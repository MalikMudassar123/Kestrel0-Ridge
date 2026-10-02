import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import Preloader from "@/components/Preloader";
import FixedUI from "@/components/FixedUI";
import ScrollFilm from "@/components/ScrollFilm";
import BookStay from "@/components/BookStay";
import Footer from "@/components/Footer";
import MenuOverlay from "@/components/MenuOverlay";
import Cursor from "@/components/Cursor";
import { kestrelAssets } from "@/assets/kestrel/assets";
import { lockScroll, startSmoothScroll } from "@/lib/smoothScroll";

function makeGrain() {
  const c = document.createElement("canvas");
  c.width = c.height = 192;
  const x = c.getContext("2d")!;
  const img = x.createImageData(192, 192);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

export default function IndexPage() {
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    // Always start the film from the top, so the intro and the film never start half-way.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.style.setProperty("--canvas", `url(${kestrelAssets.canvas})`);
    document.documentElement.style.setProperty("--grain", `url(${makeGrain()})`);
    startSmoothScroll();
    lockScroll(); // unlocked by ScrollFilm when the intro ends
  }, []);

  return (
    <>
      <Preloader onDone={() => setIntroReady(true)} />
      <FixedUI />
      <Cursor />
      <MenuOverlay />
      <main id="top">
        {/* ScrollFilm reads screen size on first render, so it renders in the browser only. */}
        <ClientOnly fallback={<div className="film__stage" />}>
          <ScrollFilm introReady={introReady} />
        </ClientOnly>
        <BookStay />
      </main>
      <Footer />
    </>
  );
}
