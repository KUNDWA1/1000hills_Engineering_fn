const KEY = '1h_orders';

export function getOrders() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

/** Admin creates / assigns an order to a vendor */
export function assignOrder(order) {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== order.id);
  saveOrders([...filtered, order]);
}

/** Vendor accepts an incoming order */
export function acceptOrder(orderId) {
  saveOrders(getOrders().map(o =>
    o.id === orderId ? { ...o, vendorStatus: 'accepted' } : o
  ));
}

/** Vendor rejects an incoming order */
export function rejectOrder(orderId) {
  saveOrders(getOrders().map(o =>
    o.id === orderId ? { ...o, vendorStatus: 'rejected' } : o
  ));
}

/** Get orders for a specific vendor email */
export function getVendorOrders(vendorEmail) {
  return getOrders().filter(o => o.vendorEmail === vendorEmail);
}
