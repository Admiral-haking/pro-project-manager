"use client";

import { useEffect, useState } from "react";
import { alpha, Box, Button, Divider, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@next/components/hook-form/form-provider";
import { RHFTextField } from "@next/components/hook-form/rhf-text-field";
import { RHFSwitch } from "@next/components/hook-form/rhf-switch";
import { useSearchParams } from "next/navigation";

const schema = z.object({
    title: z.string().min(1, "Title is required"),
    host: z.string().min(1, "Host is required"),
    port: z.string().default("22"),
    users: z.array(z.object({
        username: z.string().min(1, "Username required"),
        password: z.string().optional(),
        privateKey: z.string().optional(),
        sudo: z.boolean().default(false)
    }))
});

export default function ServerSaveView() {
    const searchParams = useSearchParams();
    const serverId = searchParams.get("id");
    const isEditing = Boolean(serverId);
    const methods = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            host: "",
            port: "22",
            users: [{ username: "", password: "", privateKey: "", sudo: false }]
        }
    });

    const { control, reset, handleSubmit } = methods;
    const { fields, append, remove } = useFieldArray({ control, name: "users" });
    const [status, setStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");

    useEffect(() => {
        const load = async () => {
            if (!serverId) return;
            const res = await window.electron?.servers?.get?.(serverId);
            if (res) {
                reset({
                    title: res.title ?? "",
                    host: res.host ?? "",
                    port: res.port ?? "22",
                    users: res.users?.length ? res.users : [{ username: "", password: "", privateKey: "", sudo: false }]
                });
            }
        };
        load();
    }, [serverId, reset]);

    const onSubmit = async (data: z.infer<typeof schema>) => {
        setStatus("saving");
        try {
            await window.electron?.servers?.save?.({
                id: serverId ?? undefined,
                title: data.title,
                host: data.host,
                port: data.port,
                users: data.users
            });
            setStatus("saved");
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    const handleReset = () => {
        reset({
            title: "",
            host: "",
            port: "22",
            users: [{ username: "", password: "", privateKey: "", sudo: false }]
        });
        setStatus("idle");
    };

    return (
        <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={3}>
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "linear-gradient(120deg, rgba(255,255,255,0.02), rgba(124,139,255,0.05))"
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" gap={2}>
                        <div>
                            <Typography variant="h5" fontWeight={800}>{isEditing ? "Update server" : "Create server"}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Capture connection essentials and SSH users. Nothing extra.
                            </Typography>
                        </div>
                        <Stack direction="row" gap={1}>
                            <Button startIcon={<AutorenewRoundedIcon />} variant="outlined" onClick={handleReset}>Reset</Button>
                            <Button startIcon={<SaveRoundedIcon />} type="submit" variant="contained" sx={{ borderRadius: 2, px: 2.5 }} disabled={status === "saving"}>
                                {status === "saving" ? "Saving…" : isEditing ? "Save changes" : "Save server"}
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.12)" }} />

                    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack gap={2}>
                                <RHFTextField name="title" label="Name" placeholder="Prod bastion" />
                                <RHFTextField name="host" label="Host" placeholder="10.0.0.1 or ssh.example.com" />
                                <Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
                                    <RHFTextField name="port" label="Port" placeholder="22" />
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack gap={1.5}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Typography variant="subtitle2" fontWeight={700}>SSH Users</Typography>
                                    <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={() => append({ username: "", password: "", privateKey: "", sudo: false })}>
                                        Add user
                                    </Button>
                                </Stack>
                                <Stack gap={1}>
                                    {fields.map((field, idx) => (
                                        <Box
                                            key={field.id}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1.5,
                                                border: "1px solid rgba(255,255,255,0.1)",
                                                background: alpha("#ffffff", 0.02)
                                            }}
                                        >
                                            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                                                <RHFTextField name={`users.${idx}.username`} label="Username" placeholder="root" />
                                                <RHFTextField name={`users.${idx}.password`} label="Password" placeholder="Optional" type="password" />
                                            </Stack>
                                            <RHFTextField name={`users.${idx}.privateKey`} label="Private key (path or content)" placeholder="~/.ssh/id_rsa" sx={{ mt: 1 }} />
                                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                                                <Stack direction="row" alignItems="center" gap={1}>
                                                    <RHFSwitch name={`users.${idx}.sudo`} label="Sudo" />
                                                </Stack>
                                                {fields.length > 1 && (
                                                    <IconButton onClick={() => remove(idx)} color="error">
                                                        <DeleteForeverRoundedIcon />
                                                    </IconButton>
                                                )}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Stack>
        </Form>
    );
}
