"""Attach teaching marks to mathematical objects, never guessed page positions."""
import xml.etree.ElementTree as ET

NS='http://www.w3.org/2000/svg'
ET.register_namespace('',NS)
def tag(name):return '{'+NS+'}'+name

def mark_bounds(svg,measure=None):
    """Provide a static fallback, or exact embedded-font bounds for the PDF."""
    ids={e.get('id'):e for e in svg.iter() if e.get('id')}
    for mark in svg.iter():
        target=mark.get('data-cancel-target') or mark.get('data-highlight-target')
        if not target:continue
        text=ids[target];value=''.join(text.itertext());size=float(text.get('font-size','26'))
        x=float(text.get('x'));y=float(text.get('y'))
        width,ascent,descent=measure(value,size) if measure else (len(value)*size*.56,size*.78,-size*.2)
        x-=width/2 if text.get('text-anchor')=='middle' else width if text.get('text-anchor')=='end' else 0
        top=y-ascent;height=ascent-descent
        if mark.get('data-cancel-target'):
            values={'x1':x-2,'y1':top+height*.82,'x2':x+width+2,'y2':top+height*.15}
        else:values={'x':x-10,'y':top-6,'width':width+20,'height':height+12}
        for key,value in values.items():mark.set(key,f'{value:.3f}')
    return svg

def cancel_line(parent,target,colour='#b96a12'):
    return ET.SubElement(parent,tag('line'),{'data-cancel-target':target,'stroke':colour,'stroke-width':'2.5','stroke-linecap':'round','aria-hidden':'true'})

def prepare_grid(source):
    svg=ET.fromstring(source)
    ids={e.get('id'):e for e in svg.iter() if e.get('id')}
    if 'rowArrow' not in ids:return source
    parents={child:parent for parent in svg.iter() for child in parent}
    for key in ('rowArrow','colArrow'):parents[ids[key]].remove(ids[key])
    cell=next(e for e in svg.iter() if e.get('id','').startswith('cell') and e.get('stroke')=='#b96a12')
    index=int(cell.get('id')[4:]);cols=sum(k.startswith('col') and k[3:].isdigit() for k in ids)
    row=ids['rowlabel'+str(index//cols)];col=ids['col'+str(index%cols)];product=ids['prod'+str(index)]
    for text in (row,col):
        mark=ET.Element(tag('rect'),{'data-highlight-target':text.get('id'),'rx':'8','fill':'#fff3dd','stroke':'#b96a12','stroke-width':'2','aria-hidden':'true'})
        parent=parents[text];parent.insert(list(parent).index(text),mark)
        text.set('fill','#80500c')
    caption=ET.SubElement(svg,tag('text'),{'id':'pairing-caption','x':'380','y':'315','font-family':'Segoe UI, Arial, sans-serif','font-size':'28','fill':'#80500c','text-anchor':'middle'})
    caption.text=f"({''.join(row.itertext())}) × ({''.join(col.itertext())}) = {''.join(product.itertext())}"
    return ET.tostring(mark_bounds(svg),encoding='unicode')

def prepare_marks(source):
    return ET.tostring(mark_bounds(ET.fromstring(source)),encoding='unicode')

def pdf_marks(source,pdfmetrics,font='Desk'):
    def measure(text,size):
        ascent,descent=pdfmetrics.getAscentDescent(font,size)
        return pdfmetrics.stringWidth(text,font,size),ascent,descent
    return ET.tostring(mark_bounds(ET.fromstring(source),measure),encoding='unicode')
