import { Suspense } from "react";
import ServerSaveView from "@next/views/servers/ServerSaveView";

export default function Page() {
    return (
        <Suspense>
            <ServerSaveView />
        </Suspense>
    );
}
