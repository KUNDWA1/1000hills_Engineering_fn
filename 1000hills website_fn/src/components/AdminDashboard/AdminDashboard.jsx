import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import { assignOrder, getOrders, getCustomerOrders, confirmAndAssignOrder } from "../../utils/orderStore";

/* ── Seed vendors (always present) ──────────────────────── */
const SEED_VENDORS = [
  { id: "V-001", name: "Rwanda Builders Ltd", email: "info@rwandabuilders.rw", products: 24, reliability: 95, status: "Approved", availability: "Available", location: "Kigali" },
  { id: "V-002", name: "Kigali Hardware Hub", email: "hub@kigalihardware.rw", products: 18, reliability: 88, status: "Approved", availability: "Busy", location: "Kigali" },
  { id: "V-004", name: "SafeBuild Co.", email: "safe@safebuild.rw", products: 9, reliability: 72, status: "Approved", availability: "Available", location: "Huye" },
];

/** Pull approved vendors from localStorage and merge with seed list */
function loadAllVendors() {
  const requests = JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]');
  const approved = requests
    .filter(r => r.status === 'approved')
    .map((r, i) => ({
      id: 'V-R' + (i + 1).toString().padStart(3, '0'),
      name: r.companyName || r.vendorName,
      email: r.vendorEmail,
      products: 0,
      reliability: null,
      status: 'Approved',
      availability: 'Available',
      location: r.location || '—',
    }));
  // Merge: seed first, then real approved (skip if email already in seed)
  const seedEmails = SEED_VENDORS.map(v => v.email);
  const newVendors = approved.filter(v => !seedEmails.includes(v.email));
  return [...SEED_VENDORS, ...newVendors];
}

const mockOrders = [
  { id: "#ORD-001", customer: "Construc Labs", product: "Steel Rebar 12mm", qty: 50, total: 2250000, vendor: null, status: "Pending", date: "2025-01-15" },
  { id: "#ORD-002", customer: "Kigali Builders", product: "Portland Cement 50kg", qty: 100, total: 1800000, vendor: "Rwanda Builders Ltd", status: "Assigned", date: "2025-01-14" },
  { id: "#ORD-003", customer: "Green Build Co.", product: "PVC Pipe 4 inch", qty: 30, total: 360000, vendor: "Kigali Hardware Hub", status: "Processing", date: "2025-01-13" },
  { id: "#ORD-004", customer: "TechCon Ltd", product: "Safety Helmet (x20)", qty: 20, total: 150000, vendor: "SafeBuild Co.", status: "Delivered", date: "2025-01-12" },
];

const mockCustomers = [
  { id: "C-001", name: "Construc Labs", email: "info@construclabs.rw", orders: 5, totalSpent: 5800000, joined: "2024-10-01" },
  { id: "C-002", name: "Kigali Builders", email: "kb@kb.rw", orders: 12, totalSpent: 14200000, joined: "2024-08-15" },
  { id: "C-003", name: "Green Build Co.", email: "green@build.rw", orders: 3, totalSpent: 1100000, joined: "2024-12-20" },
];

const statusColors = {
  Suspended: "#6b7280",
  Approved: "#22c55e", Pending: "#f59e0b", Rejected: "#ef4444",
  Available: "#22c55e", Busy: "#f59e0b", Offline: "#6b7280",
  Assigned: "#3b82f6", Processing: "#a855f7", Delivered: "#22c55e",
  "Out for Delivery": "#06b6d4",
};

const EMPTY_ASSIGN = { vendorId: "", deliveryDate: "", description: "", products: [{ name: "", qty: "", unitPrice: "" }] };

