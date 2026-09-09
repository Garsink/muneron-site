import { VERSION, STORAGE_KEY, choices, groups, questions, cleanAnswers, summarize, exportText } from './check-model.mjs';

const profiles = new Set(['unknown', 'chat', 'connected']);
let answers = {};
let profile = 'unknown';
let storageAvailable = true;
try {
  const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  if (stored?.version === VERSION) {
    answers = cleanAnswers(stored.answers);
    if (profiles.has(stored.profile)) profile = stored.profile;
  }
} catch (_) { storageAvailable = false; }

const byId = id => document.getElementById(id);
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function showStorageStatus() {
  byId('storage-status').textContent = storageAvailable
    ? 'Progress stays in this tab’s session.'
    : 'This browser cannot save the session. Save your checklist before leaving or reloading.';
}
function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, answers, profile }));
    storageAvailable = true;
  } catch (_) { storageAvailable = false; }
  showStorageStatus();
}
function updateGuidance() {
  byId('setup-guidance').textContent = profile === 'chat'
    ? 'Some checks about integrations, sending and scheduled jobs may not apply. Confirm those capabilities are absent before choosing Not applicable. This does not make a browser chatbot compatible with the planned desktop pack.'
    : profile === 'connected'
      ? 'Review the specific sources, action tools and jobs enabled for this role. Do not grant new access or run a live action for this checklist.'
      : 'Start by confirming the connected sources with the responsible person. Unknown access is not the same as no access.';
}
async function copyPrompt(text, button) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    byId('action-status').textContent = 'Suggested question copied. Review it before using it with your assistant.';
    button.textContent = 'Copied';
  } catch (_) {
    byId('action-status').textContent = 'Copying was not available. Select and copy the suggested question shown above manually.';
    button.textContent = 'Copy unavailable — select the text above';
  }
}

for (const group of groups) {
  const section = element('section', undefined, 'check-group');
  const heading = element('h2', group.title);
  heading.id = 'group-' + group.id;
  section.setAttribute('aria-labelledby', heading.id);
  section.append(heading, element('p', group.description, 'group-description'));
  for (const q of questions.filter(question => question.group === group.id)) {
    const fieldset = element('fieldset', undefined, 'question');
    fieldset.id = 'question-' + q.id;
    const legend = element('legend');
    legend.append(element('span', 'Question ' + q.id, 'q-number'), document.createTextNode(q.title));
    const check = element('p', q.check); check.id = 'check-' + q.id;
    const evidence = element('p', q.evidence); evidence.id = 'evidence-' + q.id;
    fieldset.setAttribute('aria-describedby', check.id + ' ' + evidence.id);
    fieldset.append(legend, check, evidence);
    if (q.applicability) fieldset.append(element('p', q.applicability, 'applicability'));
    const details = element('details');
    details.append(element('summary', 'Optional question to help find the evidence'));
    const note = element('div', undefined, 'evidence-note');
    note.append(element('p', q.prompt), element('p', 'This prompt does not verify a control. Inspect the underlying evidence yourself.', 'small muted'));
    const copy = element('button', 'Copy suggested question', 'plain-button copy-prompt');
    copy.type = 'button'; copy.addEventListener('click', () => copyPrompt(q.prompt, copy));
    note.append(copy); details.append(note); fieldset.append(details);
    const options = element('div', undefined, 'answer-options');
    for (const [value, label] of choices) {
      const wrapper = element('label', undefined, 'answer-choice');
      const input = element('input');
      input.type = 'radio'; input.name = 'question-' + q.id; input.value = value;
      input.checked = answers[q.id] === value;
      input.addEventListener('change', () => {
        answers[q.id] = value;
        persist(); render();
      });
      wrapper.append(input, document.createTextNode(label)); options.append(wrapper);
    }
    const clear = element('button', 'Clear this answer', 'plain-button clear-one');
    clear.type = 'button'; clear.id = 'clear-answer-' + q.id;
    clear.setAttribute('aria-label', 'Clear answer to question ' + q.id);
    clear.hidden = !answers[q.id];
    clear.addEventListener('click', () => {
      delete answers[q.id];
      options.querySelectorAll('input').forEach(input => { input.checked = false; });
      persist(); render();
      options.querySelector('input').focus();
      byId('action-status').textContent = 'Question ' + q.id + ' is now unreviewed.';
    });
    fieldset.append(options, clear); section.append(fieldset);
  }
  byId('questions').append(section);
}

