"use client";

import { useEffect, useMemo, useState } from "react";
import { alpha, Box, Button, Divider, Grid, Stack, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@next/components/hook-form/form-provider";
import { RHFTextField } from "@next/components/hook-form/rhf-text-field";
import { RHFMultiSelect } from "@next/components/hook-form/rhf-select";
import { RHFRating } from "@next/components/hook-form/rhf-rating";
import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; title: string };

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    priority: z.number().min(0).max(5),
    categoryIds: z.array(z.string()).optional(),
});

export default function ProjectSaveView() {
    const projectId = useSearchParams().get("id");
    const router = useRouter();
    const isEditing = Boolean(projectId);
    const methods = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            description: "",
            priority: 0,
            categoryIds: []
        }
    });

    const { watch, setValue, reset, handleSubmit } = methods;

    const priority = watch("priority") ?? 0;
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCat, setNewCat] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");

    const stage = useMemo(() => (priority >= 4 ? "At Risk" : priority >= 2 ? "In Progress" : "Discovery"), [priority]);

    const loadCategories = async () => {
        const res = await window.electron?.categories?.list?.();
        if (res) setCategories(res);
    };

    const loadProject = async () => {
        if (!projectId) return;
        const res = await window.electron?.projects?.get?.(projectId);
        if (res) {
            reset({
                title: res.title ?? "",
                description: res.description ?? "",
                priority: res.priority ?? 0,
                categoryIds: res.categoryIds ?? res.categories?.map((c: any) => c.id) ?? []
            });
        }
    };

    useEffect(() => {
        loadCategories();
        loadProject();
    }, [projectId]);

    const handleSave = async (data: z.infer<typeof schema>) => {
        setStatus("saving");
        try {
            await window.electron?.projects?.save?.({
                id: projectId ?? undefined,
                title: data.title,
                description: data.description,
                priority: data.priority,
                categoryIds: data.categoryIds ?? [],
            });
            setStatus("saved");
            router.push("/app/projects")
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    const handleCreateCategory = async () => {
        const name = newCat.trim();
        if (!name) return;
        try {
            const res = await window.electron?.categories?.create?.(name);
            if (res) {
                setCategories(prev => [...prev, res]);
                setValue("categoryIds", [...(methods.getValues("categoryIds") ?? []), res.id]);
                setNewCat("");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        reset({
            title: "",
            description: "",
            priority: 0,
            categoryIds: []
        });
        setStatus("idle");
    };

    return (
        <Form methods={methods} onSubmit={handleSubmit(handleSave)}>
            <Stack gap={3}>
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        position: 'relative'
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
                        <div>
                            <Typography variant="h5" fontWeight={800}>{isEditing ? "Update project" : "Create project"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isEditing ? "Editing" : "Drafting"} only what exists in the model: title, summary, priority, categories.
                            </Typography>
                        </div>
                        <Stack direction="row" gap={1}>
                            <Button startIcon={<AutorenewRoundedIcon />} variant="outlined" onClick={resetForm}>Reset</Button>
                            <Button startIcon={<SaveRoundedIcon />} type="submit" variant="contained" sx={{ borderRadius: 2, px: 2.5 }} disabled={status === "saving"}>
                                {status === "saving" ? "Saving…" : isEditing ? "Save changes" : "Save project"}
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

                    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Stack gap={2}>
                                <RHFTextField name="title" label="Project name" placeholder="Project Phoenix" />
                                <RHFTextField name="description" label="Summary" multiline minRows={3} placeholder="What problem are we solving and why now?" />
                                <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
                                    <Box
                                        sx={{
                                            px: 1.5,
                                            py: 1,
                                            borderRadius: 1.5,
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 1.25,
                                            minWidth: 220
                                        }}
                                    >
                                        <Typography variant="subtitle2">Priority</Typography>
                                        <RHFRating name="priority" precision={0.5} max={5} />
                                    </Box>
                                    <TextField fullWidth label="Stage (auto)" value={stage} disabled />
                                </Stack>

                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Stack gap={1.5}>
                                <Typography variant="subtitle2" fontWeight={700}>Categories</Typography>
                                <Box
                                    sx={{
                                        borderRadius: 1.5,
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        padding: 1.25,
                                        minHeight: 84
                                    }}
                                >
                                    <RHFMultiSelect
                                        name="categoryIds"
                                        label="Categories"
                                        options={categories.map(c => ({ label: c.title, value: c.id }))}
                                        placeholder="Select categories"
                                        checkbox
                                        chip
                                        helperText="Toggle categories or add a new one."
                                    />
                                </Box>
                                <Stack direction="row" gap={1.25} alignItems="center">
                                    <TextField size="small" placeholder="New category" value={newCat} onChange={(e) => setNewCat(e.target.value)} sx={{ flex: 1 }} />
                                    <Button variant="outlined" onClick={handleCreateCategory}>Add</Button>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Stack>
        </Form>
    );
}

function FieldShell({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode; }) {
    return (
        <Box
            sx={theme => ({
                p: 1.5,
                borderRadius: 1.5,
                border: "1px solid rgba(255,255,255,0.08)",
                background: alpha(theme.palette.background.paper, 0.86),
                display: "flex",
                flexDirection: "column",
                gap: 1,
            })}
        >
            <Stack direction="row" alignItems="center" gap={1}>
                {icon}
                <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
            </Stack>
            {body}
        </Box>
    );
}
