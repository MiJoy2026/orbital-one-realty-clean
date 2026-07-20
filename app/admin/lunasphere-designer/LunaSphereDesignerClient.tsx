"use client";

import dynamic from "next/dynamic";

const LunaSphereDesigner = dynamic(
  () => import("@/components/moon-map/LunaSphereDesigner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading LunaSphere Designer...
      </div>
    ),
  }
);

export default function LunaSphereDesignerClient() {
  return <LunaSphereDesigner />;
}