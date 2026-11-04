"""Original graduated written practice. Four tasks follow each lesson's two checks.

Each row is question | first clue | next clue | worked steps (~ separated) |
answer | independent check. No runtime generation, randomness or remote services.
"""
from pathlib import Path

BANK = {}

def pack(lesson, text):
    rows = [line.strip().split('|') for line in text.strip().splitlines() if line.strip()]
    assert len(rows) == 4, (lesson, len(rows))
    assert lesson not in BANK, lesson
    BANK[lesson] = []
    for i, row in enumerate(rows):
        assert len(row) == 6, (lesson, i, row)
        question, h1, h2, working, answer, check = (x.strip() for x in row)
        BANK[lesson].append(dict(id=f'{lesson}-w{i+1}', difficulty=i+3,
            question=question, hints=[h1,h2], solution=working.split('~'),
            answer=answer, check=check))

def load_practice():
    if BANK:
        return BANK
    # Each file is an intentionally small, reviewable set of original tasks.
    for file in sorted((Path(__file__).parent/'data').glob('practice-*.txt')):
        for block in file.read_text(encoding='utf-8').split('@'):
            if not block.strip():
                continue
            lesson, rows = block.strip().split('\n', 1)
            pack(lesson.strip(), rows)
    return BANK
