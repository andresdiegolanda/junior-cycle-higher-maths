"""Check that cancellation and pairing marks still refer to valid mathematics."""
from pathlib import Path
import json,re,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parent
chapters=json.loads((ROOT/'compiled-data.json').read_text(encoding='utf8'))
NS='{http://www.w3.org/2000/svg}'
def monomial(value,x):
    value=value.replace(' ','').replace('−','-')
    m=re.fullmatch(r'([+-]?)(\d*)(x[²³]?)?',value)
    assert m,value
    coefficient=int(m[2] or '1')*(-1 if m[1]=='-' else 1)
    power=0 if not m[3] else 2 if '²' in m[3] else 3 if '³' in m[3] else 1
    return coefficient*x**power
grids=0;cancelled=[];svg_count=0
def check(value):
    global grids,svg_count
    if isinstance(value,dict):
        for v in value.values():check(v)
    elif isinstance(value,list):
        for v in value:check(v)
    elif isinstance(value,str) and '<svg' in value:
        svg_count+=1;svg=ET.fromstring(value);ids={e.get('id'):e for e in svg.iter() if e.get('id')}
        assert 'rowArrow' not in ids and 'colArrow' not in ids
        targets=[]
        for mark in svg.iter():
            target=mark.get('data-cancel-target') or mark.get('data-highlight-target')
            if target:
                assert target in ids,(target,'Missing target')
                assert ids[target].tag==NS+'text'
            if mark.get('data-cancel-target'):targets.append(''.join(ids[target].itertext()))
        if targets:
            assert targets in [['(x − 2)','(x − 2)'],['(x−2)','(x−2)'],['x','x','x','x']],targets
            text=''.join(svg.itertext());assert '≠ 2' in text or '≠ 0' in text
            cancelled.append(targets)
        if 'pairing-caption' in ids:
            grids+=1
            terms=[ids[m.get('data-highlight-target')].text for m in svg.iter() if m.get('data-highlight-target')]
            assert len(terms)==2
            active=next(e for e in svg.iter() if e.get('id','').startswith('cell') and e.get('stroke')=='#b96a12')
            product=ids['prod'+active.get('id')[4:]].text
            for x in [-3,0,2]:assert monomial(terms[0],x)*monomial(terms[1],x)==monomial(product,x),(terms,product)
check(chapters)
assert grids==15,grids
assert len(cancelled)==3 and sum(map(len,cancelled))==8,cancelled
print(f'{svg_count} diagrams checked: 15 correct multiplication pairings; 8 anchored cancellation strokes in 3 diagrams, with restrictions preserved.')
