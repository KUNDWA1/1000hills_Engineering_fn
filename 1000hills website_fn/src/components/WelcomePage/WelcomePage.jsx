import styles from './WelcomePage.module.css';

export default function WelcomePage({ user, onGoHome, onLogout }) {
  return (
    <main className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.badge}>1H</div>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.heading}>Congratulations, You're Welcome!!!</h1>
        <p className={styles.sub}>
          Hello <strong>{user?.name || 'there'}</strong>, you've successfully signed in to
          1000 Hills Engineering.
        </p>
        <p className={styles.desc}>
          Explore our full range of professional equipment — from construction tools
          and power generators to solar energy solutions and security systems.
        </p>
        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={onGoHome}>
            Start Shopping
          </button>
          <button className={styles.secondaryBtn} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
