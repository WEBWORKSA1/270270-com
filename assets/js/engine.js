/* 270270 Number Lab: analysis engine (pure functions, no DOM).
   All scores are cultural entertainment, based on common folk homophones. */
(function (g) {
  'use strict';
  var D = g.NL_DATA || { digits: {}, entries: [] };
  var COMBOS = D.entries.filter(function (e) { return e.code.length >= 2 && e.w !== 0; })
    .sort(function (a, b) { return b.code.length - a.code.length; });

  function clean(s) { return String(s == null ? '' : s).replace(/\D+/g, '').slice(0, 24); }

  function patterns(n, safe) {
    var out = [], L = n.length;
    if (L < 2) return out;
    if (/^(\d)\1+$/.test(n) && L >= 3) {
      out.push(n[0] === '4' ? { k: 'All the same digit, but it is 4 (死): heavily avoided', w: -12 }
        : { k: 'All the same digit (' + n[0] + ' × ' + L + '): collectors pay a premium for solid numbers', w: 10 });
    } else if (L % 2 === 0 && n.slice(0, L / 2) === n.slice(L / 2) && L >= 4) {
      out.push({ k: 'Mirror pattern (' + n.slice(0, L / 2) + ' · ' + n.slice(0, L / 2) + '). 好事成双: good things come in pairs', w: 8 });
    } else if (/^(\d)\1(\d)\2$/.test(n.slice(-4)) && L >= 4) {
      out.push({ k: 'AABB ending: rhythmic and memorable, valued in phone numbers', w: 4 });
    }
    var up = 1, down = 1, bestUp = 1, bestDown = 1;
    for (var i = 1; i < L; i++) {
      up = (+n[i] === +n[i - 1] + 1) ? up + 1 : 1; bestUp = Math.max(bestUp, up);
      down = (+n[i] === +n[i - 1] - 1) ? down + 1 : 1; bestDown = Math.max(bestDown, down);
    }
    if (bestUp >= 4) out.push({ k: 'Rising sequence. 步步高升: "rising step by step"', w: 6 });
    if (bestDown >= 4) out.push({ k: 'Descending sequence: some read it as "going downhill"', w: -3 });
    if (L >= 4 && n === n.split('').reverse().join('') && !/^(\d)\1+$/.test(n)) out.push({ k: 'Palindrome: balanced and easy to remember', w: 3 });
    var last = n[L - 1];
    if (last === '8') out.push({ k: 'Ends in 8: finishes on prosperity (发)', w: 5 });
    else if (last === '9' || last === '6') out.push({ k: 'Ends in ' + last + ': a strong finish (' + (last === '9' ? '久 lasting' : '顺 smooth') + ')', w: 3 });
    else if (last === '4' && !(safe && safe(L - 1))) out.push({ k: 'Ends in 4: the ending carries the most weight, and 4 sounds like 死', w: -6 });
    return out;
  }

  function grade(score) {
    if (score >= 85) return { han: '大吉', en: 'Great Fortune', cls: 'lucky', color: 'var(--jade)' };
    if (score >= 70) return { han: '吉', en: 'Lucky', cls: 'lucky', color: 'var(--jade)' };
    if (score >= 50) return { han: '平', en: 'Balanced', cls: 'neutral', color: 'var(--gold)' };
    if (score >= 35) return { han: '慎', en: 'Use with Care', cls: 'caution', color: 'var(--plum)' };
    return { han: '凶', en: 'Best Avoided', cls: 'caution', color: 'var(--plum)' };
  }

  function analyze(input, opts) {
    opts = opts || {};
    var cant = opts.dialect === 'c';
    var n = clean(input);
    var res = { n: n, digits: [], combos: [], patterns: [], warnings: [], raw: 0, score: 0 };
    if (!n) return res;
    var covered = new Array(n.length).fill(false), raw = 0;
    // Greedy longest-match combos, scanning left to right
    var i = 0;
    while (i < n.length) {
      var hit = null;
      for (var c = 0; c < COMBOS.length; c++) {
        var e = COMBOS[c];
        if (n.substr(i, e.code.length) === e.code) { hit = e; break; }
      }
      if (hit) {
        var w = (cant && hit.cw != null) ? hit.cw : hit.w;
        res.combos.push({ code: hit.code, hanzi: hit.hanzi, pinyin: hit.pinyin, en: hit.en, tone: hit.tone, cat: hit.cat, w: w, at: i });
        for (var k = i; k < i + hit.code.length; k++) covered[k] = true;
        raw += w; i += hit.code.length;
      } else i++;
    }
    for (var j = 0; j < n.length; j++) {
      var d = D.digits[n[j]] || {};
      var dw = cant ? (d.cw != null ? d.cw : d.w) : d.w;
      res.digits.push({ d: n[j], hanzi: d.hanzi, pinyin: cant ? d.cant : d.pinyin, sounds: d.sounds, mean: cant ? d.cmean : d.mean, w: dw, covered: covered[j] });
      if (!covered[j]) raw += dw || 0;
    }
    res.patterns = patterns(n, function (pos) { return res.combos.some(function (c) { return c.w > 0 && pos >= c.at && pos < c.at + c.code.length; }); });
    res.patterns.forEach(function (p) { raw += p.w; });
    var fours = (n.match(/4/g) || []).length;
    var safe4 = res.combos.some(function (c) { return /4/.test(c.code) && c.w > 0; });
    if (fours >= 2 && !safe4) res.warnings.push('Contains ' + fours + ' fours (四 ≈ 死 "death"). Many Chinese buyers would avoid this for a phone, plate, floor or price.');
    else if (fours === 1 && !safe4) res.warnings.push('Contains a 4. Its impact is softened in the middle of a long number but strongest at the end.');
    if (cant && /7/.test(n)) res.warnings.push('Cantonese note: 7 (cat1) has a vulgar slang homophone in Hong Kong / Guangdong. Fine in most numbers, but avoid it as a stand-alone brand number.');
    res.combos.forEach(function (c) { if (c.tone === 'rude') res.warnings.push('"' + c.code + '" reads as ' + c.hanzi + ' (' + c.en.split('.')[0] + '). Avoid this for gifts, prices and plates.'); });
    res.raw = raw;
    var s = Math.round(50 + 46 * Math.tanh(raw / 30));
    res.score = Math.max(1, Math.min(99, s));
    res.grade = grade(res.score);
    res.reading = reading(res);
    return res;
  }

  function reading(r) {
    var parts = [];
    if (r.combos.length) {
      parts.push('Hidden phrases: ' + r.combos.map(function (c) { return c.code + ' → ' + c.hanzi + ' (' + c.en.split(/[.:;]/)[0].trim() + ')'; }).join('; ') + '.');
    }
    var free = r.digits.filter(function (d) { return !d.covered; });
    var good = free.filter(function (d) { return d.w >= 5; }).map(function (d) { return d.d; });
    var bad = free.filter(function (d) { return d.w <= -4; }).map(function (d) { return d.d; });
    if (good.length) parts.push('Boosted by ' + uniq(good).join(', ') + ' (' + uniq(good).map(function (d) { return D.digits[d].sounds[0].split(' (')[0]; }).join(', ') + ').');
    if (bad.length) parts.push('Weighed down by ' + uniq(bad).join(', ') + '.');
    if (!parts.length) parts.push('A calm, neutral number with no strong homophones either way. That makes it a clean slate.');
    return parts.join(' ');
  }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }

  /* Lucky price finder */
  function luckyPrices(price) {
    var p = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (!isFinite(p) || p <= 0) return [];
    var ends = ['8', '88', '68', '98', '168', '888', '18', '28', '58', '66', '99', '9', '6', '188', '288', '388', '588', '688', '988', '1688', '8888'];
    var seen = {}, out = [];
    ends.forEach(function (e) {
      var L = e.length, base = Math.pow(10, L);
      [-1, 0, 1].forEach(function (off) {
        var c = (Math.floor(p / base) + off) * base + (+e);
        if (c <= 0 || seen[c] || /4/.test(String(c))) return;
        if (c < p * 0.75 || c > p * 1.3) return;
        seen[c] = 1;
        var a = analyze(String(c));
        out.push({ price: c, score: a.score, delta: c - p, grade: a.grade });
      });
    });
    if (p < 100) {
      var cents = ['.88', '.98', '.68', '.80', '.18', '.28', '.58', '.66', '.99'];
      [Math.floor(p), Math.floor(p) - 1, Math.floor(p) + 1].forEach(function (b) {
        if (b < 0) return;
        cents.forEach(function (ct) {
          var c = +(b + ct); if (seen[c] || /4/.test(String(c)) || c < p * 0.8 || c > p * 1.2) return; seen[c] = 1;
          var a = analyze(String(c).replace('.', ''));
          out.push({ price: c, score: a.score, delta: +(c - p).toFixed(2), grade: a.grade });
        });
      });
    }
    // rank = score minus a distance penalty
    out = out.filter(function (o) { return Math.abs(o.price - p) > 0.001; });
    out.forEach(function (o) { o.rank = o.score - Math.abs(o.delta / p) * 60; });
    out.sort(function (a, b) { return b.rank - a.rank; });
    return out.slice(0, 8);
  }

  /* Lunar calendar via the browser's built-in Chinese calendar */
  var LF = null;
  try { LF = new Intl.DateTimeFormat('en-u-ca-chinese', { year: 'numeric', month: 'numeric', day: 'numeric' }); } catch (e) { LF = null; }
  function lunar(date) {
    if (!LF) return null;
    var parts = LF.formatToParts(date), o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var m = String(o.month || ''), y = +(o.relatedYear || o.year);
    return { year: y, month: parseInt(m, 10), leap: /bis/.test(m), day: parseInt(o.day, 10) };
  }
  var ANIMALS = [
    { en: 'Rat', h: '鼠', e: '🐀', lucky: [2, 3], unlucky: [5, 9] },
    { en: 'Ox', h: '牛', e: '🐂', lucky: [1, 4], unlucky: [5, 6] },
    { en: 'Tiger', h: '虎', e: '🐅', lucky: [1, 3, 4], unlucky: [6, 7, 8] },
    { en: 'Rabbit', h: '兔', e: '🐇', lucky: [3, 4, 6], unlucky: [1, 7, 8] },
    { en: 'Dragon', h: '龙', e: '🐉', lucky: [1, 6, 7], unlucky: [3, 8] },
    { en: 'Snake', h: '蛇', e: '🐍', lucky: [2, 8, 9], unlucky: [1, 6, 7] },
    { en: 'Horse', h: '马', e: '🐎', lucky: [2, 3, 7], unlucky: [1, 5, 6] },
    { en: 'Goat', h: '羊', e: '🐐', lucky: [3, 4, 9], unlucky: [6, 7, 8] },
    { en: 'Monkey', h: '猴', e: '🐒', lucky: [4, 9], unlucky: [2, 7] },
    { en: 'Rooster', h: '鸡', e: '🐓', lucky: [5, 7, 8], unlucky: [1, 3, 9] },
    { en: 'Dog', h: '狗', e: '🐕', lucky: [3, 4, 9], unlucky: [1, 6, 7] },
    { en: 'Pig', h: '猪', e: '🐖', lucky: [2, 5, 8], unlucky: [1, 3, 9] }
  ];
  var ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
  var ELH = { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' };
  function zodiacYear(y) {
    var a = ANIMALS[((y - 4) % 12 + 12) % 12], el = ELEMENTS[((y - 4) % 10 + 10) % 10];
    return { year: y, animal: a, element: el, elementHan: ELH[el], yin: ((y - 4) % 2) ? 'Yin' : 'Yang' };
  }
  function zodiac(date) {
    var l = lunar(date);
    var y = l ? l.year : (date.getMonth() < 1 || (date.getMonth() === 1 && date.getDate() < 5) ? date.getFullYear() - 1 : date.getFullYear());
    var z = zodiacYear(y); z.lunar = l; z.approx = !l; return z;
  }

  /* Auspicious date finder */
  var PURPOSES = {
    wedding: { label: 'Wedding / marriage registration', ghost: -18, weekend: 5 },
    opening: { label: 'Business opening / launch', ghost: -8, weekend: 0 },
    moving: { label: 'Moving house', ghost: -15, weekend: 3 },
    signing: { label: 'Signing a contract / deal', ghost: -6, weekend: 0 },
    travel: { label: 'Starting a journey', ghost: -6, weekend: 2 }
  };
  function scoreDate(dt, purpose) {
    var P = PURPOSES[purpose] || PURPOSES.wedding, why = [], s;
    var m = dt.getMonth() + 1, d = dt.getDate();
    var md = String(m) + String(d).padStart(2, '0');
    var a = analyze(md); s = a.score;
    if (a.combos.length) why.push(md + ' contains ' + a.combos.map(function (c) { return c.code + ' ' + c.hanzi; }).join(', '));
    if (/4/.test(String(d))) { s -= 6; why.push('Day number contains 4'); }
    if (/8/.test(String(d))) why.push('Day number contains 8 (发)');
    var l = lunar(dt);
    if (l) {
      if (l.month === 7 && !l.leap) {
        if (l.day === 7 && purpose === 'wedding') { s += 10; why.push('Qixi, Chinese Valentine\'s Day (lunar 7/7)'); }
        else { s += P.ghost; why.push('Lunar 7th month (Ghost Month), traditionally avoided'); }
      }
      if ([8, 18, 28].indexOf(l.day) >= 0) { s += 5; why.push('Lunar day ' + l.day + ' contains 8'); }
      if ([6, 16, 26, 9, 19, 29].indexOf(l.day) >= 0) { s += 2; why.push('Lunar day ' + l.day + ' (smooth / lasting)'); }
      if ([4, 14, 24].indexOf(l.day) >= 0) { s -= 4; why.push('Lunar day ' + l.day + ' contains 4'); }
      if (l.month === 1 && l.day <= 15 && purpose === 'opening') { s += 6; why.push('Lunar New Year period: a classic time to open for business'); }
    }
    if ((dt.getDay() === 6 || dt.getDay() === 0) && P.weekend) { s += P.weekend; why.push('Weekend: easier for guests'); }
    if (m === 5 && (d === 20 || d === 21) && purpose === 'wedding') { s += 10; why.push('5.20 / 5.21: 我爱你 / 我愿意'); }
    if (m === 8 && d === 8) { s += 8; why.push('8/8: double prosperity'); }
    return { date: dt, score: Math.max(1, Math.min(99, Math.round(s))), why: why, lunar: l };
  }
  function findDates(start, days, purpose) {
    var out = [], t = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 12);
    for (var i = 0; i < Math.min(days, 400); i++) {
      out.push(scoreDate(new Date(t), purpose)); t.setDate(t.getDate() + 1);
    }
    return out.sort(function (a, b) { return b.score - a.score || a.date - b.date; });
  }

  /* Seeded helpers (number of the day) */
  function seedFrom(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function numberOfDay(date) {
    var key = date.toISOString().slice(0, 10), h = seedFrom(key);
    var pool = D.entries.filter(function (e) { return e.w > 0 && e.code.length >= 2; });
    return pool[h % pool.length];
  }

  g.NL = { analyze: analyze, clean: clean, luckyPrices: luckyPrices, lunar: lunar, zodiac: zodiac, zodiacYear: zodiacYear, ANIMALS: ANIMALS, PURPOSES: PURPOSES, findDates: findDates, scoreDate: scoreDate, numberOfDay: numberOfDay, grade: grade, seed: seedFrom };
})(typeof window !== 'undefined' ? window : globalThis);
