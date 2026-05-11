"use client";

import { alpha, Box, Chip, Stack, Typography } from "@mui/material";

const reminders = [
    {
        title: "Design review",
        when: "Today • 3:30 PM",
        date: "Mar 12",
        priority: "High",
        tag: "UI/UX",
        color: "secondary" as const,
        note: "Walk through the fresh flows before sharing with stakeholders."
    },
    {
        title: "Client status update",
        when: "Tomorrow • 9:00 AM",
        date: "Mar 13",
        priority: "Medium",
        tag: "Client",
        color: "primary" as const,
        note: "Summarize wins, blockers, and a crisp next-steps list."
    },
    {
        title: "QA sweep",
        when: "Friday • 1:15 PM",
        date: "Mar 15",
        priority: "Low",
        tag: "Quality",
        color: "success" as const,
        note: "Spot-check new dashboard widgets and polish micro-interactions."
    },
    {
        title: "Budget sign-off",
        when: "Monday • 11:45 AM",
        date: "Mar 18",
        priority: "High",
        tag: "Finance",
        color: "warning" as const,
        note: "Finalize Q2 allocation and confirm vendor renewals."
    },
    {
        title: "Sprint kickoff",
        when: "Wednesday • 10:00 AM",
        date: "Mar 20",
        priority: "Medium",
        tag: "Delivery",
        color: "info" as const,
        note: "Lock stories, owners, and the expectation for demo-ready slices."
    },
];

export default function Reminders() {
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
                display: "flex",
                flexDirection: "column",
            })}
        >
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "-20% -10% auto auto",
                    height: 180,
                    width: 180,
                    background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.primary.main, 0.35)}, transparent 60%)`,
                    filter: "blur(6px)",
                    zIndex: 0,
                })}
            />
            <Box
                sx={theme => ({
                    position: "absolute",
                    inset: "auto auto -25% -10%",
                    height: 240,
                    width: 240,
                    background: `radial-gradient(circle at 60% 60%, ${alpha(theme.palette.secondary.main, 0.28)}, transparent 60%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />

            <Stack gap={1} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Reminders
                    </Typography>
                    <Chip
                        label="Stay ahead"
                        size="small"
                        color="primary"
                        sx={theme => ({
                            bgcolor: alpha(theme.palette.primary.main, 0.2),
                            color: theme.palette.primary.main,
                        })}
                    />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    A curated stack of what matters now—keep momentum with quick, tactile cues.
                </Typography>
            </Stack>
            <Box sx={{ mt: 1.5, flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>
                <Stack gap={1.25}>
                    {reminders.map((item, idx) => (
                        <Box
                            key={item.title}
                            sx={theme => ({
                                p: 1.5,
                                borderRadius: 1.5,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: alpha(theme.palette.background.default, 0.85),
                                backdropFilter: "blur(6px)",
                                transition: "transform 150ms ease, border-color 150ms ease",
                                ":hover": {
                                    transform: "translateY(-2px)",
                                    borderColor: alpha(theme.palette.primary.main, 0.5),
                                },
                            })}
                        >
                            <Stack direction="row" alignItems="center" gap={1.5}>
                                <Box
                                    sx={theme => ({
                                        height: 38,
                                        width: 38,
                                        borderRadius: "50%",
                                        display: "grid",
                                        placeItems: "center",
                                        background: `linear-gradient(135deg, ${alpha(theme.palette[item.color].main, 0.28)}, ${alpha(theme.palette[item.color].main, 0.12)})`,
                                        color: theme.palette[item.color].main,
                                        fontWeight: 700,
                                    })}
                                >
                                    {(idx + 1).toString().padStart(2, "0")}
                                </Box>
                                <Box flex="1 1 auto">
                                    <Typography fontWeight="bold">{item.title}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.date} • {item.when} • {item.note}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={item.tag}
                                    color={item.color}
                                    size="small"
                                    sx={theme => ({
                                        bgcolor: alpha(theme.palette[item.color].main, 0.2),
                                        color: theme.palette[item.color].main,
                                    })}
                                />
                            </Stack>
                            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                                <Chip
                                    label={item.priority}
                                    size="small"
                                    color={item.priority === "High" ? "error" : item.priority === "Medium" ? "warning" : "success"}
                                    variant="outlined"
                                    sx={theme => ({
                                        borderColor: alpha(theme.palette.text.primary, 0.2),
                                        bgcolor: alpha(theme.palette.text.primary, 0.2),
                                        color: theme.palette.text.primary,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        fontWeight: 700,
                                    })}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "right" }}>
                                    {item.when}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
