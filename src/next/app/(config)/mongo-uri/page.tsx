"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const mongoUriSchema = z.string().trim().min(1, "Connection string is required").regex(/^mongodb(\+srv)?:\/\//i, "Must start with mongodb:// or mongodb+srv://");

function Pill({ text }: { text: string }) {
    return <span className="pill">{text}</span>;
}

export default function MongoUriPage() {
    const [value, setValue] = useState("mongodb://127.0.0.1:27017/project-manager-pro");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const parsedHost = useMemo(() => {
        try {
            const url = new URL(value);
            return `${url.protocol}//${url.host}${url.pathname}`;
        } catch {
            return "";
        }
    }, [value]);

    useEffect(() => {
        const load = async () => {
            try {
                const stored = await window.electron?.config?.getMongoUri?.();
                if (stored?.mongoUri) {
                    setValue(stored.mongoUri);
                }
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setStatus("idle");
        setError(null);
        try {
            const normalized = mongoUriSchema.parse(value);
            setStatus("saving");
            await window.electron?.config?.setMongoUri?.(normalized);
            setStatus("saved");
            setTimeout(() => window.close(), 650);
        } catch (err: any) {
            const msg = err?.message ?? "Could not save connection string";
            setError(msg);
            setStatus("error");
        }
    };

    return (
        <div className="page-shell">
            <div className="glow" />
            <div className="card">
                <div className="header">
                    <div>
                        <p className="eyebrow">Step 1</p>
                        <h1>Connect your database</h1>
                        <p className="subtitle">Provide a MongoDB connection string. It will be stored locally and used to start the app.</p>
                    </div>
                    <div className="badges">
                        <Pill text="Secure local storage" />
                        <Pill text="Works with SRV" />
                        <Pill text="No external calls" />
                    </div>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label htmlFor="uri">MongoDB URI</label>
                    <div className={`input-shell ${error ? "has-error" : ""}`}>
                        <input
                            id="uri"
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="mongodb://user:pass@host:27017/dbname"
                            autoFocus
                        />
                        <button type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save & Continue"}</button>
                    </div>
                    <div className="meta">
                        <span className="hint">Detected host: {parsedHost || "—"}</span>
                        {error && <span className="error">{error}</span>}
                        {status === "saved" && <span className="success">Saved! Launching…</span>}
                    </div>
                </form>
            </div>

            <style jsx>{`
                .page-shell {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(120% 120% at 15% 20%, rgba(109, 245, 255, 0.25), transparent 45%),
                                radial-gradient(120% 120% at 80% 0%, rgba(141, 109, 255, 0.35), transparent 40%),
                                #05060a;
                    color: #e5f4ff;
                    padding: 32px;
                }
                .glow {
                    position: absolute;
                    width: 320px;
                    height: 320px;
                    background: radial-gradient(circle, rgba(89, 243, 255, 0.18) 0%, rgba(5, 6, 10, 0) 60%);
                    filter: blur(12px);
                    top: 12%;
                    left: 10%;
                    pointer-events: none;
                }
                .card {
                    position: relative;
                    width: min(720px, 100%);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(14, 17, 26, 0.85);
                    box-shadow:
                        0 25px 60px rgba(0, 0, 0, 0.45),
                        inset 0 1px 0 rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    padding: 28px;
                    backdrop-filter: blur(16px);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 18px;
                }
                .eyebrow {
                    text-transform: uppercase;
                    letter-spacing: 0.14em;
                    font-size: 11px;
                    color: #7fd1ff;
                    margin: 0 0 6px;
                }
                h1 {
                    margin: 0 0 8px;
                    font-size: 26px;
                }
                .subtitle {
                    margin: 0;
                    color: #a8b7d6;
                    max-width: 540px;
                }
                .badges {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 12px;
                    color: #dbe6ff;
                }
                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                label {
                    font-size: 13px;
                    color: #c8d6f8;
                }
                .input-shell {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    padding: 10px 12px 10px 14px;
                    transition: border 0.2s ease;
                }
                .input-shell.has-error {
                    border-color: rgba(255, 92, 92, 0.6);
                }
                input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #eaf2ff;
                    font-size: 15px;
                }
                input::placeholder {
                    color: #6d7a9d;
                }
                button {
                    border: none;
                    border-radius: 12px;
                    background: linear-gradient(120deg, #6ff2ff, #7c8bff);
                    color: #051022;
                    padding: 10px 16px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 24px rgba(127, 209, 255, 0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
                }
                button:disabled {
                    opacity: 0.7;
                    cursor: default;
                    box-shadow: none;
                }
                button:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 28px rgba(124, 139, 255, 0.45);
                }
                .meta {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                    color: #7f91b5;
                    font-size: 13px;
                }
                .hint {
                    color: #8fb0ff;
                }
                .error {
                    color: #ff9e9e;
                }
                .success {
                    color: #6cf7c5;
                }
                @media (max-width: 640px) {
                    .card {
                        padding: 20px;
                    }
                    .header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    button {
                        width: 140px;
                    }
                }
            `}</style>
        </div>
    );
}
