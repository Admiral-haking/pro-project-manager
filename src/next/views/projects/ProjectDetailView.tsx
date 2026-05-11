"use client";

import { useEffect, useState } from "react";
import { alpha, Avatar, AvatarGroup, Box, Chip, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useSearchParams } from "next/navigation";

type Project = {
    id: string;
    title: string;
    description?: string;
    priority?: number;
    categories?: { id: string; title: string }[];
    updatedAt?: string;
};

const milestones = [
    { title: "Design sign-off", status: "Done", date: "Mar 12", owner: "Nora" },
    { title: "API contracts", status: "In Review", date: "Mar 18", owner: "Kim" },
    { title: "Mobile beta", status: "In Progress", date: "Apr 02", owner: "Jin" },
    { title: "Public launch", status: "Planned", date: "May 24", owner: "Lex" },
];

export default function ProjectDetailView() {
    const projectId = useSearchParams().get("id");
    const [project, setProject] = useState<Project | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!projectId) return;
            const res = await window.electron?.projects?.get?.(projectId);
            if (res) setProject(res);
        };
        load();
    }, [projectId]);

    const displayId = project?.id ?? projectId ?? "unknown";
    const title = project?.title ?? "Project";
    const priority = project?.priority ?? 0;
    const progress = Math.round((priority / 5) * 100);

    return (
        <Stack gap={3}>
            <Box
                sx={theme => ({
                    borderRadius: 3,
                    border: "1px solid rgba(124,139,255,0.25)",
                    background: `radial-gradient(circle at 10% 20%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 45%), radial-gradient(circle at 90% 0%, ${alpha(theme.palette.secondary.main, 0.12)}, transparent 40%), ${alpha(theme.palette.background.paper, 0.85)}`,
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.32)}`
                })}
            >
                <IconButton href="/app/projects" sx={{ position: "absolute", top: 16, left: 16 }} color="primary">
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Stack gap={0.5}>
                        <Typography variant="overline" letterSpacing={1} color="text.secondary">Project</Typography>
                        <Typography variant="h4" fontWeight={800}>{title}</Typography>
                        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                            <Chip size="small" label={`ID ${displayId}`} variant="outlined" />
                            <Chip size="small" label={priority >= 4 ? "At Risk" : priority >= 2 ? "In Progress" : "Discovery"} color="primary" variant="outlined" />
                            {project?.categories?.map(cat => <Chip key={cat.id} size="small" label={cat.title} />)}
                        </Stack>
                    </Stack>
                    <Stack direction="row" gap={2} alignItems="center">
                        <Gauge title="Priority" value={priority.toString()} accent="#ffcf7d" />
                        <Gauge title="Progress" value={`${progress}%`} accent="#7c8bff" />
                        <Gauge title="Updated" value={project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "—"} accent="#6cf7c5" />
                    </Stack>
                </Stack>
                <Box sx={{ my: 2, height: 1, background: "rgba(255,255,255,0.1)" }} />
                <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Overview</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
                            {project?.description || "No description yet."}
                        </Typography>
                        <Stack direction="row" gap={1.5} alignItems="center" sx={{ mt: 1 }}>
                            <AvatarGroup max={5}>
                                <Avatar>{title.charAt(0)}</Avatar>
                            </AvatarGroup>
                            <Typography variant="body2" color="text.secondary">Core team placeholder</Typography>
                        </Stack>
                    </Box>
                    <Box
                        sx={theme => ({
                            minWidth: 260,
                            p: 1.5,
                            borderRadius: 2,
                            border: `1px dashed rgba(124,139,255,0.5)`,
                            background: alpha(theme.palette.primary.main, 0.06)
                        })}
                    >
                        <Typography variant="subtitle2" fontWeight={700}>Progress</Typography>
                        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
                            <LinearProgress variant="determinate" value={progress} sx={{ flex: 1, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
                            <Typography variant="body2" fontWeight={700}>{progress}%</Typography>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center" sx={{ mt: 1 }}>
                            <BoltRoundedIcon color="warning" fontSize="small" />
                            <Typography variant="caption" color="text.secondary">Priority drives this gauge.</Typography>
                        </Stack>
                    </Box>
                </Stack>
            </Box>

            <GridShell>
                <Section title="Milestones" icon={<TimelineRoundedIcon />}>
                    <Stack gap={1.25}>
                        {milestones.map(ms => (
                            <Stack
                                key={ms.title}
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{
                                    p: 1.25,
                                    borderRadius: 1.5,
                                    border: "1px solid rgba(255,255,255,0.08)"
                                }}
                            >
                                <Chip
                                    size="small"
                                    color={
                                        ms.status === "Done"
                                            ? "success"
                                            : ms.status === "In Progress"
                                                ? "primary"
                                                : ms.status === "In Review"
                                                    ? "warning"
                                                    : "default"
                                    }
                                    label={ms.status}
                                />
                                <Typography flex={1} fontWeight={700}>{ms.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{ms.owner}</Typography>
                                <Typography variant="body2" color="text.secondary">{ms.date}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Section>

                <Section title="Log" icon={<ScheduleRoundedIcon />}>
                    <Stack gap={1}>
                        {[
                            "Incident runbooks drafted",
                            "Auto-mitigation POC greenlit",
                            "Service map shipped",
                            "Latency SLO aligned with platform team"
                        ].map(item => (
                            <Stack
                                key={item}
                                direction="row"
                                alignItems="center"
                                gap={1}
                                sx={{
                                    p: 1,
                                    borderRadius: 1,
                                    border: "1px solid rgba(255,255,255,0.08)"
                                }}
                            >
                                <CheckCircleRoundedIcon color="success" fontSize="small" />
                                <Typography flex={1}>{item}</Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Section>

                <Section title="Risks & callouts" icon={<BoltRoundedIcon />}>
                    <Stack gap={1}>
                        <Callout tone="warning" title="LLM cost creep" body="Guardrails on inference budget; exploring batching and caching." />
                        <Callout tone="error" title="Legacy service integration" body="Dependency on outdated auth path; blocked until migration is scheduled." />
                        <Callout tone="info" title="Data coverage" body="Need wider incident corpus for better prompts; collecting from SRE notebooks." />
                    </Stack>
                </Section>
            </GridShell>
        </Stack>
    );
}

function Gauge({ title, value, accent }: { title: string; value: string; accent: string; }) {
    return (
        <Stack
            sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                border: `1px solid ${alpha(accent, 0.5)}`,
                background: alpha(accent, 0.12),
                minWidth: 120
            }}
        >
            <Typography variant="caption" color="text.secondary">{title}</Typography>
            <Typography variant="h6" fontWeight={800}>{value}</Typography>
        </Stack>
    );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode; }) {
    return (
        <Box
            sx={theme => ({
                p: 2,
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.08)",
                background: alpha(theme.palette.background.paper, 0.8),
            })}
        >
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
                {icon}
                <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
            </Stack>
            {children}
        </Box>
    );
}

function Callout({ tone, title, body }: { tone: "warning" | "error" | "info"; title: string; body: string; }) {
    const palette = {
        warning: { bg: "rgba(255, 191, 94, 0.1)", border: "rgba(255, 191, 94, 0.4)" },
        error: { bg: "rgba(255, 130, 130, 0.12)", border: "rgba(255, 130, 130, 0.45)" },
        info: { bg: "rgba(124, 139, 255, 0.12)", border: "rgba(124, 139, 255, 0.4)" },
    }[tone];

    return (
        <Box sx={{
            p: 1.25,
            borderRadius: 1.5,
            border: `1px solid ${palette.border}`,
            background: palette.bg
        }}>
            <Typography fontWeight={700}>{title}</Typography>
            <Typography variant="body2" color="text.secondary">{body}</Typography>
        </Box>
    );
}

function GridShell({ children }: { children: React.ReactNode }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 1.5
            }}
        >
            {children}
        </Box>
    );
}
