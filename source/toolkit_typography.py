"""Readable reference rows without changing the mathematical content."""
import re
import xml.etree.ElementTree as ET

ET.register_namespace('', 'http://www.w3.org/2000/svg')

# These long expressions need deliberate breaks, rather than character wrapping.
BREAKS = {
    (2, 4): [('p+q=b, pq=c', 'p+q=b\npq=c')],
    (3, 5): [('=n(A)+n(B)+n(C)', '\n= n(A)+n(B)+n(C)'), ('−n(A∩B)−n(A∩C)−n(B∩C)', '\n− n(A∩B)−n(A∩C)−n(B∩C)'), ('+n(A∩B∩C)', '\n+ n(A∩B∩C)')],
    (9, 8): [('=n(A)+n(B)+n(C)', '\n= n(A)+n(B)+n(C)'), ('−n(A∩B)−n(A∩C)−n(B∩C)', '\n− n(A∩B)−n(A∩C)−n(B∩C)'), ('+n(A∩B∩C)', '\n+ n(A∩B∩C)')],
    (11, 2): [('M=((x₁+x₂)/2,(y₁+y₂)/2)', 'M = ((x₁+x₂)/2,\n       (y₁+y₂)/2)')],
    (12, 1): [(', B=', '\nB=')],
    (17, 4): [(', A =', '\nA =')],
    (22, 2): [(', height=', '\nheight='), (', k=', '\nk=')],
    (22, 5): [(', cos', '\ncos'), (', tan', '\ntan')],
    (23, 3): [(', y=f', '\ny=f')],
    (23, 9): [(', y(x+1)', '\ny(x+1)')],
}

def spaced(text):
    """Space binary operators; keep signed numbers and superscripts intact."""
    text = re.sub(r'\s*([=≠≤≥±×÷⇒⇔↔∝])\s*', r' \1 ', text)
    text = re.sub(r'(?<=[\w)\]²³ⁿᵐᵏ₁₂₃°])\s*([+−<>])\s*', r' \1 ', text)
    text = re.sub(r'\s*([∪∩⊂⊆])\s*', r' \1 ', text)
    text = re.sub(r',\s*', ', ', text)
    text = re.sub(r'\s+([,.;:])', r'\1', text)
    return re.sub(r' {2,}', ' ', text).strip()

def reference_rows(text, key=None):
    if key in BREAKS:
        for old, new in BREAKS[key]:
            text = text.replace(old, new)
    chunks = re.split(r'\n|;\s*|(?<=[^\d])\.\s+(?=[A-Za-zℕℤℚℝ])', text)
    rows = []
    for chunk in chunks:
        chunk = chunk.strip().rstrip(';').strip()
        if not chunk:
            continue
        words = re.findall(r'[A-Za-z]{3,}', chunk)
        # Sentences use the interface font, equations use the maths font.
        is_math = bool(re.search(r'[=≠≤≥±×÷⇒⇔↔∝⊂⊆∪∩√]|^[+−]', chunk)) and len(words) <= 3
        rows.append({'kind': 'equation' if is_math else 'instruction', 'text': spaced(chunk)})
    return rows

def readable_diagram(source, key=None):
    svg = ET.fromstring(source)
    text_colours = {'#087f75': '#075c52', '#3175ba': '#245b89', '#b96a12': '#80500c'}
    labels = [element for element in svg.iter() if element.tag.endswith('text')]
    # Two-line boxes need enough baseline separation for the sans-serif font.
    for upper in labels:
        for lower in labels:
            if upper.get('x')==lower.get('x') and upper.get('y')=='80.3' and lower.get('y')=='102.4':
                upper.set('y','76.5');lower.set('y','105.5')
    label_y={
        (4,3):{'first units':73,'next units':73,'rest':73,'× rate 1':101,'× rate 2':101,'× rate 3':101},
        (5,1):{'labels':102,'counts':102,'measures':102,'colour':132,'siblings':132,'height':132},
        (5,4):{'N=10; B: 5/10 = 50%':24},
    }.get(key,{})
    for label in labels:
        text=''.join(label.itertext())
        if text in label_y:label.set('y',str(label_y[text]))
        if key==(15,4) and text=='x' and label.get('y')=='145':label.set('y','137')
        # Leave a clear gap between captions and the diagram's boundary lines.
        if key in {(3,1),(6,1),(8,9)} and float(label.get('y','0'))>150:
            label.set('y','174')
        if key==(3,6) and not text.startswith('n(U)'):
            label.set('y',str(float(label.get('y'))-12))
        if key==(3,6) and text.startswith('n(U)'):label.set('y','174')
        if key==(8,9) and text=='a':label.set('x',str(float(label.get('x'))+24))
        if key==(14,8) and text=='leading zeros':label.set('x','90')
        if key==(14,8) and text=='keep 2 digits':label.set('x','245')
        if key in {(19,1),(21,8)} and text=='×a, then +b':
            label.text=None
            for y,part in [('79','×a,'),('104',' then +b')]:
                ET.SubElement(label,'{http://www.w3.org/2000/svg}tspan',{'x':'240','y':y}).text=part
        if key==(22,4) and text=='known' and label.get('x')=='380':label.set('x','401')
    for element in svg.iter():
        tag=element.tag.rsplit('}',1)[-1]
        if key==(3,6) and tag=='g':element.set('transform','translate(36 2) scale(0.85)')
        if key==(5,2) and tag=='rect' and element.get('width')=='426':
            element.set('x','-15');element.set('width','510')
        if key==(7,2) and tag=='rect' and element.get('width')=='418':
            element.set('x','-15');element.set('width','510')
        if key==(8,9) and tag=='line' and element.get('x1')=='154':
            element.set('x1','165.5');element.set('y1','156')
        if key==(18,2) and tag=='path':element.set('d','M75 115 Q210 145 350 115')
        if key==(19,7) and tag=='rect' and element.get('height')=='12':
            element.set('y',str(float(element.get('y'))-24))
    for element in svg.iter():
        if element.tag.endswith('text'):
            # DejaVu Sans is not installed on many readers' computers. An explicit
            # sans-serif fallback prevents tiny serif glyphs in those browsers.
            element.set('font-family', 'Arial, Segoe UI Symbol, sans-serif')
            element.set('fill', text_colours.get(element.get('fill'), element.get('fill', '#173349')))
    return ET.tostring(svg, encoding='unicode')
