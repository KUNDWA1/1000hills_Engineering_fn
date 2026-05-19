import { useState } from 'react';
import styles from './ProductCard.module.css';

function formatPrice(n) {
  return 'RWF ' + n.toLocaleString();
}

export default function ProductCard({ product, onAddToCart, onProductClick }) {
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleAdd(e) {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const isLow = product.status === 'LOW STOCK';
  const isOut = product.status === 'OUT OF STOCK';

  return (
    <div
      className={styles.card}
      onClick={() => onProductClick && onProductClick(product)}
      style={{ cursor: onProductClick ? 'pointer' : 'default' }}
    >
      <div className={styles.imgWrap}>
        {!imgError ? (
          <img
            src={product.img}
            alt={product.name}
            className={styles.img}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={styles.imgFallback}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}
        <span className={styles.categoryTag}>{product.category.replace('-', ' ').toUpperCase()}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.brand}>{product.brand}</span>
          <span className={`${styles.status} ${isLow ? styles.statusLow : isOut ? styles.statusOut : styles.statusIn}`}>
            {isLow ? '⚠ LOW STOCK' : isOut ? '✕ OUT OF STOCK' : '● IN STOCK'}
          </span>
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        {product.description && (
          <p className={styles.desc}>{product.description}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <button
            className={`${styles.addBtn} ${added ? styles.addedBtn : ''}`}
            onClick={handleAdd}
            disabled={isOut}
            title="Add to cart"
          >
            {added ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}