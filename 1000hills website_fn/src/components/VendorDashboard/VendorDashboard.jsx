import { useState, useEffect } from "react";
import styles from "./VendorDashboard.module.css";
import { getVendorOrders, acceptOrder, rejectOrder } from "../../utils/orderStore";

const INITIAL_PRODUCTS = [
  { id: 1, name: "Steel Rebar 12mm", category: "Construction Tools", price: 45000, stock: 200, status: "Available" },
  { id: 2, name: "Portland Cement 50kg", category: "Building Supplies", price: 18000, stock: 85, status: "Available" },
  { id: 3, name: "Safety Helmet", category: "Safety Equipment", price: 7500, stock: 0, status: "Out of Stock" },
  { id: 4, name: "PVC Pipe 4 inch", category: "Plumbing Materials", price: 12000, stock: 60, status: "Available" },
];

const STATUS_COLORS = {
  Available: "#2a7d3f",
  "Out of Stock": "#ef4444",
  Processing: "#f59e0b",
  "Out for Delivery": "#3b82f6",
  Delivered: "#2a7d3f",
  Busy: "#f59e0b",
  Offline: "#6b7280",
  pending: "#f59e0b",
  accepted: "#22c55e",
  rejected: "#ef4444",
};

const EMPTY_FORM = { name: "", category: "", price: "", stock: "", status: "Available" };

const CATEGORIES = [
  "Construction Tools", "Building Supplies", "Safety Equipment",
  "Plumbing Materials", "Electrical Supplies", "Solar & Energy",
  "Generators & Power", "Security & IT",
];

