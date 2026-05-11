import MainLayout from "@next/layouts";
import { ReactNode } from "react";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: ReactNode }) {
    return <MainLayout>
        {children}
        <Toaster />
    </MainLayout>
}