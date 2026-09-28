"""Generate Jekyll stub pages (root pages, guide pages, n/ number pages) from tools/pages + _data/numbers.json."""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools' / 'pages'
DATA = json.loads((ROOT / '_data' / 'numbers.json').read_text(encoding='utf-8'))
q = lambda s: json.dumps(s, ensure_ascii=False)
out = []
for f in sorted(SRC.rglob('*.html')):
    rel = f.relative_to(SRC).as_posix()
    m = re.match(r'\s*<!--META\s*(\{.*?\})\s*-->', f.read_text(encoding='utf-8'), re.S)
    meta = json.loads(m.group(1))
    fm = ['---', f'title: {q(meta["title"])}', f'desc: {q(meta["desc"])}']
    if meta.get('exit'): fm.append('exit: true')
    if meta.get('robots'): fm.append(f'robots: {q(meta["robots"])}')
    if meta.get('ogtype'): fm.append(f'ogtype: {q(meta["ogtype"])}')
    if meta.get('ld'): fm.append(f"ld_json: {q(json.dumps(meta['ld'][0], ensure_ascii=False, separators=(',', ':')))}")
    if meta.get('noindex'): fm.append('sitemap: false')
    if '/' in rel:
        slug = rel.split('/')[-1]
        dest = 'guide-' + slug
        fm += [f'permalink: /{rel}', 'r: "../"']
    else:
        dest = rel
        if rel == '404.html': fm.append('permalink: /404.html')
    fm.append('---')
    body = '{% capture raw %}{% include_relative tools/pages/' + rel + ' %}{% endcapture %}{% include frag.html src=raw %}\n'
    (ROOT / dest).write_text('\n'.join(fm) + '\n' + body, encoding='utf-8')
    out.append(dest)
(ROOT / 'n').mkdir(exist_ok=True)
for ent in DATA['entries']:
    (ROOT / 'n' / f'{ent["code"]}.html').write_text(f'---\ncode: {q(ent["code"])}\n---\n', encoding='utf-8')
print(len(out), 'page stubs,', len(DATA['entries']), 'number stubs')
