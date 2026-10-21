import re

def spoken(t):
    for symbol,name in [('α',' alpha '),('β',' beta '),('γ',' gamma '),('△',' triangle '),('≅',' is congruent to '),('↔',' corresponds to '),('↦',' maps to '),('⊂',' is a subset of '),('⊆',' is a subset of or equal to '),('∠',' angle '),('∝',' is proportional to '),('½',' one half '),('′',' prime ')]:
        t=t.replace(symbol,name)
    for short,long in [('sin','sine'),('cos','cosine'),('tan','tangent')]:
        t=t.replace(short+'⁻¹','inverse '+long)
    t=re.sub(r'\b([fgh])⁻¹',r'inverse function \1',t)
    t=t.replace('Tₙ','term n').replace('ˣ',' to the power x ')
    t=re.sub('[₀₁₂₃₄₅₆₇₈₉ₙ]+',lambda m:' subscript '+m.group().translate(str.maketrans('₀₁₂₃₄₅₆₇₈₉ₙ','0123456789n'))+' ',t)
    # Make powers and grouping audible, especially in automatically narrated questions.
    t=re.sub(r'ⁿ√', ' nth root of ',t)
    supermap=str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿᵐᵏᵖʳˢᵗᵘᵛˣʸᶻ','0123456789-+nmkprstuvxyz')
    def power(m):
        value=m.group().translate(supermap)
        return ' squared ' if value=='2' else ' cubed ' if value=='3' else ' to the power '+value.replace('-','minus ').replace('+','plus ')+' '
    t=re.sub('[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ⁿᵐᵏᵖʳˢᵗᵘᵛˣʸᶻ]+',power,t)
    t=re.sub(r'\b([fgh])\(([^()]+)\)',r'\1 of \2',t)
    t=re.sub(r'\bP\(([^()]+)\)',r'probability of \1',t)
    t=t.replace('sin inverse','inverse sine')
    for unit,name in [('mm','millimetres'),('cm','centimetres'),('km','kilometres'),('kg','kilograms'),('min','minutes')]:
        t=re.sub(r'\b'+unit+r'\b',name,t)
    t=re.sub(r'€\s*([\d,]+(?:\.\d+)?)',r'\1 euros',t)
    t=re.sub(r'£\s*([\d,]+(?:\.\d+)?)',r'\1 pounds',t)
    t=re.sub(r'\$\s*([\d,]+(?:\.\d+)?)',r'\1 dollars',t)
    t=t.replace('€x','x euros').replace('·',' times ')
    t=t.replace('≤',' less than or equal to ').replace('≥',' greater than or equal to ').replace('≠',' not equal to ').replace('√',' square root of ').replace('∛',' cube root of ')
    t=t.replace('²',' squared ').replace('³',' cubed ').replace('⁻',' negative ').replace('¹',' one ').replace('⁰',' zero ')
    for a,b in [('×',' times '),('÷',' divided by '),('−',' minus '),('–',' to '),('=',' equals '),('≈',' approximately '),('→',' gives '),('⇒',' therefore '),('±',' plus or minus '),('∩',' intersection '),('∪',' union '),('∈',' belongs to '),('∉',' does not belong to '),('∅',' empty set '),('ℕ',' natural numbers '),('ℤ',' integers '),('ℚ',' rational numbers '),('ℝ',' real numbers '),('π',' pi '),('θ',' theta '),('Σ',' sum of '),('°',' degrees '),('%',' percent '),('∞',' infinity '),('⊥',' perpendicular to '),('∥',' parallel to ')]:t=t.replace(a,b)
    t=re.sub(r'(\d)([xyzabcmnpt])\b',r'\1 times \2',t)
    t=t.replace('+',' plus ').replace('<',' less than ').replace('>',' greater than ')
    t=re.sub(r'(?<=\w)\s*/\s*(?=[\w(])',' over ',t)
    t=re.sub(r'\^\s*\(?([^ )]+)\)?',r' to the power \1 ',t)
    t=re.sub(r'(?<!\w)-(?=\d)','minus ',t)
    t=t.replace('(',' open bracket ').replace(')',' close bracket ')
    t=t.replace('/',' divided by ')
    t=re.sub(r'\|([A-Z])([A-Z])\|',r'length \1 \2',t)
    t=re.sub(r'#\s*([A-Z])',r'number of elements in \1',t)
    t=t.replace('{',' set containing ').replace('}',' end set ').replace('\\',' set difference ')
    return re.sub(r'\s+',' ',t).strip()
