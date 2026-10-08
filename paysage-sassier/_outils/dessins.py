"""Dessins botaniques au trait (SVG) du site — générés, puis collés dans les pages."""
import math, random
random.seed(7)
def f(v): return f"{v:.1f}".rstrip('0').rstrip('.')
def leaf(x, y, ang, L, w=0.24, veins=True):
    """Leaf drawn as outline + midrib + a few veins, base at (x,y), pointing at ang (deg)."""
    a = math.radians(ang)
    def pt(u, v):  # u along, v across
        return (x + u*math.cos(a) - v*math.sin(a), y + u*math.sin(a) + v*math.cos(a))
    W = L*w
    j = lambda: random.uniform(-1.2, 1.2)
    p0 = pt(0,0); tip = pt(L,0)
    c1 = pt(L*.25, -W*1.25+j()); c2 = pt(L*.7, -W*1.05+j())
    c3 = pt(L*.7, W*1.0+j()); c4 = pt(L*.25, W*1.2+j())
    out = [f'<path class="o" d="M{f(p0[0])},{f(p0[1])} C{f(c1[0])},{f(c1[1])} {f(c2[0])},{f(c2[1])} {f(tip[0])},{f(tip[1])} C{f(c3[0])},{f(c3[1])} {f(c4[0])},{f(c4[1])} {f(p0[0])},{f(p0[1])}" pathLength="1"/>']
    m = pt(L*.92, 0)
    out.append(f'<path class="v" d="M{f(p0[0])},{f(p0[1])} Q{f(pt(L*.5,1.5)[0])},{f(pt(L*.5,1.5)[1])} {f(m[0])},{f(m[1])}" pathLength="1"/>')
    if veins:
        for k in (0.3, 0.5, 0.7):
            for s in (-1, 1):
                b = pt(L*k, 0); e = pt(L*(k+.16), s*W*.62)
                out.append(f'<path class="v" d="M{f(b[0])},{f(b[1])} L{f(e[0])},{f(e[1])}" pathLength="1"/>')
    return ''.join(out)

def apple(x, y, r):
    s = f'<path class="o" d="M{f(x)},{f(y-r*.75)} C{f(x-r*.3)},{f(y-r*1.05)} {f(x-r*1.15)},{f(y-r*.9)} {f(x-r*1.05)},{f(y+r*.1)} C{f(x-r*.95)},{f(y+r*.95)} {f(x-r*.25)},{f(y+r*1.1)} {f(x)},{f(y+r*.95)} C{f(x+r*.25)},{f(y+r*1.1)} {f(x+r*.95)},{f(y+r*.95)} {f(x+r*1.05)},{f(y+r*.1)} C{f(x+r*1.15)},{f(y-r*.9)} {f(x+r*.3)},{f(y-r*1.05)} {f(x)},{f(y-r*.75)}" pathLength="1"/>'
    s += f'<path class="v" d="M{f(x)},{f(y-r*.75)} Q{f(x+2)},{f(y-r*1.3)} {f(x+6)},{f(y-r*1.6)}" pathLength="1"/>'
    s += f'<path class="v" d="M{f(x-r*.6)},{f(y-r*.2)} Q{f(x-r*.55)},{f(y+r*.4)} {f(x-r*.2)},{f(y+r*.7)}" pathLength="1"/>'
    return s

def blossom(x, y, r):
    s = ''
    for i in range(5):
        a = math.radians(i*72 - 90 + random.uniform(-6, 6))
        cx, cy = x + r*math.cos(a), y + r*math.sin(a)
        s += f'<ellipse class="o" cx="{f(cx)}" cy="{f(cy)}" rx="{f(r*.62)}" ry="{f(r*.5)}" transform="rotate({f(math.degrees(a))} {f(cx)} {f(cy)})" pathLength="1"/>'
    s += f'<circle class="v" cx="{f(x)}" cy="{f(y)}" r="{f(r*.28)}" pathLength="1"/>'
    return s

