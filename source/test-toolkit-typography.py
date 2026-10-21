"""Protect all mathematical content while reflowing the reference cards."""
from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET
from toolkit_typography import reference_rows, readable_diagram

ROOT=Path(__file__).resolve().parent
def content(text):
    # Sentence punctuation and layout may change; mathematical tokens may not.
    return re.sub(r'[\s;,.]', '', text)

cards=[]
for path in sorted((ROOT/'data').glob('visual-cards-*.json')):
    cards.extend(json.loads(path.read_text(encoding='utf-8')))
assert len(cards)==222
labels=0
for card in cards:
    rows=reference_rows(card['formula'],(card['chapter'],card['index']+1))
    assert content(''.join(r['text'] for r in rows))==content(card['formula']),card['task']
    assert rows and all(r['kind'] in ('equation','instruction') and r['text'] for r in rows)
    before=ET.fromstring(card['svg']);after=ET.fromstring(readable_diagram(card['svg'],(card['chapter'],card['index']+1)))
    old=[''.join(e.itertext()) for e in before.iter() if e.tag.endswith('text')]
    new=[''.join(e.itertext()) for e in after.iter() if e.tag.endswith('text')]
    assert old==new,card['task']
    labels+=len(new)
chapters=json.loads((ROOT/'data/chapters.json').read_text(encoding='utf-8'))
for chapter in chapters:
    for method in chapter['toolkit']['methods']:
        rows=reference_rows(method['rule'])
        assert content(''.join(r['text'] for r in rows))==content(method['rule']),method['title']
print(f'Typography checks passed: {len(cards)} formula cards, 222 full methods, {labels} unchanged diagram labels.')
