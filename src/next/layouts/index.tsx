"use client"

import { Box, Stack, Typography } from "@mui/material"
import Header from "./components/header"
import Assistant from "@next/components/assistant"
import Link from "next/link"
import AppButtons from "./components/AppButtons"


export default function MainLayout({ children }: ChildProp) {
    return <>
        <Stack
            sx={{
                maxHeight: '100vh',
                height: '100%'
            }}>
            <Header />
            <Stack
                direction="row"
                gap={1}
                component="main"
                sx={{
                    width: '100%',
                    height: '100%',
                    maxHeight: 'calc(100vh - 56px)',
                    px: 2,
                    pt: 1
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        borderRadius: 1,
                        overflowY: 'scroll'
                    }}
                    flex="1 1 auto">
                    {children}

                    <Stack alignItems="center" justifyContent="center" sx={{ p: 4 }}>
                        <Typography variant="caption">Developed By <Link href="https://hippogriff.ir">Hippogriff</Link> | Mohammad Hussain Nazarnejad</Typography>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        width: 400,
                        minWidth: 400,
                        height: '100%',
                        overflow: 'hidden',
                        maxHeight: '100%'
                    }}
                >
                    <Assistant />
                </Box>
            </Stack>
        </Stack>
    </>
}


export function MinimalLayout({ children }: ChildProp) {
    return <>
        <Stack
            sx={{
                maxHeight: '100vh',
                height: '100%'
            }}>
            <Stack
                direction="row"
                gap={1}
                alignItems="center"
                component="nav"
                className="header"
                sx={{ p: 1, px: 2, width: '100%' }}>
                <AppButtons />
            </Stack>
            <Box sx={{ maxHeight: 'calc(100% - 56px)' }}>
                {children}
            </Box>
        </Stack>
    </>
}