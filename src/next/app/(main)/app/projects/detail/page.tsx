import { Suspense } from "react";
import ProjectDetailView from "@next/views/projects/ProjectDetailView";

export default function Page() {
    return (
        <Suspense>
            <ProjectDetailView />
        </Suspense>
    );
}
