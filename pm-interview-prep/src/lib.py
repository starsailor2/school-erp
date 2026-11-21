"""Small layout helpers on top of reportlab platypus."""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.fonts import addMapping
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
                                Table, TableStyle, PageBreak, Preformatted, KeepTogether,
                                CondPageBreak, NextPageTemplate)
from reportlab.platypus.tableofcontents import TableOfContents

FD = "/usr/share/fonts/truetype/dejavu/"
pdfmetrics.registerFont(TTFont("Sans", FD + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("Sans-B", FD + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Sans-I", "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Sans-BI", "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf"))
pdfmetrics.registerFont(TTFont("Mono", FD + "DejaVuSansMono.ttf"))
addMapping("Sans", 0, 0, "Sans"); addMapping("Sans", 1, 0, "Sans-B")
addMapping("Sans", 0, 1, "Sans-I"); addMapping("Sans", 1, 1, "Sans-BI")

INK = colors.HexColor("#1f2933")
MUTED = colors.HexColor("#52606d")
ACCENT = colors.HexColor("#0b5cad")
ACCENT_L = colors.HexColor("#e6f0fa")
RULE = colors.HexColor("#cbd2d9")
KIND = {
    "tip": (colors.HexColor("#e8f5ee"), colors.HexColor("#1e7b4f"), "Interview tip"),
    "example": (colors.HexColor("#eef2fb"), colors.HexColor("#2f4fa2"), "Example"),
    "warn": (colors.HexColor("#fdf1e6"), colors.HexColor("#b2560d"), "Common mistake"),
    "q": (colors.HexColor("#f4eefb"), colors.HexColor("#6b3fa0"), "Practice question"),
    "def": (ACCENT_L, ACCENT, "Definition"),
}

ss = {}
ss["body"] = ParagraphStyle("body", fontName="Sans", fontSize=9.6, leading=14, textColor=INK, spaceAfter=5)
ss["h1"] = ParagraphStyle("h1", fontName="Sans-B", fontSize=20, leading=25, textColor=ACCENT, spaceAfter=4)
ss["kicker"] = ParagraphStyle("kicker", fontName="Sans-B", fontSize=9, leading=12, textColor=MUTED, spaceAfter=2)
ss["h2"] = ParagraphStyle("h2", fontName="Sans-B", fontSize=14, leading=18, textColor=INK, spaceBefore=12, spaceAfter=6)
ss["h3"] = ParagraphStyle("h3", fontName="Sans-B", fontSize=11, leading=15, textColor=ACCENT, spaceBefore=8, spaceAfter=4)
ss["bullet"] = ParagraphStyle("bullet", parent=ss["body"], leftIndent=14, bulletIndent=4, spaceAfter=2.5)
ss["cell"] = ParagraphStyle("cell", fontName="Sans", fontSize=8.6, leading=11.5, textColor=INK)
ss["cellh"] = ParagraphStyle("cellh", fontName="Sans-B", fontSize=8.6, leading=11.5, textColor=colors.white)
ss["boxt"] = ParagraphStyle("boxt", fontName="Sans-B", fontSize=8.6, leading=12, spaceAfter=2)
ss["boxb"] = ParagraphStyle("boxb", parent=ss["body"], fontSize=9.2, leading=13, spaceAfter=2.5)
ss["boxbul"] = ParagraphStyle("boxbul", parent=ss["boxb"], leftIndent=12, bulletIndent=2)
ss["code"] = ParagraphStyle("code", fontName="Mono", fontSize=8.2, leading=10.8, textColor=INK)
ss["toc1"] = ParagraphStyle("toc1", fontName="Sans-B", fontSize=10.5, leading=15, leftIndent=0, spaceBefore=5)
ss["toc2"] = ParagraphStyle("toc2", fontName="Sans", fontSize=9.2, leading=12.5, leftIndent=16)

S = []  # the story


class Doc(BaseDocTemplate):
    def __init__(self, fn, **kw):
        super().__init__(fn, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                         topMargin=18*mm, bottomMargin=18*mm, **kw)
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="f")
        self.addPageTemplates([PageTemplate("cover", [fr], onPage=lambda c, d: None),
                               PageTemplate("main", [fr], onPage=self._deco)])

    def beforeDocument(self):
        self._sect = ""

    def _deco(self, c, d):
        c.saveState()
        c.setStrokeColor(RULE); c.setLineWidth(0.5)
        c.line(18*mm, A4[1]-12*mm, A4[0]-18*mm, A4[1]-12*mm)
        c.setFont("Sans", 7.5); c.setFillColor(MUTED)
        c.drawString(18*mm, A4[1]-10.5*mm, "PM Interview Prep — Campus Placements")
        c.drawRightString(A4[0]-18*mm, A4[1]-10.5*mm, getattr(self, "_sect", ""))
        c.drawCentredString(A4[0]/2, 10*mm, str(d.page))
        c.restoreState()

    def afterFlowable(self, f):
        if isinstance(f, Paragraph):
            st = f.style.name
            if st == "h1":
                self._sect = f.getPlainText()
                self.notify("TOCEntry", (0, f.getPlainText(), self.page, getattr(f, "_key", None)))
            elif st == "h2":
                self.notify("TOCEntry", (1, f.getPlainText(), self.page, getattr(f, "_key", None)))


_n = [0]
def _keyed(text, style):
    _n[0] += 1
    k = "k%d" % _n[0]
    para = Paragraph('<a name="%s"/>%s' % (k, text), ss[style])
    para._key = k
    return para

def chapter(kicker, title, intro=None):
    S.append(PageBreak())
    S.append(Paragraph(kicker.upper(), ss["kicker"]))
    S.append(_keyed(title, "h1"))
    S.append(Table([[""]], colWidths=[174*mm], rowHeights=[2],
                   style=[("BACKGROUND", (0, 0), (-1, -1), ACCENT)]))
    S.append(Spacer(1, 8))
    if intro:
        p(intro)

def h2(t):
    S.append(CondPageBreak(60*mm)); S.append(_keyed(t, "h2"))
def h3(t):
    S.append(CondPageBreak(45*mm)); S.append(Paragraph(t, ss["h3"]))
def p(t):
    S.append(Paragraph(t, ss["body"]))
def bl(items, style="bullet"):
    for it in items:
        S.append(Paragraph(it, ss[style], bulletText="•"))
    S.append(Spacer(1, 3))
def nl(items):
    for i, it in enumerate(items, 1):
        S.append(Paragraph(it, ss["bullet"], bulletText="%d." % i))
    S.append(Spacer(1, 3))
def sp(h=6):
    S.append(Spacer(1, h))

def tbl(rows, widths=None, zebra=True):
    W = 174*mm
    n = len(rows[0])
    if widths is None:
        widths = [W/n]*n
    else:
        tot = sum(widths); widths = [W*w/tot for w in widths]
    data = [[Paragraph(str(c), ss["cellh"] if r == 0 else ss["cell"]) for c in row]
            for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1)
    st = [("BACKGROUND", (0, 0), (-1, 0), ACCENT),
          ("VALIGN", (0, 0), (-1, -1), "TOP"),
          ("GRID", (0, 0), (-1, -1), 0.4, RULE),
          ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
          ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5)]
    if zebra:
        for r in range(2, len(rows), 2):
            st.append(("BACKGROUND", (0, r), (-1, r), colors.HexColor("#f5f7fa")))
    t.setStyle(TableStyle(st))
    S.append(t); S.append(Spacer(1, 8))

def box(kind, lines, title=None):
    bg, fg, default = KIND[kind]
    st = ParagraphStyle("bt", parent=ss["boxt"], textColor=fg)
    inner = [Paragraph((title or default).upper(), st)]
    for ln in ([lines] if isinstance(lines, str) else lines):
        if ln.startswith("- "):
            inner.append(Paragraph(ln[2:], ss["boxbul"], bulletText="•"))
        else:
            inner.append(Paragraph(ln, ss["boxb"]))
    t = Table([[inner]], colWidths=[174*mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg),
                           ("LINEBEFORE", (0, 0), (0, -1), 3, fg),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                           ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    S.append(t); S.append(Spacer(1, 8))

def code(txt):
    pre = Preformatted(txt.strip("\n"), ss["code"])
    t = Table([[pre]], colWidths=[174*mm])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f4f5f7")),
                           ("BOX", (0, 0), (-1, -1), 0.4, RULE),
                           ("LEFTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 6),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
    S.append(t); S.append(Spacer(1, 8))
