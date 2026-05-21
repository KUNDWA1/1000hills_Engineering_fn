import { useState, useCallback } from 'react';
import Navbar from './components/Navbar/Navbar';
import HomePage from './components/HomePage/HomePage';
import ProductCard from './components/ProductCard/ProductCard';
import ProductDetail from './components/ProductDetail/ProductDetail';
import SearchPage from './components/SearchPage/SearchPage';
import Cart from './components/Cart/Cart';
import Footer from './components/Footer/Footer';
import WelcomePage from './components/WelcomePage/WelcomePage';
import VendorDashboard from './components/VendorDashboard/VendorDashboard';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import VendorSetup from './components/VendorSetup/VendorSetup';
import VendorPending from './components/VendorSetup/VendorPending';

import { constructionToolsProducts } from './data/ConstructionTools_products';
import { generatorsProducts } from './data/Generators & Power_products';
import { securityProducts } from './data/Security & IT_products';
import { solarProducts } from './data/Solar & Energy_products';

import styles from './App.module.css';

const products = {
  'construction-tools': constructionToolsProducts,
  'generators-power': generatorsProducts,
  'security-it': securityProducts,
  'solar-energy': solarProducts,
};

const allProducts = Object.values(products).flat();

const categoryMeta = {
  'construction-tools': { title: 'Construction Tools', sub: 'Professional construction equipment' },
  'generators-power':   { title: 'Generators & Power', sub: 'Reliable power solutions' },
  'security-it':        { title: 'Security & IT',      sub: 'Security and technology products' },
  'solar-energy':       { title: 'Solar & Energy',     sub: 'Clean energy solutions' },
};

export default function App() {
  // 'home' | 'category' | 'detail' | 'search' | 'welcome' | 'vendor' | 'vendor-setup' | 'vendor-pending' | 'admin'
  const [activePage, setActivePage]         = useState('home');
  const [activeCategory, setActiveCategory] = useState('construction-tools');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [cart, setCart]                     = useState([]);
  const [cartOpen, setCartOpen]             = useState(false);
  const [loggedInUser, setLoggedInUser]     = useState(null);

  // ── Auth helpers ──
  function handleLoginSuccess(user) {
    setLoggedInUser(user);
    const role = user?.role || 'customer';
    if (role === 'vendor') {
      // Check profile status from localStorage (always fresh)
      const fresh = JSON.parse(localStorage.getItem('1h_user_' + user.email) || '{}');
      const status = fresh.profileStatus;
      if (status === 'approved') {
        setActivePage('vendor');
      } else if (status === 'pending') {
        setActivePage('vendor-pending');
      } else {
        setActivePage('vendor-setup');
      }
    } else if (role === 'admin') {
      setActivePage('admin');
    } else {
      setActivePage('welcome');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogout() {
    localStorage.removeItem('1h_logged_in');
    setLoggedInUser(null);
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Cart helpers ──
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.id !== id));
    else setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // ── Navigation ──
  function goHome() {
    setActivePage('home');
    setSelectedProduct(null);
    setCategorySearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goCategory(key) {
    setActiveCategory(key);
    setActivePage('category');
    setSelectedProduct(null);
    setCategorySearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goDetail(product) {
    setSelectedProduct(product);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBackFromDetail() {
    setActivePage('category');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goSearch(query) {
    setSearchQuery(query);
    setActivePage('search');
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Category page filtered products ──
  const allItems = products[activeCategory] || [];
  const filtered = categorySearch.trim()
    ? allItems.filter((p) =>
        p.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : allItems;

  const meta = categoryMeta[activeCategory];

  // ── Dashboard pages (full-screen, no navbar/footer) ──
  if (activePage === 'vendor-setup') {
    return (
      <VendorSetup
        user={loggedInUser}
        onSubmitted={() => {
          setActivePage('vendor-pending');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (activePage === 'vendor-pending') {
    return (
      <VendorPending
        user={loggedInUser}
        onLogout={handleLogout}
        onApproved={() => {
          setActivePage('vendor');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (activePage === 'vendor') {
    return <VendorDashboard user={loggedInUser} onLogout={handleLogout} />;
  }

  if (activePage === 'admin') {
    return <AdminDashboard user={loggedInUser} onLogout={handleLogout} />;
  }

  return (
    <div className={styles.app}>
      <Navbar
        activePage={activePage}
        activeCategory={activeCategory}
        onCategoryChange={goCategory}
        onGoHome={goHome}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onSearch={goSearch}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ── WELCOME PAGE ── */}
      {activePage === 'welcome' && (
        <WelcomePage user={loggedInUser} onGoHome={goHome} onLogout={handleLogout} />
      )}

      {/* ── HOME PAGE ── */}
      {activePage === 'home' && (
        <HomePage
          onCategoryChange={goCategory}
          onAddToCart={addToCart}
          onProductClick={goDetail}
        />
      )}

      {/* ── SEARCH PAGE ── */}
      {activePage === 'search' && (
        <SearchPage
          query={searchQuery}
          allProducts={allProducts}
          onAddToCart={addToCart}
          onProductClick={goDetail}
        />
      )}

      {/* ── CATEGORY PAGE ── */}
      {activePage === 'category' && (
        <main className={styles.main}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionLeft}>
              <h2 className={styles.sectionTitle}>{meta.title.toUpperCase()}</h2>
              <p className={styles.sectionSub}>{meta.sub.toUpperCase()}</p>
            </div>

            <div className={styles.searchWrap}>
              <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search products..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              {categorySearch && (
                <button className={styles.clearSearch} onClick={() => setCategorySearch('')}>×</button>
              )}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className={styles.grid} key={activeCategory}>
              {filtered.map((product, index) => (
                <div key={product.id} style={{ animationDelay: `${index * 55}ms` }} className={styles.cardWrapper}>
                  <ProductCard product={product} onAddToCart={addToCart} onProductClick={goDetail} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No products found for &quot;<strong>{categorySearch}</strong>&quot;</p>
              <button className={styles.clearSearchBtn} onClick={() => setCategorySearch('')}>Clear search</button>
            </div>
          )}
        </main>
      )}

      {/* ── DETAIL PAGE ── */}
      {activePage === 'detail' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          allProducts={allProducts}
          onBack={goBackFromDetail}
          onAddToCart={addToCart}
          onProductClick={goDetail}
        />
      )}

      {activePage !== 'welcome' && (
        <Footer onCategoryChange={goCategory} onGoHome={goHome} />
      )}

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onRemove={removeFromCart}
        onUpdateQty={updateQty}
        loggedInUser={loggedInUser}
      />
    </div>
  );
}
