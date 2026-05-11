"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { alpha, Box, Button, Chip, IconButton, Rating, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { DeleteIcon, EditIcon, SeeMoreIcon } from "@next/components/icons";
import { useRouter } from "next/navigation";

type Project = {
    id: string;
    title: string;
    priority?: number;
    description?: string;
    categories?: { id: string; title: string }[];
    updatedAt?: string;
};

type Category = { id: string; title: string };

export default function ProjectListView() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filterCat, setFilterCat] = useState<string | null>(null);
    const [catInput, setCatInput] = useState("");
    const [loading, setLoading] = useState(false);

    const filtered = useMemo(() => {
        return projects.filter(p => {
            const matchesCat = filterCat ? p.categories?.some(c => c.id === filterCat) : true;
            return matchesCat;
        });
    }, [projects, filterCat]);

    const fetchCategories = useCallback(async () => {
        const res = await window.electron?.categories?.list?.();
        if (res) setCategories(res);
    }, []);

    const fetchProjects = useCallback(async (categoryId?: string) => {
        setLoading(true);
        try {
            const res = await window.electron?.projects?.list?.(categoryId ? { categoryId } : undefined);
            if (res) setProjects(res);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAddCategory = async () => {
        const title = catInput.trim();
        if (!title) return;
        try {
            const created = await window.electron?.categories?.create?.(title);
            if (created) {
                setCategories(prev => [...prev, created]);
                setCatInput("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProjects();
    }, [fetchCategories, fetchProjects]);

    useEffect(() => {
        fetchProjects(filterCat || undefined);
    }, [filterCat, fetchProjects]);

    const handleDelete = useCallback(async (projectId: string) => {
        try {
            await window.electron?.projects?.delete?.(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (err) {
            console.error(err);
        }
    }, []);

    const handleEdit = useCallback((projectId: string) => {
        router.push(`/app/projects/save?id=${projectId}`);
    }, [router]);

    const handleDetails = useCallback((projectId: string) => {
        router.push(`/app/projects/detail?id=${projectId}`);
    }, [router]);

    return (
        <Stack gap={3} sx={{ position: "relative" }}>
            <Box
                sx={{
                    position: "absolute",
                    inset: "-8% 5% auto auto",
                    height: 220,
                    width: 220,
                    background: "radial-gradient(circle at 30% 30%, rgba(127, 209, 255, 0.18), transparent 60%)",
                    filter: "blur(10px)",
                    pointerEvents: "none",
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    inset: "auto auto -15% -5%",
                    height: 260,
                    width: 260,
                    background: "radial-gradient(circle at 50% 50%, rgba(124, 139, 255, 0.14), transparent 60%)",
                    filter: "blur(12px)",
                    pointerEvents: "none",
                }}
            />

            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
                <Stack gap={0.5}>
                    <Typography variant="h4" fontWeight={800}>Projects</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Live portfolio—filter by lane, drop in new categories, and drill into details.
                    </Typography>
                </Stack>
                <Stack direction="row" gap={1}>
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        href="/app/projects/save"
                    >
                        New project
                    </Button>
                </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={2}>
                <Box
                    sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 1.5,
                    }}
                >
                    <Metric title="Projects" value={projects.length.toString()} hint="total" color="primary" />
                    <Metric title="Filtered" value={filtered.length.toString()} hint="matching filters" color="success" />
                    <Metric title="Categories" value={categories.length.toString()} hint="available" color="warning" />
                    <Metric title="Priority avg" value={averagePriority(projects)} hint="0-5 scale" color="info" />
                </Box>
            </Stack>

            <Stack gap={1.5}>
                <Stack direction={{ xs: "column", md: "row" }} gap={1} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="h6" fontWeight={700}>Categories</Typography>
                        <Chip label="tap to filter" size="small" color="primary" variant="outlined" />
                    </Stack>
                    <Stack direction="row" gap={1} flexWrap="wrap">
                        <TextField
                            size="small"
                            placeholder="New category"
                            value={catInput}
                            onChange={(e) => setCatInput(e.target.value)}
                            sx={{
                                minWidth: 180,
                                "& .MuiInputBase-root": { borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }
                            }}
                        />
                        <Button onClick={handleAddCategory} variant="outlined" startIcon={<AddRoundedIcon />}>Add</Button>
                    </Stack>
                </Stack>
                <Stack direction="row" gap={1} flexWrap="wrap">
                    <Chip
                        label="All"
                        color={filterCat ? "default" : "primary"}
                        onClick={() => setFilterCat(null)}
                        variant={filterCat ? "outlined" : "filled"}
                    />
                    {categories.map(cat => (
                        <Chip
                            key={cat.id}
                            label={cat.title}
                            color={filterCat === cat.id ? "primary" : "default"}
                            variant={filterCat === cat.id ? "filled" : "outlined"}
                            onClick={() => setFilterCat(filterCat === cat.id ? null : cat.id)}
                        />
                    ))}
                </Stack>
            </Stack>

            <Stack gap={1.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="h6" fontWeight={700}>Pipeline</Typography>
                    <Chip label={loading ? "Loading…" : "Live snapshot"} size="small" color="primary" variant="outlined" />
                </Stack>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Categories</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.map((project, i) => (
                                <TableRow
                                    key={project.id}
                                >
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{project.title}</TableCell>
                                    <TableCell>
                                        <Rating
                                            value={project.priority}
                                            readOnly
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" gap={.5}>
                                            {
                                                project.categories?.map(x => <Chip
                                                    key={x.id}
                                                    label={x.title}
                                                    color="secondary"
                                                />)
                                            }
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" justifyContent="end">
                                            <IconButton size="small" onClick={() => handleDelete(project.id)}>
                                                <DeleteIcon width={18} height={18} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleEdit(project.id)}>
                                                <EditIcon width={18} height={18} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDetails(project.id)}>
                                                <SeeMoreIcon width={18} height={18} />
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

function Metric({ title, value, hint, color }: { title: string; value: string; hint: string; color: "primary" | "error" | "success" | "warning" | "info"; }) {
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

function averagePriority(items: Project[]) {
    if (!items.length) return "0";
    const avg = items.reduce((sum, p) => sum + (p.priority ?? 0), 0) / items.length;
    return avg.toFixed(1);
}
