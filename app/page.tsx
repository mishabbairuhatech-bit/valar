import Header from "./components/Header";
import Gallery from "./components/Gallery";
import StudioCarousel from "./components/StudioCarousel";
import Footer from "./components/Footer";
import HeroMedia from "./components/HeroMedia";
import SmoothScroll from "./components/SmoothScroll";

const STATS = [
  { num: "120+", label: "Portfolio Holdings" },
  { num: "12", label: "Global Locations" },
  { num: "98%", label: "Patron Loyalty Rate" },
];

export default function Home() {
  return (
    <main id="top">
      <SmoothScroll />
      <Header />

      {/* sky scrolls away, building rides down over the section below */}
      <HeroMedia />

      <section className="hero">
        <div className="hero__copy">
          <div className="hero__top">
            <span className="eyebrow">Live in</span>
            <p className="hero__note">
              Stately homes built with vision,{" "}
              <br />
              scope, and architectural finesse.
            </p>
          </div>
          <h1 className="hero__title">Irreplaceable</h1>
        </div>
      </section>

      <span className="tone-mark" data-tone="paper" aria-hidden />

      {/* the statement only needs to stick while the gallery climbs over it —
          scoping it here stops it staying pinned behind the sections below */}
      <div className="stack">
        <section className="statement">
          <div className="statement__inner">
            <p>
              Every estate we present is hand-chosen{" "}
              <br />
              through a frame of permanence, refinement,{" "}
              <br />
              and timeless detail. Standards are not{" "}
              <br />
              a flourish. It is our discipline.
            </p>

            <div className="stats">
              {STATS.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat__num">{stat.num}</div>
                  <div className="stat__label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Gallery />
      </div>

      <span className="tone-mark" data-tone="ink" aria-hidden />

      <StudioCarousel />

      <span className="tone-mark" data-tone="paper" aria-hidden />

      <Footer />
    </main>
  );
}
