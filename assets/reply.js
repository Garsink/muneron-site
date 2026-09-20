import { buildHandover, FREIGHT } from './reply-model.mjs';

const form = document.getElementById('reply-form');
const out = document.getElementById('reply-output');
if (form && out) {
  form.hidden = false;
  const staticNote = document.getElementById('reply-static-note');
  if (staticNote) staticNote.hidden = true;

  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const read = () => {
    const d = new FormData(form), o = {};
    for (const [k, v] of d.entries()) o[k] = v;
    return o;
  };

  function render() {
    const h = buildHandover(read());
    out.textContent = '';

    out.append(el('h4', null, 'Reply draft'));
    h.draft.forEach(p => out.append(el('p', null, p)));

    if (h.refusals.length) {
      out.append(el('h4', 'refuse-heading', 'What it will not write, and why'));
      const ul = el('ul', 'refusals');
      h.refusals.forEach(r => {
        const li = el('li');
        li.append(el('strong', null, r.wont.charAt(0).toUpperCase() + r.wont.slice(1) + '.'));
        li.append(document.createTextNode(' ' + r.why));
        ul.append(li);
      });
      out.append(ul);
    }

    if (h.checks.length) {
      out.append(el('h4', null, 'The arithmetic it is willing to show'));
      const dl = el('dl', 'checks');
      h.checks.forEach(c => {
        const row = el('div');
        row.append(el('dt', null, c.label));
        const dd = el('dd', null, c.value);
        dd.append(el('span', 'src', ' Source: ' + c.source));
        row.append(dd); dl.append(row);
      });
      out.append(dl);
    }

    out.append(el('h4', null, 'For the person reviewing it'));
    const ol = el('ul');
    h.decisions.forEach(d => {
      const li = el('li');
      li.append(el('strong', null, d.what + '.'));
      li.append(document.createTextNode(' ' + d.why));
      ol.append(li);
    });
    out.append(ol);
    out.append(el('p', 'unsent', h.unsent));
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', e => { e.preventDefault(); render(); });
  const reset = document.getElementById('reply-reset');
  if (reset) reset.addEventListener('click', () => { form.reset(); render(); });
  render();

  const freightSel = form.elements.freight;
  if (freightSel && !freightSel.options.length) {
    Object.entries(FREIGHT).forEach(([v, label]) => freightSel.append(new Option(label, v)));
  }
}