/* ── Component ───────────────────────────────────────────── */
export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN);
  const [assignSuccess, setAssignSuccess] = useState(null);
  const [customerOrders, setCustomerOrders] = useState(() => getCustomerOrders());
  const [vendorRequests, setVendorRequests] = useState(
    () => JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]').filter(r => r.status === 'pending')
  );
  const [actionDone, setActionDone] = useState(null);
  const [allVendors, setAllVendors] = useState(loadAllVendors);
  const [viewOrder, setViewOrder] = useState(null);
  const [trackOrder, setTrackOrder] = useState(null); // { order, steps }
  const [viewVendor, setViewVendor] = useState(null);       // vendor being viewed
  const [suspendVendor, setSuspendVendor] = useState(null); // vendor pending suspension

  // Always refresh customer orders on every tab change
  useEffect(() => { setCustomerOrders(getCustomerOrders()); }, [activeTab]);

  // Refresh vendor list whenever an approval action fires
  useEffect(() => { setAllVendors(loadAllVendors()); }, [actionDone]);

  const handleApprove = (req) => {
    const all = JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]');
    localStorage.setItem('1h_vendor_requests', JSON.stringify(all.map(r => r.vendorEmail === req.vendorEmail ? { ...r, status: 'approved' } : r)));
    const userRecord = JSON.parse(localStorage.getItem('1h_user_' + req.vendorEmail) || '{}');
    localStorage.setItem('1h_user_' + req.vendorEmail, JSON.stringify({ ...userRecord, profileStatus: 'approved' }));
    setVendorRequests(prev => prev.filter(r => r.vendorEmail !== req.vendorEmail));
    setAllVendors(loadAllVendors());
    setActionDone({ name: req.companyName || req.vendorName, action: 'approved' });
    setTimeout(() => setActionDone(null), 4000);
  };

  const handleReject = (req) => {
    const all = JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]');
    localStorage.setItem('1h_vendor_requests', JSON.stringify(all.map(r => r.vendorEmail === req.vendorEmail ? { ...r, status: 'rejected' } : r)));
    const userRecord = JSON.parse(localStorage.getItem('1h_user_' + req.vendorEmail) || '{}');
    localStorage.setItem('1h_user_' + req.vendorEmail, JSON.stringify({ ...userRecord, profileStatus: 'rejected' }));
    setVendorRequests(prev => prev.filter(r => r.vendorEmail !== req.vendorEmail));
    setActionDone({ name: req.companyName || req.vendorName, action: 'rejected' });
    setTimeout(() => setActionDone(null), 4000);
  };

  const handleSuspend = (vendor) => {
    // For seed vendors: update in-memory only
    setAllVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status: 'Suspended' } : v));
    // For real vendors from localStorage: update their record
    const userRecord = JSON.parse(localStorage.getItem('1h_user_' + vendor.email) || '{}');
    if (userRecord.email) {
      localStorage.setItem('1h_user_' + vendor.email, JSON.stringify({ ...userRecord, profileStatus: 'suspended' }));
      const reqs = JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]');
      localStorage.setItem('1h_vendor_requests', JSON.stringify(
        reqs.map(r => r.vendorEmail === vendor.email ? { ...r, status: 'suspended' } : r)
      ));
    }
    setSuspendVendor(null);
    setActionDone({ name: vendor.name, action: 'suspended' });
    setTimeout(() => setActionDone(null), 4000);
  };

  const [expenseModal, setExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ label: '', amount: '', category: 'Vendor Payment' });
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('1h_expenses') || '[]'));

  const saveExpense = () => {
    if (!expenseForm.label.trim() || !expenseForm.amount) return;
    const updated = [...expenses, { ...expenseForm, id: Date.now(), date: new Date().toISOString() }];
    localStorage.setItem('1h_expenses', JSON.stringify(updated));
    setExpenses(updated);
    setExpenseForm({ label: '', amount: '', category: 'Vendor Payment' });
    setExpenseModal(false);
  };

  const totalRevenue = customerOrders.filter(o => o.status === 'Delivered').reduce((s, o) => s + (o.total || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const pendingOrders = customerOrders.filter(o => o.status === 'Pending');
  const assignedOrders = customerOrders.filter(o => o.status === 'Assigned');

  // Recent activity feed from real events
  const recentActivity = [
    ...customerOrders.slice(-3).reverse().map(o => ({
      text: `Order ${o.id} placed by ${o.customerName}`,
      time: new Date(o.placedAt).toLocaleDateString(),
      color: '#3b82f6',
    })),
    ...expenses.slice(-2).reverse().map(e => ({
      text: `Expense recorded: ${e.label} — RWF ${Number(e.amount).toLocaleString()}`,
      time: new Date(e.date).toLocaleDateString(),
      color: '#ef4444',
    })),
  ].slice(0, 6);

  /* ── Assign form helpers ── */
  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setAssignForm({
      vendorId: "",
      deliveryDate: "",
      description: "",
      products: order.items
        ? order.items.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.price || '' }))
        : [{ name: order.product || "", qty: order.qty || "", unitPrice: "" }],
    });
    setAssignModal(true);
  };

  const handleAssignField = (field, value) => setAssignForm(prev => ({ ...prev, [field]: value }));

  const handleProductField = (index, field, value) => {
    setAssignForm(prev => {
      const products = [...prev.products];
      products[index] = { ...products[index], [field]: value };
      return { ...prev, products };
    });
  };

  const addProductRow = () => setAssignForm(prev => ({
    ...prev,
    products: [...prev.products, { name: "", qty: "", unitPrice: "" }],
  }));

  const removeProductRow = (index) => setAssignForm(prev => ({
    ...prev,
    products: prev.products.filter((_, i) => i !== index),
  }));

  const calcTotal = () =>
    assignForm.products.reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0), 0);

  const handleConfirmAssign = () => {
    const vendor = allVendors.find(v => v.id === assignForm.vendorId);
    if (!vendor || !assignForm.deliveryDate) return;

    // Order sent to vendor — NO customer name/ID
    const vendorOrder = {
      id: selectedOrder.id,
      vendorEmail: vendor.email,
      vendorName: vendor.name,
      deliveryDate: assignForm.deliveryDate,
      description: assignForm.description,
      products: assignForm.products,
      total: calcTotal() || selectedOrder.total,
      status: 'Assigned',
      vendorStatus: 'pending',
      assignedAt: new Date().toISOString(),
    };

    assignOrder(vendorOrder);
    // Update customer order status
    confirmAndAssignOrder(selectedOrder.id, { vendorName: vendor.name, deliveryDate: assignForm.deliveryDate });
    setCustomerOrders(getCustomerOrders());
    setAssignModal(false);
    setAssignSuccess(`Order ${selectedOrder.id} assigned to ${vendor.name}`);
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  const navItems = [
    { id: "overview",    label: "Overview",                icon: "⊞" },
    { id: "orders",      label: "Customer Order Management", icon: "📋" },
    { id: "ordertrack",  label: "Order Track",             icon: "🚚" },
    { id: "vendors",     label: "Vendor Management",       icon: "🏭" },
    { id: "approvals",   label: "Approvals",               icon: "✅", badge: vendorRequests.length },
    { id: "payments",    label: "Payments",                icon: "💳" },
    { id: "analytics",   label: "Analytics",               icon: "📊" },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚙</span>
            {sidebarOpen && <span className={styles.logoText}>1000Hills</span>}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "‹" : "›"}
          </button>
        </div>

        <div className={styles.adminInfo}>
          <div className={styles.avatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}</div>
          {sidebarOpen && (
            <div className={styles.adminMeta}>
              <p className={styles.adminName}>{user?.name || 'Administrator'}</p>
              <span className={styles.adminRole}>Admin</span>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
              {sidebarOpen && item.badge > 0 && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={onLogout}>
            <span>⬡</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <span className={styles.breadcrumb}>Admin Panel / {navItems.find((n) => n.id === activeTab)?.label}</span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.searchBar}>
              <span>🔍</span>
              <input placeholder="Search anything..." className={styles.topSearch} />
            </div>
            <div className={styles.notifBtn}>🔔 <span className={styles.notifDot} /></div>
            <div className={styles.topbarAvatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}</div>
          </div>
        </header>

        <div className={styles.content}>

          {/* ── TOASTS ── */}
          {actionDone && (
            <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, background: actionDone.action === 'approved' ? '#2a7d3f' : actionDone.action === 'suspended' ? '#6b7280' : '#ef4444', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              {actionDone.action === 'approved' ? '✓' : actionDone.action === 'suspended' ? '⏸' : '✗'} {actionDone.name} has been <strong>{actionDone.action}</strong>
            </div>
          )}
          {assignSuccess && (
            <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, background: '#3b82f6', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              ⚡ {assignSuccess}
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>

              {/* ── FINANCE CARDS ── */}
              <div className={styles.financeRow}>

                {/* Revenue */}
                <div className={styles.finCard}>
                  <div className={styles.finCardAccent} style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)' }} />
                  <div className={styles.finCardIcon} style={{ background: '#22c55e18', color: '#22c55e' }}>💰</div>
                  <p className={styles.finCardLabel}>Total Revenue</p>
                  <p className={styles.finCardValue}>RWF {totalRevenue.toLocaleString()}</p>
                  <p className={styles.finCardSub}>
                    <span className={styles.finCardTrend} style={{ background: '#22c55e18', color: '#22c55e' }}>↑ Delivered orders</span>
                    <span>incoming cash flow</span>
                  </p>
                </div>

                {/* Expenses */}
                <div className={styles.finCard}>
                  <div className={styles.finCardAccent} style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }} />
                  <div className={styles.finCardIcon} style={{ background: '#ef444418', color: '#ef4444' }}>📤</div>
                  <p className={styles.finCardLabel}>Total Expenses</p>
                  <p className={styles.finCardValue}>RWF {totalExpenses.toLocaleString()}</p>
                  <p className={styles.finCardSub}>
                    <span className={styles.finCardTrend} style={{ background: '#ef444418', color: '#ef4444' }}>{expenses.length} entries</span>
                    <span>vendor &amp; operational</span>
                  </p>
                </div>

                {/* Net Profit */}
                <div className={styles.finCard}>
                  <div className={styles.finCardAccent} style={{ background: netProfit >= 0 ? 'linear-gradient(90deg,#3b82f6,#1d4ed8)' : 'linear-gradient(90deg,#f59e0b,#d97706)' }} />
                  <div className={styles.finCardIcon} style={{ background: netProfit >= 0 ? '#3b82f618' : '#f59e0b18', color: netProfit >= 0 ? '#3b82f6' : '#f59e0b' }}>
                    {netProfit >= 0 ? '📈' : '📉'}
                  </div>
                  <p className={styles.finCardLabel}>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                  <p className={styles.finCardValue} style={{ color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                    {netProfit >= 0 ? '+' : ''}RWF {netProfit.toLocaleString()}
                  </p>
                  <p className={styles.finCardSub}>
                    <span className={styles.finCardTrend} style={{ background: netProfit >= 0 ? '#22c55e18' : '#ef444418', color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                      {netProfit >= 0 ? '✓ Profitable' : '⚠ Loss'}
                    </span>
                    <span>Revenue minus expenses</span>
                  </p>
                </div>

                {/* Quick Actions */}
                <div className={styles.finCard}>
                  <div className={styles.finCardAccent} style={{ background: 'linear-gradient(90deg,#c8860a,#a06e08)' }} />
                  <div className={styles.finCardIcon} style={{ background: '#c8860a18', color: '#c8860a' }}>⚡</div>
                  <p className={styles.finCardLabel}>Quick Actions</p>
                  <div className={styles.quickActions}>
                    <button className={`${styles.qaBtn} ${styles.qaBtnPrimary}`} onClick={() => setExpenseModal(true)}>+ Add Expense</button>
                    <button className={styles.qaBtn} onClick={() => setActiveTab('orders')}>📋 Orders</button>
                    <button className={styles.qaBtn} onClick={() => setActiveTab('ordertrack')}>🚚 Track</button>
                    <button className={styles.qaBtn} onClick={() => {
                      const rows = customerOrders.map(o => `${o.id},${o.customerName},${o.status},${o.total}`).join('\n');
                      const blob = new Blob([`Order ID,Customer,Status,Total\n${rows}`], { type: 'text/csv' });
                      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '1000hills_orders.csv'; a.click();
                    }}>⬇ Export CSV</button>
                  </div>
                </div>
              </div>

              {/* ── KPI ROW ── */}
              <div className={styles.kpiRow}>
                {[
                  { icon: '📦', label: 'Total Orders', value: customerOrders.length, color: '#3b82f6' },
                  { icon: '⏳', label: 'Pending Assignment', value: pendingOrders.length, color: '#f59e0b' },
                  { icon: '🚚', label: 'In Transit', value: assignedOrders.length + customerOrders.filter(o => o.status === 'Processing' || o.status === 'Out for Delivery').length, color: '#a855f7' },
                  { icon: '✅', label: 'Delivered', value: customerOrders.filter(o => o.status === 'Delivered').length, color: '#22c55e' },
                  { icon: '🏭', label: 'Active Vendors', value: allVendors.filter(v => v.status === 'Approved').length, color: '#f97316' },
                  { icon: '✅', label: 'Pending Approvals', value: vendorRequests.length, color: '#ef4444' },
                  { icon: '💳', label: 'Expense Entries', value: expenses.length, color: '#06b6d4' },
                  { icon: '📊', label: 'Fulfillment Rate', value: customerOrders.length ? Math.round((customerOrders.filter(o => o.status === 'Delivered').length / customerOrders.length) * 100) + '%' : '0%', color: '#22c55e' },
                ].map((k, i) => (
                  <div className={styles.kpiCard} key={i}>
                    <div className={styles.kpiIcon} style={{ background: k.color + '18', color: k.color }}>{k.icon}</div>
                    <div className={styles.kpiInfo}>
                      <p className={styles.kpiValue}>{k.value}</p>
                      <p className={styles.kpiLabel}>{k.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── ALERT BANNER ── */}
              {pendingOrders.length > 0 && (
                <div className={styles.alertBanner}>
                  <span className={styles.alertIcon}>⚡</span>
                  <span className={styles.alertText}>
                    <strong>{pendingOrders.length} order{pendingOrders.length !== 1 ? 's are' : ' is'} waiting for vendor assignment</strong> — Review and assign them now to avoid delays.
                  </span>
                  <button className={styles.alertBtn} onClick={() => setActiveTab('orders')}>Assign Now →</button>
                </div>
              )}

              {/* ── MAIN CONTENT ROW ── */}
              <div className={styles.threeCol}>

                {/* Left: Recent Orders + Vendor Ranking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Recent Orders */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle} style={{ margin: 0 }}>Recent Orders</h2>
                      <button className={styles.viewAllBtn} onClick={() => setActiveTab('orders')}>View All →</button>
                    </div>
                    {customerOrders.length === 0 ? (
                      <p style={{ color: '#8a8680', fontSize: 13 }}>No orders yet.</p>
                    ) : (
                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead><tr><th>Order ID</th><th>Customer</th><th>Total (RWF)</th><th>Status</th><th>Date</th></tr></thead>
                          <tbody>
                            {customerOrders.slice(-5).reverse().map(o => (
                              <tr key={o.id}>
                                <td className={styles.orderId}>{o.id}</td>
                                <td>{o.customerName}</td>
                                <td className={styles.amount}>{o.total?.toLocaleString()}</td>
                                <td><span className={styles.statusPill} style={{ background: (statusColors[o.status] || '#f59e0b') + '22', color: statusColors[o.status] || '#f59e0b' }}>{o.status}</span></td>
                                <td className={styles.dateCell}>{new Date(o.placedAt).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Vendor Performance */}
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle} style={{ margin: 0 }}>Vendor Performance</h2>
                      <button className={styles.viewAllBtn} onClick={() => setActiveTab('vendors')}>View All →</button>
                    </div>
                    <div className={styles.vendorRankList}>
                      {allVendors.filter(v => v.reliability).sort((a, b) => b.reliability - a.reliability).map((v, i) => (
                        <div className={styles.vendorRankItem} key={v.id}>
                          <span className={styles.rankNum}>#{i + 1}</span>
                          <div className={styles.rankInfo}>
                            <p className={styles.rankName}>{v.name}</p>
                            <div className={styles.reliabilityBar}>
                              <div className={styles.reliabilityFill} style={{ width: v.reliability + '%', background: v.reliability > 90 ? '#22c55e' : v.reliability > 75 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                          </div>
                          <span className={styles.reliabilityScore} style={{ color: v.reliability > 90 ? '#22c55e' : v.reliability > 75 ? '#f59e0b' : '#ef4444' }}>{v.reliability}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Pending Actions + Activity Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Pending Actions */}
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Pending Actions</h2>
                    <div className={styles.pendingList}>
                      {pendingOrders.length > 0 && (
                        <div className={styles.pendingItem}>
                          <span className={styles.pendingIcon}>📋</span>
                          <div className={styles.pendingInfo}>
                            <p className={styles.pendingTitle}>{pendingOrders.length} Unassigned Order{pendingOrders.length !== 1 ? 's' : ''}</p>
                            <p className={styles.pendingDesc}>Awaiting vendor assignment</p>
                          </div>
                          <button className={styles.pendingAction} onClick={() => setActiveTab('orders')}>Assign</button>
                        </div>
                      )}
                      {vendorRequests.length > 0 && (
                        <div className={styles.pendingItem} style={{ borderLeftColor: '#3b82f6' }}>
                          <span className={styles.pendingIcon}>🏭</span>
                          <div className={styles.pendingInfo}>
                            <p className={styles.pendingTitle}>{vendorRequests.length} Vendor Approval{vendorRequests.length !== 1 ? 's' : ''}</p>
                            <p className={styles.pendingDesc}>Awaiting review</p>
                          </div>
                          <button className={styles.pendingAction} style={{ background: '#3b82f6' }} onClick={() => setActiveTab('approvals')}>Review</button>
                        </div>
                      )}
                      {pendingOrders.length === 0 && vendorRequests.length === 0 && (
                        <p style={{ color: '#8a8680', fontSize: 13 }}>✓ No pending actions</p>
                      )}
                    </div>
                  </div>

                  {/* Pending Vendor Requests */}
                  {vendorRequests.length > 0 && (
                    <div className={styles.card}>
                      <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle} style={{ margin: 0 }}>New Vendor Requests</h2>
                        <button className={styles.viewAllBtn} onClick={() => setActiveTab('approvals')}>View All →</button>
                      </div>
                      {vendorRequests.slice(0, 2).map(v => (
                        <div className={styles.requestCard} key={v.vendorEmail}>
                          <div className={styles.requestAvatar}>{(v.companyName || v.vendorName || '??').slice(0, 2).toUpperCase()}</div>
                          <div className={styles.requestInfo}>
                            <p className={styles.requestName}>{v.companyName || v.vendorName}</p>
                            <p className={styles.requestSub}>{v.location} · {new Date(v.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <div className={styles.requestActions}>
                            <button className={styles.approveBtn} onClick={() => handleApprove(v)}>✓</button>
                            <button className={styles.rejectBtn} onClick={() => handleReject(v)}>✗</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Recent Activity</h2>
                    {recentActivity.length === 0 ? (
                      <p style={{ color: '#8a8680', fontSize: 13 }}>No recent activity.</p>
                    ) : (
                      <div className={styles.activityFeed}>
                        {recentActivity.map((a, i) => (
                          <div className={styles.activityItem} key={i}>
                            <div className={styles.activityDot} style={{ background: a.color }} />
                            <div>
                              <p className={styles.activityText}>{a.text}</p>
                              <span className={styles.activityTime}>{a.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ── ORDER MANAGEMENT ── */}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input className={styles.searchInput} placeholder="🔍  Search orders..." />
                <select className={styles.filterSelect}>
                  <option>All Statuses</option><option>Pending</option><option>Assigned</option><option>Processing</option><option>Delivered</option>
                </select>
              </div>
              <div className={styles.card}>
                {customerOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📋</span>
                    <p>No customer orders yet.</p>
                  </div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total (RWF)</th>
                          <th>Vendor Assigned</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrders.map(o => (
                          <tr key={o.id}>
                            <td className={styles.orderId}>{o.id}</td>
                            <td>{o.customerName}</td>
                            <td style={{ fontSize: 12, color: '#8a8680' }}>
                              {o.items?.map(i => `${i.name} x${i.qty}`).join(', ')}
                            </td>
                            <td className={styles.amount}>{o.total?.toLocaleString()}</td>
                            <td>
                              {o.vendorName
                                ? <span className={styles.vendorAssigned}>{o.vendorName}</span>
                                : <span className={styles.unassignedTag}>Not Assigned</span>}
                            </td>
                            <td>
                              <span className={styles.statusPill} style={{
                                background: (statusColors[o.status] || '#f59e0b') + '22',
                                color: statusColors[o.status] || '#f59e0b'
                              }}>{o.status}</span>
                            </td>
                            <td className={styles.dateCell}>{new Date(o.placedAt).toLocaleDateString()}</td>
                            <td>
                              {o.status === 'Pending'
                                ? <button className={styles.assignBtn} onClick={() => openAssignModal(o)}>⚡ Assign</button>
                                : <button className={styles.editBtn} onClick={() => setViewOrder(o)}>👁 View</button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORDER TRACK ── */}
          {activeTab === 'ordertrack' && (() => {
            const trackedOrders = getCustomerOrders().filter(o => ['Assigned','Processing','Out for Delivery','Delivered'].includes(o.status));
            const TRACK_STEPS = ['Assigned','Processing','Out for Delivery','Delivered'];
            return (
              <div className={styles.tabContent}>
                {trackedOrders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🚚</span>
                    <p>No orders in tracking yet. Assign an order to a vendor first.</p>
                  </div>
                ) : (
                  <div className={styles.card}>
                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Vendor</th>
                            <th>Delivery By</th>
                            <th>Total (RWF)</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trackedOrders.map(o => (
                            <tr key={o.id}>
                              <td className={styles.orderId}>{o.id}</td>
                              <td>{o.customerName}</td>
                              <td className={styles.vendorAssigned}>{o.vendorName || '—'}</td>
                              <td className={styles.dateCell}>{o.deliveryDate || '—'}</td>
                              <td className={styles.amount}>{(() => { const vo = getOrders().find(x => x.id === o.id); return (vo?.total ?? o.total)?.toLocaleString(); })()}</td>
                              <td>
                                <span className={styles.statusPill} style={{ background: (statusColors[o.status] || '#f59e0b') + '22', color: statusColors[o.status] || '#f59e0b' }}>
                                  {o.status}
                                </span>
                              </td>
                              <td>
                                <button className={styles.editBtn} onClick={() => setTrackOrder({ order: o, steps: TRACK_STEPS })}>👁 View</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── VENDOR MANAGEMENT ── */}
          {activeTab === "vendors" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input className={styles.searchInput} placeholder="🔍  Search vendors..." />
                <select className={styles.filterSelect}><option>All Statuses</option><option>Approved</option><option>Pending</option><option>Rejected</option></select>
              </div>
              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Vendor ID</th><th>Company Name</th><th>Email</th><th>Location</th><th>Products</th><th>Reliability</th><th>Availability</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {allVendors.map((v) => (
                        <tr key={v.id}>
                          <td className={styles.orderId}>{v.id}</td>
                          <td className={styles.productName}>{v.name}</td>
                          <td className={styles.dateCell}>{v.email}</td>
                          <td>{v.location}</td>
                          <td>{v.products || '—'}</td>
                          <td>
                            {v.reliability ? (
                              <div className={styles.reliabilityInline}>
                                <div className={styles.reliabilityBarSm}>
                                  <div className={styles.reliabilityFill} style={{ width: v.reliability + "%", background: v.reliability > 90 ? "#22c55e" : v.reliability > 75 ? "#f59e0b" : "#ef4444" }} />
                                </div>
                                <span style={{ color: v.reliability > 90 ? "#22c55e" : v.reliability > 75 ? "#f59e0b" : "#ef4444", fontSize: "12px" }}>{v.reliability}%</span>
                              </div>
                            ) : <span className={styles.naTag}>N/A</span>}
                          </td>
                          <td><span className={styles.statusPill} style={{ background: statusColors[v.availability] + "22", color: statusColors[v.availability] }}>{v.availability}</span></td>
                          <td><span className={styles.statusPill} style={{ background: statusColors[v.status] + "22", color: statusColors[v.status] }}>{v.status}</span></td>
                          <td className={styles.actionsCell}>
                            <button className={styles.editBtn} onClick={() => setViewVendor(v)}>👁 View</button>
                            {v.status === 'Approved' && (
                              <button className={styles.deleteBtn} onClick={() => setSuspendVendor(v)}>✗ Suspend</button>
                            )}
                            {v.status === 'Suspended' && (
                              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Suspended</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── APPROVALS ── */}
          {activeTab === "approvals" && (
            <div className={styles.tabContent}>
              {vendorRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>✅</span>
                  <p>All vendor requests have been reviewed.</p>
                </div>
              ) : (
                vendorRequests.map((v) => (
                  <div className={styles.approvalCard} key={v.vendorEmail}>
                    <div className={styles.approvalHeader}>
                      <div className={styles.approvalAvatar}>
                        {v.photoPreview
                          ? <img src={v.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                          : (v.companyName || v.vendorName || '??').slice(0, 2).toUpperCase()
                        }
                      </div>
                      <div>
                        <h3 className={styles.approvalName}>{v.companyName || v.vendorName}</h3>
                        <p className={styles.approvalSub}>{v.vendorEmail} · {v.location} · Submitted: {new Date(v.submittedAt).toLocaleDateString()}</p>
                      </div>
                      <div className={styles.approvalActions}>
                        <button className={styles.approveBtn} onClick={() => handleApprove(v)}>✓ Approve Vendor</button>
                        <button className={styles.rejectBtn} onClick={() => handleReject(v)}>✗ Reject</button>
                      </div>
                    </div>
                    <div className={styles.approvalDocs}>
                      <p className={styles.docsTitle}>Company Details</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 16 }}>
                        {[['Contact', v.contactPerson], ['Phone', v.phone], ['Registration No.', v.registrationNo], ['Description', v.description]].filter(([, val]) => val).map(([k, val]) => (
                          <div key={k} style={{ fontSize: 13 }}>
                            <span style={{ color: '#8a8680', fontWeight: 600 }}>{k}: </span>
                            <span style={{ color: '#1a1916' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      <p className={styles.docsTitle}>Submitted Documents</p>
                      <div className={styles.docTags}>
                        {v.docs?.businessLicense && <span className={styles.docTag}>📄 Business License</span>}
                        {v.docs?.nationalId && <span className={styles.docTag}>🪪 National ID</span>}
                        {v.docs?.companyCertificate
                          ? <span className={styles.docTag}>📜 Company Certificate</span>
                          : <span className={styles.docTagMissing}>📜 Company Certificate — Not uploaded</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeTab === "payments" && (
            <div className={styles.tabContent}>
              <div className={styles.statsRow} style={{ marginBottom: 0 }}>
                {[
                  { label: "Total Revenue", value: "21,400,000 RWF", icon: "💰", color: "#22c55e" },
                  { label: "Confirmed Payments", value: "38", icon: "✅", color: "#3b82f6" },
                  { label: "Pending Payments", value: "4", icon: "⏳", color: "#f59e0b" },
                  { label: "Failed Transactions", value: "1", icon: "❌", color: "#ef4444" },
                ].map((s, i) => (
                  <div className={styles.statCard} key={i} style={{ "--accent": s.color }}>
                    <div className={styles.statIcon} style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div><p className={styles.statValue}>{s.value}</p><p className={styles.statLabel}>{s.label}</p></div>
                  </div>
                ))}
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Payment Transactions</h2></div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Amount (RWF)</th><th>Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {mockOrders.map((o) => (
                        <tr key={o.id}>
                          <td className={styles.orderId}>{o.id}</td>
                          <td>{o.customer}</td>
                          <td className={styles.amount}>{o.total.toLocaleString()}</td>
                          <td><span className={styles.categoryTag}>Mobile Money</span></td>
                          <td><span className={styles.statusPill} style={{ background: o.status === "Delivered" ? "#22c55e22" : "#f59e0b22", color: o.status === "Delivered" ? "#22c55e" : "#f59e0b" }}>{o.status === "Delivered" ? "Confirmed" : "Pending"}</span></td>
                          <td className={styles.dateCell}>{o.date}</td>
                          <td><button className={styles.editBtn}>Generate Invoice</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <div className={styles.tabContent}>
              <div className={styles.analyticsGrid}>
                {[
                  { label: "Orders This Month", value: 34, max: 50 },
                  { label: "Vendor Fulfillment Rate", value: 91, max: 100, unit: "%" },
                  { label: "Customer Retention", value: 78, max: 100, unit: "%" },
                  { label: "On-time Delivery", value: 85, max: 100, unit: "%" },
                ].map((m, i) => (
                  <div className={styles.metricCard} key={i}>
                    <p className={styles.metricLabel}>{m.label}</p>
                    <p className={styles.metricValue}>{m.value}{m.unit || ""}</p>
                    <div className={styles.metricBar}>
                      <div className={styles.metricFill} style={{ width: (m.value / m.max * 100) + "%", background: m.value / m.max > 0.8 ? "#22c55e" : "#f97316" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.twoCol}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Orders by Category</h2>
                  <div className={styles.categoryBreakdown}>
                    {[
                      { name: "Construction Tools", pct: 42, color: "#f97316" },
                      { name: "Building Supplies", pct: 28, color: "#3b82f6" },
                      { name: "Safety Equipment", pct: 18, color: "#22c55e" },
                      { name: "Plumbing Materials", pct: 12, color: "#a855f7" },
                    ].map((c) => (
                      <div className={styles.categoryRow} key={c.name}>
                        <span className={styles.categoryDot} style={{ background: c.color }} />
                        <span className={styles.categoryName}>{c.name}</span>
                        <div className={styles.categoryBar}><div className={styles.categoryFill} style={{ width: c.pct + "%", background: c.color }} /></div>
                        <span className={styles.categoryPct}>{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Vendor Performance Summary</h2>
                  <div className={styles.vendorRankList}>
                    {allVendors.filter(v => v.reliability).map((v, i) => (
                      <div className={styles.vendorRankItem} key={v.id}>
                        <span className={styles.rankNum}>#{i + 1}</span>
                        <div className={styles.rankInfo}>
                          <p className={styles.rankName}>{v.name}</p>
                          <div className={styles.reliabilityBar}><div className={styles.reliabilityFill} style={{ width: v.reliability + "%", background: v.reliability > 90 ? "#22c55e" : v.reliability > 75 ? "#f59e0b" : "#ef4444" }} /></div>
                        </div>
                        <span className={styles.reliabilityScore}>{v.reliability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── ADD EXPENSE MODAL ── */}
      {expenseModal && (
        <div className={styles.modalOverlay} onClick={() => setExpenseModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Add Expense</h2>
              <button className={styles.modalClose} onClick={() => setExpenseModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.expenseModal}>
                <div>
                  <label className={styles.modalSubtitle} style={{ display: 'block', marginBottom: 6 }}>Category</label>
                  <select className={styles.filterSelect} style={{ width: '100%' }} value={expenseForm.category} onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))}>
                    {['Vendor Payment','Salary','Logistics','Operations','Marketing','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={styles.modalSubtitle} style={{ display: 'block', marginBottom: 6 }}>Description</label>
                  <input className={styles.searchInput} style={{ width: '100%', boxSizing: 'border-box' }} placeholder='e.g. Payment to Rwanda Builders Ltd' value={expenseForm.label} onChange={e => setExpenseForm(p => ({ ...p, label: e.target.value }))} />
                </div>
                <div>
                  <label className={styles.modalSubtitle} style={{ display: 'block', marginBottom: 6 }}>Amount (RWF)</label>
                  <input type='number' min='0' className={styles.searchInput} style={{ width: '100%', boxSizing: 'border-box' }} placeholder='e.g. 500000' value={expenseForm.amount} onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setExpenseModal(false)}>Cancel</button>
              <button className={styles.primaryBtn} onClick={saveExpense} disabled={!expenseForm.label.trim() || !expenseForm.amount} style={{ opacity: (!expenseForm.label.trim() || !expenseForm.amount) ? 0.5 : 1 }}>Save Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRACK ORDER MODAL ── */}
      {trackOrder && (() => {
        const { order: o, steps: TRACK_STEPS } = trackOrder;
        const stepIdx = TRACK_STEPS.indexOf(o.status);
        return (
          <div className={styles.modalOverlay} onClick={() => setTrackOrder(null)}>
            <div className={styles.modal} style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Order Track — {o.id}</h2>
                <button className={styles.modalClose} onClick={() => setTrackOrder(null)}>✕</button>
              </div>
              <div className={styles.modalBody}>

                {/* Summary */}
                <div style={{ background: '#f7f5f2', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#8a8680' }}>
                  <span style={{ fontFamily: 'monospace', color: '#c8860a', fontWeight: 700 }}>{o.id}</span>
                  <span style={{ marginLeft: 10 }}>{new Date(o.placedAt).toLocaleDateString()}</span>
                  <div style={{ marginTop: 6 }}>
                    Customer: <strong style={{ color: '#1a1916' }}>{o.customerName}</strong>
                    {o.vendorName && <> &nbsp;·&nbsp; Vendor: <strong style={{ color: '#1a1916' }}>{o.vendorName}</strong></>}
                    {o.deliveryDate && <> &nbsp;·&nbsp; Delivery by: <strong style={{ color: '#1a1916' }}>{o.deliveryDate}</strong></>}
                  </div>
                </div>

                {/* Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                  {TRACK_STEPS.map((step, i) => (
                    <>
                      <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i <= stepIdx ? '#c8860a' : '#f0ede8', color: i <= stepIdx ? '#fff' : '#b8b4ae', fontWeight: 700, fontSize: 13, border: i === stepIdx ? '2px solid #a06e08' : '2px solid transparent' }}>
                          {i < stepIdx ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 10, color: i <= stepIdx ? '#c8860a' : '#b8b4ae', fontWeight: i === stepIdx ? 700 : 400, whiteSpace: 'nowrap' }}>{step}</span>
                      </div>
                      {i < TRACK_STEPS.length - 1 && (
                        <div key={step + '-line'} style={{ flex: 1, height: 3, background: i < stepIdx ? '#c8860a' : '#f0ede8', margin: '0 4px', marginBottom: 18, borderRadius: 4 }} />
                      )}
                    </>
                  ))}
                </div>

                {/* Items — use vendor order prices from 1h_orders */}
                {(() => {
                  const vendorOrder = getOrders().find(x => x.id === o.id);
                  const products = vendorOrder?.products || o.items;
                  const total = vendorOrder?.total ?? o.total;
                  return (
                    <>
                      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                        {products?.map((item, i) => {
                          const qty = Number(item.qty) || 0;
                          const unitPrice = Number(item.unitPrice ?? item.price) || 0;
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                              <span style={{ fontSize: 13.5, fontWeight: 500, color: '#1a1916' }}>{item.name} <span style={{ color: '#8a8680', fontWeight: 400 }}>x{qty}</span></span>
                              <strong style={{ color: '#2a7d3f', fontSize: 13 }}>RWF {(qty * unitPrice).toLocaleString()}</strong>
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #dedad3', marginBottom: 16 }}>
                        <span style={{ fontSize: 13, color: '#8a8680', fontWeight: 600 }}>Total</span>
                        <strong style={{ fontSize: 15, color: '#2a7d3f' }}>RWF {Number(total)?.toLocaleString()}</strong>
                      </div>
                    </>
                  );
                })()}

                {/* Update status */}
                {o.status !== 'Delivered' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#8a8680' }}>Update status:</span>
                    {TRACK_STEPS.filter((_, i) => i > stepIdx).map(nextStep => (
                      <button
                        key={nextStep}
                        onClick={() => {
                          const all = getCustomerOrders();
                          localStorage.setItem('1h_customer_orders', JSON.stringify(
                            all.map(x => x.id === o.id ? { ...x, status: nextStep } : x)
                          ));
                          setCustomerOrders(getCustomerOrders());
                          setTrackOrder({ order: { ...o, status: nextStep }, steps: TRACK_STEPS });
                        }}
                        style={{ background: '#c8860a18', border: '1px solid #c8860a40', color: '#c8860a', padding: '6px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}
                      >
                        Mark as {nextStep}
                      </button>
                    ))}
                  </div>
                )}
                {o.status === 'Delivered' && (
                  <p style={{ color: '#22c55e', fontWeight: 600, fontSize: 13 }}>✓ This order has been delivered.</p>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.primaryBtn} onClick={() => setTrackOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── VIEW ORDER MODAL ── */}
      {viewOrder && (
        <div className={styles.modalOverlay} onClick={() => setViewOrder(null)}>
          <div className={styles.modal} style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Order Details — {viewOrder.id}</h2>
              <button className={styles.modalClose} onClick={() => setViewOrder(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>

              {/* Status + date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span className={styles.statusPill} style={{ background: (statusColors[viewOrder.status] || '#f59e0b') + '22', color: statusColors[viewOrder.status] || '#f59e0b', fontSize: 13 }}>
                  {viewOrder.status}
                </span>
                <span style={{ fontSize: 12, color: '#b8b4ae' }}>Placed: {new Date(viewOrder.placedAt).toLocaleDateString()}</span>
              </div>

              {/* Customer info */}
              <div style={{ background: '#f7f5f2', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Customer</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a1916' }}>{viewOrder.customerName}</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8a8680' }}>{viewOrder.customerEmail}</p>
              </div>

              {/* Items */}
              <p style={{ margin: '0 0 10px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Items Ordered</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {viewOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: '#1a1916' }}>{item.name}</p>
                      {item.brand && <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#8a8680' }}>{item.brand}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#8a8680' }}>x{item.qty}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, fontWeight: 600, color: '#2a7d3f' }}>RWF {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #dedad3', borderBottom: '1px solid #dedad3', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#8a8680', fontWeight: 600 }}>Total</span>
                <strong style={{ fontSize: 15, color: '#2a7d3f' }}>RWF {viewOrder.total?.toLocaleString()}</strong>
              </div>

              {/* Vendor & delivery info */}
              {viewOrder.vendorName && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Assigned Vendor</p>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#1a1916' }}>{viewOrder.vendorName}</p>
                  </div>
                  {viewOrder.deliveryDate && (
                    <div style={{ background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Delivery Date</p>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#1a1916' }}>{viewOrder.deliveryDate}</p>
                    </div>
                  )}
                  {viewOrder.assignedAt && (
                    <div style={{ background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Assigned On</p>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#1a1916' }}>{new Date(viewOrder.assignedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={() => setViewOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW VENDOR MODAL ── */}
      {viewVendor && (
        <div className={styles.modalOverlay} onClick={() => setViewVendor(null)}>
          <div className={styles.modal} style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Vendor Details</h2>
              <button className={styles.modalClose} onClick={() => setViewVendor(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#c8860a,#a06e08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {viewVendor.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1a1916' }}>{viewVendor.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#8a8680' }}>{viewVendor.email}</p>
                </div>
                <span className={styles.statusPill} style={{ marginLeft: 'auto', background: (statusColors[viewVendor.status] || '#6b7280') + '22', color: statusColors[viewVendor.status] || '#6b7280' }}>
                  {viewVendor.status}
                </span>
              </div>
              {/* Details grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', marginBottom: 20 }}>
                {[
                  ['Vendor ID', viewVendor.id],
                  ['Location', viewVendor.location],
                  ['Availability', viewVendor.availability],
                  ['Products Listed', viewVendor.products || '—'],
                  ['Reliability Score', viewVendor.reliability ? viewVendor.reliability + '%' : 'N/A'],
                ].map(([k, val]) => (
                  <div key={k} style={{ background: '#f7f5f2', borderRadius: 8, padding: '10px 14px' }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{k}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: '#1a1916', fontWeight: 500 }}>{val}</p>
                  </div>
                ))}
              </div>
              {/* Reliability bar */}
              {viewVendor.reliability && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>Reliability</p>
                  <div style={{ height: 8, background: '#f0ede8', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: viewVendor.reliability + '%', background: viewVendor.reliability > 90 ? '#22c55e' : viewVendor.reliability > 75 ? '#f59e0b' : '#ef4444', borderRadius: 10, transition: 'width 0.4s' }} />
                  </div>
                  <p style={{ fontSize: 12, color: viewVendor.reliability > 90 ? '#22c55e' : viewVendor.reliability > 75 ? '#f59e0b' : '#ef4444', fontWeight: 700, marginTop: 6 }}>{viewVendor.reliability}%</p>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {viewVendor.status === 'Approved' && (
                <button className={styles.deleteBtn} style={{ padding: '10px 20px', fontSize: 13.5 }} onClick={() => { setViewVendor(null); setSuspendVendor(viewVendor); }}>✗ Suspend Vendor</button>
              )}
              <button className={styles.primaryBtn} onClick={() => setViewVendor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUSPEND CONFIRM MODAL ── */}
      {suspendVendor && (
        <div className={styles.modalOverlay} onClick={() => setSuspendVendor(null)}>
          <div className={styles.modal} style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Suspend Vendor</h2>
              <button className={styles.modalClose} onClick={() => setSuspendVendor(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: 14, color: '#1a1916', margin: 0 }}>
                Are you sure you want to suspend <strong>{suspendVendor.name}</strong>?<br />
                <span style={{ fontSize: 13, color: '#8a8680' }}>They will no longer be available for order assignments.</span>
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setSuspendVendor(null)}>Cancel</button>
              <button className={styles.deleteBtn} style={{ padding: '10px 20px', fontSize: 13.5 }} onClick={() => handleSuspend(suspendVendor)}>✗ Yes, Suspend</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN VENDOR MODAL ── */}
      {assignModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setAssignModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Assign Order {selectedOrder.id} to Vendor</h2>
              <button className={styles.modalClose} onClick={() => setAssignModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>

              {/* Order summary — no customer info sent to vendor */}
              <div className={styles.orderSummary} style={{ marginBottom: 20 }}>
                <div className={styles.summaryRow}>
                  <span>Order ID</span><strong>{selectedOrder.id}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Items</span>
                  <strong style={{ fontSize: 12 }}>
                    {selectedOrder.items?.map(i => `${i.name} x${i.qty}`).join(', ') || selectedOrder.product}
                  </strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total</span><strong className={styles.amount}>{selectedOrder.total?.toLocaleString()} RWF</strong>
                </div>
              </div>

              {/* Vendor select */}
              <p className={styles.modalSubtitle}>Select Vendor</p>
              <div className={styles.vendorOptions} style={{ marginBottom: 20 }}>
                {allVendors.filter(v => v.status === "Approved" && v.availability !== "Offline").map((v) => (
                  <div
                    className={styles.vendorOption}
                    key={v.id}
                    style={assignForm.vendorId === v.id ? { borderColor: "#c8860a", background: "#c8860a08" } : {}}
                    onClick={() => handleAssignField("vendorId", v.id)}
                  >
                    <input
                      type="radio"
                      name="vendor"
                      id={v.id}
                      className={styles.radioInput}
                      checked={assignForm.vendorId === v.id}
                      onChange={() => handleAssignField("vendorId", v.id)}
                    />
                    <label htmlFor={v.id} className={styles.vendorOptionLabel} style={{ cursor: "pointer" }}>
                      <div className={styles.voInfo}>
                        <p className={styles.voName}>{v.name}</p>
                        <p className={styles.voMeta}>{v.location} · {v.products} products · {v.email}</p>
                      </div>
                      <div className={styles.voMeta2}>
                        <span className={styles.statusPill} style={{ background: (v.availability === "Available" ? "#22c55e" : "#f59e0b") + "22", color: v.availability === "Available" ? "#22c55e" : "#f59e0b" }}>{v.availability}</span>
                        <span style={{ fontSize: "12px", color: "#22c55e" }}>⭐ {v.reliability}%</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Delivery date & description */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div className={styles.formGroup}>
                  <label className={styles.modalSubtitle} style={{ marginBottom: 6, display: "block" }}>Delivery Date *</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={assignForm.deliveryDate}
                    onChange={e => handleAssignField("deliveryDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalSubtitle} style={{ marginBottom: 6, display: "block" }}>Description / Notes</label>
                  <input
                    className={styles.formInput}
                    placeholder="Special instructions..."
                    value={assignForm.description}
                    onChange={e => handleAssignField("description", e.target.value)}
                  />
                </div>
              </div>

              {/* Products table */}
              <p className={styles.modalSubtitle} style={{ marginBottom: 10 }}>Products / Line Items</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                {assignForm.products.map((p, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 90px 110px 32px", gap: 8, alignItems: "center" }}>
                    <input
                      className={styles.formInput}
                      placeholder="Product name"
                      value={p.name}
                      onChange={e => handleProductField(idx, "name", e.target.value)}
                    />
                    <input
                      className={styles.formInput}
                      placeholder="Qty"
                      type="number"
                      min="1"
                      value={p.qty}
                      onChange={e => handleProductField(idx, "qty", e.target.value)}
                    />
                    <input
                      className={styles.formInput}
                      placeholder="Unit price"
                      type="number"
                      min="0"
                      value={p.unitPrice}
                      onChange={e => handleProductField(idx, "unitPrice", e.target.value)}
                    />
                    <button
                      onClick={() => removeProductRow(idx)}
                      style={{ background: "#ef444412", border: "none", color: "#ef4444", borderRadius: 6, cursor: "pointer", fontSize: 14, padding: "6px 8px" }}
                      disabled={assignForm.products.length === 1}
                    >✕</button>
                  </div>
                ))}
              </div>
              <button onClick={addProductRow} style={{ background: "#f0ede8", border: "none", color: "#8a8680", padding: "6px 14px", borderRadius: 7, cursor: "pointer", fontSize: 12.5, marginBottom: 16 }}>
                + Add Product Row
              </button>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, padding: "12px 0", borderTop: "1px solid #dedad3" }}>
                <span style={{ color: "#8a8680", fontSize: 13 }}>Estimated Total:</span>
                <strong style={{ color: "#2a7d3f", fontSize: 16 }}>{calcTotal().toLocaleString()} RWF</strong>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setAssignModal(false)}>Cancel</button>
              <button
                className={styles.primaryBtn}
                onClick={handleConfirmAssign}
                disabled={!assignForm.vendorId || !assignForm.deliveryDate}
                style={{ opacity: (!assignForm.vendorId || !assignForm.deliveryDate) ? 0.5 : 1 }}
              >
                ⚡ Assign to Vendor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component: OrderTable ── */
function OrderTable({ orders, onAssign, styles, showAll }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order ID</th><th>Customer</th><th>Product</th>
            <th>Total (RWF)</th><th>Vendor Assigned</th><th>Status</th><th>Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className={styles.orderId}>{o.id}</td>
              <td>{o.customer}</td>
              <td>{o.product}</td>
              <td className={styles.amount}>{o.total.toLocaleString()}</td>
              <td>{o.vendor ? <span className={styles.vendorAssigned}>{o.vendor}</span> : <span className={styles.unassignedTag}>Not Assigned</span>}</td>
              <td>
                <span className={styles.statusPill} style={{ background: { Pending: "#f59e0b", Assigned: "#3b82f6", Processing: "#a855f7", Delivered: "#22c55e" }[o.status] + "22", color: { Pending: "#f59e0b", Assigned: "#3b82f6", Processing: "#a855f7", Delivered: "#22c55e" }[o.status] }}>
                  {o.status}
                </span>
              </td>
              <td className={styles.dateCell}>{o.date}</td>
              <td>
                {!o.vendor
                  ? <button className={styles.assignBtn} onClick={() => onAssign(o)}>⚡ Assign</button>
                  : <button className={styles.editBtn}>View</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}