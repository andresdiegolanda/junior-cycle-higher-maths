from pathlib import Path
from functools import partial
import json,re,html,hashlib,os,subprocess,datetime
import xml.etree.ElementTree as ET
from urllib.parse import quote
from spoken import spoken
from toolkit_typography import reference_rows, readable_diagram
from diagram_marks import prepare_grid, prepare_marks
from practice_bank import load_practice
from rule_help import attach_rule_help
from formula_catalog import load_formula_library
from learning_design import add_learning_design
ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent/'site'
OUT.mkdir(parents=True,exist_ok=True)
chapters=json.loads((ROOT/'data/chapters.json').read_text(encoding='utf-8'))
practice=load_practice()
practice_order=json.loads((ROOT/'data/practice-order.json').read_text(encoding='utf-8'))
narration_context=json.loads((ROOT/'data/narration-context.json').read_text(encoding='utf-8'))
assert set(practice)=={l['id'] for c in chapters for l in c['lessons']}, 'Practice must cover every lesson exactly'
assert set(practice_order)<=set(practice), 'Unknown practice ordering key'
context_ids=set(practice)|{q['id'] for rows in practice.values() for q in rows}|{q['id'] for c in chapters for q in c['challenges']}
assert set(narration_context)<=context_ids, 'Unknown narration context ID'
assert all(set(v)=={'clock_times'} and isinstance(v['clock_times'],bool) for v in narration_context.values()), 'Invalid narration context'

def narrator(*ids):
    options={}
    for key in ids:options.update(narration_context.get(key,{}))
    return partial(spoken,**options)

# Every narration is derived here from the written content, so editing a
# question, step or method in the data files never leaves stale speech behind.
for c in chapters:
    for l in c['lessons']:
        say=narrator(l['id'])
        for q in l['quiz']:
            q['speechQuestion']=say(q['question']+' '+' '.join(f'Option {"ABCD"[i]}. {o}.' for i,o in enumerate(q['options'])))
            q['speechHint']=say(q['hint']);q['speechExplanation']=say(q['explanation'])
        for s in l['steps']:
            s['say']=s['speech']=say(s['title']+'. '+s['text']+' '+s['math']+'. '+s['why'])
    for q in c['challenges']:
        say=narrator(q['id'])
        q['speechQuestion']=say(q['question']);q['speechHints']=[say(h) for h in q['hints']]
        for st in q['solution']:st['speech']=say(st['title']+'. '+st['math']+'. '+st['reason'])
    for m in c['toolkit']['methods']:
        m['speech']=narrator(m['lessonId'])(m['title']+'. '+m['when']+' '+m['rule']+' '+' '.join(m['steps'])+' Example. '+m['example']+' Check. '+m['check']+' Watch out. '+m['trap'])
for c in chapters:
    for l in c['lessons']:
        checks=[dict(q,id=f'{l["id"]}-q{i}',type='choice',difficulty=i+1,
                     hints=[q['hint']],speechHints=[q['speechHint']]) for i,q in enumerate(l['quiz'])]
        written=[]
        for q in practice[l['id']]:
            say=narrator(l['id'],q['id'])
            written.append(dict(q,type='written',speechQuestion=say(q['question']),
                speechHints=[say(h) for h in q['hints']],
                speechSolution=[say(s) for s in q['solution']],
                speechResult=say('Answer. '+q['answer']+'. Check it. '+q['check'])))
        candidates=dict(zip('abcdef',checks+written))
        order=practice_order.get(l['id'],'abcdef').replace(' ','')
        assert sorted(order)==list('abcdef'), (l['id'],order)
        l['exercises']=[dict(candidates[key],difficulty=i+1) for i,key in enumerate(order)]
        assert len(l['exercises'])==6, l['id']
visuals={}
for file in sorted((ROOT/'data').glob('visual-cards-*.json')):
    for card in json.loads(file.read_text(encoding='utf-8')):
        key=(card['chapter'],card['index'])
        assert key not in visuals,('Duplicate visual card',key)
        visuals[key]=card
