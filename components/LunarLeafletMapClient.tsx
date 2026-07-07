"use client";

import dynamic from "next/dynamic";

const LunarLeafletMap = dynamic(() => import("./LunarLeafletMap"), {
  ssr: false,
});

export default LunarLeafletMap;