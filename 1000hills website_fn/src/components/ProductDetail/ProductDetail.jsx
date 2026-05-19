import { useState } from 'react';
import styles from './ProductDetail.module.css';
import { productDetails } from '../../data/productDetails';

function formatPrice(n) {
  return 'RWF ' + n.toLocaleString();
}

export default function ProductDetail({ product, allProducts, onBack, onAddToCart, onProductClick }) {
  const detail = productDetails[product.id] || {};
  const images = detail.images || [product.img];
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isLow = product.status === 'LOW STOCK';
  const isOut = product.status === 'OUT OF STOCK';

  function handleAdd() {
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  // Related: same category, exclude current
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span className={styles.catTag}>
          {product.category.replace(/-/g, ' ').toUpperCase()}
        </span>
        <button className={styles.backBtn} onClick={onBack}>
          ← BACK TO CATALOG
        </button>
      </div>

      {/* Main layout */}
      <div className={styles.main}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImgWrap}>
            <img
              src={images[activeImg]}
              alt={product.name}
              className={styles.mainImg}
            />
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.brand}>{product.brand}</p>
          <h1 className={styles.name}>{product.name}</h1>

          {detail.partNumber && (
            <p className={styles.partNum}>Part # {detail.partNumber}</p>
          )}

          <div className={styles.pricing}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {detail.b2bPrice && (
              <span className={styles.b2b}>B2B: {formatPrice(detail.b2bPrice)}</span>
            )}
          </div>

          <p className={`${styles.stockStatus} ${isLow ? styles.stockLow : isOut ? styles.stockOut : styles.stockIn}`}>
            {isOut ? '✕ Out of stock' : isLow ? `⚠ Low stock (${detail.stock || ''} left)` : `In stock${detail.stock ? ` (${detail.stock} available)` : ''}`}
          </p>

          {/* Specs */}
          {detail.specs && detail.specs.length > 0 && (
            <div className={styles.specsBox}>
              <p className={styles.specsTitle}>SPECIFICATIONS</p>
              <table className={styles.specsTable}>
                <tbody>
                  {detail.specs.map((s) => (
                    <tr key={s.label}>
                      <td className={styles.specLabel}>{s.label}</td>
                      <td className={styles.specValue}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {detail.warranty && (
            <p className={styles.warranty}>Warranty: {detail.warranty}</p>
          )}

          {/* Qty + Add */}
          <div className={styles.actions}>
            <div className={styles.qtyWrap}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={isOut}
              >−</button>
              <span className={styles.qtyNum}>{qty}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQty((q) => q + 1)}
                disabled={isOut}
              >+</button>
            </div>
            <button
              className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
              onClick={handleAdd}
              disabled={isOut}
            >
              {added ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  ADDED
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  ADD TO CART
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>RELATED PRODUCTS</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => (
              <button
                key={p.id}
                className={styles.relatedCard}
                onClick={() => onProductClick(p)}
              >
                <div className={styles.relatedImgWrap}>
                  <img src={p.img} alt={p.name} className={styles.relatedImg} />
                  <span className={styles.relatedCatTag}>
                    {p.category.replace(/-/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className={styles.relatedBody}>
                  <p className={styles.relatedBrand}>{p.brand}</p>
                  <p className={styles.relatedName}>{p.name}</p>
                  <p className={styles.relatedPrice}>{formatPrice(p.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}