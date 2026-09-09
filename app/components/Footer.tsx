const NAV = ["Portfolio", "Private office"];

const LEGAL = ["Careers", "Contact", "Privacy policy", "Terms & conditions"];

const SOCIAL = [
  {
    label: "Instagram",
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    path: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M7.5 10.5v6" />
        <circle cx="7.5" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
        <path d="M11.2 16.5v-6M11.2 12.6a2.4 2.4 0 0 1 4.8 0v3.9" />
      </>
    ),
  },
  {
    label: "X",
    path: <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" />,
  },
  {
    label: "Pinterest",
    path: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10.4 19.2 12.4 11M9.6 13.6a3.5 3.5 0 1 1 4.9 1.9" />
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__head">
        <a className="footer__logo" href="#top">
          Velar<span>.</span>
        </a>

        <span className="footer__rule" aria-hidden />

        <nav className="footer__nav" aria-label="Footer">
          {NAV.map((item) => (
            <a key={item} href="#top">
              {item}
            </a>
          ))}
        </nav>
      </div>

      <ul className="footer__social">
        {SOCIAL.map((item) => (
          <li key={item.label}>
            <a href="#top" aria-label={item.label}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {item.path}
              </svg>
            </a>
          </li>
        ))}
      </ul>

      <div className="footer__centre">
        <h2>Private estates since 1974</h2>
        <p>Twelve territories. One standard.</p>
      </div>

      <div className="footer__foot">
        <div className="footer__cta">
          <div className="footer__cta-row">
            <h3>Arrange a viewing</h3>
            <a className="footer__button" href="mailto:hello@velar.estate">
              Book now
            </a>
          </div>
          <p>Private appointments, across twelve territories.</p>
        </div>

        <div className="footer__legal">
          <nav aria-label="Legal">
            {LEGAL.map((item, i) => (
              <span key={item}>
                {i > 0 && <i aria-hidden>//</i>}
                <a href="#top">{item}</a>
              </span>
            ))}
          </nav>
          <p>© Velar Estates all rights reserved 2026</p>
        </div>
      </div>
    </footer>
  );
}
