"""Check the actual shipped lessons, clues, answers and toolkits for regressions.

Run after build.py. Testing both index.html and standalone chapters catches
context that is lost when narration moves between different reading controls.
"""
from pathlib import Path
import json
import re

SITE = Path(__file__).resolve().parent.parent / 'site'

# Each check names authored content and the exact spoken meaning it must retain.
checks = [
    (8, ('intro',), 'full formal proofs are not examinable'),
    (11, ('lessons', '11-08', 'exercises', '11-08-w4', 'speechQuestion'), '0.006 times h with h in metres'),
    (12, ('lessons', '12-02', 'steps', 1, 'boxSpeech', 'diagram'), 'fourteen forty-seven gives fifteen hundred hours'),
    (12, ('lessons', '12-02', 'quiz', 1, 'speechQuestion'), 'zero nine thirty-eight'),
    (12, ('lessons', '12-02', 'quiz', 1, 'speechHint'), 'ten hundred hours'),
    (12, ('lessons', '12-02', 'exercises', '12-02-w3', 'speechQuestion'), 'twenty-two forty-five'),
    (12, ('lessons', '12-02', 'exercises', '12-02-w3', 'speechHints', 1), 'twenty-two forty-five to midnight'),
    (12, ('lessons', '12-02', 'exercises', '12-02-w4', 'speechSolution', 1), 'zero five thirty next day'),
    (12, ('lessons', '12-02', 'exercises', '12-02-w2', 'speechResult'), 'Answer. twelve thirty-five'),
    (12, ('toolkit', 'methods', 4, 'speech'), 'twenty-three forty-two gives zero one seventeen'),
    (12, ('challenges', '12-c04', 'speechQuestion'), 'zero one seventeen'),
    (12, ('challenges', '12-c04', 'speechHints', 0), 'zero one thirty-five'),
    (12, ('challenges', '12-c04', 'solution', 0, 'speech'), 'midnight'),
    (12, ('challenges', '12-c04', 'speechResult'), 'zero two forty next day'),
    (12, ('challenges', '12-c02', 'speechResult'), 'Mixed ratio 12 to 23'),
    (13, ('lessons', '13-01', 'exercises', '13-01-w2', 'speechQuestion'), 'zero nine hundred hours'),
    (20, ('challenges', '20-c02', 'speechQuestion'), 'zero eight hundred hours'),
    (20, ('challenges', '20-c02', 'solution', 2, 'speech'), 'zero eight fifty-five'),
    (20, ('challenges', '20-c02', 'speechResult'), 'zero eight fifty-five'),
    (21, ('lessons', '21-07', 'exercises', '21-07-w2', 'speechHints', 1), 'C equals 15 plus 6 times h'),
    (22, ('lessons', '22-05', 'exercises', '22-05-w1', 'speechHints', 1), '8 over h'),
    (22, ('toolkit', 'methods', 6, 'speech'), 'O over h'),
]

count = 0
for page in sorted(SITE.glob('*.html')):
    if page.name.startswith('_'):
        continue
    data = json.loads(re.search(r'<script>const DATA=(.*?);</script>', page.read_text(encoding='utf-8'), re.S).group(1))
    chapters = {c['id']: c for c in data['chapters']}
    for chapter, path, expected in checks:
        if chapter not in chapters:
            continue
        value = chapters[chapter]
        for key in path:
            value = next(x for x in value if x['id'] == key) if isinstance(value, list) and isinstance(key, str) else value[key]
        assert expected in value, (page.name, path, expected, value)
        count += 1
assert count == 2 * len(checks), 'Every regression must pass in the full guide and its standalone chapter'
print(f'Published narration/content checks passed: {count} assertions across the full guide and standalone chapters.')
