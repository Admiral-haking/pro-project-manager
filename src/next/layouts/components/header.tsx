import { Box, IconButton, Stack } from "@mui/material";
import AppButtons from "./AppButtons";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Link from "next/link";
import SearchBox from "@next/components/search";
import AppMenu from "./Menu";
import { TerminalIcon } from "@next/components/icons";
import { toast } from "sonner";

export default function Header() {
    return <Stack
        direction="row"
        gap={1}
        alignItems="center"
        component="nav"
        className="header"
        sx={{ p: 1, px: 2, width: '100%' }}>

        <AppButtons />

        <Space />

        <IconButton
            LinkComponent={Link}
            href="/app/dashboard"
            sx={{ color: 'text.secondary' }}
            className="noDrag"
        >
            <HomeRoundedIcon />
        </IconButton>

        <SearchBox />

        <Space />

        <AppMenu />

        <Space />

        <Box flex="1 1 auto" />

        <IconButton
            color="success"
            className="noDrag"
            onClick={async () => {
                const res = await window.electron?.sessions?.createLocal?.({
                    name: "Hippo Terminal",
                });

                if (!res) return toast.error("failed to create a local session for terminal.");

                window.electron?.newTerminal(res.id)
            }}
        >
            <TerminalIcon />
        </IconButton>

        <IconButton
            LinkComponent={Link}
            href="/app/settings"
            sx={{ color: 'text.secondary' }}
            className="noDrag"
        >
            <SettingsRoundedIcon />
        </IconButton>

    </Stack>
}


function Space() {
    return <Box sx={{ width: 10 }} />
}