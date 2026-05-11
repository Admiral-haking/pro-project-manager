"use client"
import { alpha, Avatar, AvatarGroup, Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { mockProjects } from "../mock/projects";



export default function DashboardProjects() {

    const remain = mockProjects.slice(0, 5)
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
                    background: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.3)}, transparent 65%)`,
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
                    background: `radial-gradient(circle at 70% 70%, ${alpha(theme.palette.secondary.main, 0.22)}, transparent 60%)`,
                    filter: "blur(10px)",
                    zIndex: 0,
                })}
            />

            <Stack gap={1.5} sx={{ position: "relative", zIndex: 1, height: '100%' }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight="bold">
                        Projects
                    </Typography>
                    <Chip
                        label="Active sprints"
                        size="small"
                        color="secondary"
                        sx={theme => ({
                            bgcolor: alpha(theme.palette.secondary.main, 0.2),
                            color: theme.palette.secondary.main,
                        })}
                    />
                    <Box flex="1 1 auto" />
                    <Button
                        LinkComponent={Link}
                        href="/app/projects"
                        size="small"
                        endIcon={<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M8.707 5.293a1 1 0 1 0-1.414 1.414L12.586 12l-5.293 5.293a1 1 0 0 0 1.414 1.414l6-6a1 1 0 0 0 0-1.414z" />
                        </svg>}
                    >
                        View all
                    </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                    Quick-glance cards for the crews shipping now—avatars, repos, and instant jumps.
                </Typography>
                <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5, minHeight: 0 }}>
                    <Grid container spacing={1.5}>
                        {remain.map((project, idx) => (
                            <Grid key={project._id} size={{ xs: 12 }}>
                                <Box
                                    sx={theme => ({
                                        p: 1.5,
                                        borderRadius: 1.5,
                                        position: "relative",
                                        overflow: "hidden",
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: alpha(theme.palette.background.default, 0.9),
                                        backdropFilter: "blur(6px)",
                                        transition: "transform 160ms ease, border-color 160ms ease",
                                        ":hover": {
                                            transform: "translateY(-2px)",
                                            borderColor: alpha(theme.palette.primary.main, 0.6),
                                        },
                                    })}
                                >
                                    <Stack direction="row" gap={1.5} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                                        <Box flex="1 1 auto">
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                <Typography fontWeight="bold" variant="subtitle1">
                                                    {project.title} #{idx + 1}
                                                </Typography>
                                                <Chip
                                                    label={`${project.repositories} repos`}
                                                    size="small"
                                                    color="primary"
                                                    sx={theme => ({
                                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                    })}
                                                />
                                            </Stack>
                                            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                                                <AvatarGroup max={4} spacing="small" sx={{ "& .MuiAvatar-root": { width: 26, height: 26 } }}>
                                                    {project.contractors.map(person => (
                                                        <Avatar key={person} alt={person} sx={{ bgcolor: "primary.dark" }}>
                                                            {person.substring(0, 1)}
                                                        </Avatar>
                                                    ))}
                                                </AvatarGroup>
                                                <Typography variant="caption" color="text.secondary">
                                                    {project.contractors.join(", ")}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                        <Stack gap={0.5} alignItems="flex-end">
                                            <Button
                                                LinkComponent={Link}
                                                href={`/app/projects/view?id=${project._id}`}
                                                size="small"
                                                color="secondary"
                                                variant="contained"
                                            >
                                                Inspect
                                            </Button>
                                            <Button
                                                LinkComponent={Link}
                                                href={project.link}
                                                target="_blank"
                                                size="small"
                                                variant="text"
                                            >
                                                Open repo
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Stack>
        </Box>
    )
}