export default function VendorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [availability, setAvailability] = useState("Available");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Products state
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  // Real orders from orderStore
  const vendorEmail = user?.email || "";
  const [allVendorOrders, setAllVendorOrders] = useState([]);
  const [actionToast, setActionToast] = useState(null); // { msg, type }

  // Poll orderStore every 10s for new assignments
  useEffect(() => {
    const load = () => setAllVendorOrders(getVendorOrders(vendorEmail));
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [vendorEmail]);

  const incomingRequests = allVendorOrders.filter(o => o.vendorStatus === "pending");
  const assignedOrders   = allVendorOrders.filter(o => o.vendorStatus === "accepted");

  const handleAccept = (orderId) => {
    acceptOrder(orderId);
    setAllVendorOrders(getVendorOrders(vendorEmail));
    setActionToast({ msg: `Order ${orderId} accepted — moved to Assigned Orders`, type: "success" });
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleReject = (orderId) => {
    rejectOrder(orderId);
    setAllVendorOrders(getVendorOrders(vendorEmail));
    setActionToast({ msg: `Order ${orderId} declined`, type: "error" });
    setTimeout(() => setActionToast(null), 4000);
  };

  // Dynamic stats from real data
  const stats = [
    { label: "Total Products", value: products.length.toString(), icon: "📦", change: "+3 this month" },
    { label: "Incoming Requests", value: incomingRequests.length.toString(), icon: "📥", change: incomingRequests.length > 0 ? "Needs your response" : "None pending" },
    { label: "Assigned Orders", value: assignedOrders.length.toString(), icon: "📋", change: "Accepted by you" },
    { label: "Pending Deliveries", value: assignedOrders.filter(o => o.status !== "Delivered").length.toString(), icon: "🚚", change: "In progress" },
  ];

  const navItems = [
    { id: "overview", label: "Overview", icon: "⊞" },
    { id: "incoming", label: "Incoming Requests", icon: "📥", badge: incomingRequests.length },
    { id: "orders", label: "Assigned Orders", icon: "📋" },
    { id: "products", label: "My Products", icon: "📦" },
    { id: "profile", label: "Profile & Docs", icon: "🏢" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ];

  // Product helpers
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setFormData(EMPTY_FORM); setFormError(""); setModal({ mode: "add" }); };
  const openEdit = (product) => {
    setFormData({ name: product.name, category: product.category, price: product.price, stock: product.stock, status: product.status });
    setFormError("");
    setModal({ mode: "edit", id: product.id });
  };
  const closeModal = () => setModal(null);
  const handleFormChange = (e) => { setFormError(""); setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value })); };
  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category || formData.price === "" || formData.stock === "") { setFormError("Please fill in all fields."); return; }
    const price = Number(formData.price), stock = Number(formData.stock);
    if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) { setFormError("Price and stock must be valid positive numbers."); return; }
    const status = stock === 0 ? "Out of Stock" : "Available";
    if (modal.mode === "add") {
      setProducts((prev) => [...prev, { id: Date.now(), name: formData.name.trim(), category: formData.category, price, stock, status }]);
    } else {
      setProducts((prev) => prev.map((p) => p.id === modal.id ? { ...p, name: formData.name.trim(), category: formData.category, price, stock, status } : p));
    }
    closeModal();
  };

  return (
    <div className={styles.layout}>
      {/* ── SIDEBAR ── */}
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

        <div className={styles.vendorInfo}>
          <div className={styles.avatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : "VD"}</div>
          {sidebarOpen && (
            <div className={styles.vendorMeta}>
              <p className={styles.vendorName}>{user?.name || "Vendor"}</p>
              <span className={styles.badge} style={{ background: STATUS_COLORS[availability] + "22", color: STATUS_COLORS[availability], border: `1px solid ${STATUS_COLORS[availability]}40` }}>
                ● {availability}
              </span>
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

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{navItems.find((n) => n.id === activeTab)?.label}</h1>
            <span className={styles.breadcrumb}>Vendor Portal / {navItems.find((n) => n.id === activeTab)?.label}</span>
          </div>
          <div className={styles.topbarRight}>
            <select
              className={styles.availabilitySelect}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              style={{ borderColor: STATUS_COLORS[availability] + "60", color: STATUS_COLORS[availability] }}
            >
              <option>Available</option>
              <option>Busy</option>
              <option>Offline</option>
            </select>
            <div className={styles.notifBtn}>🔔 <span className={styles.notifDot} /></div>
            <div className={styles.topbarAvatar}>{user?.name ? user.name.slice(0, 2).toUpperCase() : "VD"}</div>
          </div>
        </header>

        {/* Action toast */}
        {actionToast && (
          <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 200,
            background: actionToast.type === "success" ? "#2a7d3f" : "#ef4444",
            color: "#fff", padding: "14px 22px", borderRadius: 12,
            fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            {actionToast.type === "success" ? "✓" : "✗"} {actionToast.msg}
          </div>
        )}

        <div className={styles.content}>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              <div className={styles.statsRow}>
                {stats.map((s, i) => (
                  <div className={styles.statCard} key={i}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div className={styles.statInfo}>
                      <p className={styles.statValue}>{s.value}</p>
                      <p className={styles.statLabel}>{s.label}</p>
                      <p className={styles.statChange}>{s.change}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Incoming alert banner */}
              {incomingRequests.length > 0 && (
                <div className={styles.incomingBanner}>
                  <span className={styles.incomingBannerIcon}>📥</span>
                  <span>
                    <strong>{incomingRequests.length} new order{incomingRequests.length > 1 ? "s" : ""} assigned to you</strong> — Accept or reject to update admin.
                  </span>
                  <button className={styles.incomingBannerBtn} onClick={() => setActiveTab("incoming")}>
                    Review Now →
                  </button>
                </div>
              )}

              {/* Recent incoming requests preview */}
              {incomingRequests.length > 0 && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>📥 Incoming Requests</h2>
                    <button className={styles.viewAllBtn} onClick={() => setActiveTab("incoming")}>View All →</button>
                  </div>
                  {incomingRequests.slice(0, 2).map(order => (
                    <IncomingRequestCard
                      key={order.id}
                      order={order}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      styles={styles}
                      compact
                    />
                  ))}
                </div>
              )}

              {/* Assigned orders preview */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Recent Assigned Orders</h2>
                  <button className={styles.viewAllBtn} onClick={() => setActiveTab("orders")}>View All →</button>
                </div>
                {assignedOrders.length === 0 ? (
                  <p style={{ color: "#8a8680", fontSize: 13 }}>No accepted orders yet. Accept incoming requests to see them here.</p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Delivery Date</th><th>Total (RWF)</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {assignedOrders.slice(0, 3).map((o) => (
                          <tr key={o.id}>
                            <td className={styles.orderId}>{o.id}</td>
                            <td>{o.customer}</td>
                            <td className={styles.dateCell}>{o.deliveryDate || "—"}</td>
                            <td className={styles.amount}>{(o.total || 0).toLocaleString()}</td>
                            <td><span className={styles.statusPill} style={{ background: "#3b82f622", color: "#3b82f6" }}>Accepted</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>⚠ Stock Alerts</h2></div>
                <div className={styles.alertList}>
                  {products.filter((p) => p.stock === 0 || p.stock < 20).map((p) => (
                    <div className={styles.alertItem} key={p.id}>
                      <span className={styles.alertName}>{p.name}</span>
                      <span className={styles.alertStock} style={{ color: p.stock === 0 ? "#ef4444" : "#f59e0b" }}>
                        {p.stock === 0 ? "OUT OF STOCK" : `${p.stock} units left`}
                      </span>
                      <button className={styles.updateStockBtn} onClick={() => { setActiveTab("products"); openEdit(p); }}>Update</button>
                    </div>
                  ))}
                  {products.filter((p) => p.stock === 0 || p.stock < 20).length === 0 && (
                    <p style={{ color: "#8a8680", fontSize: 13 }}>All products are well stocked ✓</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── INCOMING REQUESTS TAB ── */}
          {activeTab === "incoming" && (
            <div className={styles.tabContent}>
              {incomingRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📭</span>
                  <p>No incoming requests right now. You'll see new orders here when admin assigns them to you.</p>
                </div>
              ) : (
                incomingRequests.map(order => (
                  <IncomingRequestCard
                    key={order.id}
                    order={order}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    styles={styles}
                  />
                ))
              )}
            </div>
          )}

          {/* ── ASSIGNED ORDERS TAB ── */}
          {activeTab === "orders" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input className={styles.searchInput} placeholder="🔍  Search orders..." />
                <select className={styles.filterSelect}>
                  <option>All Statuses</option>
                  <option>Processing</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
              </div>

              {assignedOrders.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📋</span>
                  <p>No accepted orders yet. Accept requests from the Incoming Requests tab.</p>
                </div>
              ) : (
                <div className={styles.card}>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Order ID</th><th>Customer</th><th>Products</th>
                          <th>Delivery Date</th><th>Total (RWF)</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedOrders.map((o) => (
                          <tr key={o.id}>
                            <td className={styles.orderId}>{o.id}</td>
                            <td>{o.customer}</td>
                            <td style={{ fontSize: 12, color: "#8a8680" }}>
                              {Array.isArray(o.products)
                                ? o.products.map(p => `${p.name} ×${p.qty}`).join(", ")
                                : "—"}
                            </td>
                            <td className={styles.dateCell}>{o.deliveryDate || "—"}</td>
                            <td className={styles.amount}>{(o.total || 0).toLocaleString()}</td>
                            <td>
                              <span className={styles.statusPill} style={{ background: "#3b82f622", color: "#3b82f6" }}>
                                Accepted
                              </span>
                            </td>
                            <td>
                              <select className={styles.statusUpdate}>
                                <option>Update Status</option>
                                <option>Processing</option>
                                <option>Out for Delivery</option>
                                <option>Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && (
            <div className={styles.tabContent}>
              <div className={styles.tabActions}>
                <input
                  className={styles.searchInput}
                  placeholder="🔍  Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className={styles.primaryBtn} onClick={openAdd}>+ Add Product</button>
              </div>
              <div className={styles.card}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>#</th><th>Product Name</th><th>Category</th><th>Price (RWF)</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign: "center", color: "#8a8680", padding: "32px" }}>No products found.</td></tr>
                      ) : (
                        filteredProducts.map((p, i) => (
                          <tr key={p.id}>
                            <td className={styles.rowNum}>{i + 1}</td>
                            <td className={styles.productName}>{p.name}</td>
                            <td><span className={styles.categoryTag}>{p.category}</span></td>
                            <td className={styles.amount}>{p.price.toLocaleString()}</td>
                            <td className={styles.stockCell} style={{ color: p.stock === 0 ? "#ef4444" : p.stock < 20 ? "#f59e0b" : "#2a7d3f" }}>{p.stock}</td>
                            <td><span className={styles.statusPill} style={{ background: STATUS_COLORS[p.status] + "22", color: STATUS_COLORS[p.status] }}>{p.status}</span></td>
                            <td className={styles.actionsCell}>
                              <button className={styles.editBtn} onClick={() => openEdit(p)}>✏ Edit</button>
                              <button className={styles.deleteBtn} onClick={() => setDeleteId(p.id)}>🗑</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className={styles.tabContent}>
              <div className={styles.profileGrid}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Company Information</h2>
                  <div className={styles.formGrid}>
                    {[
                      ["Company Name", "Rwanda Builders Ltd"],
                      ["Contact Person", "Jean Claude Nkurunziza"],
                      ["Email", "info@rwandabuilders.rw"],
                      ["Phone", "+250 788 123 456"],
                      ["Location", "Kigali, Rwanda"],
                      ["Registration No.", "RCA/2021/0045"],
                    ].map(([label, val]) => (
                      <div className={styles.formGroup} key={label}>
                        <label className={styles.formLabel}>{label}</label>
                        <input className={styles.formInput} defaultValue={val} />
                      </div>
                    ))}
                    <button className={styles.primaryBtn} style={{ gridColumn: "1 / -1" }}>Save Changes</button>
                  </div>
                </div>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Verification Documents</h2>
                  <div className={styles.docList}>
                    {[
                      { name: "Business License", status: "Verified", icon: "📄" },
                      { name: "National ID", status: "Verified", icon: "🪪" },
                      { name: "Company Certificate", status: "Pending", icon: "📜" },
                    ].map((doc) => (
                      <div className={styles.docItem} key={doc.name}>
                        <span className={styles.docIcon}>{doc.icon}</span>
                        <span className={styles.docName}>{doc.name}</span>
                        <span className={styles.statusPill} style={{ background: doc.status === "Verified" ? "#2a7d3f22" : "#f59e0b22", color: doc.status === "Verified" ? "#2a7d3f" : "#f59e0b" }}>
                          {doc.status}
                        </span>
                        <button className={styles.uploadBtn}>↑ Upload</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "notifications" && (
            <div className={styles.tabContent}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Recent Notifications</h2>
                <div className={styles.notifList}>
                  {[
                    ...incomingRequests.map(o => ({ msg: `New order ${o.id} assigned to you by Admin — awaiting your response`, time: new Date(o.assignedAt).toLocaleDateString(), type: "order", read: false })),
                    { msg: "Payment of RWF 2,250,000 confirmed for #ORD-001", time: "5 hours ago", type: "payment", read: false },
                    { msg: "Your stock for Safety Helmet is now 0 — update required", time: "1 day ago", type: "alert", read: true },
                    { msg: "Your vendor account has been approved", time: "3 days ago", type: "approval", read: true },
                  ].map((n, i) => (
                    <div className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ""}`} key={i}>
                      <div className={styles.notifDotType} style={{ background: n.type === "order" ? "#3b82f6" : n.type === "payment" ? "#2a7d3f" : n.type === "alert" ? "#ef4444" : "#a855f7" }} />
                      <div className={styles.notifBody}>
                        <p className={styles.notifMsg}>{n.msg}</p>
                        <span className={styles.notifTime}>{n.time}</span>
                      </div>
                      {!n.read && <span className={styles.unreadBadge}>New</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── ADD / EDIT PRODUCT MODAL ── */}
      {modal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{modal.mode === "add" ? "Add New Product" : "Edit Product"}</h2>
              <button className={styles.modalClose} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {formError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 14, background: "#ef444412", padding: "8px 12px", borderRadius: 8 }}>{formError}</p>}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label className={styles.formLabel}>Product Name</label>
                    <input className={styles.formInput} name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Steel Rebar 12mm" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Category</label>
                    <select className={styles.formInput} name="category" value={formData.category} onChange={handleFormChange}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Price (RWF)</label>
                    <input className={styles.formInput} name="price" type="number" min="0" value={formData.price} onChange={handleFormChange} placeholder="e.g. 45000" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Stock Quantity</label>
                    <input className={styles.formInput} name="stock" type="number" min="0" value={formData.stock} onChange={handleFormChange} placeholder="e.g. 100" />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>{modal.mode === "add" ? "Add Product" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setDeleteId(null)}>
          <div className={styles.modal} style={{ maxWidth: 400 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Delete Product</h2>
              <button className={styles.modalClose} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ color: "#1a1916", fontSize: 14 }}>
                Are you sure you want to delete <strong>{products.find((p) => p.id === deleteId)?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.deleteBtn} style={{ padding: "10px 20px", fontSize: 13.5 }} onClick={() => { setProducts(prev => prev.filter(p => p.id !== deleteId)); setDeleteId(null); }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── IncomingRequestCard ── */
function IncomingRequestCard({ order, onAccept, onReject, styles, compact }) {
  const total = order.total || order.products?.reduce((s, p) => s + (Number(p.qty) || 0) * (Number(p.unitPrice) || 0), 0) || 0;

  return (
    <div className={styles.incomingCard}>
      <div className={styles.incomingCardHeader}>
        <div>
          <span className={styles.incomingOrderId}>{order.id}</span>
          <span className={styles.incomingCustomer}> · {order.customer}</span>
        </div>
        <span className={styles.incomingDate}>
          Assigned {order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : "—"}
        </span>
      </div>

      {/* Products */}
      {Array.isArray(order.products) && order.products.length > 0 && (
        <div className={styles.incomingProducts}>
          <table className={styles.incomingTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price (RWF)</th>
                <th>Subtotal (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {order.products.map((p, i) => (
                <tr key={i}>
                  <td>{p.name || "—"}</td>
                  <td>{p.qty || "—"}</td>
                  <td>{p.unitPrice ? Number(p.unitPrice).toLocaleString() : "—"}</td>
                  <td className={styles.amount}>{((Number(p.qty) || 0) * (Number(p.unitPrice) || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.incomingMeta}>
        {order.deliveryDate && (
          <span className={styles.incomingMetaTag}>📅 Deliver by: <strong>{order.deliveryDate}</strong></span>
        )}
        {order.description && (
          <span className={styles.incomingMetaTag}>📝 {order.description}</span>
        )}
        <span className={styles.incomingMetaTag} style={{ color: "#2a7d3f", fontWeight: 700 }}>
          💰 Total: {total.toLocaleString()} RWF
        </span>
      </div>

      <div className={styles.incomingActions}>
        <button className={styles.acceptBtn} onClick={() => onAccept(order.id)}>
          ✓ Accept Order
        </button>
        <button className={styles.rejectOrderBtn} onClick={() => onReject(order.id)}>
          ✗ Reject
        </button>
      </div>
    </div>
  );
}