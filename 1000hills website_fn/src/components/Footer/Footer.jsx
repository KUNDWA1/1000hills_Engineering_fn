import styles from './Footer.module.css';

const categories = [
  {
    key: 'construction-tools',
    label: 'Construction Tools',
  },
  {
    key: 'generators-power',
    label: 'Generators & Power',
  },
  {
    key: 'security-it',
    label: 'Security & IT',
  },
  {
    key: 'solar-energy',
    label: 'Solar & Energy',
  },
];

export default function Footer({ onCategoryChange }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>1H</span>
            <span className={styles.logoName}>
              1000 HILLS ENGINEERING
            </span>
          </div>

          <p className={styles.tagline}>
            Engineering-led sourcing for projects that need
            <br />
            reliability, technical depth, and long-term support.
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>DEPARTMENTS</h4>

            <ul>
              {categories.map((cat) => (
                <li key={cat.key}>
                  <button
                    className={styles.linkBtn}
                    onClick={() => onCategoryChange(cat.key)}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>CONTACT</h4>

            <ul>
              <li>
                <a
                  href="tel:+250788500080"
                  className={styles.linkBtn}
                >
                  +250 788 500 080
                </a>
              </li>

              <li>
                <a
                  href="mailto:info@1000hillseng.rw"
                  className={styles.linkBtn}
                >
                  info@1000hillseng.rw
                </a>
              </li>

              <li>
                <span className={styles.linkBtn}>
                  Kigali, Rwanda
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <nav className={styles.bottomNav}>
          <button className={styles.bottomLink}>
            Inventory
          </button>

          <button className={styles.bottomLink}>
            Departments
          </button>

          <button className={styles.bottomLink}>
            Support
          </button>
        </nav>

        <span className={styles.copy}>
          © 2026 1000 Hills Engineering. All rights reserved.
        </span>
      </div>
    </footer>
  );
}