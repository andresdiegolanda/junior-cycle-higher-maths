from pathlib import Path
import json,hashlib,zipfile
ROOT=Path(__file__).resolve().parent;OUT=ROOT.parent/'site'
files=sorted(p for p in OUT.rglob('*') if p.is_file() and not any(x.startswith('_') for x in p.relative_to(OUT).parts))
assert len(files)==27,(len(files),[p.name for p in files]);assert not any(p.suffix.lower() in ['.mp3','.wav'] for p in files)
inventory=[{'path':p.relative_to(OUT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(ROOT/'package-inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')
dest=ROOT.parent/'downloads/Junior-Cycle-Higher-Maths.zip'
dest.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,'Junior-Cycle-Higher-Maths/'+p.relative_to(OUT).as_posix())
with zipfile.ZipFile(dest) as z:assert z.testzip() is None and len(z.namelist())==len(files)
report={'files':len(files),'siteBytes':sum(x['bytes'] for x in inventory),'zipBytes':dest.stat().st_size,'zipSha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'largestFileBytes':max(x['bytes'] for x in inventory)}
(ROOT/'package-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report,indent=2))
