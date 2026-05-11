"use client"
import { alpha, Box, Button, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { mockServers } from "../mock/servers";
import { TerminalIcon } from "@next/components/icons";



export default function DashboardServers() {

    const remain = mockServers.slice(0, 6)
    return (
        <Box
            sx={theme => ({
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.25)}`,
                p: 2.5,
                minHeight: 320,
                maxHeight: 500,
                height: 500,
                display: "flex",
                flexDirection: "column",
            })}
        >
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "-25% -10% auto auto",
                    height: 200,
                    width: 200,
                    background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.success.main, 0.28)}, transparent 65%)`,
                    filter: "blur(8px)",
                    zIndex: 0,
                })}
            />
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "auto auto -30% -10%",
                    height: 220,
                    width: 220,
                    background: `radial-gradient(circle at 70% 70%, ${alpha(theme.palette.info.main, 0.25)}, transparent 60%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />

            <Stack gap={1.5} sx={{ position: "relative", zIndex: 1, maxHeight: '100%' }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Servers
                    </Typography>
                    <Chip
                        label="Fleet pulse"
                        size="small"
                        color="success"
                        sx={theme => ({
                            bgcolor: alpha(theme.palette.success.main, 0.2),
                            color: theme.palette.success.main,
                        })}
                    />
                    <Box flex="1 1 auto" />
                    <Button
                        LinkComponent={Link}
                        href="/app/servers"
                        size="small"
                        endIcon={<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8.707 5.293a1 1 0 1 0-1.414 1.414L12.586 12l-5.293 5.293a1 1 0 0 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414z" />
                        </svg>}
                    >
                        Manage
                    </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Track hosts, roots, and teammates at a glance—ready for a fast terminal hop.
                </Typography>


                <Box sx={{ mt: 1.5, flex: 1, overflowY: "scroll", position: "relative", zIndex: 1 }}>
                    <Grid container spacing={1.25}>
                        {remain.map((server, idx) => {
                            const hasRoot = server.users.some(user => user.username === "root");
                            return (
                                <Grid key={server._id} size={{ xs: 12 }}>
                                    <Box
                                        sx={theme => ({
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            border: `1px solid ${theme.palette.divider}`,
                                            bgcolor: alpha(theme.palette.background.default, 0.9),
                                            backdropFilter: "blur(6px)",
                                            transition: "transform 160ms ease, border-color 160ms ease",
                                            ":hover": {
                                                transform: "translateY(-2px)",
                                                borderColor: alpha(theme.palette.success.main, 0.6),
                                            },
                                        })}
                                    >
                                        <Stack gap={1}>
                                            <Stack direction="row" alignItems="center" gap={1.25}>
                                                <Box
                                                    sx={theme => ({
                                                        height: 36,
                                                        width: 36,
                                                        borderRadius: "50%",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.25)}, ${alpha(theme.palette.info.main, 0.12)})`,
                                                        color: theme.palette.success.main,
                                                        fontWeight: 700,
                                                    })}
                                                >
                                                    {(idx + 1).toString().padStart(2, "0")}
                                                </Box>
                                                <Box flex="1 1 auto">
                                                    <Stack direction="row" alignItems="center" gap={1}>
                                                        <Typography fontWeight="bold">{server.name}</Typography>
                                                        {hasRoot && (
                                                            <Chip
                                                                label="root"
                                                                size="small"
                                                                color="error"
                                                                variant="outlined"
                                                                sx={theme => ({
                                                                    borderColor: alpha(theme.palette.error.main, 0.6),
                                                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                                                    color: theme.palette.error.main,
                                                                    textTransform: "uppercase",
                                                                    letterSpacing: 0.5,
                                                                    fontWeight: 700,
                                                                    fontSize: 9
                                                                })}
                                                            />
                                                        )}
                                                    </Stack>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {server.host}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={`${server.users.length} users`}
                                                    size="small"
                                                    color="success"
                                                    sx={theme => ({
                                                        bgcolor: alpha(theme.palette.success.main, 0.2),
                                                        color: theme.palette.success.main,
                                                        fontWeight: 700,
                                                    })}
                                                />
                                            </Stack>
                                            <Stack gap={0.75} sx={theme => ({
                                                p: 1,
                                                borderLeft: `1px dashed ${theme.palette.divider}`,
                                            })}>
                                                {server.users.map(user => (
                                                    <Stack
                                                        key={user.username}
                                                        direction="row"
                                                        alignItems="center"
                                                        gap={1}
                                                        sx={theme => ({
                                                            p: 0.75,
                                                            borderRadius: 1,
                                                            transition: "background 120ms ease",
                                                            ":hover": { bgcolor: alpha(theme.palette.success.main, 0.08) },
                                                        })}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color={user.username === "root" ? "error.main" : "text.primary"}
                                                            sx={{ flex: 1, fontWeight: 600 }}
                                                        >
                                                            {user.username}
                                                        </Typography>
                                                        <IconButton size="small" color="success">
                                                            <TerminalIcon width="16" height="16" />
                                                        </IconButton>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>
            </Stack>
        </Box>
    )
}
