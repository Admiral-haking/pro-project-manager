"use client";

import TerminalXterm from "@next/terminal";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import { Box, Button, Chip, CircularProgress, Drawer, Fab, IconButton, NoSsr, Paper, Stack, Typography, alpha } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type SessionState = "checking" | "not-found" | "ready";

export default function Page() {
    const id = useSearchParams().get("id");
    const [status, setStatus] = useState<SessionState>(id ? "checking" : "not-found");
    const [retryKey, setRetryKey] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (!id) {
            setStatus("not-found");
            return;
        }

        const listSessions = window.electron?.sessions?.list;

        if (!listSessions) {
            setStatus("not-found");
            return;
        }

        setStatus("checking");
        listSessions()
            .then((sessions) => {
                if (cancelled) return;

                const exists = sessions?.some((session) => session.id === id);
                setStatus(exists ? "ready" : "not-found");
            })
            .catch(() => {
                if (!cancelled) setStatus("not-found");
            });

        return () => {
            cancelled = true;
        };
    }, [id, retryKey]);

    const handleOnData = useCallback((cb: (data: string) => any) => {
        const off = window.electron?.sessions?.onData?.(({ id: incomingId, data }) => {
            if (incomingId === id) cb(data);
        });
        return typeof off === "function" ? off : () => { };
    }, [id]);

    const handleWrite = useCallback((data: string) => {
        if (!id) return;
        return window.electron?.sessions?.write?.(id, data);
    }, [id]);

    const handleResize = useCallback((cols: number, rows: number) => {
        if (!id) return;
        return window.electron?.sessions?.resize?.(id, cols, rows);
    }, [id]);

    const handleClose = useCallback(() => {
        if (!id) return;
        return window.electron?.sessions?.close?.(id);
    }, [id]);

    const launchNewSession = useCallback(async () => {
        const res = await window.electron?.sessions?.createLocal?.({
            name: "Hippo Terminal",
        });

        if (!res?.id) return;
        window.open(`/terminal?id=${res.id}`, "_self");
    }, []);

    const loadHistory = useCallback(async () => {
        if (!id) return;

        const getHistory = window.electron?.sessions?.getHistory;
        if (!getHistory) return;

        setLoadingHistory(true);
        try {
            const entries = await getHistory(id);
            setHistory(entries ?? []);
        } catch {
            // no-op; keep current history
        } finally {
            setLoadingHistory(false);
        }
    }, [id]);

    useEffect(() => {
        if (!historyOpen) return;
        loadHistory();
    }, [historyOpen, loadHistory]);

    if (status !== "ready" || !id) {
        return <SessionMissing
            status={status}
            onRetry={() => setRetryKey((count) => count + 1)}
            onLaunchNew={launchNewSession}
        />;
    }

    return <NoSsr>
        <Box sx={{ position: "relative", width: "100%", height: "100%", bgcolor: "background.default" }}>
            <TerminalXterm
                close={handleClose}
                onData={handleOnData}
                write={handleWrite}
                resize={handleResize}
            />

            <Fab
                color="primary"
                aria-label="open command history"
                onClick={() => setHistoryOpen(true)}
                sx={{ position: "fixed", bottom: 24, right: 24, boxShadow: 6 }}
            >
                <HistoryRoundedIcon />
            </Fab>

            <Drawer
                anchor="right"
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                PaperProps={{ sx: { width: { xs: 340, sm: 420 } } }}
            >
                <Stack spacing={2} sx={{ p: 2, height: "100%" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography variant="h6" fontWeight={700}>
                            Command history
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                size="small"
                                startIcon={<ReplayRoundedIcon />}
                                onClick={loadHistory}
                                disabled={loadingHistory}
                            >
                                Refresh
                            </Button>
                            <IconButton onClick={() => setHistoryOpen(false)} size="small">
                                <CloseRoundedIcon />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Stack spacing={1.5} sx={{ overflow: "auto", pr: 1, flex: 1 }}>
                        {loadingHistory ? (
                            <Box sx={{ display: "grid", placeItems: "center", flex: 1, minHeight: 200 }}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : history.length === 0 ? (
                            <Typography color="text.secondary">
                                No commands recorded for this session yet.
                            </Typography>
                        ) : (
                            [...history]
                                .sort((a, b) => b.date - a.date)
                                .map((entry, idx) => (
                                    <Paper
                                        key={`${entry.date}-${idx}`}
                                        variant="outlined"
                                        sx={{ p: 1.5, borderRadius: 2, bgcolor: "background.paper" }}
                                    >
                                        <Stack spacing={0.75}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                                                <Typography variant="subtitle2" fontWeight={700} noWrap title={entry.cmd}>
                                                    {entry.cmd || "(empty command)"}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={entry.status === "success" ? "Success" : "Failed"}
                                                    color={entry.status === "success" ? "success" : "error"}
                                                    variant="outlined"
                                                />
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary" noWrap title={entry.pwd}>
                                                {new Date(entry.date).toLocaleString()} • {entry.pwd}
                                            </Typography>
                                            {entry.result ? (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                                >
                                                    {entry.result.trim()}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                    </Paper>
                                ))
                        )}
                    </Stack>
                </Stack>
            </Drawer>
        </Box>
    </NoSsr>;
}

type SessionMissingProps = {
    status: SessionState;
    onRetry: () => void;
    onLaunchNew: () => void;
};

function SessionMissing({ status, onRetry, onLaunchNew }: SessionMissingProps) {
    const checking = status === "checking";

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: (theme) => `
                    radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 42%),
                    radial-gradient(circle at 80% 0%, ${alpha(theme.palette.success.main, 0.18)}, transparent 40%),
                    radial-gradient(circle at 30% 80%, ${alpha(theme.palette.info.main, 0.16)}, transparent 45%),
                    ${theme.palette.background.default}
                `,
                p: 3,
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: { xs: 3, sm: 4 },
                    maxWidth: 640,
                    width: "100%",
                    backdropFilter: "blur(12px)",
                    borderRadius: 4,
                    boxShadow: (theme) => `0 15px 80px ${alpha(theme.palette.common.black, 0.35)}`,
                }}
            >
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <Box
                        sx={{
                            position: "relative",
                            width: 96,
                            height: 96,
                            borderRadius: 5,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                            display: "grid",
                            placeItems: "center",
                            overflow: "hidden",
                            boxShadow: (theme) => `0 15px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                        }}
                    >
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 48, color: "#fff" }} />
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                background: (theme) => `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.common.white, 0.35)}, transparent 50%)`,
                            }}
                        />
                    </Box>

                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={700}>
                            Session not found
                        </Typography>
                        <Typography color="text.secondary">
                            {checking ? "Checking for an active shell..." : "This terminal link looks stale or has already been closed. Spin up a fresh session or head back home."}
                        </Typography>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} width="100%" justifyContent="center">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RocketLaunchRoundedIcon />}
                            onClick={onLaunchNew}
                            fullWidth
                            sx={{ py: 1.2 }}
                        >
                            Launch new terminal
                        </Button>
                    </Stack>

                    <Button
                        variant="text"
                        startIcon={<ReplayRoundedIcon />}
                        onClick={onRetry}
                        disabled={checking}
                    >
                        Retry lookup
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
