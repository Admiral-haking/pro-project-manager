"use client"

import { Box, Stack, Typography } from "@mui/material"
import { ReactNode } from "react"

type Props = {
    title: string
    children: ReactNode
}
export default function Title({ children, title }: Props) {
    return <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={theme => ({
            p: 1,
            pl: 2,
            borderLeft: `5px solid ${theme.palette.primary.main}`,
            my: 2
        })}>

        <Typography variant="h6" fontWeight="bold">
            {title}
        </Typography>
        <Box flex="1 1 auto" />
        {children}
    </Stack>
}