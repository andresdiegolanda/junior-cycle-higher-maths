from pathlib import Path
import json,re,html
import xml.etree.ElementTree as ET
from urllib.parse import quote
from spoken import spoken
from toolkit_typography import reference_rows, readable_diagram
from diagram_marks import prepare_grid, prepare_marks
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'site'
OUT.mkdir(parents=True,exist_ok=True)
chapters=json.loads((ROOT/'data/chapters.json').read_text(encoding='utf-8'))
visuals={}
for file in sorted((ROOT/'data').glob('visual-cards-*.json')):
    for card in json.loads(file.read_text(encoding='utf-8')):
        key=(card['chapter'],card['index'])
        assert key not in visuals,('Duplicate visual card',key)
        visuals[key]=card
for c in chapters:
    for q in c['challenges']:q['speechResult']=spoken('Final result. '+q['answer']+'. Check it independently. '+q['check'])
    for i,m in enumerate(c['toolkit']['methods']):
        m['ruleRows']=reference_rows(m['rule'])
        if (c['id'],i) in visuals:
            v=visuals[c['id'],i]
            v['formulaRows']=reference_rows(v['formula'],(c['id'],i+1))
            v['svg']=prepare_marks(readable_diagram(v['svg'],(c['id'],i+1)))
            v['conditionLabel']='Watch for' if v['condition'].strip()==m['trap'].strip() else 'Remember'
            cue='Watch for this mistake' if v['conditionLabel']=='Watch for' else 'Remember'
            v['speech']=spoken(v['task']+'. '+v['narration']+' Formula or method. '+v['formula']+'. '+cue+'. '+v['condition'])
            m['visual']=v
    for l in c['lessons']:
        l['boxSpeech']={key:spoken(label+'. '+l[field]) for key,field,label in [('goal','goal','Your goal'),('takeaway','takeaway','Keep this idea'),('mistake','mistake','Watch out for')]}
        for s in l['steps']:
            s['svg']=prepare_marks(prepare_grid(s['svg']))
            root=ET.fromstring(s['svg']);title=root.find('{http://www.w3.org/2000/svg}title')
            desc=root.attrib.get('aria-label') or (''.join(title.itertext()) if title is not None else s['title'])
            s['boxSpeech']={'explanation':spoken(s['title']+'. '+s['text']),'diagram':spoken('Read the diagram. '+desc+'. '+s['math']),'why':spoken('Why it works. '+s['why'])}
pdf_report=ROOT/'toolkit-pdf-report.json'
if pdf_report.exists():
    for row in json.loads(pdf_report.read_text(encoding='utf-8')):
        if 'firstPage' in row:
            c=next(c for c in chapters if c['id']==row['chapter'])
            c['toolkit']['pdfFirst']=row['firstPage'];c['toolkit']['pdfLast']=row['lastPage']
glossary=json.loads((ROOT/'data/glossary.json').read_text(encoding='utf-8')) if (ROOT/'data/glossary.json').exists() else []
for g in glossary:g['speech']=spoken(g['term']+'. '+g['definition']+' Example. '+g['example']+' Watch for. '+g['watch'])
labs=json.loads((ROOT/'data/lab-narration.json').read_text(encoding='utf-8'))
def strings(v):
    if isinstance(v,str):return re.sub('<[^>]+>',' ',v)
    if isinstance(v,list):return ' '.join(strings(x) for x in v)
    if isinstance(v,dict):return ' '.join(strings(x) for k,x in v.items() if k not in ['svg','diagram','boxSpeech','narration'] and not k.startswith('speech'))
    return ''
search=[]
for c in chapters:
    items=[]
    for l in c['lessons']:items.append({'title':l['title'],'lesson':l['id'],'mode':'learn','text':strings(l)})
    for m in c['toolkit']['methods']:items.append({'title':m['title'],'lesson':m['lessonId'],'mode':'reference','text':strings(m)})
    for q in c['challenges']:items.append({'title':q['title'],'mode':'challenge','problem':q['id'],'text':strings(q)})
    search.append({'id':c['id'],'title':c['title'],'items':items})