def branch():
    g = ['<path class="s" d="M70,548 C92,480 118,430 148,368 C176,310 208,258 246,210 C280,166 318,118 346,44" pathLength="1"/>',
         '<path class="s" d="M150,364 C190,354 232,346 286,318" pathLength="1"/>',
         '<path class="s" d="M212,262 C182,240 150,230 104,226" pathLength="1"/>',
         '<path class="s" d="M282,160 C312,160 340,150 372,128" pathLength="1"/>']
    for (x,y,a,L) in [(118,430,200,74),(126,416,-35,62),(186,352,-70,58),(236,342,-20,70),(286,318,10,64),(270,326,60,52),
                      (170,236,210,66),(104,226,190,58),(134,229,140,50),(246,210,-150,64),(262,192,-40,72),(310,146,-110,58),
                      (340,140,-30,60),(372,128,-10,52),(346,44,-80,46),(330,90,200,60),(336,80,-20,54)]:
        g.append(f'<g class="lf leaf" data-o="{x},{y}">' + leaf(x,y,a,L*1.3) + '</g>')
    # pommes suspendues : le pivot est le point d'attache sur le rameau
    for (ox,oy,x,y,r) in [(286,318,300,360,22),(296,322,332,372,19),(112,232,96,262,20)]:
        g.append(f'<g class="ap" data-o="{ox},{oy}"><path class="v" d="M{ox},{oy} Q{f((ox+x)/2+3)},{f((oy+y)/2)} {f(x)},{f(y-r*.75)}" pathLength="1"/>' + apple(x,y,r) + '</g>')
    for (x,y,r) in [(366,112,10),(222,184,9),(352,30,8)]:
        g.append(f'<g class="lf flower" data-o="{x},{y}">' + blossom(x,y,r) + '</g>')
    return '<svg class="draw branch" viewBox="0 0 420 560" aria-hidden="true"><g class="tree">' + ''.join(g) + '</g></svg>'

def fern():
    g = ['<path class="s" d="M100,392 C102,320 98,240 104,160 C108,100 116,60 124,18" pathLength="1"/>']
    n = 15
    for i in range(n):
        t = i/(n-1)
        y = 360 - t*330
        x = 100 + t*t*22
        L = 70*(1-t)**0.8 + 10
        for s in (-1,1):
            a = (-90 + s*(62 - t*20)) if True else 0
            g.append(leaf(x, y, a + s*0, L, w=.18, veins=False))
    return '<svg class="draw fern" viewBox="0 0 220 400" aria-hidden="true">' + ''.join(g) + '</svg>'

def oak():
    # lobed oak leaf
    d = "M100,290 C96,250 98,240 92,232 C70,236 52,226 62,212 C72,204 84,206 90,200 C64,196 38,184 48,166 C58,154 76,160 86,156 C62,146 46,126 58,112 C70,102 82,114 90,108 C74,90 70,66 86,56 C96,50 102,40 104,24 C108,40 114,50 124,56 C140,66 136,90 120,108 C128,114 140,102 152,112 C164,126 148,146 124,156 C134,160 152,154 162,166 C172,184 146,196 120,200 C126,206 138,204 148,212 C158,226 140,236 118,232 C112,240 114,250 110,290"
    g = [f'<path class="o" d="{d}" pathLength="1"/>',
         '<path class="v" d="M105,288 C104,200 104,110 104,30" pathLength="1"/>',
         '<path class="v" d="M104,220 L68,212 M104,220 L140,214 M104,176 L58,162 M104,176 L150,164 M104,130 L66,112 M104,130 L142,112 M104,84 L86,62 M104,84 L122,62" pathLength="1"/>',
         '<path class="o" d="M130,300 C120,292 120,276 134,272 C150,270 156,288 146,298 C142,304 134,304 130,300" pathLength="1"/>',
         '<path class="o" d="M124,282 C126,266 150,264 152,282" pathLength="1"/>',
         '<path class="v" d="M110,288 Q120,290 126,280" pathLength="1"/>']
    return '<svg class="draw oak" viewBox="0 0 200 320" aria-hidden="true">' + ''.join(g) + '</svg>'

def grass():
    g = []
    for i in range(11):
        x = 20 + i*16 + random.uniform(-4,4)
        h = random.uniform(120, 220)
        lean = random.uniform(-40, 40)
        g.append(f'<path class="s" d="M{f(x)},240 Q{f(x+lean*.2)},{f(240-h*.6)} {f(x+lean)},{f(240-h)}" pathLength="1"/>')
        if i % 3 == 1:
            tx, ty = x+lean, 240-h
            for k in range(6):
                yy = ty + k*9
                g.append(f'<path class="v" d="M{f(tx- k*lean/60)},{f(yy)} l{f(-6)},{f(-8)} M{f(tx- k*lean/60)},{f(yy)} l6,-8" pathLength="1"/>')
    return '<svg class="draw grass" viewBox="0 0 220 250" aria-hidden="true">' + ''.join(g) + '</svg>'

if __name__ == "__main__":
  import sys
  which = sys.argv[1]
  print({'branch':branch,'fern':fern,'oak':oak,'grass':grass}[which]())
