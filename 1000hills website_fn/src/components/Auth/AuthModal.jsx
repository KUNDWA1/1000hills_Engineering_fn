import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [view, setView] = useState('signin'); // 'signin' | 'signup' | 'success'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setError('');
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    // Check if account exists in localStorage
    const stored = localStorage.getItem('1h_user_' + formData.email);
    if (!stored) {
      setError('No account found with this email. Please create an account.');
      return;
    }
    const user = JSON.parse(stored);
    if (user.password !== formData.password) {
      setError('Incorrect password. Please try again.');
      return;
    }
    // Login success
    localStorage.setItem('1h_logged_in', JSON.stringify(user));
    onClose();
    if (onLoginSuccess) onLoginSuccess(user);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Check if account already exists
    const existing = localStorage.getItem('1h_user_' + formData.email);
    if (existing) {
      setError('An account with this email already exists. Please sign in.');
      return;
    }
    // Save new user
    const user = { name: formData.name, email: formData.email, password: formData.password };
    localStorage.setItem('1h_user_' + formData.email, JSON.stringify(user));
    // Show success, then redirect to signin
    setView('success');
  };

  const switchTo = (v) => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setView(v);
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        <div className={styles.badge}>1H</div>

        {/* ── SUCCESS VIEW ── */}
        {view === 'success' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.title}>Account Created!</h2>
            <p className={styles.subtitle}>Your account has been created successfully</p>
            <p className={styles.successMsg}>Welcome to 1000 Hills Engineering! You can now sign in.</p>
            <button className={styles.primaryBtn} onClick={() => switchTo('signin')}>
              Go to Sign In
            </button>
          </>
        )}

        {/* ── SIGN IN VIEW ── */}
        {view === 'signin' && (
          <>
            <h2 className={styles.title}>Access Portal</h2>
            <p className={styles.subtitle}>Sign in with your credentials</p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSignIn}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input className={styles.input} type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" required />
              </div>
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <button type="button" className={styles.forgotLink}>Forgot password?</button>
                </div>
                <input className={styles.input} type="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••••" required />
              </div>
              <button type="submit" className={styles.primaryBtn}>Sign In</button>
            </form>

            <div className={styles.divider}><span>Don&apos;t have an account?</span></div>
            <button className={styles.secondaryBtn} onClick={() => switchTo('signup')}>
              Create an Account
            </button>
          </>
        )}

        {/* ── SIGN UP VIEW ── */}
        {view === 'signup' && (
          <>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Register for a new account</p>

            {error && <div className={styles.errorMsg}>{error}</div>}

            <form onSubmit={handleSignUp}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} type="text" name="name"
                  value={formData.name} onChange={handleChange}
                  placeholder="Your Full Name" required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input className={styles.input} type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" required />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <input className={styles.input} type="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••••" minLength={6} required />
              </div>
              <button type="submit" className={styles.primaryBtn}>Create Account</button>
            </form>

            <div className={styles.divider}><span>Already have an account?</span></div>
            <button className={styles.secondaryBtn} onClick={() => switchTo('signin')}>
              Sign In Instead
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
