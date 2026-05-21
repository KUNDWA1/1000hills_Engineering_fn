import styles from './Cart.module.css';
import { submitCustomerOrder } from '../../utils/orderStore';

function formatPrice(n) {
  return 'RWF ' + n.toLocaleString();
}

export default function Cart({ isOpen, onClose, items, onRemove, onUpdateQty, loggedInUser }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const handlePlaceOrder = () => {
    if (!loggedInUser) {
      alert('Please sign in to place an order.');
      return;
    }
    submitCustomerOrder({
      customerEmail: loggedInUser.email,
      customerName: loggedInUser.name,
      items: items.map(i => ({ name: i.name, brand: i.brand, qty: i.qty, price: i.price })),
      total,
    });
    items.forEach(i => onRemove(i.id));
    onClose();
    alert('Order placed! Admin will review and assign a vendor.');
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>CART</h2>
            {count > 0 && <span className={styles.count}>{count} item{count !== 1 ? 's' : ''}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.25">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <p>Your cart is empty</p>
              <span>Browse our catalogue and add items</span>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    <img src={item.img} alt={item.name} onError={(e) => { e.target.style.display='none'; }} />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemBrand}>{item.brand}</span>
                    <p className={styles.itemName}>{item.name}</p>
                    <span className={styles.itemPrice}>{formatPrice(item.price)}</span>
                  </div>
                  <div className={styles.itemControls}>
                    <div className={styles.qtyRow}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      >−</button>
                      <span className={styles.qty}>{item.qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      >+</button>
                    </div>
                    <button className={styles.removeBtn} onClick={() => onRemove(item.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TOTAL</span>
              <span className={styles.totalPrice}>{formatPrice(total)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handlePlaceOrder}>
              PLACE ORDER
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
            <button className={styles.clearBtn} onClick={() => items.forEach(i => onRemove(i.id))}>
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}