const KEY = '1h_orders';
const CUSTOMER_ORDERS_KEY = '1h_customer_orders';

export function getOrders() {
  return JSON.parse(localStorage.getItem(KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

/** Customer places an order from cart */
export function submitCustomerOrder(order) {
  const all = JSON.parse(localStorage.getItem(CUSTOMER_ORDERS_KEY) || '[]');
  const newOrder = {
    ...order,
    id: '#ORD-' + Date.now(),
    status: 'Pending',
    placedAt: new Date().toISOString(),
  };
  localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify([...all, newOrder]));
  return newOrder;
}

/** Get all customer orders (for admin) */
export function getCustomerOrders() {
  return JSON.parse(localStorage.getItem(CUSTOMER_ORDERS_KEY) || '[]');
}

/** Get orders placed by a specific customer */
export function getMyOrders(customerEmail) {
  return getCustomerOrders().filter(o => o.customerEmail === customerEmail);
}

/** Admin confirms & assigns order to vendor — updates customer order status */
export function confirmAndAssignOrder(orderId, vendorData) {
  const all = getCustomerOrders();
  localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(
    all.map(o => o.id === orderId
      ? { ...o, status: 'Assigned', vendorName: vendorData.vendorName, deliveryDate: vendorData.deliveryDate, assignedAt: new Date().toISOString() }
      : o
    )
  ));
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
