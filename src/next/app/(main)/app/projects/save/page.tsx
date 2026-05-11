import { Suspense } from "react";
import ProjectSaveView from "@next/views/projects/ProjectSaveView";

export default function Page() {
    return (
        <Suspense>
            <ProjectSaveView />
        </Suspense>
    );
}
