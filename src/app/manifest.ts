// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ሕንጸተ ሰብእ",
    short_name: "H♱S",
    description: "A digital manuscript for academic and spiritual excellence",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fdfaf1",
    theme_color: "#9b5c12",
    icons: [
      // 192x192
      {
        src: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },

      // 512x512
      {
        src: "/assets/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
