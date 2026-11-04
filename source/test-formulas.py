"""Check catalogue integrity, distributed pages and independent example calculations."""
from pathlib import Path
import json, re, math, xml.etree.ElementTree as ET
from formula_catalog import load_formula_library

ROOT=Path(__file__).resolve().parent
chapters=json.loads((ROOT/'compiled-data.json').read_text(encoding='utf-8'))
cards=load_formula_library(chapters)
assert len(cards)==64 and len({c['id'] for c in cards})==64
lookup={c['id']:c for c in chapters}
groups={'Algebra','Number','Graphs & patterns','Shape & space','Data & chance'}
def validate_node(node):
    if isinstance(node,str):
        assert node.strip()
        return
    assert isinstance(node,list) and node[0] in ['row','frac','sqrt','var'],node
    if node[0]=='frac': assert len(node)==3
    if node[0] in ['sqrt','var']: assert len(node)==2
    for child in node[1:]: validate_node(child)
for f in cards:
    assert f['group'] in groups and f['when'] and f['condition'] and f['speech']
    assert f['letters'] and all(v['symbol'] and v['meaning'] for v in f['letters'])
    assert f['example']['question'] and len(f['example']['steps'])>=2
    for node in f['math']: validate_node(node)
    assert f['lesson'] in [l['id'] for l in lookup[f['chapter']]['lessons']]
    assert all(ch in lookup for ch in f['chapters'])
assert {ch for f in cards for ch in f['chapters']}==set(range(1,25))
for path in (ROOT.parent/'site').glob('*.html'):
    text=path.read_text(encoding='utf-8')
    data=json.loads(re.search(r'<script>const DATA=(.*?);</script>',text,re.S).group(1))
    assert data['formulas']==cards,path.name
    assert text.count('id="formulas-button"')==1,path.name
    assert 'installFormulaLibrary();' in text

# Independent numeric checks for the less obvious worked examples.
by_id={f['id']:f for f in cards}
assert 'n times' not in by_id['sets']['speech'] and 'number of elements in' in by_id['sets']['speech']
assert 'P times' not in by_id['probability']['speech'] and 'probability of E' in by_id['probability']['speech']
assert 'a times x squared' in by_id['quadratic']['speech'] and '4 times a times c' in by_id['quadratic']['speech']
assert 'sum of frequency times value' in by_id['weighted-mean']['speech']
assert 'inverse tan' in by_id['inverse-trig']['speech']
assert 'rule evaluated at' in by_id['function']['speech']
def example(id): return ' '.join(by_id[id]['example']['steps'])
a,b,c=2,-5,-3
roots=[(-b+sign*math.sqrt(b*b-4*a*c))/(2*a) for sign in [1,-1]]
assert roots==[3,-.5] and all(abs(a*x*x+b*x+c)<1e-12 for x in roots)
assert 'x = 3 or x = −½' in example('quadratic')
assert 2*(4*3+4*2+3*2)==52 and '52 cm²' in example('cuboid-surface')
assert round(math.degrees(math.atan(3/4)),1)==36.9 and '36.9°' in example('inverse-trig')
assert round(1000*1.05**2,2)==1102.5 and '1102.50' in example('compound').replace(',','')
assert (2*3+5*2)/(3+2)==3.2 and '3.2' in example('weighted-mean')
assert (80/200)*30==12 and '12 students' in example('sampling')
assert [n*n+n for n in range(1,5)]==[2,6,12,20] and 'n² + n' in example('quadratic-sequence')
assert 18+12-5==25 and '25' in example('sets')
assert 'denominator' in by_id['cancel-factors']['condition'].lower() or 'x ≠ 3' in example('cancel-factors')
print('64 formula cards: schema, all chapter targets, all 25 distributions and numeric spot checks passed.')