for c in chapters:
    for q in c['challenges']:q['speechResult']=narrator(q['id'])('Final result. '+q['answer']+'. Check it independently. '+q['check'])
    for i,m in enumerate(c['toolkit']['methods']):
        m['ruleRows']=reference_rows(m['rule'])
        if (c['id'],i) in visuals:
            v=visuals[c['id'],i]
            v['formulaRows']=reference_rows(v['formula'],(c['id'],i+1))
            v['svg']=prepare_marks(readable_diagram(v['svg'],(c['id'],i+1)))
            v['conditionLabel']='Watch for' if v['condition'].strip()==m['trap'].strip() else 'Remember'
            cue='Watch for this mistake' if v['conditionLabel']=='Watch for' else 'Remember'
            v['speech']=narrator(m['lessonId'])(v['task']+'. '+v['narration']+' Formula or method. '+v['formula']+'. '+cue+'. '+v['condition'])
            m['visual']=v
    for l in c['lessons']:
        say=narrator(l['id'])
        l['boxSpeech']={key:say(label+'. '+l[field]) for key,field,label in [('goal','goal','Your goal'),('takeaway','takeaway','Keep this idea'),('mistake','mistake','Watch out for')]}
        for s in l['steps']:
            s['svg']=prepare_marks(prepare_grid(s['svg']))
            root=ET.fromstring(s['svg']);title=root.find('{http://www.w3.org/2000/svg}title')
            desc=root.attrib.get('aria-label') or (''.join(title.itertext()) if title is not None else s['title'])
            s['boxSpeech']={'explanation':say(s['title']+'. '+s['text']),'diagram':say('Read the diagram. '+desc+'. '+s['math']),'why':say('Why it works. '+s['why'])}
pdf_report=ROOT/'toolkit-pdf-report.json'
if pdf_report.exists():
    for row in json.loads(pdf_report.read_text(encoding='utf-8')):
        if 'firstPage' in row:
            c=next(c for c in chapters if c['id']==row['chapter'])
            c['toolkit']['pdfFirst']=row['firstPage'];c['toolkit']['pdfLast']=row['lastPage']
glossary=json.loads((ROOT/'data/glossary.json').read_text(encoding='utf-8')) if (ROOT/'data/glossary.json').exists() else []
for g in glossary:g['speech']=spoken(g['term']+'. '+g['definition']+' Example. '+g['example']+' Watch for. '+g['watch'])
labs=json.loads((ROOT/'data/lab-narration.json').read_text(encoding='utf-8'))
rule_library,rule_help_count=attach_rule_help(chapters)
add_learning_design(chapters,narrator,rule_library)
formulas=load_formula_library(chapters)
# Skill drills are defined in JavaScript. The account service only needs each
# skill's id and lesson, so they are read from the source without running it.
skill_files=sorted(f.name for f in ROOT.glob('skills-*.js') if f.name!='skills-core.js')
skills={}
for name in skill_files:
    for block in re.split(r'\bK\.define\(\{',(ROOT/name).read_text(encoding='utf-8'))[1:]:
        found=re.search(r"\bid:'([a-z0-9-]+)'",block),re.search(r"\blesson:'(\d\d-\d\d)'",block)
        assert all(found),('Skill needs a literal id and lesson',name)
        assert found[0][1] not in skills,('Duplicate skill',found[0][1])
        skills[found[0][1]]={'lesson':found[1][1]}
lesson_ids={l['id'] for c in chapters for l in c['lessons']}
assert all(s['lesson'] in lesson_ids for s in skills.values()),'A skill points to an unknown lesson'
catalog={'lessons':{},'exercises':{},'skills':skills}
for c in chapters:
    for l in c['lessons']:
        catalog['lessons'][l['id']]={'chapter':c['id'],'title':l['title'],'steps':len(l['steps'])}
        for q in l['exercises']:
            catalog['exercises'][q['id']]={'chapter':c['id'],'lessonId':l['id'],'title':q['question'],'type':q['type'],'hints':len(q['hints']),'steps':len(q.get('solution',[])),'options':len(q.get('options',[])),'answer':q.get('answer') if q['type']=='choice' else None}
    for q in c['challenges']:
        catalog['exercises'][q['id']]={'chapter':c['id'],'lessonId':None,'title':q['title'],'type':'challenge','hints':len(q['hints']),'steps':len(q['solution'])}
