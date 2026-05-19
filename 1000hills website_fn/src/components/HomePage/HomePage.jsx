import styles from './HomePage.module.css';
import ProductCard from '../ProductCard/ProductCard';

import { constructionToolsProducts } from '../../data/ConstructionTools_products';
import { generatorsProducts } from '../../data/Generators & Power_products';
import { securityProducts } from '../../data/Security & IT_products';
import { solarProducts } from '../../data/Solar & Energy_products';

const products = {
  'construction-tools': constructionToolsProducts,
  'generators-power': generatorsProducts,
  'security-it': securityProducts,
  'solar-energy': solarProducts,
};

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

const hubs = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: 'Construction Tools',
    sub: 'Heavy machinery, hand tools, and site equipment.',
    key: 'construction-tools',
  },

  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'MEP Design & Supervision',
    sub: 'Mechanical, HVAC, electrical, and plumbing systems.',
    key: 'construction-tools',
  },

  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M1 6l11 6 11-6" />
        <path d="M1 12l11 6 11-6" />
        <path d="M1 18l11 6 11-6" />
      </svg>
    ),
    title: 'IT & Surveillance',
    sub: 'Security, networking, and smart monitoring.',
    key: 'security-it',
  },

  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
    title: 'Energy & Sustainability',
    sub: 'Solar systems, storage, and renewable upgrades.',
    key: 'solar-energy',
  },
];

// Pull featured products
const featured = [
  ...products['solar-energy'].slice(0, 2),
  ...products['generators-power'].slice(0, 2),
  ...products['security-it'].slice(0, 2),
  ...products['construction-tools'].slice(0, 2),
  ...products['solar-energy'].slice(2, 4),
  ...products['generators-power'].slice(2, 4),
];

export default function HomePage({
  onCategoryChange,
  onAddToCart,
  onProductClick,
}) {
  return (
    <div className={styles.page}>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            Building the future of Rwanda
          </p>

          <h1 className={styles.heroTitle}>
            Building
            <br />
            with
            <br />
            precision.
          </h1>

          <p className={styles.heroDesc}>
            Premier engineering solutions across
            construction tools,
            <br />
            MEP design, IT infrastructure, and
            sustainable energy systems.
          </p>

          <div className={styles.heroBtns}>
            <button
              className={styles.btnPrimary}
              onClick={() =>
                document
                  .getElementById('featured-products')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              View inventory
            </button>

            <button
              className={styles.btnSecondary}
              onClick={() =>
                document
                  .getElementById('operation-hubs')
                  ?.scrollIntoView({
                    behavior: 'smooth',
                  })
              }
            >
              Consultancy services
            </button>
          </div>
        </div>
      </section>

      {/* ── OPERATION HUBS ── */}
      <section
        className={styles.hubsSection}
        id="operation-hubs"
      >
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              Operation Hubs
            </h2>

            <button className={styles.allDepts}>
              All departments →
            </button>
          </div>

          <div className={styles.hubsGrid}>
            {hubs.map((hub) => (
              <button
                key={hub.title}
                className={styles.hubCard}
                onClick={() =>
                  onCategoryChange(hub.key)
                }
              >
                <span className={styles.hubIcon}>
                  {hub.icon}
                </span>

                <h3 className={styles.hubTitle}>
                  {hub.title}
                </h3>

                <p className={styles.hubSub}>
                  {hub.sub}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section
        className={styles.productsSection}
        id="featured-products"
      >
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>
              High Precision Supply
            </h2>
          </div>

          <div className={styles.productsGrid}>
            {featured.map((product, i) => (
              <div
                key={product.id}
                className={styles.cardWrap}
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onProductClick={onProductClick}
                />
              </div>
            ))}
          </div>

          <div className={styles.viewAll}>
            <button
              className={styles.viewAllBtn}
              onClick={() =>
                onCategoryChange(
                  'construction-tools'
                )
              }
            >
              View full inventory →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}