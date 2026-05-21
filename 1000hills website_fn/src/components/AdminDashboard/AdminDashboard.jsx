import { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import { assignOrder } from "../../utils/orderStore";

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
  const [vendorRequests, setVendorRequests] = useState(
    () => JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]').filter(r => r.status === 'pending')
  );
  const [actionDone, setActionDone] = useState(null);
  const [allVendors, setAllVendors] = useState(loadAllVendors);
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

  /* ── Assign form helpers ── */
  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setAssignForm({
      vendorId: "",
      deliveryDate: "",
      description: "",
      products: [{ name: order.product || "", qty: order.qty || "", unitPrice: "" }],
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

    const order = {
      id: selectedOrder.id,
      customer: selectedOrder.customer,
      vendorEmail: vendor.email,
      vendorName: vendor.name,
      deliveryDate: assignForm.deliveryDate,
      description: assignForm.description,
      products: assignForm.products,
      total: calcTotal() || selectedOrder.total,
      status: "Assigned",
      vendorStatus: "pending", // pending | accepted | rejected
      assignedAt: new Date().toISOString(),
    };

    assignOrder(order);
    setAssignModal(false);
    setAssignSuccess(`Order ${selectedOrder.id} assigned to ${vendor.name}`);
    setTimeout(() => setAssignSuccess(null), 4000);
  };

  const stats = [
    { label: "Total Vendors", value: "18", icon: "🏭", change: "3 pending approval", color: "#f97316" },
    { label: "Total Customers", value: "134", icon: "👥", change: "+12 this month", color: "#3b82f6" },
    { label: "Orders Today", value: "7", icon: "📋", change: "2 unassigned", color: "#a855f7" },
    { label: "Revenue (RWF)", value: "21.4M", icon: "💰", change: "+24% vs last month", color: "#22c55e" },
  ];

  const navItems = [
    { id: "overview",  label: "Overview",         icon: "⊞" },
    { id: "orders",    label: "Order Management", icon: "📋" },
    { id: "vendors",   label: "Vendor Management",icon: "🏭" },
    { id: "customers", label: "Customers",        icon: "👥" },
    { id: "approvals", label: "Approvals",        icon: "✅", badge: vendorRequests.length },
    { id: "payments",  label: "Payments",         icon: "💳" },
    { id: "analytics", label: "Analytics",        icon: "📊" },
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
            <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, background: actionDone.action === 'approved' ? '#2a7d3f' : '#ef4444', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              {actionDone.action === 'approved' ? '✓' : '✗'} {actionDone.name} has been <strong>{actionDone.action}</strong>
            </div>
          )}
          {assignSuccess && (
            <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, background: '#3b82f6', color: '#fff', padding: '14px 22px', borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              ⚡ {assignSuccess}
            </div>
          )}

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={styles.statsRow}>
                {stats.map((s, i) => (
                  <div className={styles.statCard} key={i} style={{ "--accent": s.color }}>
                    <div className={styles.statIcon} style={{ background: s.color + "18", color: s.color }}>{s.icon}</div>
                    <div>
                      <p className={styles.statValue}>{s.value}</p>
                      <p className={styles.statLabel}>{s.label}</p>
                      <p className={styles.statChange}>{s.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.alertBanner}>
                <span className={styles.alertIcon}>⚡</span>
                <span className={styles.alertText}>
                  <strong>2 orders are waiting for vendor assignment</strong> — Review and assign them now to avoid delays.
                </span>
                <button className={styles.alertBtn} onClick={() => setActiveTab("orders")}>Assign Now →</button>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Recent Orders</h2>
                  <button className={styles.viewAllBtn} onClick={() => setActiveTab("orders")}>View All →</button>
                </div>
                <OrderTable orders={mockOrders.slice(0, 4)} onAssign={openAssignModal} styles={styles} />
              </div>

              <div className={styles.twoCol}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Pending Vendor Requests</h2>
                    <button className={styles.viewAllBtn} onClick={() => setActiveTab("approvals")}>View All →</button>
                  </div>
                  {vendorRequests.length === 0
                    ? <p style={{ color: '#8a8680', fontSize: 13 }}>No pending requests</p>
                    : vendorRequests.slice(0, 2).map((v) => (
                      <div className={styles.requestCard} key={v.vendorEmail}>
                        <div className={styles.requestAvatar}>{(v.companyName || v.vendorName || '??').slice(0, 2).toUpperCase()}</div>
                        <div className={styles.requestInfo}>
                          <p className={styles.requestName}>{v.companyName || v.vendorName}</p>
                          <p className={styles.requestSub}>{v.location} · {new Date(v.submittedAt).toLocaleDateString()}</p>
                        </div>
                        <div className={styles.requestActions}>
                          <button className={styles.approveBtn} onClick={() => handleApprove(v)}>✓ Approve</button>
                          <button className={styles.rejectBtn} onClick={() => handleReject(v)}>✗ Reject</button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Top Vendors by Reliability</h2>
                  <div className={styles.vendorRankList}>
                    {allVendors.filter(v => v.reliability).sort((a, b) => b.reliability - a.reliability).map((v, i) => (
                      <div className={styles.vendorRankItem} key={v.id}>
                        <span className={styles.rankNum}>#{i + 1}</span>
                        <div className={styles.rankInfo}>
                          <p className={styles.rankName}>{v.name}</p>
                          <div className={styles.reliabilityBar}>
                            <div className={styles.reliabilityFill} style={{ width: v.reliability + "%", background: v.reliability > 90 ? "#22c55e" : v.reliability > 75 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                        </div>
                        <span className={styles.reliabilityScore} style={{ color: v.reliability > 90 ? "#22c55e" : v.reliability > 75 ? "#f59e0b" : "#ef4444" }}>{v.reliability}%</span>
                      </div>
                    ))}
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
                <select className={styles.filterSelect}><option>All Statuses</option><option>Pending</option><option>Assigned</option><option>Processing</option><option>Delivered</option></select>
                <select className={styles.filterSelect}><option>All Dates</option><option>Today</option><option>This Week</option><option>This Month</option></select>
              </div>
              <div className={styles.card}>
                <OrderTable orders={mockOrders} onAssign={openAssignModal} styles={styles} showAll />
              </div>
            </div>
          )}

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
                            <button className={styles.editBtn}>👁 View</button>
                            {v.status === "Approved" && <button className={styles.deleteBtn}>✗ Suspend</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {activeTab === "customers" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input className={styles.searchInput} placeholder="🔍  Search customers..." />
              </div>
              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Orders</th><th>Total Spent (RWF)</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {mockCustomers.map((c) => (
                        <tr key={c.id}>
                          <td className={styles.orderId}>{c.id}</td>
                          <td className={styles.productName}>{c.name}</td>
                          <td className={styles.dateCell}>{c.email}</td>
                          <td>{c.orders}</td>
                          <td className={styles.amount}>{c.totalSpent.toLocaleString()}</td>
                          <td className={styles.dateCell}>{c.joined}</td>
                          <td><button className={styles.editBtn}>👁 View</button></td>
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

      {/* ── ASSIGN VENDOR MODAL (NEW) ── */}
      {assignModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setAssignModal(false)}>
          <div className={styles.modal} style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Assign Order {selectedOrder.id} to Vendor</h2>
              <button className={styles.modalClose} onClick={() => setAssignModal(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>

              {/* Order summary */}
              <div className={styles.orderSummary} style={{ marginBottom: 20 }}>
                <div className={styles.summaryRow}><span>Customer</span><strong>{selectedOrder.customer}</strong></div>
                <div className={styles.summaryRow}><span>Original Product</span><strong>{selectedOrder.product}</strong></div>
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