function render() {
  const result = summarize(answers);
  byId('progress-count').textContent = result.marked + ' of 11 reviewed';
  byId('result-heading').textContent = result.title;
  byId('result-message').textContent = result.message;
  byId('download-result').disabled = result.marked === 0;
  byId('clear-answers').disabled = result.marked === 0 && profile === 'unknown';
  for (const q of questions) byId('clear-answer-' + q.id).hidden = !result.answers[q.id];
  const counts = byId('result-counts'); counts.replaceChildren();
  for (const [key, label] of choices) {
    const cell = element('div'); cell.append(element('dt', label), element('dd', String(result.count[key]))); counts.append(cell);
  }
  const next = byId('next-steps'); next.replaceChildren();
  if (result.followups.length) {
    next.append(element('h3', result.complete ? 'Your next steps' : 'Next steps for the items reviewed so far'));
    const list = element('ul');
    for (const q of result.followups) {
      const item = element('li');
      item.append(element('strong', 'Question ' + q.id + (answers[q.id] === 'gap' ? ' · Gap found. ' : ' · Evidence needed. ')), document.createTextNode(q.action));
      list.append(item);
    }
    next.append(list);
  }
  if (result.count.na) next.append(element('p', 'Not applicable answers are excluded from verified checks. Revisit them if you add sources, action tools or automated jobs.', 'small'));
  if (!byId('export-fallback').hidden) byId('export-text').value = exportText(answers, profile);
}

byId('setup-type').value = profile;
byId('setup-type').addEventListener('change', event => { profile = event.target.value; updateGuidance(); persist(); render(); });
byId('result-link').addEventListener('click', () => byId('result-heading').focus({ preventScroll: true }));
byId('download-result').addEventListener('click', () => {
  const text = exportText(answers, profile);
  byId('export-text').value = text;
  byId('export-fallback').hidden = false;
  byId('export-fallback').open = true;
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = element('a'); link.href = url; link.download = 'muneron-boundary-check.txt';
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    byId('action-status').textContent = 'Download requested. If no file appears, you can copy the checklist text shown here.';
  } catch (_) {
    byId('action-status').textContent = 'A file download is not available in this browser. Copy the checklist text shown here instead.';
  }
});
function closeConfirmation() { byId('clear-confirmation').hidden = true; byId('clear-answers').setAttribute('aria-expanded', 'false'); }
byId('clear-answers').addEventListener('click', () => {
  byId('clear-confirmation').hidden = false; byId('clear-answers').setAttribute('aria-expanded', 'true'); byId('cancel-clear').focus();
});
byId('cancel-clear').addEventListener('click', () => { closeConfirmation(); byId('clear-answers').focus(); });
byId('confirm-clear').addEventListener('click', () => {
  answers = {}; profile = 'unknown'; byId('setup-type').value = profile;
  byId('export-fallback').hidden = true; byId('export-fallback').open = false; byId('export-text').value = '';
  document.querySelectorAll('.answer-options input').forEach(input => { input.checked = false; });
  let cleared = false;
  try { sessionStorage.removeItem(STORAGE_KEY); cleared = true; storageAvailable = true; }
  catch (_) { storageAvailable = false; }
  showStorageStatus(); render(); updateGuidance(); closeConfirmation();
  byId('action-status').textContent = cleared
    ? 'Answers and setup selection cleared from this tab.'
    : 'Visible answers cleared, but browser storage could not be erased. Close this tab and clear this site’s browser data before using a shared device.';
  byId('setup-type').focus();
});
byId('clear-confirmation').addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeConfirmation(); byId('clear-answers').focus(); }
});
updateGuidance(); persist(); render();
byId('load-status').hidden = true;
for (const id of ['results', 'session-tools', 'progress-dock']) byId(id).hidden = false;
