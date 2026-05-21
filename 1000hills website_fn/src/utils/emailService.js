import emailjs from '@emailjs/browser';

// ─────────────────────────────────────────────────────────────
//  EMAILJS CONFIG
//  Replace these three values with your own from emailjs.com
//  Dashboard → Account → API Keys  (Public Key)
//  Dashboard → Email Services      (Service ID)
//  Dashboard → Email Templates     (Template IDs)
// ─────────────────────────────────────────────────────────────
const PUBLIC_KEY     = 'YOUR_PUBLIC_KEY';       // e.g. 'user_aBcDeFgHiJkLmN'
const SERVICE_ID     = 'YOUR_SERVICE_ID';       // e.g. 'service_xxxxxxx'
const TEMPLATE_SUBMITTED = 'YOUR_TEMPLATE_SUBMITTED_ID'; // template for "profile received"
const TEMPLATE_APPROVED  = 'YOUR_TEMPLATE_APPROVED_ID';  // template for "you're approved"
const TEMPLATE_REJECTED  = 'YOUR_TEMPLATE_REJECTED_ID';  // template for "application rejected"

emailjs.init(PUBLIC_KEY);

// Called when vendor submits their profile
export function sendSubmissionEmail({ vendorName, vendorEmail, companyName }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_SUBMITTED, {
    to_name:      vendorName,
    to_email:     vendorEmail,
    company_name: companyName,
  });
}

// Called when admin clicks Approve
export function sendApprovalEmail({ vendorName, vendorEmail, companyName }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_APPROVED, {
    to_name:      vendorName,
    to_email:     vendorEmail,
    company_name: companyName,
  });
}

// Called when admin clicks Reject
export function sendRejectionEmail({ vendorName, vendorEmail, companyName }) {
  return emailjs.send(SERVICE_ID, TEMPLATE_REJECTED, {
    to_name:      vendorName,
    to_email:     vendorEmail,
    company_name: companyName,
  });
}
