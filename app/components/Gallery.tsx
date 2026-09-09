"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const ESTATES = [
  { src: "/img/estate-1.jpg", alt: "Low pavilion estate under old-growth canopy" },
  { src: "/img/estate-2.jpg", alt: "Stacked white villa above a still pool" },
  { src: "/img/estate-3.jpg", alt: "Dark-clad courtyard house with a lit entry" },
  { src: "/img/estate-4.jpg", alt: "Timber-lined terraces over a lap pool" },
  { src: "/img/estate-5.jpg", alt: "Glazed garden residence behind a screen wall" },
];

const MARQUEE = "Selected residences —";

/**
 * The gallery used to crawl up across the statement, its top edge wiping over
 * the copy for a full viewport of scrolling. Instead its approach is compressed:
 * it rises normally until it meets the bottom of the pinned panel, and from
 * there a power curve carries it to full screen in a fraction of the distance,
 * so there is no drawn-out state where it sits half over the text.
 *
 * Layout is untouched — only the paint position moves — so the section that
 * follows keeps its place in the flow and the hand-off needs no spacer.
 */
const PANEL_BOTTOM = 0.87; // where `.statement` ends once it is pinned
const TAKEOVER = 0.26; // scroll it takes to go from there to full screen
const FADE_FROM = 0.97; // the copy starts clearing as the gallery shows itself…
const FADE_SPAN = 0.2; // …and is gone well before the rising edge reaches it

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

/**
 * A power curve gets there fast but starts at many times the scroll rate, which
 * reads as a lurch the instant the section is touched. This is a cubic Hermite
 * pinned at both ends instead: it leaves the panel already matching the speed
 * the section was rising at (gradient 1), accelerates through the middle, and
 * arrives at the top with the gradient back at 0 — so it settles into place
 * rather than slamming into it. No step in position or in velocity anywhere.
 */
const takeover = (u: number, from: number, span: number) =>
  from * (2 * u ** 3 - 3 * u ** 2 + 1) - span * (u ** 3 - 2 * u ** 2 + u);

export default function Gallery() {
  // nothing is expanded until a frame is picked up — as in the reference
  const [active, setActive] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // offsetTop ignores transforms, so the untransformed position stays readable
    const flowTop = () => {
      let el: HTMLElement | null = section;
      let y = 0;
      while (el) {
        y += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      return y;
    };

    let raf = 0;
    let top = flowTop();

    const draw = () => {
      const vh = window.innerHeight;
      const from = vh * PANEL_BOTTOM;
      const span = vh * TAKEOVER;
      const natural = top - window.scrollY;

      let painted = natural;
      if (natural < from && natural > 0) {
        const u = clamp01((from - natural) / span);
        painted = u >= 1 ? 0 : takeover(u, from, span);
      }
      section.style.transform = `translate3d(0, ${(painted - natural).toFixed(2)}px, 0)`;

      // …which finishes before the rising edge can reach the copy, so nothing
      // is ever seen sliced in half
      const handoff = smoothstep(
        clamp01((FADE_FROM * vh - natural) / (FADE_SPAN * vh))
      );
      document.documentElement.style.setProperty(
        "--panel-handoff",
        handoff.toFixed(3)
      );

      // running every frame keeps it locked to the smooth-scrolled position;
      // waiting on scroll events lands the transform a frame late and stutters
      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      top = flowTop();
    };

    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="gallery" aria-label="Selected residences" ref={sectionRef}>
      <div className="marquee" aria-hidden>
        <span>{`${MARQUEE} `.repeat(4)}</span>
        <span>{`${MARQUEE} `.repeat(4)}</span>
      </div>

      <div className="rail" data-active={active} onMouseLeave={() => setActive(-1)}>
        {ESTATES.map((estate, i) => (
          <figure
            key={estate.src}
            className="card"
            data-active={active === i}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            tabIndex={0}
          >
            <Image
              src={estate.src}
              alt={estate.alt}
              fill
              sizes="(max-width: 900px) 60vw, 46vw"
              priority={i < 3}
            />
            <span className="card__bar" />
          </figure>
        ))}
      </div>
    </section>
  );
}
