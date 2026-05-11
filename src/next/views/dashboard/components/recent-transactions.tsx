"use client";

import { alpha, Box, Chip, Divider, Stack, Typography } from "@mui/material";

const transactions = [
    { id: "1", title: "Figma subscription", category: "Tools", amount: -48, currency: "USD", time: "Today • 11:20 AM" },
    { id: "2", title: "Client invoice #142", category: "Income", amount: 1250, currency: "USD", time: "Today • 9:05 AM" },
    { id: "3", title: "Coffee with team", category: "Food", amount: -18, currency: "USD", time: "Yesterday • 5:10 PM" },
    { id: "4", title: "Server credits", category: "Infra", amount: -220, currency: "USD", time: "Yesterday • 2:42 PM" },
    { id: "5", title: "Marketplace payout", category: "Income", amount: 680, currency: "USD", time: "Mon • 3:30 PM" },
    { id: "6", title: "UX workshop", category: "Education", amount: -140, currency: "USD", time: "Mon • 11:00 AM" },
    { id: "7", title: "Ride share", category: "Travel", amount: -24, currency: "USD", time: "Sun • 9:18 PM" },
    { id: "8", title: "Cloud backup", category: "Infra", amount: -60, currency: "USD", time: "Sun • 4:30 PM" },
    { id: "9", title: "Design retainer", category: "Income", amount: 2100, currency: "USD", time: "Sat • 1:05 PM" },
];

export default function RecentTransactions() {
    return (
        <Box
            sx={theme => ({
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.92),
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.25)}`,
                p: 2.5,
                minHeight: 320,
                maxHeight: 420,
                display: "flex",
                flexDirection: "column",
            })}
        >
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "-25% -10% auto auto",
                    height: 220,
                    width: 220,
                    background: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.28)}, transparent 65%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "auto auto -30% -10%",
                    height: 240,
                    width: 240,
                    background: `radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.22)}, transparent 60%)`,
                    filter: "blur(12px)",
                    zIndex: 0,
                })}
            />

            <Stack gap={1} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Recent Transactions
                    </Typography>
                    <Chip
                        label="Live feed"
                        size="small"
                        color="primary"
                        sx={theme => ({
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                        })}
                    />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Latest inflows and outflows—keeps the ledger tight without leaving the dashboard.
                </Typography>
            </Stack>

            <Box
                sx={theme => ({
                    mt: 1.5,
                    borderRadius: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.background.default, 0.85),
                    backdropFilter: "blur(6px)",
                    overflow: "hidden",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                })}
            >
                <Box
                    sx={theme => ({
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: 1,
                        alignItems: "center",
                        p: 1.25,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    })}
                >
                    <Typography variant="caption" color="text.secondary">
                        Item
                    </Typography>
                    <Typography variant="caption" color="text.secondary" textAlign="right">
                        Amount
                    </Typography>
                </Box>
                <Box sx={{ flex: 1, overflowY: "auto" }}>
                    <Stack divider={<Divider flexItem sx={{ borderColor: "divider" }} />} spacing={0}>
                        {transactions.map(item => (
                            <Stack
                                key={item.id}
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={theme => ({
                                    p: 1.25,
                                    transition: "background 120ms ease",
                                    ":hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                })}
                            >
                                <Box flex="1 1 auto">
                                    <Stack direction="row" alignItems="center" gap={0.75}>
                                        <Typography fontWeight="bold">{item.title}</Typography>
                                        <Chip
                                            label={item.category}
                                            size="small"
                                            sx={theme => ({
                                                bgcolor: alpha(theme.palette.text.primary, 0.15),
                                                color: theme.palette.text.primary,
                                                fontWeight: 700,
                                                fontSize: 11,
                                            })}
                                        />
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.time}
                                    </Typography>
                                </Box>
                                <Typography
                                    fontWeight="bold"
                                    color={item.amount >= 0 ? "success.main" : "error.main"}
                                >
                                    {item.amount >= 0 ? "+" : "-"}${Math.abs(item.amount).toLocaleString()}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
