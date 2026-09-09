import { buildEnquiry, cleanSource } from './enquiry-model.mjs';

const form = document.getElementById('enquiry-form');
const result = document.getElementById('enquiry-result');
const status = document.getElementById('enquiry-status');
const copyStatus = document.getElementById('copy-status');
const emailLink = document.getElementById('email-enquiry');
const text = document.getElementById('enquiry-text');
const source = cleanSource(new URLSearchParams(location.search).get('source'));

form.addEventListener('change', () => {
  result.hidden = true;
  emailLink.removeAttribute('href');
  text.value = '';
  status.textContent = '';
  copyStatus.textContent = '';
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const value = buildEnquiry({
    work: document.getElementById('enquiry-work').value,
    app: document.getElementById('enquiry-app').value,
    computer: document.getElementById('enquiry-computer').value
  }, source);
  if (!value.valid) {
    status.textContent = value.message;
    form.reportValidity();
    return;
  }
  document.getElementById('enquiry-heading').textContent = value.heading;
  document.getElementById('enquiry-guidance').textContent = value.guidance;
  text.value = value.body;
  emailLink.href = value.mailto;
  result.hidden = false;
  status.textContent = 'Your enquiry text is ready below. Nothing has been sent.';
  document.getElementById('enquiry-heading').focus();
});
emailLink.addEventListener('click', () => {
  copyStatus.textContent = 'Your email application should open. Review and send the message there. If it does not open, copy the text below and email hello@muneron.com.';
});
document.getElementById('copy-enquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(text.value);
    copyStatus.textContent = 'Copied. Paste it into your email to hello@muneron.com. Nothing has been sent.';
  } catch (_) {
    text.focus();
    text.select();
    copyStatus.textContent = 'Automatic copy is unavailable. The text is selected; copy it using your browser or keyboard.';
  }
});
form.hidden = false;
document.getElementById('enquiry-loading').hidden = true;