content_version=hashlib.sha256(json.dumps(catalog,sort_keys=True,ensure_ascii=False).encode()).hexdigest()[:16]
catalog['version']=content_version
(ROOT.parent/'worker').mkdir(exist_ok=True)
(ROOT.parent/'worker/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
def strings(v):
    if isinstance(v,str):return re.sub('<[^>]+>',' ',v)
    if isinstance(v,list):return ' '.join(strings(x) for x in v)
    if isinstance(v,dict):return ' '.join(strings(x) for k,x in v.items() if k not in ['svg','diagram','boxSpeech','narration','stepHelp','solutionHelp','explanationHelp'] and not k.startswith('speech'))
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
stats['lessonExercises']=sum(len(l['exercises']) for c in chapters for l in c['lessons'])
stats['writtenLessonExercises']=sum(len(practice[l['id']]) for c in chapters for l in c['lessons'])
stats['stepRuleHelpers']=rule_help_count
stats['formulaCards']=len(formulas)
stats['conceptModels']=len(chapters)
stats['conceptualBridges']=sum(len(c['lessons']) for c in chapters)
stats['drillSkills']=len(skills)
stats['drillLevels']=3*len(skills)
css='\n'.join((ROOT/f).read_text(encoding='utf-8') for f in ['guide.css','enhancements.css','display.css','visual-learning.css','practice.css','rule-help.css','formulas.css','accounts.css','learning.css','trainer.css'])
js='\n'.join((ROOT/f).read_text(encoding='utf-8') for f in ['speech.js','accounts.js','guide.js','reading.js','rule-help-view.js','rule-help.js','learning-view.js','concept-explorers.js','lesson-view.js','practice.js','enhancements.js','toolkit-view.js','discovery.js','diagram-marks.js','formula-view.js','formula-library.js','skills-core.js',*skill_files,'trainer.js','activity-view.js','account-view.js'])
favicon='data:image/svg+xml,'+quote('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#173349"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="#6bb5ab" stroke-width="2"/><text x="32" y="45" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#85dfcc">x</text></svg>',safe='')
def build_info():
    """When this copy was built and from which commit, for the line at the foot of the home page.
    SOURCE_DATE_EPOCH fixes the time when a reproducible build is wanted."""
    epoch=os.environ.get('SOURCE_DATE_EPOCH')
    built=datetime.datetime.fromtimestamp(int(epoch),datetime.timezone.utc) if epoch else datetime.datetime.now(datetime.timezone.utc)
    info={'built':built.strftime('%Y-%m-%dT%H:%M:00Z')}
    def git(*args):
        try:return subprocess.run(['git',*args],cwd=ROOT.parent,capture_output=True,text=True,timeout=15,check=True).stdout.strip()
        except Exception:return ''
    hosted=os.environ.get('WORKERS_CI_COMMIT_SHA','')
    commit=hosted or git('rev-parse','HEAD')
    if re.fullmatch(r'[0-9a-f]{7,40}',commit):
        info['commit']=commit[:7]
        date=git('log','-1','--format=%cI',commit)
        if date:info['commitDate']=date
        # A copy built before its changes were committed says so.
        if not hosted and git('status','--porcelain','--','source','worker','tests','migrations','package.json'):info['changed']=True
    return info
BUILD=build_info()
def page(items,initial=0,standalone=False):
    data={'build':BUILD,'chapters':items,'initialChapter':initial,'standalone':standalone,'stats':stats,'glossary':glossary,'searchIndex':search,'labNarration':labs,'ruleLibrary':rule_library,'formulas':formulas,'contentVersion':content_version}
    payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('</',r'<\/')
    home='index.html#home' if standalone else '#home'
    return f'''<!doctype html><html lang="en-IE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Junior Cycle Higher Level Mathematics preparation: visual lessons, browser narration, written practice, a visual glossary and chapter toolkits."><meta name="color-scheme" content="light dark"><title>Junior Cycle Higher Maths: Preparation Guide</title><link rel="icon" type="image/svg+xml" sizes="any" href="{favicon}"><style>{css}</style></head><body><a class="skip" href="#app">Skip to the guide</a><header class="topbar"><a class="brand" href="{home}"><span class="brand-mark" aria-hidden="true">x</span><span><strong>Junior Cycle Higher Maths</strong><small>PREPARATION GUIDE · SEE · UNDERSTAND · PRACTISE</small></span></a><nav class="toplinks" aria-label="Guide tools"><button id="drills-button">Skill drills</button><button id="formulas-button">Formulas</button><button id="glossary-button">Glossary</button><button id="term-search-button">Search by term</button><button id="display-button">Display</button><button data-voice-settings>Voice</button><button id="about-button">How to use</button></nav></header><div class="container" id="app" tabindex="-1"></div><div class="print-sheet" id="print-sheet"></div><div class="screen-reader" id="status-live" aria-live="polite" aria-atomic="true"></div><script>const DATA={payload};</script><script>{js}</script></body></html>'''
(OUT/'index.html').write_text(page(chapters),encoding='utf-8')
for c in chapters:
    slug=re.sub('[^a-z0-9]+','-',c['title'].lower()).strip('-')
    (OUT/f'{c["id"]:02}-{slug}.html').write_text(page([c],c['id'],True),encoding='utf-8')
(ROOT/'compiled-data.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf-8')
(ROOT/'build-report.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
(OUT/'START-HERE.txt').write_text('''JUNIOR CYCLE HIGHER MATHS: PREPARATION GUIDE

Open index.html for all 24 chapters, or open an individual chapter page.
Each HTML page contains its own styles, diagrams, scripts and glossary.
Keep the toolkits folder beside the HTML pages for the A3 printable cards.

Each topic opens with a question to think about and a short explanation of the idea.
The first lesson in every chapter has a three-stage interactive model. Predict,
change a value and explain what stays the same. Use Next for one move at a time,
Watch the change for playback, or Enlarge this model for a closer look. Controls
work with the keyboard. Reduced-motion preferences are respected. Starting audio
or leaving the lesson stops model playback.

Use Next step to reveal a method. Each teaching box has its own Listen button.
Play whole lesson reads the boxes in order and advances the diagrams when each
part ends. The current box has a reading marker. Pause keeps your place;
Continue repeats the current short part. Turn off Follow narration to prevent
automatic scrolling. Choosing a different step or lesson stops the narration.
Choose an available English voice and speaking speed with Voice.
Local voices can work offline; online voices need an internet connection and may
send the narration text to the voice provider. No microphone is needed.
If speech is unavailable, use the written explanations and transcripts.

Skill drills: rounds of five generated questions for the core skills of algebra,
number, ratio and statistics. Type your answer and it is marked at once. A wrong
answer shows the likely slip and a worked solution. Each skill has three levels;
stars record your best round. "Get ready for a test" builds a ten-question
warm-up from the topics you tick, then lists the skills to fix first.

Formulas: search by name or expression, such as quadratic or ax2+bx+c.
Browse subjects for clearly typeset rules, symbol meanings, diagrams and worked
examples. Each formula links to its Toolkit method. Close to return to your place.
Glossary: searchable definitions, examples and diagrams.
Search by term: matching chapters with direct lesson and toolkit links.
Display: Classic, Warm paper, High contrast or Projector.
Chapter Toolkit: 222 visual cards with diagrams, formulas and short conditions.
Open a card's working for the full method and example. Enlarge any card's diagram
to inspect its labels. The A3 PDF covers all 24 chapters; each chapter links to
its own page range. Equations and instructions appear on separate readable lines.
Exam practice: original written problems with hints and staged worked solutions.
Topic practice: six exercises for every lesson, from easier to harder, combining
two quick checks and four written tasks. Reveal clues and worked steps only when
needed, listen to any question or explanation, and record your own assessment.
There are 948 topic exercises plus the separate 96 chapter challenges.
Written reviews are self-reports, not automatically marked answers. Notes and
question position are saved locally; covering a solution retains these records.

Rule applied: the formula, reason and conditions for a worked step.
Method reminder: the relevant method when broader guidance is useful.
Hover to preview; click or tap to keep open. Enter opens the card for keyboard
use; Escape closes it. Square expansions match the values to the formula's
letters. The Toolkit link opens the full method. Practice help is revealed
and covered with its solution step.

The hosted guide requires an invited account. Progress and activity sync with
that account; the administrator can review activity. Activity and progress older
than six calendar months are removed daily. Written notes and preferences remain
on the device. My activity provides a personal record and a data download.

Downloaded file:// copies work offline without login. Their progress stays in
this browser and does not sync. Use the main index across all chapters. Old
anonymous progress is only imported after you explicitly confirm it is yours.

This is an independent study resource. Check each formula's conditions, show your
reasoning, keep units consistent and use other practice materials as needed.
''',encoding='utf-8')
print(json.dumps(stats,indent=2))
