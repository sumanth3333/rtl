
import { Suspense } from "react";
import SetupPasswordClient from "./SetupPasswordClient";

export default function SetupPasswordPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Loading setup...</div>}>
            <SetupPasswordClient />
        </Suspense>
    );
}

