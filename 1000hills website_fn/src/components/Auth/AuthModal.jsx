import { useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  const [view, setView] = useState('signin'); // 'signin' | 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    // TODO: connect your auth logic here
    console.log('Sign in:', formData.email, formData.password);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // TODO: connect your auth logic here
    console.log('Sign up:', formData.name, formData.email, formData.password);
  };

  const switchTo = (v) => {
    setFormData({ name: '', email: '', password: '' });
    setView(v);
  };

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.badge}>1H</div>

        {view === 'signin' ? (
          <>
            <h2 className={styles.title}>Access Portal</h2>
            <p className={styles.subtitle}>Sign in with your credentials</p>

            <form onSubmit={handleSignIn}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  <button type="button" className={styles.forgotLink}>
                    Forgot password?
                  </button>
                </div>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Sign In
              </button>
            </form>

            <div className={styles.divider}>
              <span>Don&apos;t have an account?</span>
            </div>
            <button className={styles.secondaryBtn} onClick={() => switchTo('signup')}>
              Create an Account
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>Register for a new account</p>

            <form onSubmit={handleSignUp}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Kundwa Divine"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.primaryBtn}>
                Create Account
              </button>
            </form>

            <div className={styles.divider}>
              <span>Already have an account?</span>
            </div>
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