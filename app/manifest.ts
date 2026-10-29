import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EcoSnap — Campus waste reporting",
    short_name: "EcoSnap",
    description: "Report campus waste issues with photographic evidence.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f4",
    theme_color: "#166445",
    orientation: "portrait",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