stats={'chapters':len(chapters),'lessons':sum(len(c['lessons']) for c in chapters),'steps':sum(len(l['steps']) for c in chapters for l in c['lessons']),'skillChecks':sum(len(l['quiz']) for c in chapters for l in c['lessons']),'toolkitMethods':sum(len(c['toolkit']['methods']) for c in chapters),'writtenChallenges':sum(len(c['challenges']) for c in chapters),'glossaryTerms':len(glossary),'glossaryDiagrams':sum(bool(g['svg']) for g in glossary),'narration':'Browser speech'}
stats['visualCards']=len(visuals)
css='\n'.join((ROOT/f).read_text(encoding='utf-8') for f in ['guide.css','enhancements.css','display.css','visual-learning.css'])
js='\n'.join((ROOT/f).read_text(encoding='utf-8') for f in ['speech.js','guide.js','reading.js','lesson-view.js','enhancements.js','toolkit-view.js','discovery.js','diagram-marks.js'])
favicon='data:image/svg+xml,'+quote('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173349"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#6bb5ab" stroke-width="2"/><text x="32" y="45" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#85dfcc">x</text></svg>',safe='')
def page(items,initial=0,standalone=False):
    data={'chapters':items,'initialChapter':initial,'standalone':standalone,'stats':stats,'glossary':glossary,'searchIndex':search,'labNarration':labs}
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/')
    home='index.html#home' if standalone else '#home'
    return f'''<!doctype html><html lang="en-IE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Junior Cycle Higher Level Mathematics preparation: visual lessons, browser narration, written practice, a visual glossary and chapter toolkits."><meta name="color-scheme" content="light dark"><title>Junior Cycle Higher Maths — Preparation Guide</title><link rel="icon" type="image/svg+xml" sizes="any" href="{favicon}"><style>{css}</style></head><body><a class="skip" href="#app">Skip to the guide</a><header class="topbar"><a class="brand" href="{home}"><span class="brand-mark" aria-hidden="true">x</span><span><strong>Junior Cycle Higher Maths</strong><small>PREPARATION GUIDE · SEE · UNDERSTAND · PRACTISE</small></span></a><nav class="toplinks" aria-label="Guide tools"><button id="glossary-button">Glossary</button><button id="term-search-button">Search by term</button><button id="display-button">Display</button><button data-voice-settings>Voice</button><button id="about-button">How to use</button></nav></header><div class="container" id="app" tabindex="-1"></div><div class="print-sheet" id="print-sheet"></div><div class="screen-reader" id="status-live" aria-live="polite" aria-atomic="true"></div><script>const DATA={payload};</script><script>{js}</script></body></html>'''
(OUT/'index.html').write_text(page(chapters),encoding='utf-8')
for c in chapters:
    slug=re.sub('[^a-z0-9]+','-',c['title'].lower()).strip('-')
    (OUT/f'{c["id"]:02}-{slug}.html').write_text(page([c],c['id'],True),encoding='utf-8')
(ROOT/'compiled-data.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'build-report.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
(OUT/'START-HERE.txt').write_text('''JUNIOR CYCLE HIGHER MATHS — PREPARATION GUIDE

Open index.html for all 24 chapters, or open an individual chapter page.
Each HTML page contains its own styles, diagrams, scripts and glossary.
Keep the toolkits folder beside the HTML pages for the A3 printable cards.

Use Next step to reveal a method. Each teaching box has its own Listen button.
Play whole lesson reads the boxes in order and advances the diagrams when each
part ends. The current box has a reading marker. Pause keeps your place;
Continue repeats the current short part. Turn off Follow narration to prevent
automatic scrolling. Choosing a different step or lesson stops the narration.
Choose an available English voice and speaking speed with Voice.
Local voices can work offline; online voices need an internet connection and may
send the narration text to the voice provider. No microphone or account is needed.
If speech is unavailable, use the written explanations and transcripts.

Glossary: searchable definitions, examples and diagrams.
Search by term: matching chapters with direct lesson and toolkit links.
Display: Classic, Warm paper, High contrast or Projector.
Chapter Toolkit: 222 visual cards with diagrams, formulas and short conditions.
Open a card's working for the full method and example. Enlarge any card's diagram
to inspect its labels. The A3 PDF covers all 24 chapters; each chapter links to
its own page range. Equations and instructions appear on separate readable lines.
Exam practice: original written problems with hints and staged worked solutions.

Progress, working notes and preferences stay in this browser where storage is
available. They do not sync between devices or different site addresses.
Use the main index to keep one progress record across all chapters.

This is an independent study resource. Check each formula's conditions, show your
reasoning, keep units consistent and use other practice materials as needed.
''',encoding='utf-8')
print(json.dumps(stats,indent=2))
