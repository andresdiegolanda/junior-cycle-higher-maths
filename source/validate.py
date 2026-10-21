from pathlib import Path
import json,re,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent;OUT=ROOT.parent/'site'
cs=json.loads((ROOT/'compiled-data.json').read_text(encoding='utf-8'));gs=json.loads((ROOT/'data/glossary.json').read_text(encoding='utf-8'))
pdf_report=json.loads((ROOT/'toolkit-pdf-report.json').read_text(encoding='utf-8'));pdf_pages=pdf_report[-1]['lastPage']
assert len(cs)==24 and len(gs)>=100
spoken=0;svgs=0
def check(v):
    global spoken,svgs
    if isinstance(v,dict):
        for k,x in v.items():
            if k.startswith('speech'):
                vals=x if isinstance(x,list) else [x]
                assert all(isinstance(t,str) and len(t)>3 and '.mp3' not in t for t in vals);spoken+=len(vals)
            if k in ['svg','diagram'] and x and str(x).lstrip().startswith('<'):
                el=ET.fromstring(x);assert el.tag.endswith('svg');assert not re.search(r'<script|\son\w+=|javascript:',x,re.I);svgs+=1
            check(x)
    elif isinstance(v,list):
        for x in v:check(x)
check(cs);check(gs)
assert len({g['id'] for g in gs})==len(gs)
for c in cs:
    ids={l['id'] for l in c['lessons']}
    assert all(m['lessonId'] in ids for m in c['toolkit']['methods'])
    assert len(c['challenges'])==4
    assert sum(c['id'] in g['chapters'] for g in gs)>=2
    for i,m in enumerate(c['toolkit']['methods']):
        v=m['visual'];assert v['chapter']==c['id'] and v['index']==i
        assert all(v[k] for k in ['task','formula','condition','svg','narration','speech'])
        svg=ET.fromstring(v['svg']);assert svg.attrib['viewBox']=='0 0 480 180'
        assert all(float(t.attrib.get('font-size',20))>=20 for t in svg.iter() if t.tag.endswith('text'))
    for l in c['lessons']:
        assert all(l['boxSpeech'].get(k) for k in ['goal','takeaway','mistake'])
        assert all(all(s['boxSpeech'].get(k) for k in ['diagram','explanation','why']) for s in l['steps'])
assert sum(len(c['toolkit']['methods']) for c in cs)==222
for g in gs:
    assert all(1<=i<=24 for i in g['chapters'])
    assert all(g[k] for k in ['term','definition','example','watch'])
for p in OUT.rglob('*'):
    if not p.is_file() or p.name.startswith('_'):continue
    assert p.suffix.lower() not in ['.mp3','.wav']
    if p.suffix=='.pdf':
        r=PdfReader(p);text='\n'.join(x.extract_text() for x in r.pages)+str(r.metadata);assert len(r.pages)==pdf_pages
        flat=re.sub(r'\s+','',text)
        for c in cs:
            for m in c['toolkit']['methods']:
                title=m['visual']['task'].replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')
                assert re.sub(r'\s+','',title) in flat,('Missing printed card',c['id'],title)
    else:text=p.read_text(encoding='utf-8')
    assert not re.search(r'Luca|Text\s*(?:&|&amp;)\s*Tests|CJ\s*Fallon|cjfallon|ereader|textbook|book[- ]level|Book pp\.|\.mp3|\.wav',text,re.I),p
    if p.suffix=='.html':
        assert '<script src=' not in text and 'new Audio(' not in text
        assert all(i in text for i in ['glossary-button','term-search-button','display-button','BrowserNarrator','follow-narration','data-read-box','visual-method-grid'])
        class Links(HTMLParser):
            def handle_starttag(self,tag,attrs):
                for key,val in attrs:
                    if key in ['href','src'] and val and not val.startswith(('#','http','data:')):
                        dest=val.split('#')[0].split('?')[0]
                        if dest:assert (p.parent/dest).is_file(),(p,dest)
        Links().feed(text)
assert len([p for p in OUT.glob('*.html') if not p.name.startswith('_')])==25
report={'chapters':len(cs),'visualReferenceCards':222,'glossaryTerms':len(gs),'glossaryDiagrams':sum(bool(g['svg']) for g in gs),'narratedItems':spoken,'validatedSVGs':svgs,'htmlFiles':25,'pdfPages':pdf_pages,'recordedAudioFiles':0,'forbiddenReferences':0}
(ROOT/'validation-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
