/*
  Real estate site, v2 behaviour. Plain JavaScript, no dependencies, no network calls.
  Everything a visitor types stays in this browser (localStorage, wrapped so the page
  still works when storage is blocked).
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var KEY = 'pb-re-v2-';

  /* ---------- small helpers ---------- */

  var store = {
    get: function (k, fallback) {
      try { var v = localStorage.getItem(KEY + k); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* storage blocked: keep going */ }
    }
  };

  var moneyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  function money(n) { return moneyFmt.format(Math.round(n)); }
  function pctText(n) { return (Math.round(n * 100) / 100).toString() + '%'; }
  function shareText(part, whole) {
    if (!(whole > 0)) return '0%';
    var s = part / whole * 100;
    return (s > 0 && s < 1 ? '<1' : Math.round(s)) + '%';
  }
  function parseNum(str) {
    var s = String(str == null ? '' : str).replace(/[^0-9.]/g, '');
    if (s === '' || s === '.') return NaN;
    var n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); };
  }

  var announcer = $('[data-announce]');
  function announce(msg) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(function () { announcer.textContent = msg; }, 50);
  }

  function setStatus(el, msg, extra) {
    if (!el) return;
    el.textContent = msg;
    if (extra) { el.appendChild(doc.createTextNode(' ')); el.appendChild(extra); }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      doc.body.removeChild(ta);
    });
  }

  /* ---------- theme switch (unchanged behaviour from the live site) ---------- */

  (function themeSwitch() {
    var btn = $('.theme-toggle');
    if (!btn) return;
    function current() {
      var t = root.getAttribute('data-theme');
      if (t) return t;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function label() {
      var next = current() === 'dark' ? 'light' : 'dark';
      btn.textContent = next === 'dark' ? 'Dark theme' : 'Light theme';
      btn.setAttribute('aria-label', 'Switch to the ' + next + ' theme');
    }
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
      renderAllBars();
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', label);
    label();
  })();

  /* ---------- the map: Fremont is five towns ---------- */

  (function towns() {
    var plat = $('.plat');
    if (!plat) return;
    var labels = $$('.plat-label', plat);
    var parcels = $$('.parcel', plat);
    var edges = $$('.parcel-edge', plat);
    var cards = $$('.town-card');
    var current = 'overview';

    function select(town) {
      current = town;
      labels.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-town') === town)); });
      parcels.forEach(function (p) { p.classList.toggle('is-selected', p.getAttribute('data-town') === town); });
      edges.forEach(function (e) {
        var on = e.getAttribute('data-town') === town;
        e.classList.remove('is-selected');
        if (on) { e.getBoundingClientRect(); e.classList.add('is-selected'); }
      });
      cards.forEach(function (c) { c.classList.toggle('is-current', c.getAttribute('data-town') === town); });
      var card = cards.filter(function (c) { return c.getAttribute('data-town') === town; })[0];
      if (card) announce('Showing ' + card.querySelector('h4').textContent);
    }

    labels.forEach(function (b) {
      b.addEventListener('click', function () {
        var town = b.getAttribute('data-town');
        select(current === town ? 'overview' : town);
      });
    });
    parcels.forEach(function (p) {
      p.addEventListener('click', function () {
        var town = p.getAttribute('data-town');
        select(current === town ? 'overview' : town);
      });
    });
  })();

  /* ---------- buying or selling: one mode shared by the calculators and the steps ---------- */

  var modeListeners = [];
  var mode = store.get('mode', 'buy') === 'sell' ? 'sell' : 'buy';

  function setMode(next, opts) {
    mode = next === 'sell' ? 'sell' : 'buy';
    store.set('mode', mode);
    $$('.tabs[data-group="mode"]').forEach(function (list) {
      $$('[role="tab"]', list).forEach(function (tab) {
        var on = tab.getAttribute('data-mode') === mode;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        var panel = doc.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    });
    modeListeners.forEach(function (fn) { fn(mode, opts || {}); });
  }

  $$('.tabs[data-group="mode"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { setMode(tab.getAttribute('data-mode')); });
      tab.addEventListener('keydown', function (e) {
        var j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = tabs.length - 1;
        if (j === null) return;
        e.preventDefault();
        setMode(tabs[j].getAttribute('data-mode'));
        tabs[j].focus();
      });
    });
  });

  $$('a[data-mode]').forEach(function (a) {
    a.addEventListener('click', function () { setMode(a.getAttribute('data-mode')); });
  });

  /* ---------- bars: drawn at real pixel width so the hatching stays square ---------- */

  var barRenderers = [];
  function renderAllBars() { barRenderers.forEach(function (fn) { fn(); }); }
  function drawBar(svg, segments, scale) {
    if (!svg) return;
    var w = Math.max(120, Math.round(svg.getBoundingClientRect().width || svg.parentNode.clientWidth || 400));
    var h = 14, gap = 2;
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var parts = segments.filter(function (s) { return s.value > 0; });
    var total = scale > 0 ? scale : parts.reduce(function (a, s) { return a + s.value; }, 0);
    if (!(total > 0)) return;
    var usable = w - gap * Math.max(0, parts.length - 1);
    var x = 0;
    parts.forEach(function (s, i) {
      var sw = Math.max(1, usable * s.value / total);
      if (i === parts.length - 1) sw = Math.max(1, w - x);
      var r = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', x.toFixed(2)); r.setAttribute('y', 0);
      r.setAttribute('width', sw.toFixed(2)); r.setAttribute('height', h);
      r.setAttribute('class', s.cls);
      svg.appendChild(r);
      x += sw + gap;
    });
  }
  function swatch(cls) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = doc.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 14 14'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('class', 'bar');
    var r = doc.createElementNS(ns, 'rect');
    r.setAttribute('x', 0.5); r.setAttribute('y', 0.5); r.setAttribute('width', 13); r.setAttribute('height', 13);
    r.setAttribute('class', cls);
    s.appendChild(r);
    return s;
  }
  function ledgerRow(tbody, cls, label, amountText, shareTextValue, rowClass) {
    var tr = doc.createElement('tr');
    if (rowClass) tr.className = rowClass;
    var k = doc.createElement('td'); k.className = 'key';
    if (cls) k.appendChild(swatch(cls));
    var l = doc.createElement('td'); l.textContent = label;
    var a = doc.createElement('td'); a.className = 'num'; a.textContent = amountText;
    var s = doc.createElement('td'); s.className = 'num'; s.textContent = shareTextValue;
    tr.appendChild(k); tr.appendChild(l); tr.appendChild(a); tr.appendChild(s);
    tbody.appendChild(tr);
  }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(debounce(renderAllBars, 60));
    $$('svg.bar[data-bar]').forEach(function (svg) { ro.observe(svg); });
  } else {
    window.addEventListener('resize', debounce(renderAllBars, 120));
  }

  /* ---------- shared form behaviour ---------- */

  function tidyOnBlur(form) {
    $$('input[data-kind]', form).forEach(function (input) {
      input.addEventListener('blur', function () {
        var n = parseNum(input.value);
        if (isNaN(n)) { if (input.getAttribute('data-kind') === 'money') input.value = '0'; return; }
        input.value = input.getAttribute('data-kind') === 'money' ? intFmt.format(Math.round(n)) : String(Math.round(n * 1000) / 1000);
      });
    });
  }
  function fill(form, values) {
    Object.keys(values).forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      var v = values[name];
      if (el instanceof RadioNodeList || (el.length && el[0] && el[0].type === 'radio')) {
        $$('input[name="' + name + '"]', form).forEach(function (r) { r.checked = String(r.value) === String(v); });
      } else if (el.getAttribute && el.getAttribute('data-kind') === 'money') {
        el.value = isNaN(parseNum(v)) ? '0' : intFmt.format(Math.round(parseNum(v)));
      } else {
        el.value = v === '' || v == null ? '' : String(v);
      }
    });
  }
  function linkFor(params) {
    var q = new URLSearchParams(params).toString();
    return location.origin + location.pathname + '#numbers?' + q;
  }
  var lastLink = '';
  var touchedCalc = false;

  /* ---------- buying: what a home costs per month ---------- */

  var RATES = { 30: 7.21, 15: 6.54 };   // Freddie Mac PMMS, November 25, 2026
  var buy = (function () {
    var form = doc.getElementById('calc-buy');
    if (!form) return null;
    var out = {
      total: $('[data-out="total"]', form),
      mini: $('[data-out="mini"]', form),
      downCash: $('[data-out="down-cash"]', form),
      rateTerm: $('[data-out="rate-term"]', form),
      pmi: $('[data-out="pmi"]', form),
      bar: $('svg[data-bar="buy"]', form),
      ledger: $('[data-ledger="buy"]', form),
      status: $('[data-status]', form)
    };
    var rateTouched = false;
    var segs = [];

    function read() {
      var f = form.elements;
      var years = parseInt((form.querySelector('input[name="years"]:checked') || {}).value, 10) === 15 ? 15 : 30;
      return {
        price: clamp(parseNum(f.price.value) || 0, 0, 1e9),
        down: clamp(isNaN(parseNum(f.down.value)) ? 0 : parseNum(f.down.value), 0, 100),
        rate: clamp(isNaN(parseNum(f.rate.value)) ? 0 : parseNum(f.rate.value), 0, 25),
        years: years,
        tax: clamp(isNaN(parseNum(f.tax.value)) ? 0 : parseNum(f.tax.value), 0, 5),
        ins: clamp(parseNum(f.ins.value) || 0, 0, 1e7),
        hoa: clamp(parseNum(f.hoa.value) || 0, 0, 1e6)
      };
    }
    function compute(s) {
      var loan = s.price * (1 - s.down / 100);
      var r = s.rate / 100 / 12, n = s.years * 12;
      var pi = loan <= 0 ? 0 : (r > 0 ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n);
      var tax = s.price * s.tax / 100 / 12;
      var ins = s.ins / 12;
      var hoa = s.hoa;
      return { loan: loan, cash: s.price - loan, pi: pi, tax: tax, ins: ins, hoa: hoa, total: pi + tax + ins + hoa };
    }
    function drawOnly() { drawBar(out.bar, segs, 0); }
    function render(announceIt) {
      var s = read(), c = compute(s);
      out.total.textContent = money(c.total);
      if (out.mini) out.mini.textContent = money(c.total);
      out.downCash.textContent = money(c.cash);
      out.rateTerm.textContent = s.years + '-year';
      out.pmi.hidden = !(s.down < 20 && c.loan > 0);
      segs = [
        { cls: 'seg-accent', label: 'Principal and interest', value: c.pi },
        { cls: 'seg-ink', label: 'Property tax', value: c.tax },
        { cls: 'seg-hatch', label: 'Home insurance', value: c.ins },
        { cls: 'seg-plain', label: 'HOA dues', value: c.hoa }
      ];
      drawOnly();
      out.ledger.textContent = '';
      segs.forEach(function (g) { ledgerRow(out.ledger, g.cls, g.label, money(g.value), shareText(g.value, c.total)); });
      ledgerRow(out.ledger, null, 'Total per month', money(c.total), '100%', 'total');
      if (announceIt) announceTotal('Estimated monthly cost ' + money(c.total));
      return { state: s, result: c };
    }
    var announceTotal = debounce(announce, 900);

    form.addEventListener('input', function (e) {
      touchedCalc = true;
      if (e.target && e.target.name === 'rate') rateTouched = true;
      render(true);
    });
    form.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'years' && !rateTouched) {
        form.elements.rate.value = String(RATES[read().years]);
      }
      render(true);
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    tidyOnBlur(form);
    barRenderers.push(drawOnly);

    function params() {
      var s = read();
      return { mode: 'buy', price: s.price, down: s.down, rate: s.rate, years: s.years, tax: s.tax, ins: s.ins, hoa: s.hoa };
    }
    function load(p) {
      fill(form, { price: p.price, down: p.down, rate: p.rate, years: p.years, tax: p.tax, ins: p.ins, hoa: p.hoa });
      if (p.rate != null && p.rate !== '') rateTouched = true;
      render(false);
    }

    $('[data-action="link"]', form).addEventListener('click', function () {
      lastLink = linkFor(params());
      copyText(lastLink).then(function () { setStatus(out.status, 'Link copied. It opens this calculator with these numbers.'); },
        function () { setStatus(out.status, 'Copy this link: ' + lastLink); });
    });
    $('[data-action="print"]', form).addEventListener('click', function () { printSection('buy'); });
    $('[data-action="save"]', form).addEventListener('click', function () {
      var r = render(false);
      var list = store.get('scenarios', []);
      list.unshift({ price: r.state.price, down: r.state.down, rate: r.state.rate, years: r.state.years, tax: r.state.tax, ins: r.state.ins, hoa: r.state.hoa, total: Math.round(r.result.total) });
      list = list.slice(0, 6);
      store.set('scenarios', list);
      renderSaved();
      setStatus(out.status, 'Saved below. Saved numbers stay on this device.');
    });

    render(false);
    return { render: render, params: params, load: load };
  })();

  /* ---------- saved scenarios ---------- */

  function renderSaved() {
    var wrap = doc.getElementById('saved');
    var tbody = $('[data-saved]');
    if (!wrap || !tbody) return;
    var list = store.get('scenarios', []);
    tbody.textContent = '';
    wrap.hidden = list.length === 0;
    list.forEach(function (sc, i) {
      var tr = doc.createElement('tr');
      [money(sc.price), pctText(sc.down), pctText(sc.rate), sc.years + ' years', money(sc.total)].forEach(function (t, j) {
        var td = doc.createElement('td'); td.textContent = t;
        if (j !== 3) td.className = 'num';
        tr.appendChild(td);
      });
      var act = doc.createElement('td');
      var loadBtn = doc.createElement('button');
      loadBtn.type = 'button'; loadBtn.className = 'link-btn'; loadBtn.textContent = 'Load';
      loadBtn.setAttribute('aria-label', 'Load the scenario at ' + money(sc.price) + ', ' + pctText(sc.rate));
      loadBtn.addEventListener('click', function () {
        setMode('buy');
        buy.load(sc);
        var price = doc.getElementById('b-price');
        if (price) price.focus();
      });
      var rm = doc.createElement('button');
      rm.type = 'button'; rm.className = 'link-btn'; rm.textContent = 'Remove';
      rm.setAttribute('aria-label', 'Remove the scenario at ' + money(sc.price) + ', ' + pctText(sc.rate));
      rm.addEventListener('click', function () {
        var l = store.get('scenarios', []);
        l.splice(i, 1);
        store.set('scenarios', l);
        renderSaved();
        announce('Removed.');
      });
      act.appendChild(loadBtn);
      act.appendChild(doc.createTextNode(' '));
      act.appendChild(rm);
      tr.appendChild(act);
      tbody.appendChild(tr);
    });
  }
  renderSaved();

  /* ---------- selling: what you'd walk away with ---------- */

  var TRANSFER_PER_1000 = 1.10;   // Fremont total documentary transfer tax, per $1,000
  var sell = (function () {
    var form = doc.getElementById('calc-sell');
    if (!form) return null;
    var out = {
      total: $('[data-out="total"]', form),
      mini: $('[data-out="mini"]', form),
      bar: $('svg[data-bar="sell"]', form),
      ledger: $('[data-ledger="sell"]', form),
      status: $('[data-status]', form)
    };
    var segs = [], scale = 0;

    function read() {
      var f = form.elements;
      var comm = parseNum(f.comm.value);
      return {
        price: clamp(parseNum(f.price.value) || 0, 0, 1e9),
        payoff: clamp(parseNum(f.payoff.value) || 0, 0, 1e9),
        comm: isNaN(comm) ? null : clamp(comm, 0, 20),
        escrow: clamp(isNaN(parseNum(f.escrow.value)) ? 0 : parseNum(f.escrow.value), 0, 20),
        credits: clamp(parseNum(f.credits.value) || 0, 0, 1e9)
      };
    }
    function compute(s) {
      var transfer = s.price / 1000 * TRANSFER_PER_1000;
      var comm = s.comm == null ? 0 : s.price * s.comm / 100;
      var escrow = s.price * s.escrow / 100;
      var costs = s.payoff + comm + transfer + escrow + s.credits;
      return { transfer: transfer, comm: comm, escrow: escrow, costs: costs, net: s.price - costs };
    }
    function drawOnly() { drawBar(out.bar, segs, scale); }
    function render(announceIt) {
      var s = read(), c = compute(s);
      out.total.textContent = money(c.net);
      if (out.mini) out.mini.textContent = money(c.net);
      out.total.classList.toggle('is-negative', c.net < 0);
      segs = [
        { cls: 'seg-ink', label: 'Loan payoff', value: s.payoff },
        { cls: 'seg-strong', label: 'Agent compensation', value: c.comm },
        { cls: 'seg-plain', label: 'Documentary transfer tax', value: c.transfer },
        { cls: 'seg-hatch', label: 'Escrow, title and other costs', value: c.escrow },
        { cls: 'seg-plain', label: 'Credits and repairs', value: s.credits },
        { cls: 'seg-accent', label: 'Your proceeds', value: Math.max(0, c.net) }
      ];
      scale = Math.max(s.price, c.costs);
      drawOnly();
      out.ledger.textContent = '';
      ledgerRow(out.ledger, null, 'Sale price', money(s.price), '100%');
      segs.forEach(function (g) {
        if (g.label === 'Your proceeds') return;
        if (g.label === 'Agent compensation' && s.comm == null) {
          ledgerRow(out.ledger, g.cls, 'Agent compensation: enter your rate', 'Not included', '', 'muted');
          return;
        }
        ledgerRow(out.ledger, g.cls, g.label, (g.value > 0 ? '−' : '') + money(g.value), shareText(g.value, s.price));
      });
      ledgerRow(out.ledger, 'seg-accent', c.net < 0 ? 'You would bring to closing' : 'Estimated proceeds', money(Math.abs(c.net)), shareText(Math.max(0, c.net), s.price), 'total');
      if (announceIt) announceTotal('Estimated proceeds ' + money(c.net));
      return { state: s, result: c };
    }
    var announceTotal = debounce(announce, 900);

    form.addEventListener('input', function () { touchedCalc = true; render(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    tidyOnBlur(form);
    barRenderers.push(drawOnly);

    function params() {
      var s = read();
      return { mode: 'sell', price: s.price, payoff: s.payoff, comm: s.comm == null ? '' : s.comm, escrow: s.escrow, credits: s.credits };
    }
    function load(p) {
      fill(form, { price: p.price, payoff: p.payoff, comm: p.comm, escrow: p.escrow, credits: p.credits });
      render(false);
    }

    $('[data-action="link"]', form).addEventListener('click', function () {
      lastLink = linkFor(params());
      copyText(lastLink).then(function () { setStatus(out.status, 'Link copied. It opens this calculator with these numbers.'); },
        function () { setStatus(out.status, 'Copy this link: ' + lastLink); });
    });
    $('[data-action="print"]', form).addEventListener('click', function () { printSection('sell'); });

    render(false);
    return { render: render, params: params, load: load };
  })();

  /* ---------- printing: only the estimate or the list, plus the disclosures ---------- */

  var reopened = [];
  function printSection(which) {
    doc.body.setAttribute('data-print', which);
    if (which === 'steps') {
      reopened = $$('.step-checks').filter(function (d) { return !d.open; });
      reopened.forEach(function (d) { d.open = true; });
    }
    window.print();
  }
  window.addEventListener('afterprint', function () {
    doc.body.removeAttribute('data-print');
    reopened.forEach(function (d) { d.open = false; });
    reopened = [];
  });

  /* ---------- the checklist ---------- */

  (function checklist() {
    var boxes = $$('input[data-check]');
    if (!boxes.length) return;
    var progress = $('[data-progress]');
    var state = store.get('checks', {});
    var undoTimer = null;

    boxes.forEach(function (b) { b.checked = !!state[b.getAttribute('data-check')]; });

    function visibleBoxes() {
      var panel = doc.getElementById(mode === 'sell' ? 'steps-sell' : 'steps-buy');
      return panel ? $$('input[data-check]', panel) : [];
    }
    function update() {
      var vis = visibleBoxes();
      var done = vis.filter(function (b) { return b.checked; }).length;
      if (progress) progress.textContent = done + ' of ' + vis.length + ' checked';
      $$('.step-checks').forEach(function (d) {
        var own = $$('input[data-check]', d);
        var n = own.filter(function (b) { return b.checked; }).length;
        var out = $('[data-step-progress]', d);
        if (out) out.textContent = n + ' of ' + own.length + ' done';
      });
    }
    boxes.forEach(function (b) {
      b.addEventListener('change', function () {
        state[b.getAttribute('data-check')] = b.checked;
        if (!b.checked) delete state[b.getAttribute('data-check')];
        store.set('checks', state);
        update();
      });
    });

    var clearBtn = $('[data-action="clear-checks"]');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      var vis = visibleBoxes();
      var before = {};
      vis.forEach(function (b) { if (b.checked) before[b.getAttribute('data-check')] = true; b.checked = false; delete state[b.getAttribute('data-check')]; });
      store.set('checks', state);
      update();
      if (!progress) return;
      var undo = doc.createElement('button');
      undo.type = 'button'; undo.className = 'link-btn'; undo.textContent = 'Undo';
      undo.addEventListener('click', function () {
        vis.forEach(function (b) { if (before[b.getAttribute('data-check')]) { b.checked = true; state[b.getAttribute('data-check')] = true; } });
        store.set('checks', state);
        clearTimeout(undoTimer);
        update();
        announce('Checklist restored.');
      });
      progress.textContent = 'Cleared.';
      progress.appendChild(doc.createTextNode(' '));
      progress.appendChild(undo);
      announce('Checklist cleared.');
      clearTimeout(undoTimer);
      undoTimer = setTimeout(update, 8000);
    });

    var printBtn = $('[data-action="print-steps"]');
    if (printBtn) printBtn.addEventListener('click', function () { printSection('steps'); });

    modeListeners.push(update);
    update();
  })();

  /* ---------- contact: write the email in the visitor's own mail app ---------- */

  (function composer() {
    var form = doc.getElementById('composer');
    if (!form) return;
    // The address lives once, in the page's contact link, so it isn't duplicated here.
    var mailLink = doc.querySelector('.contact-item a[href^="mailto:"]');
    var EMAIL = mailLink ? decodeURIComponent(mailLink.getAttribute('href').slice(7).split('?')[0]) : '';
    if (!EMAIL) return;
    var status = $('[data-status]', form);
    var include = doc.getElementById('c-numbers');
    var SUBJECTS = { buy: 'Buying in Fremont', sell: 'Selling a home', other: 'A question from your website' };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var topic = (form.querySelector('input[name="topic"]:checked') || {}).value || 'other';
      var msg = (doc.getElementById('c-msg').value || '').trim();
      var lines = ['Hi Paolo,', ''];
      if (msg) { lines.push(msg, ''); }
      if (include && include.checked) {
        var p = mode === 'sell' && sell ? sell.params() : (buy ? buy.params() : null);
        if (p) lines.push('My numbers: ' + linkFor(p), '');
      }
      var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(SUBJECTS[topic] || SUBJECTS.other) +
        '&body=' + encodeURIComponent(lines.join('\r\n'));
      setStatus(status, 'Opening your email app. If nothing opens, copy my address and write from your usual email.');
      window.location.href = href;
    });

    $('[data-action="copy-email"]', form).addEventListener('click', function () {
      copyText(EMAIL).then(function () { setStatus(status, 'Email address copied.'); },
        function () { setStatus(status, 'My address is ' + EMAIL + '.'); });
    });

    modeListeners.push(function (m) {
      var r = form.querySelector('input[name="topic"][value="' + m + '"]');
      if (r && !form.dataset.topicTouched) r.checked = true;
    });
    form.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'topic') form.dataset.topicTouched = '1';
      if (e.target === include) form.dataset.includeTouched = '1';
    });
    // Offer the numbers link once the visitor has actually used a calculator.
    doc.addEventListener('input', function (e) {
      if (include && !form.dataset.includeTouched && e.target.closest && e.target.closest('.calc')) include.checked = true;
    });
  })();

  /* ---------- deep links: #numbers?mode=buy&price=... ---------- */

  function fromHash() {
    var h = location.hash || '';
    if (h.indexOf('#numbers?') !== 0) return false;
    var p = {};
    new URLSearchParams(h.slice('#numbers?'.length)).forEach(function (v, k) { p[k] = v; });
    setMode(p.mode === 'sell' ? 'sell' : 'buy');
    if (p.mode === 'sell' && sell) sell.load(p);
    else if (buy) buy.load(p);
    var target = doc.getElementById('numbers');
    if (target) target.scrollIntoView();
    return true;
  }

  setMode(mode);
  fromHash();
  window.addEventListener('hashchange', fromHash);
})();
