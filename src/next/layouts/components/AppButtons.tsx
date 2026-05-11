import { Link } from "@mui/material";
import type { MouseEvent } from "react";

export default function AppButtons() {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>, action?: () => void) => {
        event.preventDefault();
        action?.();
    };

    return <>
        <Link
            href="#"
            sx={{
                display: 'block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'error.main'
            }}
            className="noDrag"
            onClick={(event) => handleClick(event, () => window.electron?.window?.close?.())}
        />
        <Link
            href="#"
            sx={{
                display: 'block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'warning.main'
            }}
            className="noDrag"
            onClick={(event) => handleClick(event, () => window.electron?.window?.minimize?.())}
        />
        <Link
            href="#"
            sx={{
                display: 'block',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'success.main'
            }}
            className="noDrag"
            onClick={(event) => handleClick(event, () => window.electron?.window?.maximize?.())}
        />
    </>
}
