import { createFileRoute } from "@tanstack/react-router";
import IndexPage from "@/pages/Index";
import { kestrelAssets } from "@/assets/kestrel/assets";

export const Route = createFileRoute("/")({
  component: IndexPage,
  head: () => ({
    meta: [
      { title: "Kestrel Ridge Lodge — Above the Clouds" },
      { name: "description", content: "A fictional luxury mountain lodge among snowy peaks, firelight and mist." },
      { property: "og:title", content: "Kestrel Ridge Lodge — Above the Clouds" },
      { property: "og:description", content: "Twelve suites of timber and stone, one long fire, and nowhere you need to be." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `https://id-preview--8fc3561d-bc7d-4900-b09a-86cd655a98b5.lovable.app${kestrelAssets.master}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://id-preview--8fc3561d-bc7d-4900-b09a-86cd655a98b5.lovable.app${kestrelAssets.master}` },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preload", as: "image", href: kestrelAssets.heroMobile, media: "(max-width: 767px)" },
      { rel: "preload", as: "image", href: kestrelAssets.mist },
      ...[kestrelAssets.sky, kestrelAssets.peaks, kestrelAssets.ridge, kestrelAssets.lodge, kestrelAssets.hand, kestrelAssets.branches].map((href) => ({
        rel: "preload", as: "image", href, media: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      })),
    ],
  }),
});
