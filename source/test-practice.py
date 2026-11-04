"""Coverage, regression and independent mathematical checks for topic practice.

The symbolic/numerical cases cover error-prone arithmetic, algebra, models and
geometry. They complement the editorial review, not a proof of every prose answer.
"""
from pathlib import Path
import json, re, math
from fractions import Fraction
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

ROOT=Path(__file__).parent
chapters=json.loads((ROOT/'compiled-data.json').read_text(encoding='utf-8'))
original=json.loads((ROOT/'data/chapters.json').read_text(encoding='utf-8'))
questions={q['id']:q for c in chapters for l in c['lessons'] for q in l['exercises']}
assert len(questions)==948
assert sum(q['type']=='written' for q in questions.values())==632
normal=lambda s:re.sub(r'\s+','',s.lower().replace('−','-'))
for c,old in zip(chapters,original):
    for l,prior in zip(c['lessons'],old['lessons']):
        qs=l['exercises']
        assert len(qs)==6 and [q['difficulty'] for q in qs]==list(range(1,7)), l['id']
        assert len({normal(q['question']) for q in qs})==6, l['id']
        for i,q in enumerate(prior['quiz']):
            actual=questions[f'{l["id"]}-q{i}']
            assert all(actual[k]==q[k] for k in q), ('Changed legacy check',actual['id'])
        for q in qs:
            assert all(q.get(k) for k in ['id','question','hints','speechQuestion','speechHints']),q['id']
            assert len(q['hints'])==len(q['speechHints'])
            if q['type']=='written':
                assert len(q['hints'])==2 and all(h.strip() for h in q['hints']),q['id']
                assert q['answer'] and len(q['check'])>5 and all(q['solution']),q['id']
                assert len(q['solution'])==len(q['speechSolution'])
                assert q['speechResult']

def expression(s):
    for a,b in {'−':'-','×':'*','÷':'/','²':'**2','³':'**3','⁴':'**4','⁵':'**5','⁶':'**6','⁷':'**7','⁻²':'**(-2)','π':'pi','^':'**','[':'(',']':')'}.items():
        s=s.replace(a,b)
    s=re.sub(r'√(\d+)',r'sqrt(\1)',s)
    return parse_expr(s, transformations=standard_transformations+(implicit_multiplication_application,))

checked=0
def identity(key,original):
    global checked
    actual=questions[key]['answer'].split(';')[0].split(',')[0].strip()
    assert sp.simplify(expression(actual)-expression(original))==0,(key,actual,original)
    checked+=1

identities={
'01-01-w1':'8x+3-5x+6','01-01-w2':'5a-2b+3a+7b-4','01-01-w3':'4x**2-3x+7-x**2+8x-12',
'01-02-w1':'(x+2)(x+5)','01-02-w2':'(3x-2)(x+5)','01-02-w3':'(3x-2)(2x-5)',
'01-03-w1':'(x+2)(x**2+x+3)','01-03-w2':'(x-3)(x**2+2x-4)','01-03-w3':'(2x-1)(3x**2-2x+5)',
'01-07-w1':'(x**2+8x+15)/(x+3)','01-07-w2':'(2x**2+7x-4)/(x+4)','01-07-w3':'(x**3-2x**2-5x+6)/(x-1)',
'02-01-w1':'12x+18','02-01-w2':'15a**2-10a','02-01-w3':'18x**3*y-24x**2*y**2+6x*y','02-01-w4':'-8x**3+12x**2',
'02-02-w1':'a*x+a*y+b*x+b*y','02-02-w2':'3x**2+8x+4','02-02-w3':'x*y-4x-3y+12','02-02-w4':'x**3-2x**2-9x+18',
'02-03-w1':'x**2-25','02-03-w2':'9a**2-16b**2','02-03-w3':'2x**2-50','02-03-w4':'x**4-81',
'02-04-w1':'x**2+9x+20','02-04-w2':'x**2-x-12','02-04-w3':'x**2-9x+20',
'02-05-w1':'2x**2+5x+3','02-05-w2':'3x**2-5x-2','02-05-w3':'6x**2-7x-3',
'02-06-w1':'6x/(9x)','02-06-w2':'(x**2-16)/(x-4)','02-06-w3':'(x**2+x-6)/(x**2-4)','02-06-w4':'(x**3-4x)/(x**2-x-2)',
'14-01-w1':'a**2*a**5','14-01-w2':'(2x**3)**2/x**2','14-01-w3':'12a**5*b**2/(3a**2*b**4)',
'14-04-w1':'sqrt(72)','14-04-w2':'3sqrt(8)-sqrt(18)',
'19-03-w3':'2(k+1)**2+1','19-03-w4':'(2k-1)**2-3(2k-1)+2-(k**2-3k+2)',
'21-01-w1':'x/3+x/6','21-01-w3':'(3x-2)/5-(x+4)/3',
'21-02-w1':'8x**2/(12x)','21-02-w2':'(x**2-16)/(x-4)','21-02-w3':'(2x**2+7x+3)/(2x+1)',
'21-08-w1':'(x/3)*(6/5)','21-08-w2':'(3x/(x+2))*((x+2)/9)','21-08-w3':'((x**2-9)/(x+1))*((x+1)/(x-3))',
'21-08-w4':'((2x**2+5x+2)/(x**2-4))*((x-2)/(2x+1))',
'21-09-w1':'(x/4)/(3/2)','21-09-w2':'(6x/5)/(3x/10)','21-09-w3':'((x**2-9)/(x+1))/((x-3)/2)',
'21-09-w4':'((x**2-4)/(x-1))/((x+2)/(x**2-1))',
'21-10-w1':'2/x+3/x','21-10-w2':'1/x+1/(x+1)','21-10-w3':'3/(x-2)-2/(x+2)',
'21-10-w4':'2/(x-1)-(x+3)/(x**2-1)'
}
for key,value in identities.items():identity(key,value)

