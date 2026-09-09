"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Three things move at three different rates in the hero.
 *
 *  · the sky scrolls away with the page, like any other section
 *  · the headline scrolls away with it
 *  · the building is welded to the viewport, so against the rising sky it is
 *    already drifting downward — and then, halfway through the hero, it starts
 *    sliding down the screen as well
 *
 * It is painted above the statement panel and below the gallery, so it crosses
 * over the second section on its way down and is swallowed by the third.
 *
 * Timing read off the reel — the sky's lower edge gives the scroll position,
 * the lamp head gives the travel:
 *
 *      hero progress   0.53   0.61   0.70   0.82
 *      travel (vh)      9.2   24.2   41.2   50.9
 *
 * which is a hold to just under halfway, then a quick ramp to 48vh — the point
 * where the roofline is crossing the figures on the panel below.
 *
 * From there it stops easing out and runs: a linear term picks up the speed the
 * ramp was carrying, and a squared term keeps building on it, so by the time it
 * leaves it is travelling at nearly twice the scroll rate. It clears a full
 * viewport height well before the gallery arrives, so the building sees itself
 * out rather than parking at the bottom edge waiting to be covered.
 */
const SLIDE_FROM = 0.47;
const SLIDE_OVER = 0.38;
const SLIDE_VH = 48;
const EASE = 1.6; // 1 − (1 − t)^EASE: quick off the mark, settling at the end

const EXIT_FROM = 0.82; // where the run for the door starts
const EXIT_SPEED = 44; // vh per unit of progress, carried over from the ramp
const EXIT_ACCEL = 190; // …and how hard it keeps building
const EXIT_VH = 112; // a full viewport clear of the top, so nothing is left

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function HeroMedia() {
  const buildingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = buildingRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const draw = () => {
      raf = 0;
      const p = window.scrollY / window.innerHeight;
      const t = clamp01((p - SLIDE_FROM) / SLIDE_OVER);
      const d = Math.max(0, p - EXIT_FROM);
      const travel = Math.min(
        (1 - Math.pow(1 - t, EASE)) * SLIDE_VH + EXIT_SPEED * d + EXIT_ACCEL * d * d,
        EXIT_VH
      );
      el.style.transform = `translate3d(0, ${travel.toFixed(2)}vh, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      {/* scrolls away with the page */}
      <div className="hero__sky">
        <Image src="/img/hero-sky.jpg" alt="" fill priority sizes="100vw" />
      </div>

      {/* held to the viewport, then slid down over the section below */}
      <div className="hero__building" ref={buildingRef} aria-hidden>
        <Image
          src="/img/hero-building.webp"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>
    </>
  );
}
