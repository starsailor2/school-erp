import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from lib import *
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, NextPageTemplate, PageBreak
import day2, day3, day4, extras

out = sys.argv[1] if len(sys.argv) > 1 else "PM_Interview_Prep_Guide.pdf"

# cover
cov_t = ParagraphStyle("ct", fontName="Sans-B", fontSize=30, leading=36, textColor=ACCENT)
cov_s = ParagraphStyle("cs", fontName="Sans", fontSize=13, leading=19, textColor=MUTED)
S.append(Spacer(1, 60*mm))
S.append(Paragraph("Product Management<br/>Interview Prep Guide", cov_t))
S.append(Spacer(1, 8))
S.append(Paragraph("Campus placements · APM / Associate PM / Product Analyst roles", cov_s))
S.append(Spacer(1, 18))
S.append(Table([[""]], colWidths=[60*mm], rowHeights=[3], style=[("BACKGROUND", (0, 0), (-1, -1), ACCENT)]))
S.append(Spacer(1, 18))
for line in ["<b>Day 2</b> — PM fundamentals: lifecycle, PMF, RICE / MoSCoW, North Star, strategy; improve Blinkit, Instagram, Spotify",
             "<b>Day 3</b> — Case studies: design, improvement, market sizing, root cause, prioritisation, trade-offs; 5 timed cases",
             "<b>Day 4</b> — Analytics: DAU/MAU, retention, funnels, cohorts, A/B &amp; hypothesis testing, SQL; Blinkit 20% order drop",
             "<b>Bonus</b> — PRDs &amp; Agile, user research, GTM &amp; pricing, tech basics, AI PM, behavioural questions, cheat sheet"]:
    S.append(Paragraph(line, ParagraphStyle("cl", parent=ss["body"], fontSize=10.5, leading=16, spaceAfter=6)))
S.append(NextPageTemplate("main"))
S.append(PageBreak())

# toc
S.append(Paragraph("Contents", ParagraphStyle("tt", parent=ss["h1"])))
S.append(Spacer(1, 6))
toc = TableOfContents(); toc.levelStyles = [ss["toc1"], ss["toc2"]]; toc.dotsMinLevel = 0
S.append(toc)
S.append(Spacer(1, 10))
box("tip", ["<b>How to use this guide.</b> Read each section, then close the PDF and explain the concept aloud in under 2 minutes. "
            "Attempt every practice question before reading the outline. Indian market numbers are rounded estimates for "
            "practice — say \"I will assume...\" in interviews rather than quoting them as facts."], title="Before you start")

day2.build(); day3.build(); day4.build(); extras.build()

doc = Doc(out, title="PM Interview Prep Guide", author="PM Interview Prep", subject="Product management interview preparation")
doc.multiBuild(S)
print("wrote", out)
