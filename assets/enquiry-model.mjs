export const ENQUIRY_VERSION = 'customer-enquiry-v1';
export const fields = {
  work: {
    replies: 'Preparing replies from approved product documents',
    connected: 'Live ERP/mailbox connections or automatic actions',
    other: 'Another task / not sure yet'
  },
  app: {
    'claude-code': 'Claude Code',
    cowork: 'Claude Cowork',
    chatgpt: 'ChatGPT',
    copilot: 'Microsoft Copilot',
    other: 'Another AI application',
    unsure: 'Not sure / not using one yet'
  },
  computer: {
    mac: 'Mac, with permission to install',
    windows: 'Windows, with permission to install',
    managed: 'Managed computer / installation needs IT approval',
    unsure: 'Not sure'
  }
};
const sources = new Set(['website', 'linkedin', 'referral', 'partner', 'boundary-check', 'example']);
export function cleanSource(value) { return sources.has(value) ? value : 'website'; }
export function buildEnquiry(input, source = 'website') {
  if (!input || Object.keys(fields).some(key => !Object.hasOwn(fields[key], input[key]))) {
    return { valid: false, message: 'Choose an answer to each question. Not sure is a valid answer.' };
  }
  let heading = 'Let us check the fit before you buy.';
  let guidance = 'This is the workflow we are developing first. We still need to verify the application version, permitted access and installation on your setup. These answers are not a compatibility pass.';
  if (input.work !== 'replies') {
    heading = 'That work is outside the first pack, or needs clarification.';
    guidance = 'The planned €390 pack covers customer reply preparation from approved documents. It does not include live system integrations, automatic sending or a custom project. You can ask about your use case without placing an order.';
  } else if (input.app !== 'claude-code') {
    heading = 'Try the free example; do not assume the pack fits your app.';
    guidance = 'The first installation checks target Claude Code. It is not the same as Claude Cowork, ChatGPT or Copilot. You can still tell us what you use, but we will not treat this enquiry as a compatible order.';
  } else if (input.computer === 'managed' || input.computer === 'unsure') {
    heading = 'Check the installation policy with your administrator.';
    guidance = 'Do not change company permissions to fit the pack. We can review your enquiry, but the first release cannot be treated as suitable until the responsible person approves the setup.';
  }
  const body = [
    'Hello MUNERON,',
    '',
    'I am interested in the Customer Enquiry Desk at the planned EUR 390 one-person price.',
    'Please confirm whether the first release could fit this setup:',
    '',
    'Work: ' + fields.work[input.work],
    'AI application: ' + fields.app[input.app],
    'Computer: ' + fields.computer[input.computer],
    '',
    'I understand this is an enquiry, not an order. Please confirm availability,',
    'compatibility, final scope, applicable taxes and terms before any purchase.',
    '',
    'Optional, in my own words: the task we repeat, how often, and where we get stuck.',
    '(No customer documents, confidential figures, passwords or payment details.)',
    '',
    'Reference: ' + ENQUIRY_VERSION,
    'Source: ' + cleanSource(source)
  ].join('\n');
  const subject = 'Customer Enquiry Desk - first-release enquiry';
  return { valid: true, heading, guidance, body,
    mailto: 'mailto:hello@muneron.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) };
}
