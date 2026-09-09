"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const SHOTS = [
  { src: "/img/interior-1.jpg", alt: "Principal bedroom with a tufted headboard and linen bench" },
  { src: "/img/interior-2.jpg", alt: "Living room hung with a salon wall of framed prints" },
  { src: "/img/interior-3.jpg", alt: "Sitting room under woven rattan pendants" },
  { src: "/img/interior-4.jpg", alt: "Corner lounge opening onto a planted courtyard" },
  { src: "/img/interior-5.jpg", alt: "Low seating around a carved timber table" },
  { src: "/img/interior-6.jpg", alt: "Open kitchen and living volume under a raked ceiling" },
  { src: "/img/interior-7.jpg", alt: "Bright reception room facing a wall of glazing" },
  { src: "/img/interior-8.jpg", alt: "Bedroom with lacquered stools at the foot of the bed" },
];

/**
 * The band is a flat strip bowed by a vertical-only warp: every frame keeps its
 * width and its spacing, and only stretches taller the further it sits from the
 * middle. Measured off the reference, that stretch is a parabola reaching 1.26×
 * at the edges of the window:
 *
 *     s(u) = 1 + BOW · u²      u = (x − centre) / viewportWidth
 *
 * A plain scaleY would step at every card edge. Instead each card gets a
 * projective matrix3d that pins its left and right edges to their laid-out x
 * and stretches the two edges by s(left) and s(right) — so the tops and bottoms
 * of neighbouring cards meet on one continuous arc.
 */
const BOW = 1.032;

/** cards travelled across one full traverse of the section */
const TRAVEL = 6;

export default function StudioCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>(".studio__card")
    );
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let target = 0;
    let current = 0;

    const read = () => {
      const rect = section.getBoundingClientRect();
      // 0 as the section's top enters at the bottom of the window, 1 as its own
      // bottom leaves past the top — so the strip keeps travelling for as long
      // as any part of the section is on screen, footer or no footer
      const p = (window.innerHeight - rect.top) / (rect.height + window.innerHeight);
      const pitch = cards[0]?.offsetWidth
        ? cards[0].offsetWidth + gap()
        : window.innerWidth * 0.216;
      target = (Math.min(Math.max(p, 0), 1) - 0.5) * TRAVEL * pitch;
    };

    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;

    const layout = (offset: number) => {
      const vw = track.clientWidth;
      const centre = vw / 2;
      const w = cards[0].offsetWidth;
      const pitch = w + gap();
      const span = pitch * cards.length;

      cards.forEach((card, i) => {
        // wrap the strip so it reads as endless in both directions
        let x = i * pitch - offset;
        x = ((x % span) + span) % span;
        if (x > span / 2) x -= span;

        const left = centre + x - w / 2;
        const sl = 1 + BOW * ((left - centre) / vw) ** 2;
        const sr = 1 + BOW * ((left + w - centre) / vw) ** 2;

        // projective warp: x stays put, y stretches from sl to sr across the card
        const ratio = sl / sr;
        const p = (ratio - 1) / w;

        card.style.transform =
          `translateX(${left.toFixed(2)}px) ` +
          `matrix3d(${ratio.toFixed(5)},0,0,${p.toFixed(8)},` +
          `0,${sl.toFixed(5)},0,0,` +
          `0,0,1,0,` +
          `0,0,0,1)`;
      });
    };

    const measure = () => {
      read();
      if (reduced) layout(target);
    };

    measure();

    if (!reduced) {
      current = target;
      const loop = () => {
        // easing the offset rather than the scroll lets the strip glide on
        // for a beat after the wheel stops
        current += (target - current) * 0.075;
        layout(current);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section className="studio" ref={sectionRef}>
      <h2 className="studio__title">Rooms that endure</h2>
      <p className="studio__sub">
        Every residence in the portfolio is furnished by the studio that drew it.
      </p>

      <div className="studio__stage">
        <div className="studio__track" ref={trackRef}>
          {SHOTS.map((shot) => (
            <figure className="studio__card" key={shot.src}>
              <Image src={shot.src} alt={shot.alt} fill sizes="25vw" />
            </figure>
          ))}
        </div>
      </div>

      <p className="studio__note">
        We compose the interiors of private estates and commercial holdings from
        a blank page. No show homes, no repeated layouts, no shortcuts.
      </p>

      <div className="studio__links">
        <a href="#top">Book a viewing</a>
        <a href="#top">See the portfolio</a>
      </div>
    </section>
  );
}
