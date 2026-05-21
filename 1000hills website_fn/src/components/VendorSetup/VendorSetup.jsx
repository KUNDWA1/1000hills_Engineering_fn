import { useState, useRef } from 'react';
import styles from './VendorSetup.module.css';

const STEPS = ['Company Info', 'Documents', 'Review & Submit'];

export default function VendorSetup({ user, onSubmitted }) {
  const [step, setStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoRef = useRef();

  const [info, setInfo] = useState({
    companyName: '',
    contactPerson: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    registrationNo: '',
    description: '',
  });

  const [docs, setDocs] = useState({
    businessLicense: null,
    nationalId: null,
    companyCertificate: null,
  });

  const [errors, setErrors] = useState({});

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleInfoChange = (e) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDocChange = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
      setDocs((prev) => ({ ...prev, [key]: file }));
    }
  };

  const validateStep0 = () => {
    const e = {};
    if (!info.companyName.trim()) e.companyName = 'Required';
    if (!info.contactPerson.trim()) e.contactPerson = 'Required';
    if (!info.email.trim()) e.email = 'Required';
    if (!info.phone.trim()) e.phone = 'Required';
    if (!info.location.trim()) e.location = 'Required';
    if (!info.registrationNo.trim()) e.registrationNo = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!docs.businessLicense) e.businessLicense = 'Required';
    if (!docs.nationalId) e.nationalId = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    const profile = {
      vendorEmail: user.email,
      vendorName: user.name,
      ...info,
      photoPreview,
      docs: {
        businessLicense: docs.businessLicense?.name || null,
        nationalId: docs.nationalId?.name || null,
        companyCertificate: docs.companyCertificate?.name || null,
      },
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    const existing = JSON.parse(localStorage.getItem('1h_vendor_requests') || '[]');
    const filtered = existing.filter((r) => r.vendorEmail !== user.email);
    localStorage.setItem('1h_vendor_requests', JSON.stringify([...filtered, profile]));
    const userRecord = JSON.parse(localStorage.getItem('1h_user_' + user.email) || '{}');
    localStorage.setItem('1h_user_' + user.email, JSON.stringify({ ...userRecord, profileStatus: 'pending' }));
    localStorage.setItem('1h_logged_in', JSON.stringify({ ...user, profileStatus: 'pending' }));
    onSubmitted();
  };

  const docFields = [
    { key: 'businessLicense', label: 'Business License', icon: '📄', required: true },
    { key: 'nationalId', label: 'National ID', icon: '🪪', required: true },
    { key: 'companyCertificate', label: 'Company Certificate', icon: '📜', required: false },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>⚙ <span>1000Hills</span></div>
          <h1 className={styles.title}>Set Up Your Vendor Profile</h1>
          <p className={styles.subtitle}>Complete your profile to get approved and start selling</p>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${i < step ? styles.stepDone : i === step ? styles.stepActive : ''}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: Company Info ── */}
        {step === 0 && (
          <div className={styles.body}>
            <div className={styles.photoSection}>
              <div className={styles.photoWrap} onClick={() => photoRef.current.click()}>
                {photoPreview
                  ? <img src={photoPreview} alt="profile" className={styles.photoImg} />
                  : <div className={styles.photoPlaceholder}><span>📷</span><span>Upload Photo</span></div>
                }
              </div>
              <input ref={photoRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              <p className={styles.photoHint}>Company logo or profile photo (optional)</p>
            </div>

            <div className={styles.formGrid}>
              {[
                { name: 'companyName', label: 'Company Name', placeholder: 'e.g. Rwanda Builders Ltd' },
                { name: 'contactPerson', label: 'Contact Person', placeholder: 'Full name' },
                { name: 'email', label: 'Email Address', placeholder: 'company@email.com', type: 'email' },
                { name: 'phone', label: 'Phone Number', placeholder: '+250 788 000 000' },
                { name: 'location', label: 'Location', placeholder: 'City, Country' },
                { name: 'registrationNo', label: 'Registration No.', placeholder: 'e.g. RCA/2021/0045' },
              ].map(({ name, label, placeholder, type }) => (
                <div className={styles.formGroup} key={name}>
                  <label className={styles.label}>
                    {label}
                    {errors[name] && <span className={styles.errTag}>Required</span>}
                  </label>
                  <input
                    className={`${styles.input} ${errors[name] ? styles.inputErr : ''}`}
                    name={name}
                    type={type || 'text'}
                    placeholder={placeholder}
                    value={info[name]}
                    onChange={handleInfoChange}
                  />
                </div>
              ))}
              <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                <label className={styles.label}>
                  Business Description <span className={styles.optional}>(optional)</span>
                </label>
                <textarea
                  className={styles.textarea}
                  name="description"
                  placeholder="Briefly describe your business and what you sell..."
                  value={info.description}
                  onChange={handleInfoChange}
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Documents ── */}
        {step === 1 && (
          <div className={styles.body}>
            <p className={styles.docIntro}>
              Upload your verification documents. Business License and National ID are required.
            </p>
            <div className={styles.docList}>
              {docFields.map(({ key, label, icon, required }) => (
                <div className={`${styles.docItem} ${errors[key] ? styles.docItemErr : ''}`} key={key}>
                  <span className={styles.docIcon}>{icon}</span>
                  <div className={styles.docInfo}>
                    <span className={styles.docLabel}>
                      {label} {required && <span className={styles.reqStar}>*</span>}
                    </span>
                    {docs[key]
                      ? <span className={styles.docFileName}>✓ {docs[key].name}</span>
                      : <span className={styles.docEmpty}>{errors[key] ? 'This document is required' : 'No file selected'}</span>
                    }
                  </div>
                  <label className={styles.uploadBtn}>
                    {docs[key] ? '↺ Replace' : '↑ Upload'}
                    <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocChange(key, e)} />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Review ── */}
        {step === 2 && (
          <div className={styles.body}>
            <div className={styles.reviewSection}>
              {photoPreview && (
                <div className={styles.reviewPhoto}>
                  <img src={photoPreview} alt="profile" className={styles.reviewPhotoImg} />
                </div>
              )}
              <div className={styles.reviewGrid}>
                <h3 className={styles.reviewHeading}>Company Information</h3>
                {[
                  ['Company Name', info.companyName],
                  ['Contact Person', info.contactPerson],
                  ['Email', info.email],
                  ['Phone', info.phone],
                  ['Location', info.location],
                  ['Registration No.', info.registrationNo],
                  ...(info.description ? [['Description', info.description]] : []),
                ].map(([k, v]) => (
                  <div className={styles.reviewRow} key={k}>
                    <span className={styles.reviewKey}>{k}</span>
                    <span className={styles.reviewVal}>{v}</span>
                  </div>
                ))}
              </div>
              <div className={styles.reviewDocs}>
                <h3 className={styles.reviewHeading}>Documents</h3>
                {docFields.map(({ key, label, icon }) => (
                  <div className={styles.reviewDocRow} key={key}>
                    <span>{icon} {label}</span>
                    {docs[key]
                      ? <span className={styles.docOk}>✓ Uploaded</span>
                      : <span className={styles.docMissing}>Not uploaded</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          {step > 0 && (
            <button className={styles.backBtn} onClick={() => setStep((s) => s - 1)}>← Back</button>
          )}
          {step < 2
            ? <button className={styles.nextBtn} onClick={next}>Continue →</button>
            : <button className={styles.submitBtn} onClick={handleSubmit}>Submit Profile for Approval</button>
          }
        </div>
      </div>
    </div>
  );
}
