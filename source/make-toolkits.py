"""A3 visual reference cards. SVG diagrams stay as vectors in the PDF."""
from pathlib import Path
import sys, json, html, math, re, io, os
ROOT=Path(__file__).resolve().parent
if (ROOT/'_deps').exists():sys.path.insert(0,str(ROOT/'_deps'))
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from svglib.fonts import register_font
from pypdf import PdfReader

OUT=ROOT.parent/'site/toolkits';OUT.mkdir(parents=True,exist_ok=True)
chapters=json.loads((ROOT/'compiled-data.json').read_text(encoding='utf-8'))
font_setting=os.environ.get('MATHS_FONT_DIR')
if not font_setting:raise SystemExit('Set MATHS_FONT_DIR to the folder containing DejaVuSans.ttf before rebuilding the PDF.')
fontdir=Path(font_setting)
pdfmetrics.registerFont(TTFont('Desk',str(fontdir/'DejaVuSans.ttf')))
bold=fontdir/'DejaVuSans-Bold.ttf'
pdfmetrics.registerFont(TTFont('DeskBold',str(bold if bold.exists() else fontdir/'DejaVuSans.ttf')))
pdfmetrics.registerFontFamily('Desk',normal='Desk',bold='Desk',italic='Desk',boldItalic='Desk')
for weight in ['normal','bold']:
    for style in ['normal','italic']:
        _,registered=register_font('Desk',str(fontdir/'DejaVuSans.ttf'),weight=weight,style=style,rlgFontName='Desk')
        assert registered
INK=HexColor('#173349');TEAL=HexColor('#087f75');MUTED=HexColor('#536b79');LINE=HexColor('#c9d9df')
W,H=landscape(A3);M=22;GAP=12;TOP=H-104;BOTTOM=32

def clean(s):return html.escape(str(s).replace('\u2011','-').replace('\u2013','-').replace('\u2014','-')).replace('\n','<br/>')
def para(s,size=12,bold=False,color=INK):
    for ch in str(s):
        if not ch.isspace():assert ord(ch) in pdfmetrics.getFont('Desk').face.charToGlyph,('Missing glyph',ch)
    usebold=bold and all(ch.isspace() or ord(ch) in pdfmetrics.getFont('DeskBold').face.charToGlyph for ch in str(s))
    return Paragraph(clean(s),ParagraphStyle('card',fontName='DeskBold' if usebold else 'Desk',fontSize=size,leading=size*1.23,textColor=color,spaceAfter=0))
def layout_card(v,width,height):
    inner=width-24
    for fs in [14.5,14,13.5,13,12.5,12,11.8]:
        title=para(v['task'],14 if width>300 else 12.8,True)
        formula=para(v['formula'],fs,True,TEAL)
        condition=para(v.get('conditionLabel','Remember')+': '+v['condition'],10.4,False,MUTED)
        th=title.wrap(inner,999)[1];fh=formula.wrap(inner-16,999)[1];ch=condition.wrap(inner-8,999)[1]
        available=height-(14+13+th+7+14+fh+10+ch+16)
        image_height=min(180*inner/480,available)
        if image_height>=90:return {'title':title,'th':th,'formula':formula,'fh':fh,'condition':condition,'ch':ch,'imageHeight':image_height,'font':fs}
    raise ValueError(('Card too dense',v['chapter'],v['index'],v['task'],height,available))
def draw_card(cv,m,index,x,y,width,height):
    v=m['visual'];p=layout_card(v,width,height);pad=12
    cv.setStrokeColor(LINE);cv.setFillColor(HexColor('#ffffff'));cv.roundRect(x,y-height,width,height,9,fill=1,stroke=1)
    cy=y-13;cv.setFillColor(TEAL);cv.setFont('DeskBold',8.5);cv.drawString(x+pad,cy,f'{index+1:02}  /  {m["section"]}')
    cy-=9+p['th'];p['title'].drawOn(cv,x+pad,cy);cy-=7
    source=re.sub(r'font-family="[^"]*"','font-family="Desk"',v['svg'])
    source=re.sub(r"font-family='[^']*'",'font-family="Desk"',source)
    for el in re.findall(r'<text[^>]*>(.*?)</text>',source,re.S):
        for ch in html.unescape(re.sub('<[^>]*>','',el)):
            if not ch.isspace():assert ord(ch) in pdfmetrics.getFont('Desk').face.charToGlyph,('Missing diagram glyph',ch)
    drawing=svg2rlg(io.BytesIO(source.encode('utf-8')))
    def check_fonts(node):
        if hasattr(node,'text') and hasattr(node,'fontName'):assert node.fontName=='Desk',('Unexpected diagram font',node.fontName,node.text)
        for child in getattr(node,'contents',[]):check_fonts(child)
    check_fonts(drawing)
    scale=min((width-2*pad)/drawing.width,p['imageHeight']/drawing.height)
    drawing.scale(scale,scale);cy-=drawing.height*scale
    renderPDF.draw(drawing,cv,x+(width-drawing.width*scale)/2,cy)
    cy-=9;fh=p['fh']+14
    cv.setFillColor(HexColor('#edf7f3'));cv.roundRect(x+pad,cy-fh,width-2*pad,fh,6,fill=1,stroke=0)
    p['formula'].drawOn(cv,x+pad+8,cy-7-p['fh']);cy-=fh+9
    p['condition'].drawOn(cv,x+pad+4,cy-p['ch'])
    assert cy-p['ch']>=y-height+5,(v['chapter'],index,'Overflow')
    return {'index':index,'formulaFont':p['font'],'diagramScale':scale,'bottomClearance':round(cy-p['ch']-(y-height),2)}

