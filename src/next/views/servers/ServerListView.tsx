"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { alpha, Avatar, Box, Button, Chip, IconButton, Stack, TextField, Typography, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { EditIcon, DeleteIcon } from "@next/components/icons";
import { useRouter } from "next/navigation";

type Server = {
    id: string;
    title: string;
    host: string;
    port: string;
    users: { username: string; sudo: boolean }[];
    updatedAt?: string;
};

export default function ServerListView() {
    const router = useRouter();
    const [servers, setServers] = useState<Server[]>([]);
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const text = search.trim().toLowerCase();
        if (!text) return servers;
        return servers.filter((s) =>
            s.title.toLowerCase().includes(text) ||
            s.host.toLowerCase().includes(text)
        );
    }, [servers, search]);

    useEffect(() => {
        const load = async () => {
            const res = await window.electron?.servers?.list?.();
            if (res) setServers(res);
        };
        load();
    }, []);

    const handleDelete = useCallback(async (serverId: string) => {
        try {
            await window.electron?.servers?.delete?.(serverId);
            setServers(prev => prev.filter(s => s.id !== serverId));
        } catch (err) {
            console.error(err);
        }
    }, []);

    const handleEdit = useCallback((serverId: string) => {
        router.push(`/app/servers/save?id=${serverId}`);
    }, [router]);

    return (
        <Stack gap={3} sx={{ position: "relative" }}>
            <Box
                sx={{
                    position: "absolute",
                    inset: "-6% 5% auto auto",
                    height: 200,
                    width: 200,
                    background: "radial-gradient(circle at 30% 30%, rgba(127, 209, 255, 0.18), transparent 60%)",
                    filter: "blur(10px)",
                    pointerEvents: "none",
                }}
            />
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
                <Stack gap={0.5}>
                    <Typography variant="h4" fontWeight={800}>Servers</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Inventory of targets—filter by host or name, then jump in to edit.
                    </Typography>
                </Stack>
                <Stack direction="row" gap={1}>
                    <TextField
                        placeholder="Search servers"
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchRoundedIcon fontSize="small" color="action" />,
                        }}
                        sx={theme => ({
                            minWidth: 240,
                            "& .MuiInputBase-root": {
                                borderRadius: 14,
                                background: alpha(theme.palette.background.paper, 0.75),
                                border: "1px solid rgba(255,255,255,0.08)"
                            }
                        })}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        href="/app/servers/save"
                        sx={{ borderRadius: 2, px: 2.5 }}
                    >
                        New server
                    </Button>
                </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <Box
                    sx={theme => ({
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.92)}, ${alpha(theme.palette.primary.main, 0.06)})`,
                        backdropFilter: "blur(8px)",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: 1.5,
                    })}
                >
                    <Metric title="Servers" value={servers.length.toString()} hint="total" color="primary" />
                    <Metric title="Filtered" value={filtered.length.toString()} hint="matching filters" color="success" />
                    <Metric title="SSH users" value={servers.reduce((sum, s) => sum + (s.users?.length ?? 0), 0).toString()} hint="across hosts" color="info" />
                </Box>
            </Stack>

            <Stack gap={1.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={700}>Inventory</Typography>
                    <Chip label="Live" size="small" color="primary" variant="outlined" />
                </Stack>
                <TableContainer component={Paper} sx={{ borderRadius: 2, background: "rgba(15,17,24,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ "& th": { borderBottom: "1px solid rgba(255,255,255,0.08)" } }}>
                                <TableCell>Name</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell>Users</TableCell>
                                <TableCell>Updated</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map(server => (
                                <TableRow key={server.id} hover sx={{ "& td": { borderBottom: "1px solid rgba(255,255,255,0.04)" } }}>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Avatar sx={{ width: 32, height: 32 }}>{server.title.charAt(0)}</Avatar>
                                            <Stack>
                                                <Typography fontWeight={700}>{server.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">#{server.id}</Typography>
                                            </Stack>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{server.host}:{server.port}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" gap={0.5} flexWrap="wrap">
                                            <Chip size="small" label={`${server.users?.length ?? 0} users`} />
                                            {server.users?.slice(0, 2).map(u => (
                                                <Chip key={u.username} size="small" label={u.username + (u.sudo ? " • sudo" : "")} />
                                            ))}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{server.updatedAt ? new Date(server.updatedAt).toLocaleDateString() : "—"}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="end">
                                            <IconButton size="small" onClick={() => handleDelete(server.id)} color="error">
                                                <DeleteIcon width={18} height={18} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEdit(server.id)} color="primary">
                                                <EditIcon width={18} height={18} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Stack>
    );
}

function Metric({ title, value, hint, color }: { title: string; value: string; hint: string; color: "primary" | "success" | "info" }) {
    return (
        <Stack
            gap={0.25}
            sx={theme => ({
                p: 1.5,
                borderRadius: 1.5,
                border: `1px solid ${alpha(theme.palette[color].main, 0.35)}`,
                background: alpha(theme.palette[color].main, 0.12)
            })}
        >
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h5" fontWeight={800}>{value}</Typography>
            <Typography variant="caption" color="text.secondary">{hint}</Typography>
        </Stack>
    );
}
