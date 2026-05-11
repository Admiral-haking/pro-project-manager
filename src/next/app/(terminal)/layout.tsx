import { MinimalLayout } from "@next/layouts";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return <MinimalLayout>
        {children}
    </MinimalLayout>
}