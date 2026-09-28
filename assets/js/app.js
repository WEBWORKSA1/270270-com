/* 270270 Number Lab: UI layer */
(function () {
  'use strict';
  var C = window.NL_CONFIG || {}, NL = window.NL, DATA = window.NL_DATA || { entries: [], digits: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { } },
    sget: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { } }
  };
  var ROOT = document.documentElement.getAttribute('data-root') || '';

  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  function copy(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); }, function () { toast('Copy failed: select and copy manually'); });
    else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copied'); } catch (e) { } ta.remove(); }
  }

  /* ---------- Inbox (never in plain text) ---------- */
  function inbox() { return (C._k || []).slice().reverse().map(function (c) { return String.fromCharCode(c - 7); }).join(''); }
  function endpoint() { return 'https://formsubmit.co/ajax/' + (C.FORM_ALIAS || inbox()); }

  /* ---------- Theme ---------- */
  function initTheme() {
    var saved = store.get('nl-theme'); if (saved) document.documentElement.setAttribute('data-theme', saved);
    $$('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        var nx = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nx); store.set('nl-theme', nx);
      });
    });
  }

  /* ---------- Mobile drawer ---------- */
  function initDrawer() {
    var d = $('#drawer'); if (!d) return;
    $$('[data-drawer-open]').forEach(function (b) { b.addEventListener('click', function () { d.classList.add('open'); b.setAttribute('aria-expanded', 'true'); var f = $('a', d); if (f) f.focus(); }); });
    $$('[data-drawer-close]', d).forEach(function (b) { b.addEventListener('click', function () { d.classList.remove('open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { d.classList.remove('open'); closeModal(); } });
  }

  /* ---------- UTM capture ---------- */
  function captureUtm() {
    var q = new URLSearchParams(location.search), u = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref'].forEach(function (k) { if (q.get(k)) u[k] = q.get(k); });
    if (Object.keys(u).length) store.sset('nl-utm', JSON.stringify(u));
    if (!store.sget('nl-ref') && document.referrer) store.sset('nl-ref', document.referrer);
    if (!store.sget('nl-landing')) store.sset('nl-landing', location.pathname);
  }

  /* ---------- Forms (AJAX -> FormSubmit) ---------- */
  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('.form-msg', form);
        if (form.querySelector('[name="_honey"]') && form.querySelector('[name="_honey"]').value) return;
        if (!form.checkValidity()) {
          var bad = form.querySelector(':invalid'); if (bad) { bad.focus(); bad.reportValidity && bad.reportValidity(); }
          return;
        }
        var fd = new FormData(form), data = {};
        fd.forEach(function (v, k) { if (k === '_honey') return; data[k] = data[k] ? data[k] + ', ' + v : v; });
        data._subject = '[270270.com] ' + (form.getAttribute('data-form') || 'Form') + (data.name ? ' from ' + data.name : '');
        data._template = 'table'; data._captcha = 'false';
        data['Form'] = form.getAttribute('data-form');
        data['Page'] = location.href;
        data['Landing page'] = store.sget('nl-landing') || '';
        data['Referrer'] = store.sget('nl-ref') || '';
        data['UTM'] = store.sget('nl-utm') || '';
        data['Last number decoded'] = store.sget('nl-last') || '';
        if (data.email) data._replyto = data.email;
        var btn = form.querySelector('[type=submit]'); var label = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json().catch(function () { return {}; }); })
          .then(function () {
            if (msg) { msg.className = 'form-msg ok'; msg.textContent = form.getAttribute('data-ok') || 'Thank you! Your message has been received. We reply within 1–2 business days.'; }
            form.reset(); resetSteps(form);
            toast('Sent ✓');
            if (window.gtag) window.gtag('event', 'generate_lead', { form: form.getAttribute('data-form') });
          })
          .catch(function () {
            if (msg) { msg.className = 'form-msg err'; msg.innerHTML = 'Network hiccup. <a href="#" data-mail="' + esc(data._subject) + '">Send by email instead</a>.'; }
          })
          .then(function () { if (btn) { btn.disabled = false; btn.innerHTML = label; } });
      });
    });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-mail]'); if (!a) return;
      e.preventDefault();
      var subj = a.getAttribute('data-mail') || 'Inquiry from 270270.com';
      location.href = 'mailto:' + inbox() + '?subject=' + encodeURIComponent(subj);
    });
  }

  /* ---------- Multi-step forms ---------- */
  function resetSteps(form) { if (form.hasAttribute('data-steps')) showStep(form, 0); }
  function showStep(form, i) {
    var steps = $$('.step', form); if (!steps.length) return;
    i = Math.max(0, Math.min(steps.length - 1, i)); form._step = i;
    steps.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    $$('.steps span', form).forEach(function (s, k) { s.classList.toggle('on', k <= i); });
    var lbl = $('[data-step-label]', form); if (lbl) lbl.textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
  }
  function initSteps() {
    $$('form[data-steps]').forEach(function (form) {
      showStep(form, 0);
      form.addEventListener('click', function (e) {
        if (e.target.closest('[data-next]')) {
          e.preventDefault();
          var cur = $$('.step', form)[form._step];
          var inv = $$('input,select,textarea', cur).filter(function (el) { return !el.checkValidity(); });
          if (inv.length) { inv[0].reportValidity(); return; }
          showStep(form, form._step + 1); form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (e.target.closest('[data-prev]')) { e.preventDefault(); showStep(form, form._step - 1); }
      });
    });
    $$('[data-pick]').forEach(function (a) { a.addEventListener('click', function () { var s = $('#b-pkg'); if (!s) return; $$('option', s).forEach(function (o) { if (o.textContent.indexOf(a.getAttribute('data-pick')) === 0) s.value = o.value; }); }); });
    $$('[data-role]').forEach(function (a) { a.addEventListener('click', function () { var s = $('#j-role'); if (s) s.value = a.getAttribute('data-role'); }); });
    // Prefill audit form from query (?service=...&n=...)
    var q = new URLSearchParams(location.search);
    if (q.get('service')) $$('input[name="audit_items"]').forEach(function (i) { if (i.value.toLowerCase().indexOf(q.get('service').toLowerCase()) >= 0) i.checked = true; });
    if (q.get('n')) $$('[name="numbers"]').forEach(function (i) { i.value = q.get('n'); });
  }

  /* ---------- Ads ---------- */
  function initAds() {
    var slots = $$('.ad-slot'); if (!slots.length) return;
    if (C.ADSENSE_CLIENT) {
      if (!document.querySelector('script[src*="adsbygoogle"]')) {
        var s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + C.ADSENSE_CLIENT; document.head.appendChild(s);
      }
      if (store.get('nl-consent') === 'essential') { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
      slots.forEach(function (el) {
        var slot = (C.ADSENSE_SLOTS || {})[el.getAttribute('data-slot')] || '';
        el.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + C.ADSENSE_CLIENT + '"' + (slot ? ' data-ad-slot="' + slot + '"' : '') + ' data-ad-format="auto" data-full-width-responsive="true"></ins>';
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { }
      });
    } else {
      var house = [
        '<strong>Your brand here.</strong> Reach a global audience that cares about luck, culture & Chinese consumers. <a href="' + ROOT + 'advertise.html">Advertise on 270270 →</a>',
        '<strong>Selling to Chinese customers?</strong> Get your prices, phone numbers & launch dates audited. <a href="' + ROOT + 'business.html">Book a Number Audit →</a>',
        '<strong>Keep 270270 free.</strong> Send a lucky red envelope to fund new tools & contests. <a href="' + ROOT + 'support.html">Support us →</a>',
        '<strong>Win prizes!</strong> This month\'s Lucky Number Story contest is open. <a href="' + ROOT + 'contests.html">Enter now →</a>'
      ];
      slots.forEach(function (el, i) { el.classList.add('house'); el.innerHTML = '<div>' + house[(i + new Date().getDate()) % house.length] + '</div>'; });
    }
  }

  /* ---------- Cookie consent ---------- */
  function initCookie() {
    var c = $('#cookie'); if (!c) return;
    if (!store.get('nl-consent')) c.classList.add('show');
    $$('[data-consent]', c).forEach(function (b) { b.addEventListener('click', function () { store.set('nl-consent', b.getAttribute('data-consent')); c.classList.remove('show'); }); });
  }

  /* ---------- Modal (exit intent / generic) ---------- */
  function openModal(id) { var m = $('#' + id); if (m) { m.classList.add('show'); var f = $('input,button', m); if (f) f.focus(); } }
  function closeModal() { $$('.modal.show').forEach(function (m) { m.classList.remove('show'); }); }
  function initModal() {
    $$('.modal [data-close]').forEach(function (b) { b.addEventListener('click', closeModal); });
    $$('[data-open-modal]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openModal(b.getAttribute('data-open-modal')); }); });
    if (document.body.hasAttribute('data-exit') && matchMedia('(pointer:fine)').matches && !store.sget('nl-exit')) {
      var armed = false; setTimeout(function () { armed = true; }, 8000);
      document.addEventListener('mouseout', function (e) {
        if (!armed || e.relatedTarget || e.clientY > 8 || store.sget('nl-exit')) return;
        store.sset('nl-exit', '1'); openModal('exit-modal');
      });
    }
  }

  /* ---------- YouTube lite embeds ---------- */
  function initYouTube() {
    $$('.yt[data-id]').forEach(function (el) {
      var id = el.getAttribute('data-id');
      if (!el.querySelector('img')) el.innerHTML = '<img loading="lazy" alt="' + esc(el.getAttribute('data-title') || 'Video') + '" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><div class="play"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></div>';
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0'); el.setAttribute('aria-label', 'Play video: ' + (el.getAttribute('data-title') || ''));
      function play() { el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + esc(el.getAttribute('data-title') || 'YouTube video') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'; }
      el.addEventListener('click', play); el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
    });
    $$('[data-vfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-vfilter');
        $$('[data-vfilter]').forEach(function (x) { x.classList.toggle('active', x === b); });
        $$('.vcard').forEach(function (v) { v.style.display = (f === 'all' || v.getAttribute('data-cat') === f) ? '' : 'none'; });
      });
    });
    if (C.YOUTUBE_CHANNEL) $$('[data-yt-channel]').forEach(function (a) { a.href = C.YOUTUBE_CHANNEL; a.hidden = false; });
  }

  /* ---------- Decoder ---------- */
  function renderDecoder(box, value) {
    var out = $('.result', box); if (!out) return;
    var dialect = box._dialect || 'm', mode = box._mode || 'any';
    var r = NL.analyze(value, { dialect: dialect });
    if (!r.n) { out.innerHTML = '<p class="muted">Type any number: a phone, plate, price, date, address or slang code.</p>'; return; }
    store.sset('nl-last', r.n);
    var g = r.grade;
    var dcards = r.digits.map(function (d) {
      var cls = d.w >= 5 ? 'pos' : (d.w <= -4 ? 'neg' : '');
      return '<div class="dcard ' + cls + '" title="' + esc(d.mean) + '"><div class="d">' + d.d + '</div><div class="h">' + esc((d.hanzi || '').split(' / ')[0]) + '</div><div class="p">' + esc(d.pinyin || '') + '</div><div class="p">' + esc((d.sounds || [])[0] || '') + '</div></div>';
    }).join('');
    var combos = r.combos.map(function (c) {
      return '<div class="combo ' + c.tone + '"><div class="code">' + esc(c.code) + '</div><div><div class="han" style="color:var(--red)">' + esc(c.hanzi) + ' <span class="muted small" style="font-family:var(--f-ui);font-weight:400">' + esc(c.pinyin) + '</span></div><div class="small">' + esc(c.en) + '</div><a class="small" href="' + ROOT + 'n/' + encodeURIComponent(c.code) + '.html">Full meaning of ' + esc(c.code) + ' →</a></div></div>';
    }).join('');
    var pats = r.patterns.map(function (p) { return '<li>' + esc(p.k) + '</li>'; }).join('');
    var warns = r.warnings.map(function (w) { return '<div class="warn">⚠ ' + esc(w) + '</div>'; }).join('');
    var modeTip = {
      phone: 'For phone numbers the last 4 digits matter most. Endings in 8, 88, 168 or 518 are premium; avoid 4, 14 and 44.',
      plate: 'Short plates with 8, 18, 28, 88 or a solid run are the most coveted. The HK plate "28" sold for HK$18.1M.',
      price: 'Prices ending in 8 (e.g. 88, 168, 888) signal prosperity to Chinese shoppers. Avoid 4 and 250.',
      address: 'Buildings in Chinese communities often skip floors 4, 13, 14 and 24. Unit numbers ending in 8 command premiums.',
      date: 'For dates, also check the lunar calendar (Ghost Month) in our Lucky Date Finder.',
      any: ''
    }[mode];
    var url = new URL(ROOT + 'decoder.html?n=' + r.n + (dialect === 'c' ? '&d=c' : ''), location.href).href;
    out.innerHTML =
      '<div class="score-row"><div class="dial" style="--p:' + r.score + ';--dial-c:' + g.color + '"><b>' + r.score + '</b><small>/ 99</small></div>' +
      '<div><div class="grade"><span class="han">' + g.han + '</span>' + g.en + '</div><div class="muted small">' + (dialect === 'c' ? 'Cantonese' : 'Mandarin') + ' reading · ' + r.n.length + ' digits</div>' +
      '<p style="margin:.5em 0 0">' + esc(r.reading) + '</p></div></div>' + warns +
      (modeTip ? '<p class="note small" style="margin-top:12px">💡 ' + esc(modeTip) + '</p>' : '') +
      '<div class="digits">' + dcards + '</div>' +
      (combos ? '<h4>Hidden phrases found</h4>' + combos : '') +
      (pats ? '<h4 style="margin-top:14px">Patterns</h4><ul class="small">' + pats + '</ul>' : '') +
      '<div class="share"><button class="btn btn-sm btn-ghost" data-copy="' + esc(url) + '">🔗 Copy link</button>' +
      '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent('My number ' + r.n + ' scored ' + r.score + '/99 (' + g.en + ') on 270270 Number Lab: ' + url) + '">WhatsApp</a>' +
      '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(r.n + ' = ' + g.han + ' ' + g.en + ' (' + r.score + '/99). Decode yours:') + '&url=' + encodeURIComponent(url) + '">X / Twitter</a>' +
      '<a class="btn btn-sm btn-ghost" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '">Facebook</a>' +
      '<a class="btn btn-sm btn-primary" href="' + ROOT + 'business.html?n=' + r.n + '#audit">Get an expert audit</a></div>' +
      '<p class="muted small" style="margin-top:10px">For cultural entertainment & education. Meanings vary by dialect, region and family tradition.</p>';
    if (box.hasAttribute('data-sync-url')) {
      var q = new URLSearchParams(location.search); q.set('n', r.n); if (dialect === 'c') q.set('d', 'c'); else q.delete('d');
      history.replaceState(null, '', location.pathname + '?' + q.toString());
      var emb = $('#embed-code'); if (emb) emb.textContent = '<iframe src="' + url + '" width="100%" height="720" style="border:0;border-radius:16px" title="270270 Number Decoder" loading="lazy"></iframe>';
    }
  }
  function initDecoders() {
    $$('[data-decoder]').forEach(function (box) {
      var inp = $('.num-input', box); if (!inp) return;
      var q = new URLSearchParams(location.search);
      if (box.hasAttribute('data-sync-url') && q.get('n')) inp.value = NL.clean(q.get('n'));
      if (box.hasAttribute('data-sync-url') && q.get('d') === 'c') box._dialect = 'c';
      if (box.getAttribute('data-value') && !inp.value) inp.value = box.getAttribute('data-value');
      $$('[data-dialect]', box).forEach(function (b) {
        b.setAttribute('aria-pressed', String((box._dialect || 'm') === b.getAttribute('data-dialect')));
        b.addEventListener('click', function () { box._dialect = b.getAttribute('data-dialect'); $$('[data-dialect]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); renderDecoder(box, inp.value); });
      });
      $$('[data-mode]', box).forEach(function (b) {
        b.addEventListener('click', function () { box._mode = b.getAttribute('data-mode'); $$('[data-mode]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); inp.placeholder = b.getAttribute('data-ph') || inp.placeholder; renderDecoder(box, inp.value); inp.focus(); });
      });
      var t; inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { renderDecoder(box, inp.value); }, 120); });
      var form = inp.closest('form'); if (form) form.addEventListener('submit', function (e) { e.preventDefault(); if (box.hasAttribute('data-go')) { location.href = ROOT + 'decoder.html?n=' + NL.clean(inp.value); } else renderDecoder(box, inp.value); });
      $$('[data-try]', box.parentNode).forEach(function (c) { c.addEventListener('click', function (e) { e.preventDefault(); inp.value = c.getAttribute('data-try'); renderDecoder(box, inp.value); }); });
      renderDecoder(box, inp.value);
    });
    document.addEventListener('click', function (e) { var b = e.target.closest('[data-copy]'); if (b) { e.preventDefault(); copy(b.getAttribute('data-copy')); } });
    var cb = $('[data-copy-embed]'); if (cb) cb.addEventListener('click', function () { copy($('#embed-code').textContent); });
  }

  /* ---------- Number of the day ---------- */
  function initNotd() {
    $$('[data-notd]').forEach(function (el) {
      var e = NL.numberOfDay(new Date()); if (!e) return;
      var a = NL.analyze(e.code);
      el.innerHTML = '<div class="bignum"><div class="n">' + esc(e.code) + '</div><div><div class="h" style="font:900 1.8rem var(--f-han);color:var(--red)">' + esc(e.hanzi) + '</div><div class="muted">' + esc(e.pinyin) + '</div></div></div><p style="margin-top:10px">' + esc(e.en) + '</p><p><span class="pill lucky">' + a.grade.han + ' ' + a.grade.en + ' · ' + a.score + '/99</span></p><a class="btn btn-sm btn-ghost" href="' + ROOT + 'n/' + e.code + '.html">Explore ' + esc(e.code) + ' →</a>';
    });
  }

  /* ---------- Fortune cookie ---------- */
  var FORTUNES = ['A number ending in 8 is walking toward you. Say yes to it.', 'Good things come in pairs (好事成双): double your effort today.', 'The road to prosperity is smooth (一路发). Take the first step.', 'Patience is 久 (jiǔ): what lasts is worth the wait.', 'Someone is thinking 530 (我想你) about you.', 'Your next idea is a 666: awesome. Ship it.', 'Avoid 4 decisions made in anger (气死). Sleep on it.', 'A rising sequence (步步高升) marks your week.', 'Luck favours the prepared: check your launch date first.', 'Today\'s lucky direction is forward. Today\'s lucky number is yours to choose.', 'A red envelope of opportunity opens when you share.', 'What you plant at 3 (生) grows into 8 (发).', 'The ninth attempt lasts forever (久). Keep going.', 'Harmony is 和: listen twice, speak once.', 'Your 1314 moment is closer than you think.', 'Fortune does not skip floors. Neither should you.', 'A clever 0 (灵) completes the circle: finish what you started.', 'Prosperity loves company: invite a partner in.', 'Small steps, big 发.', 'Say 88 to bad habits. Bye-bye (拜拜)!'];
  function initFortune() {
    $$('[data-fortune]').forEach(function (box) {
      var out = $('.fortune', box), btn = $('button', box), nums = $('.fnums', box);
      function crack() {
        var f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        var ln = []; while (ln.length < 6) { var x = 1 + Math.floor(Math.random() * 49); if (ln.indexOf(x) < 0 && !/4/.test(String(x))) ln.push(x); }
        out.textContent = '“' + f + '”'; if (nums) nums.textContent = 'Lucky numbers: ' + ln.sort(function (a, b) { return a - b; }).join(' · ');
      }
      if (btn) btn.addEventListener('click', crack);
    });
  }

  /* ---------- Lucky price finder ---------- */
  function initPrice() {
    $$('[data-price-tool]').forEach(function (box) {
      var inp = $('input', box), out = $('.price-out', box), cur = $('select', box);
      function run() {
        var list = NL.luckyPrices(inp.value), sym = cur ? cur.value : '$';
        if (!list.length) { out.innerHTML = '<p class="muted">Enter a price above 0 to see lucky alternatives.</p>'; return; }
        var orig = NL.analyze(String(parseFloat(inp.value)).replace('.', ''));
        out.innerHTML = '<p>Your price <b>' + sym + esc(inp.value) + '</b> scores <b>' + orig.score + '/99</b> (' + orig.grade.en + ').</p><div class="table-wrap"><table><thead><tr><th>Lucky price</th><th>Score</th><th>Change</th><th>Why</th></tr></thead><tbody>' +
          list.map(function (o) { var a = NL.analyze(String(o.price).replace('.', '')); return '<tr><td><b>' + sym + (o.price % 1 ? o.price.toFixed(2) : o.price.toLocaleString()) + '</b></td><td><span class="pill ' + o.grade.cls + '">' + o.score + '</span></td><td>' + (o.delta >= 0 ? '+' : '') + (Math.round(o.delta * 100) / 100).toLocaleString() + '</td><td class="small">' + esc(a.combos.map(function (c) { return c.code + ' ' + c.hanzi; }).join(', ') || a.patterns.map(function (p) { return p.k.split(':')[0]; })[0] || 'Balanced digits') + '</td></tr>'; }).join('') +
          '</tbody></table></div><p class="small muted" style="margin-top:8px">Selling to Chinese customers at scale? <a href="' + ROOT + 'business.html?service=price#audit">Get a full price-list audit →</a></p>';
      }
      inp.addEventListener('input', run); if (cur) cur.addEventListener('change', run); run();
    });
  }

  /* ---------- Zodiac ---------- */
  function initZodiac() {
    $$('[data-zodiac-tool]').forEach(function (box) {
      var inp = $('input[type=date]', box), out = $('.z-out', box);
      function run() {
        if (!inp.value) { out.innerHTML = '<p class="muted">Pick a birth date.</p>'; return; }
        var p = inp.value.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2], 12);
        var z = NL.zodiac(dt), a = z.animal;
        out.innerHTML = '<div class="bignum"><div style="font-size:4rem;line-height:1">' + a.e + '</div><div><div class="han" style="font-size:2rem;color:var(--red)">' + z.elementHan + a.h + '</div><h3 style="margin:0">' + z.element + ' ' + a.en + '</h3><div class="muted small">' + z.yin + ' · lunar year ' + z.year + (z.lunar ? ' · born lunar ' + (z.lunar.leap ? 'leap ' : '') + 'month ' + z.lunar.month + ', day ' + z.lunar.day : '') + '</div></div></div>' +
          '<div class="grid g2" style="margin-top:14px"><div class="card" style="padding:16px"><b>Lucky numbers</b><p class="price" style="font-size:1.8rem;color:var(--jade)">' + a.lucky.join(' · ') + '</p></div><div class="card" style="padding:16px"><b>Numbers to avoid</b><p class="price" style="font-size:1.8rem;color:var(--plum)">' + a.unlucky.join(' · ') + '</p></div></div>' +
          (z.approx ? '<p class="warn small">Your browser lacks the Chinese calendar, so the result is approximate for January/February births.</p>' : '') +
          '<p class="small muted" style="margin-top:10px">Numbers as commonly cited in Chinese astrology. <a href="' + ROOT + 'decoder.html">Check a phone or plate against your sign →</a></p>';
      }
      inp.addEventListener('change', run); run();
    });
    $$('.zgrid[data-zgrid]').forEach(function (grid) {
      var out = $(grid.getAttribute('data-zgrid'));
      var yr = new Date().getFullYear();
      grid.innerHTML = NL.ANIMALS.map(function (a, i) {
        var years = []; for (var y = 1924; y <= yr + 12; y++) if (((y - 4) % 12 + 12) % 12 === i) years.push(y);
        return '<button class="zcell" data-i="' + i + '" data-years="' + years.slice(-8).join(', ') + '"><div class="e">' + a.e + '</div><div class="h">' + a.h + '</div><div class="small">' + a.en + '</div></button>';
      }).join('');
      grid.addEventListener('click', function (e) {
        var b = e.target.closest('.zcell'); if (!b || !out) return;
        $$('.zcell', grid).forEach(function (x) { x.classList.toggle('active', x === b); });
        var a = NL.ANIMALS[+b.getAttribute('data-i')];
        out.innerHTML = '<div class="card"><h3>' + a.e + ' ' + a.en + ' <span class="han" style="color:var(--red)">' + a.h + '</span></h3><p class="small muted">Recent years: ' + b.getAttribute('data-years') + ' (the year starts at Lunar New Year, not 1 January)</p><p>Lucky numbers: <b style="color:var(--jade)">' + a.lucky.join(', ') + '</b> · Avoid: <b style="color:var(--plum)">' + a.unlucky.join(', ') + '</b></p></div>';
      });
    });
    var cy = $('[data-current-year]');
    if (cy) { var z = NL.zodiac(new Date()); cy.innerHTML = z.animal.e + ' ' + z.element + ' ' + z.animal.en + ' <span class="han" style="color:var(--red)">' + z.elementHan + z.animal.h + '</span> (' + z.year + ')'; }
  }

  /* ---------- Lucky date finder ---------- */
  function initDates() {
    $$('[data-date-tool]').forEach(function (box) {
      var f = $('form', box), out = $('.d-out', box), start = $('[name=start]', box);
      var t = new Date(); start.value = t.toISOString().slice(0, 10);
      function run(e) {
        if (e) e.preventDefault();
        var p = start.value.split('-'), s = new Date(+p[0], +p[1] - 1, +p[2], 12);
        var days = +$('[name=range]', box).value, purpose = $('[name=purpose]', box).value;
        var res = NL.findDates(s, days, purpose).slice(0, 12);
        var fmt = new Intl.DateTimeFormat('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        out.innerHTML = '<div class="table-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Lunar</th><th>Score</th><th>Why</th></tr></thead><tbody>' +
          res.map(function (r, i) { var g = NL.grade(r.score); return '<tr><td>' + (i + 1) + '</td><td><b>' + fmt.format(r.date) + '</b></td><td class="small">' + (r.lunar ? (r.lunar.leap ? 'leap ' : '') + 'M' + r.lunar.month + ' D' + r.lunar.day : '–') + '</td><td><span class="pill ' + g.cls + '">' + r.score + ' ' + g.han + '</span></td><td class="small">' + esc(r.why.join(' · ') || 'Balanced') + '</td></tr>'; }).join('') +
          '</tbody></table></div><p class="small muted" style="margin-top:8px">Folk-number screening only. Traditional date selection (择日) also considers your birth chart and the Tong Shu almanac. <a href="' + ROOT + 'business.html?service=date#audit">Ask an expert to confirm your date →</a></p>';
      }
      f.addEventListener('submit', run); $$('select,input', f).forEach(function (el) { el.addEventListener('change', run); }); run();
    });
  }

  /* ---------- Dictionary ---------- */
  function initDict() {
    var box = $('[data-dict]'); if (!box) return;
    var list = $('.dict-list', box), q = $('input[type=search]', box), cat = 'all';
    var entries = DATA.entries.filter(function (e) { return e.cat !== 'digit'; });
    function render() {
      var s = (q.value || '').toLowerCase().trim();
      var r = entries.filter(function (e) {
        return (cat === 'all' || e.cat === cat) && (!s || (e.code + ' ' + e.hanzi + ' ' + e.pinyin + ' ' + e.en).toLowerCase().indexOf(s) >= 0);
      });
      $('.dict-count', box).textContent = r.length + ' entries';
      list.innerHTML = r.map(function (e) {
        var tag = { lucky: 'Lucky', neutral: 'Neutral', caution: 'Caution', rude: 'Rude: don\'t use' }[e.tone];
        return '<a class="card entry" href="' + ROOT + 'n/' + e.code + '.html"><div class="code">' + esc(e.code) + '</div><div class="h">' + esc(e.hanzi) + ' <span class="pill ' + e.tone + '" style="font-family:var(--f-ui)">' + tag + '</span></div><div class="muted small">' + esc(e.pinyin) + '</div><div class="small">' + esc(e.en) + '</div></a>';
      }).join('') || '<p class="muted">No match. Try the <a href="' + ROOT + 'decoder.html?n=' + encodeURIComponent(NL.clean(s)) + '">Number Decoder</a>.</p>';
    }
    q.addEventListener('input', render);
    $$('[data-cat]', box).forEach(function (b) { b.addEventListener('click', function () { cat = b.getAttribute('data-cat'); $$('[data-cat]', box).forEach(function (x) { x.classList.toggle('active', x === b); }); render(); }); });
    var qq = new URLSearchParams(location.search).get('q'); if (qq) q.value = qq;
    render();
  }

  /* ---------- Countdown ---------- */
  function contestEnd() {
    var e = C.CONTEST_END ? new Date(C.CONTEST_END) : null, now = new Date();
    if (!e || isNaN(e) || e < now) e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return e;
  }
  function initCountdown() {
    $$('[data-countdown]').forEach(function (el) {
      var target = el.getAttribute('data-countdown') === 'contest' ? contestEnd() : new Date(el.getAttribute('data-countdown'));
      function tick() {
        var ms = Math.max(0, target - new Date()), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
        el.innerHTML = [[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']].map(function (x) { return '<div><b>' + String(x[0]).padStart(2, '0') + '</b><span>' + x[1] + '</span></div>'; }).join('');
      }
      tick(); setInterval(tick, 1000);
    });
    $$('[data-contest-end]').forEach(function (el) { el.textContent = contestEnd().toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }); });
    $$('[data-contest-month]').forEach(function (el) { el.textContent = contestEnd().toLocaleDateString('en', { month: 'long', year: 'numeric' }); });
  }

  /* ---------- Donations ---------- */
  function initDonate() {
    var box = $('[data-donate]'); if (!box) return;
    var amount = 18, freq = 'once', custom = $('[name=custom]', box);
    $$('.envelope', box).forEach(function (b) {
      b.addEventListener('click', function () { amount = +b.getAttribute('data-amt'); $$('.envelope', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); if (custom) custom.value = ''; upd(); });
    });
    if (custom) custom.addEventListener('input', function () { if (custom.value) { amount = Math.max(1, +custom.value || 0); $$('.envelope', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); } upd(); });
    $$('[data-freq]', box).forEach(function (b) { b.addEventListener('click', function () { freq = b.getAttribute('data-freq'); $$('[data-freq]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); upd(); }); });
    function upd() { var l = $('[data-donate-label]', box); if (l) l.textContent = '$' + amount + (freq === 'monthly' ? ' / month' : ''); }
    upd();
    var pp = $('[data-paypal]', box);
    if (pp) {
      if (!C.PAYPAL_DONATE) pp.hidden = true;
      pp.addEventListener('click', function (e) {
        e.preventDefault();
        var url = 'https://www.paypal.com/donate/?business=' + encodeURIComponent(inbox()) + '&amount=' + amount + '&currency_code=USD&no_recurring=' + (freq === 'monthly' ? '0' : '1') + '&item_name=' + encodeURIComponent('Support 270270.com: ' + ($('[name=purpose_fund]', box) || { value: 'General fund' }).value);
        window.open(url, '_blank', 'noopener');
      });
    }
    [['KOFI_URL', 'kofi'], ['BUYMEACOFFEE_URL', 'bmc'], ['STRIPE_LINK', 'stripe'], ['GITHUB_SPONSORS_URL', 'ghs']].forEach(function (p) {
      var a = $('[data-pay="' + p[1] + '"]', box); if (!a) return;
      if (C[p[0]]) { a.href = C[p[0]]; a.hidden = false; } else a.hidden = true;
    });
    $$('[data-goal]').forEach(function (el) {
      var G = C.GOAL || { target: 888, raised: 0 }, pct = Math.min(100, Math.round((G.raised / G.target) * 100));
      el.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:600;margin-bottom:6px"><span>' + esc(G.label) + '</span><span>$' + G.raised + ' of $' + G.target + '</span></div><div class="progress"><i style="width:' + Math.max(pct, 2) + '%"></i></div><div class="small muted" style="margin-top:6px">' + pct + '% funded · resets monthly</div>';
    });
  }

  /* ---------- Misc ---------- */
  function initMisc() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('.menu a, .drawer a').forEach(function (a) { var h = (a.getAttribute('href') || '').split('/').pop(); if (h === here) a.setAttribute('aria-current', 'page'); });
    $$('[data-fill-number]').forEach(function (el) { var n = store.sget('nl-last'); if (n && !el.value) el.value = n; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    [initTheme, initDrawer, captureUtm, initForms, initSteps, initAds, initCookie, initModal, initYouTube, initDecoders, initNotd, initFortune, initPrice, initZodiac, initDates, initDict, initCountdown, initDonate, initMisc]
      .forEach(function (fn) { try { fn(); } catch (e) { if (window.console) console.warn(fn.name, e); } });
  });
})();