def contains(key,*parts):
    global checked
    answer=questions[key]['answer']
    assert all(p in answer for p in parts),(key,answer,parts)
    checked+=1

# Recompute equation roots from original equations, then compare the stated roots.
x=sp.Symbol('x')
equations={
'01-05-w1':('5x+7-32','5'), '01-05-w2':('4(x-2)-2x-10','9'),
'01-05-w3':('3(2x-5)-2(x+1)-11','7'), '01-05-w4':('(2x-1)/3-(x+2)/4-2','34/5'),
'15-01-w1':('x**2-5x+6','2,3'),'15-01-w2':('2x**2+x-3','-3/2,1'),
'15-01-w3':('x(x+3)-10','-5,2'),'15-01-w4':('(x-1)(x+4)-2(x+4)','-4,3'),
'21-03-w1':('x/3+2-7','15'),'21-03-w2':('(x-2)/3-(x+4)/5','11'),
'21-03-w3':('(2x-1)/4-(x+2)/3-1','23/2'),'21-03-w4':('2/(x-1)-3/(x+2)','7')}
for key,(rule,roots) in equations.items():
    expected=[expression(v) for v in roots.split(',')]
    assert set(sp.solve(expression(rule),x))==set(expected),key
    answer=questions[key]['answer'].replace('−','-').replace(' ','')
    assert all(str(v).replace(' ','') in answer for v in expected),(key,answer)
    checked+=1

# Exact rational arithmetic independently checks weighted means and probabilities.
contains('07-02-w3',str((10*6+15*8)/25))
contains('07-02-w4','13','12');assert (8*15-23+7)/8==13 and (104-20)/7==12
scores=[40,50,50,60,60,60,60,70,70,80]
assert sum(scores)/10==60 and (sum(scores)-40+80)/10==64
assert sorted(scores)[4:6]==sorted([80]+scores[1:])[4:6]==[60,60]
contains('09-07-w1',str(Fraction(3,5)*Fraction(3,5)))
contains('09-07-w2',str(Fraction(3,5)*Fraction(2,4)))
contains('09-07-w3',str(Fraction(4,7)*Fraction(3,6)+Fraction(3,7)*Fraction(4,6)))
contains('09-07-w4',str(round(3*.6**2*.4,3)),str(round(1-.4**3,3)))
contains('09-04-w4',str(Fraction(sum(a+b==4 for a in [1,1,2,3] for b in [1,1,2,3]),16)))
contains('09-06-w4',str(Fraction(5+4+3,50)),str(Fraction(10+5,50)))
contains('09-05-w4',str(Fraction(12+45,40+100)),'114')
contains('13-03-w4',str((8*5+12*15+20*30)/40))
contains('14-07-w4',str(round(19.8*.503/.098)))
contains('04-06-w4',f'{(1000*1.04-200)*(1+.05*.8):.2f}')
contains('04-07-w4',f'{8000*.8**3:,.0f}')

# Numerical trig checks use the original lengths/angles, including eye height.
trig={
'22-02-w2':(math.degrees(math.asin(6/10)),1),
'22-03-w2':(math.degrees(math.acos(.8)),1),
'22-03-w3':(math.degrees(math.atan(7/4)),1),
'22-03-w4':(math.degrees(math.asin(9/12)),1),
'22-04-w2':(15*math.cos(math.radians(40)),1),
'22-04-w3':(8*math.tan(math.radians(35)),2),
'22-05-w2':(9/math.cos(math.radians(50)),2),
'22-05-w3':(20/math.tan(math.radians(32)),1),
'22-06-w2':(25*math.tan(math.radians(38))+1.6,1),
'17-01-w4':(2000/(25*math.pi),1),
'17-04-w2':(3*math.pi/2,1)}
for key,(value,places) in trig.items():contains(key,f'{value:.{places}f}')
contains('22-04-w4',f'{12*math.sin(math.radians(18)):.2f}',f'{12*math.cos(math.radians(18)):.2f}')
contains('22-05-w4',f'{4/math.sin(math.radians(75)):.2f}',f'{4/math.sin(math.radians(65)):.2f}')
contains('22-06-w3',f'{30*math.tan(math.radians(40)):.1f}',f'{30/math.cos(math.radians(40)):.1f}')
contains('17-04-w4',str(math.floor(36*math.pi/5)))
contains('18-05-w4','8 by 8')
assert 2*8*9<=150<2*9*10
assert 500*.8**4>200>500*.8**5
assert 200*1.5**3<1000<200*1.5**4

# Domain restrictions are part of the mathematics, even when factors disappear.
for key,values in {'02-06-w3':['2','−2'],'21-08-w4':['−2','2','−1/2'],
                   '21-09-w4':['−1','1','−2'],'21-10-w4':['−1','1']}.items():
    q=questions[key];assert '≠' in q['answer'] and all(v in q['answer'] for v in values),key

print(f'Practice checks passed: 158 topics × 6 exercises; 632 written tasks; all legacy IDs/answers retained; {checked} independent symbolic/numerical answer checks plus domains and thresholds.')
