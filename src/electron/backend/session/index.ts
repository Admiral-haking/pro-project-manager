import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import type { ClientChannel, ConnectConfig } from "ssh2";
import { Client } from "ssh2";
import type { IPty } from "node-pty";
import * as pty from "node-pty";
import os from "os"

export type SessionType = "local" | "ssh";

export type HistoryEntry = {
    pwd: string;
    cmd: string;
    date: number; // timestamp
    result: string;
    status: "success" | "failed";
};

export type SessionPublic = {
    id: string;
    name: string;
    type: SessionType;

    // xterm-facing API
    close: () => any;
    write: (data: string) => any;
    onData: (cb: (data: string) => any) => any;
    resize: (cols: number, rows: number) => any;

    // history
    history: HistoryEntry[];
    getHistory: () => HistoryEntry[];

    // explicit “run a command and capture result”
    sendCommand: (cmd: string) => Promise<HistoryEntry>;
};

type LocalSessionOptions = {
    name: string;
    shell?: string; // default: platform shell
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    cols?: number;
    rows?: number;
};

type SshSessionOptions = {
    name: string;
    connect: ConnectConfig; // ssh2 connect config
    cols?: number;
    rows?: number;
    term?: string; // default: xterm-256color
};

function uuid(): string {
    // Node 18+ supports crypto.randomUUID; this fallback is extra-safe
    try {
        return randomUUID();
    } catch {
        return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
}

/**
 * Captures command output by injecting unique markers into the terminal stream.
 * Works best on POSIX shells (bash/zsh/sh) locally and remotely.
 */
class CommandCapturer {
    private token = `__CAPTURE_${uuid()}__`;
    private active:
        | {
            id: string;
            cmd: string;
            started: boolean;
            buf: string;
            resolve: (v: { output: string; code: number; pwd: string }) => void;
            reject: (e: any) => void;
            timeout: NodeJS.Timeout;
        }
        | undefined;

    constructor(
        private writeRaw: (data: string) => void,
        private timeoutMs = 30_000
    ) { }

    onOutput(chunk: string) {
        if (!this.active) return;

        this.active.buf += chunk;

        const { id } = this.active;
        const endMarker = `${this.token}:END:${id}`;
        const endIdx = this.active.buf.indexOf(endMarker);
        if (endIdx === -1) return;

        // We have everything up to END marker; parse from START..END
        const text = this.active.buf;

        // Clear before resolving
        const active = this.active;
        this.active = undefined;
        clearTimeout(active.timeout);

        const parsed = this.parseCaptured(text, id);
        active.resolve(parsed);
    }

    async capture(cmd: string): Promise<{ output: string; code: number; pwd: string }> {
        if (this.active) {
            throw new Error("A command capture is already in progress for this session.");
        }

        const id = uuid();

        const start = `${this.token}:START:${id}`;
        const status = `${this.token}:STATUS:${id}:`;
        const pwdLine = `${this.token}:PWD:${id}:`;
        const end = `${this.token}:END:${id}`;

        // POSIX-friendly wrapper:
        // - prints START
        // - runs command in a subshell
        // - prints STATUS:<code>
        // - prints PWD:<pwd>
        // - prints END
        //
        // Note: command output will be between START and STATUS, with extra lines after.
        const wrapped =
            [
                `echo ${this.shellEscape(start)}`,
                `(`,
                cmd,
                `)`,
                `code=$?`,
                `echo ${this.shellEscape(status)}$code`,
                `echo ${this.shellEscape(pwdLine)}"$(pwd)"`,
                `echo ${this.shellEscape(end)}`,
            ].join("\n") + "\n";

        const timeout = setTimeout(() => {
            const active = this.active;
            this.active = undefined;
            if (active) {
                active.reject(new Error(`Command capture timed out after ${this.timeoutMs}ms`));
            }
        }, this.timeoutMs);

        return new Promise((resolve, reject) => {
            this.active = { id, cmd, started: true, buf: "", resolve, reject, timeout };
            this.writeRaw(wrapped);
        });
    }

    private parseCaptured(allText: string, id: string): { output: string; code: number; pwd: string } {
        const startMarker = `${this.token}:START:${id}`;
        const statusPrefix = `${this.token}:STATUS:${id}:`;
        const pwdPrefix = `${this.token}:PWD:${id}:`;
        const endMarker = `${this.token}:END:${id}`;

        const startIdx = allText.indexOf(startMarker);
        const endIdx = allText.indexOf(endMarker);
        if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
            return { output: allText, code: 1, pwd: "" };
        }

        const segment = allText.slice(startIdx, endIdx);

        // Extract exit code
        let code = 1;
        const statusIdx = segment.indexOf(statusPrefix);
        if (statusIdx !== -1) {
            const after = segment.slice(statusIdx + statusPrefix.length);
            const m = after.match(/^(\d+)/);
            if (m) code = Number(m[1]);
        }

        // Extract pwd
        let pwd = "";
        const pwdIdx = segment.indexOf(pwdPrefix);
        if (pwdIdx !== -1) {
            const after = segment.slice(pwdIdx + pwdPrefix.length);
            const line = after.split(/\r?\n/)[0] ?? "";
            pwd = line.trim();
        }

        // Output is everything between START line and STATUS line (excluding markers)
        let output = segment;

        // Remove START line
        output = output.replace(new RegExp(`${this.escapeRegex(startMarker)}\\s*\\r?\\n`), "");
        // Remove STATUS line and after it (but keep output before STATUS)
        if (statusIdx !== -1) {
            output = segment.slice(
                segment.indexOf(startMarker) + startMarker.length,
                segment.indexOf(statusPrefix)
            );
            // Remove anything before first newline if START marker shares a line
            const firstNl = output.indexOf("\n");
            if (firstNl !== -1) output = output.slice(firstNl + 1);
        }

        // Trim trailing marker noise
        output = output.replace(/\s+$/g, "");

        return { output, code, pwd };
    }

    private shellEscape(s: string): string {
        // safe for echo '...'
        return `'${s.replace(/'/g, `'\\''`)}'`;
    }

    private escapeRegex(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}

abstract class BaseSession implements SessionPublic {
    public readonly id: string;
    public readonly name: string;
    public readonly type: SessionType;

    public history: HistoryEntry[] = [];

    protected emitter = new EventEmitter();
    protected capturer: CommandCapturer;

    protected cols: number;
    protected rows: number;

    constructor(id: string, name: string, type: SessionType, cols = 80, rows = 24) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.cols = cols;
        this.rows = rows;

        this.capturer = new CommandCapturer((data) => this.writeRaw(data));
    }

    onData(cb: (data: string) => any) {
        this.emitter.on("data", cb);
        // return unsubscribe (nice for React)
        return () => this.emitter.off("data", cb);
    }

    protected pushOutput(data: string) {
        this.emitter.emit("data", data);
        this.capturer.onOutput(data);
    }

    getHistory() {
        return [...this.history];
    }

    async sendCommand(cmd: string): Promise<HistoryEntry> {
        const date = Date.now();

        try {
            const { output, code, pwd } = await this.capturer.capture(cmd);
            const entry: HistoryEntry = {
                pwd,
                cmd,
                date,
                result: output,
                status: code === 0 ? "success" : "failed",
            };
            this.history.push(entry);
            return entry;
        } catch (e: any) {
            const entry: HistoryEntry = {
                pwd: "",
                cmd,
                date,
                result: String(e?.message ?? e),
                status: "failed",
            };
            this.history.push(entry);
            return entry;
        }
    }

    // xterm-facing methods
    abstract write(data: string): any;
    abstract resize(cols: number, rows: number): any;
    abstract close(): any;

    // internal raw write for capturer
    protected abstract writeRaw(data: string): void;
}

/** Local PTY session (node-pty) */
class LocalPtySession extends BaseSession {
    private ptyProc: IPty;

    constructor(id: string, opts: LocalSessionOptions) {
        const cols = opts.cols ?? 80;
        const rows = opts.rows ?? 24;
        super(id, opts.name, "local", cols, rows);

        const shell =
            opts.shell ??
            (process.platform === "win32"
                ? process.env.COMSPEC || "cmd.exe"
                : process.env.SHELL || "/bin/bash");

        this.ptyProc = pty.spawn(shell, [], {
            name: "xterm-256color",
            cols,
            rows,
            cwd: opts.cwd ?? os.homedir() ?? process.cwd(),
            env: { ...process.env, ...(opts.env ?? {}) },
        });

        this.ptyProc.onData((d) => this.pushOutput(d));
        this.ptyProc.onExit(() => {
            this.pushOutput("\r\n[session closed]\r\n");
        });
    }

    write(data: string) {
        this.ptyProc.write(data);
    }

    protected writeRaw(data: string) {
        this.ptyProc.write(data);
    }

    resize(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
        this.ptyProc.resize(cols, rows);
    }

    close() {
        try {
            this.ptyProc.kill();
        } catch {
            // ignore
        }
    }
}

/** SSH session (ssh2 interactive shell) */
class SshSession extends BaseSession {
    private client: Client;
    private channel?: ClientChannel;
    private ready = false;

    constructor(id: string, opts: SshSessionOptions) {
        const cols = opts.cols ?? 80;
        const rows = opts.rows ?? 24;
        super(id, opts.name, "ssh", cols, rows);

        this.client = new Client();

        this.client
            .on("ready", () => {
                this.ready = true;
                this.openShell(opts.term ?? "xterm-256color");
            })
            .on("error", (err) => {
                this.pushOutput(`\r\n[ssh error] ${err.message}\r\n`);
            })
            .on("close", () => {
                this.pushOutput("\r\n[ssh connection closed]\r\n");
            });

        this.client.connect(opts.connect);
    }

    private openShell(term: string) {
        this.client.shell(
            {
                term,
                cols: this.cols,
                rows: this.rows,
            },
            (err, stream) => {
                if (err) {
                    this.pushOutput(`\r\n[ssh shell error] ${err.message}\r\n`);
                    return;
                }
                this.channel = stream;

                stream.on("data", (buf: Buffer) => this.pushOutput(buf.toString("utf8")));
                stream.stderr.on("data", (buf: Buffer) => this.pushOutput(buf.toString("utf8")));

                stream.on("close", () => {
                    this.pushOutput("\r\n[ssh shell closed]\r\n");
                });
            }
        );
    }

    write(data: string) {
        this.channel?.write(data);
    }

    protected writeRaw(data: string) {
        this.channel?.write(data);
    }

    resize(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
        // ssh2: setWindow(rows, cols, height, width)
        // height/width in pixels are optional; pass 0.
        this.channel?.setWindow(rows, cols, 0, 0);
    }

    close() {
        try {
            this.channel?.close();
        } catch {
            // ignore
        }
        try {
            this.client.end();
        } catch {
            // ignore
        }
    }
}

export class SessionsManager {
    private sessions = new Map<string, SessionPublic>();

    createLocal(opts: LocalSessionOptions): SessionPublic {
        const id = uuid();
        const s = new LocalPtySession(id, opts);
        this.sessions.set(id, s);
        return s;
    }

    createSsh(opts: SshSessionOptions): SessionPublic {
        const id = uuid();
        const s = new SshSession(id, opts);
        this.sessions.set(id, s);
        return s;
    }

    get(id: string): SessionPublic | undefined {
        return this.sessions.get(id);
    }

    list(): Array<{ id: string; name: string; type: SessionType }> {
        return [...this.sessions.values()].map((s) => ({ id: s.id, name: s.name, type: s.type }));
    }

    close(id: string) {
        const s = this.sessions.get(id);
        if (!s) return;
        s.close();
        this.sessions.delete(id);
    }

    closeAll() {
        for (const [id, s] of this.sessions.entries()) {
            try {
                s.close();
            } finally {
                this.sessions.delete(id);
            }
        }
    }
}