dest=OUT/'Chapter-Toolkits-A3.pdf';cv=canvas.Canvas(str(dest),pagesize=(W,H),pageCompression=1)
cv.setTitle('Junior Cycle Higher Maths - Visual Chapter Toolkits');cv.setAuthor('Junior Cycle Higher Maths')
page_no=0;report=[]
for c in chapters:
    methods=c['toolkit']['methods'];assert all(m.get('visual') for m in methods),('Visuals missing',c['id'])
    pages=math.ceil(len(methods)/8);per_page=math.ceil(len(methods)/pages);first=page_no+1;cards_report=[]
    for part,start in enumerate(range(0,len(methods),per_page)):
        subset=methods[start:start+per_page];page_no+=1
        if part==0:cv.bookmarkPage('chapter-'+str(c['id']));cv.addOutlineEntry(f'{c["id"]}. {c["title"]}','chapter-'+str(c['id']),0)
        cv.setFillColor(HexColor('#f3f7f8'));cv.rect(0,0,W,H,fill=1,stroke=0)
        cv.setFillColor(INK);cv.rect(0,H-77,W,77,fill=1,stroke=0)
        cv.setFillColor(HexColor('#8bdfcb'));cv.setFont('DeskBold',9);cv.drawString(M,H-21,f'JUNIOR CYCLE HIGHER MATHS  /  CHAPTER {c["id"]:02}  /  VISUAL TOOLKIT')
        title=para(c['title'],24,True,HexColor('#ffffff'));tw,th=title.wrap(W-200,50);title.drawOn(cv,M,H-30-th)
        cv.setFillColor(HexColor('#ffffff'));cv.setFont('Desk',10);cv.drawRightString(W-M,H-28,f'SHEET {part+1} OF {pages}')
        cv.setFillColor(MUTED);cv.setFont('Desk',9);cv.drawString(M,H-92,'FIND YOUR TASK  →  MATCH THE PICTURE  →  CHECK THE CONDITION  →  USE THE FORMULA')
        cols=2 if len(subset)<=4 else 4 if len(subset) in [7,8] else 3
        rows=math.ceil(len(subset)/cols);cw=(W-2*M-(cols-1)*GAP)/cols;ch=(TOP-BOTTOM-(rows-1)*GAP)/rows
        for j,m in enumerate(subset):cards_report.append(draw_card(cv,m,start+j,M+(j%cols)*(cw+GAP),TOP-(j//cols)*(ch+GAP),cw,ch))
        cv.setFillColor(MUTED);cv.setFont('Desk',8);cv.drawString(M,15,'Read the labels. Diagrams illustrate relationships and may not be to scale. Full workings and narration are in the interactive guide.')
        cv.drawRightString(W-M,15,f'A3 landscape  /  page {page_no}')
        cv.showPage()
    report.append({'chapter':c['id'],'firstPage':first,'lastPage':page_no,'pages':pages,'cards':cards_report})
cv.save();reader=PdfReader(dest);assert len(reader.pages)==page_no
for p in reader.pages:assert abs(float(p.mediabox.width)-W)<1 and 'VISUAL TOOLKIT' in p.extract_text()
(ROOT/'toolkit-pdf-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'pdf':str(dest),'pages':page_no,'cards':sum(len(x['cards']) for x in report),'smallestFormulaType':min(k['formulaFont'] for x in report for k in x['cards']),'minimumDiagramScale':min(k['diagramScale'] for x in report for k in x['cards'])},indent=2))
