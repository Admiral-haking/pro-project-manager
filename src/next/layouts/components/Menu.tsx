import { Button } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppMenu() {
    return <>
        <Item
            title="Home"
            href="/app/dashboard"
        />
        <Item
            title="Projects"
            href="/app/projects"
        />
        <Item
            title="Servers"
            href="/app/servers"
        />
        <Item
            title="Contractors"
            href="/app/contractors"
        />
        <Item
            title="Todo"
            href="/app/todo"
        />
        <Button
            disableRipple
            className="noDrag"
            sx={{
                textTransform: 'inherit',
                color: 'text.secondary',
                fontWeight: 'bold'
            }}
        >
            More
        </Button>
    </>
}


type Props = {
    href: string
    title: string
}
function Item({ href, title }: Props) {

    const pathname = usePathname();

    const isActive = pathname.startsWith(href);

    return <Button
        disableRipple
        className="noDrag"
        sx={{
            textTransform: 'inherit',
            color: isActive ? 'primary.contrastText' : 'text.secondary',
            fontWeight: 'bold'
        }}
        LinkComponent={Link}
        href={href}
        color={isActive ? "primary" : "inherit"}
        variant={isActive ? "contained" : "text"}
    >
        {title}
    </Button>
}