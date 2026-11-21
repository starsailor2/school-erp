from lib import *

def build():
    chapter("Day 3", "Product Case Studies",
            "Case interviews are where most campus PM candidates are selected or rejected. Interviewers judge four things: "
            "<b>structure</b> (do you have a logical approach?), <b>user empathy</b> (do you understand real people?), "
            "<b>prioritisation</b> (can you choose and justify?), and <b>communication</b> (can they follow you?). "
            "This chapter gives you a framework for each question type plus fully worked examples.")

    h2("Quick map: identify the question type in 10 seconds")
    tbl([["If the question sounds like...", "It is a...", "Framework"],
         ["\"Design a ___ for ___\"", "Product design", "CIRCLES"],
         ["\"How would you improve ___?\"", "Product improvement", "8-step improvement (Day 2)"],
         ["\"How many ___ are there in ___?\" / \"Estimate the market for ___\"", "Market sizing / guesstimate", "Top-down or bottom-up tree"],
         ["\"Metric X dropped by Y%. Why?\"", "Root cause analysis (RCA)", "Clarify → internal/external → segment → funnel"],
         ["\"You have 5 features and capacity for 2. Which?\"", "Feature prioritisation", "Goal → criteria → score → decide"],
         ["\"Should we do A or B?\" / \"X goes up but Y goes down\"", "Trade-off decision", "Goal → impact on each → long-term → decide"],
         ["\"Should company X enter market Y?\"", "Strategy", "3C / Porter / build-buy-partner"],
         ["\"How would you measure success of ___?\"", "Metrics", "Goal → NSM → input metrics → guardrails"]],
        [2.6, 1.5, 2])

    # ---------- design
    h2("1. Product Design Questions")
    h3("The CIRCLES Method (Lewis C. Lin)")
    tbl([["Letter", "Step", "What to say / do"],
         ["C", "Comprehend the situation", "What is it? Who is it for? Why are we building it? Any constraints (platform, time, budget)?"],
         ["I", "Identify the customer", "List user personas; choose one target persona and justify the choice."],
         ["R", "Report customer needs", "Write user stories: \"As a ___, I want ___ so that ___.\""],
         ["C", "Cut through prioritisation", "Choose the most important 1-2 needs."],
         ["L", "List solutions", "Brainstorm at least 3 solutions — include one creative/bold one."],
         ["E", "Evaluate trade-offs", "Pros/cons of each: impact, effort, risk."],
         ["S", "Summarise recommendation", "What you would build, why, and how you would measure it."]], [0.6, 1.6, 4])
    h3("Worked example — \"Design a product to help college students get internships\"")
    bl(["<b>Comprehend:</b> Is this a new app or a feature inside an existing platform (e.g. LinkedIn, Unstop, Internshala)? "
        "I will assume a new mobile-first product in India. Goal: help students land relevant internships; business model "
        "later (company-paid listings).",
        "<b>Customers:</b> (1) Tier-1 college students with placement cells; (2) <b>Tier-2/3 college students with weak "
        "placement support</b>; (3) recruiters/startups; (4) placement officers. Pick (2): biggest group (most of India's "
        "~4 crore higher-education students), most underserved.",
        "<b>Needs (user stories):</b> As a Tier-2 student I want to... know which roles fit my skills; find genuine (not "
        "scam/unpaid-forever) internships; get my resume noticed; prepare for interviews; get feedback when rejected.",
        "<b>Prioritise:</b> \"Get noticed + know what to apply for\" — without visibility, nothing else matters.",
        "<b>Solutions:</b> (A) Skill-verified profile — short project-based assessments instead of resume keywords, so "
        "recruiters trust Tier-2 talent; (B) AI resume and application coach; (C) Verified-company badge and stipend "
        "transparency; (D) Alumni referral marketplace; (E) Bold: \"Micro-internships\" — 1-week paid projects as a trial.",
        "<b>Evaluate:</b> A has highest impact (fixes recruiter trust problem — the real bottleneck) with medium effort; E is "
        "differentiated but needs supply of companies; B is easy but commoditised.",
        "<b>Summarise:</b> Build skill-verified profiles + micro-internships for 3 roles (data analyst, marketing, "
        "developer). Metrics: % students getting at least one interview call in 30 days (NSM: successful placements/month), "
        "recruiter response rate, repeat recruiters. Risks: cheating on assessments (proctoring), cold-start of recruiters "
        "(start with startups via partnerships)."])
    box("tip", ["For design questions, sketching even a rough 3-screen wireframe on paper (Home → Core action → Result) "
                "makes a strong impression. State the MVP clearly and what you would leave for version 2."])
    box("q", ["More design questions to practise:",
              "- Design an alarm clock for visually impaired users.",
              "- Design a fridge for a smart home.",
              "- Design a product for elderly people living alone in Indian cities.",
              "- Design Google Maps for two-wheeler riders.",
              "- Design a vending machine for a college campus."])

    # ---------- improvement
    h2("2. Product Improvement Questions")
    p("Use the 8-step structure from Day 2 (Clarify → Goal → Users → Pain points → Prioritise → Solutions → Prioritise → Metrics). "
      "Key differences from design questions:")
    bl(["The product <b>already exists</b>, so show you know it: mention current features and recent changes.",
        "Start with <b>the business goal</b>; improvements are judged against a metric.",
        "Look for pain points in the <b>existing user journey</b> — walk through it screen by screen.",
        "Consider the company's strategy (e.g. Meta pushing Reels/AI; Swiggy pushing Instamart)."])
    box("warn", ["Jumping to solutions in the first minute (\"I would add dark mode\"). Interviewers want the reasoning "
                 "chain: who → what problem → why this one → what solution → how you measure it.",
                 "Choosing \"all users\" as the segment. Always narrow down."])
    box("q", ["Favourite-product question (very common at campus interviews): \"Tell me about your favourite product and how "
              "you would improve it.\" Prepare one product deeply: why you love it (specific design choices), its "
              "business model, its metrics, one weakness, and one improvement with metrics."])

    # ---------- market sizing
    h2("3. Market Sizing (Guesstimates)")
    p("Interviewers do not care about the exact answer. They evaluate whether your <b>approach is logical, assumptions "
      "are reasonable and stated out loud, maths is clean</b>, and you sanity-check the result.")
    h3("Key terms")
    bl(["<b>TAM</b> (Total Addressable Market) — total demand if you had 100% share.",
        "<b>SAM</b> (Serviceable Available Market) — part of TAM your product/business model can serve (geography, segment).",
        "<b>SOM</b> (Serviceable Obtainable Market) — realistic share you can capture in a few years."])
    h3("Two approaches")
    tbl([["Top-down", "Bottom-up"],
         ["Start from population → filter by segments → multiply by usage/price", "Start from a unit (one store, one user) → multiply up"],
         ["Fast, good for consumer markets", "More credible, good for B2B or supply-side questions"],
         ["Ex: India population → urban → smartphone users → buy online", "Ex: one dark store does 1,500 orders/day × number of dark stores"]], [1, 1])
    h3("India numbers worth memorising (rounded, for estimation)")
    tbl([["Fact", "Approx. value"],
         ["Population of India", "~145 crore (1.45 billion)"],
         ["Households", "~30 crore (avg ~4.5-5 people)"],
         ["Urban population share", "~35-36%"],
         ["Smartphone users", "~70-75 crore"],
         ["Internet users", "~90 crore"],
         ["Monthly UPI transactions", "~2,000 crore (20 billion)"],
         ["Tier-1 metros (8 big cities) population", "~10-11 crore"],
         ["Population of Mumbai / Delhi NCR / Bengaluru", "~2.1 crore / ~3.3 crore / ~1.4 crore"],
         ["Higher-education students", "~4.3 crore"],
         ["Life expectancy", "~70 years"]], [3, 2])
    p("<i>Tip: use 1 crore = 10 million; 1 lakh = 100,000. Round aggressively (1.45 billion → 1.4 or 1.5) to keep maths easy.</i>")
    h3("Worked example 1 — Cups of tea sold daily at tea stalls (tapris) in Bengaluru")
    code("""
Population of Bengaluru                          ~1.4 crore = 14 million
Remove children under 15 (~25%)                  -> 10.5 million adults
Share who drink tea at a stall on a given day    -> assume 30%  (rest: coffee, home tea)
                                                 -> ~3.2 million people
Cups per stall-drinker per day                   -> avg 1.5
Total                                            -> ~4.7 million cups/day
Sanity check (bottom-up): ~25,000 stalls x ~200 cups/day = 5 million.  Close enough.
Market value: 4.7M x Rs 15 = ~Rs 7 crore/day = ~Rs 2,500 crore/year
""")
    h3("Worked example 2 — Annual market size of quick commerce in Tier-1 Indian cities (GMV)")
    code("""
Households in 8 Tier-1 cities      ~10.5 crore people / 4 per HH       = ~2.6 crore HH
Households in serviceable areas    ~70%                                = ~1.8 crore HH
Share using quick commerce monthly ~40% (middle/upper income + smartphone)= ~73 lakh HH
Orders per active HH per month     ~6
Average order value (AOV)          ~Rs 500
Monthly GMV  = 73 lakh x 6 x 500    = ~Rs 2,200 crore
Annual GMV   = ~Rs 26,000 crore  (~USD 3 billion)
Sanity check: public reports put total Indian Q-commerce GMV at ~USD 6-7B (FY25) incl.
Tier-2 and heavier users -> our Tier-1 estimate is in a plausible range.
""")
    h3("Worked example 3 — Number of smartphones sold in India per year")
    code("""
Smartphone users                ~70 crore
Average replacement cycle       ~2.5-3 years   -> replacements = 70 / 2.75 = ~25 crore? too high
Refine: not everyone replaces on a cycle; many hand-me-downs. Use 4 yrs  -> ~17.5 crore
New first-time users per year   ~2 crore
Estimate                         ~15-19 crore units/year  (industry data: ~15 crore) -> good.
""")
    box("tip", ["Structure: (1) clarify the exact definition (units or value? which geography? per day or year?), "
                "(2) state approach, (3) draw the tree, (4) calculate with round numbers, (5) sanity-check with a second "
                "method, (6) state what assumption the answer is most sensitive to."])
    box("q", ["Practise: number of Uber rides in Delhi daily • Revenue of a petrol pump in a highway town • Number of "
              "laptops sold in India per year • Diapers used in India per year • Market size for a college laundry app."])

    # ---------- RCA
    h2("4. Root Cause Analysis (Metric Drop / Spike)")
    p("\"Metric X dropped by Y%. Investigate.\" These test analytical rigour. Never guess the cause immediately — "
      "follow a funnel from broad to narrow.")
    h3("Step-by-step framework")
    nl(["<b>Clarify the metric</b> — exact definition (orders placed or delivered?), how it is measured, by how much, over what "
        "period (sudden 1-day drop or gradual over weeks?), compared with what (week-on-week, year-on-year?).",
        "<b>Check data validity</b> — is it real? Tracking bug, logging change, dashboard error, new app version breaking analytics, "
        "time-zone issues. (A large share of real-world \"drops\" are data issues.)",
        "<b>Seasonality / time</b> — festivals, exams, weekends, month-end salary effects, monsoon, IPL final.",
        "<b>External factors</b> — competitor launch or discount, regulation, news/PR crisis, outages of partners "
        "(payment gateways, UPI downtime), economic change, app-store ranking change.",
        "<b>Internal factors</b> — recent releases, pricing changes, marketing campaign ended, policy changes, infra outages, "
        "supply-side issues.",
        "<b>Segment the drop</b> — by geography, platform (Android/iOS/web), app version, new vs existing users, user "
        "demographics, acquisition channel, category, device. Find where the drop is concentrated.",
        "<b>Walk the funnel</b> — which step of the user journey lost users?",
        "<b>Form hypotheses, validate with data, propose fixes</b> — prioritise hypotheses by likelihood and ease of checking."])
    h3("Supporting tools")
    bl(["<b>5 Whys</b> — keep asking why until you hit a root cause, not a symptom.",
        "<b>Fishbone (Ishikawa) diagram</b> — group causes into People, Process, Product/Tech, Pricing, Place, Partners.",
        "<b>Metric decomposition</b> — e.g. Revenue = Users × Conversion × AOV; check which component changed."])
    h3("Worked example — \"Instagram Reels watch time dropped 10% week-on-week\"")
    bl(["Clarify: global or India? total watch time or per user? Answer: India, total, sudden drop starting Tuesday.",
        "Data: check whether the logging pipeline changed with the latest app release → no issues found.",
        "Decompose: total watch time = DAU × % DAU watching Reels × sessions × time per session. Finding: DAU flat, time per "
        "session down 15%.",
        "Segment: drop is concentrated on Android, app version 3xx.x released Monday.",
        "Hypothesis: new version introduced a bug — e.g. videos buffering longer / autoplay broken / ranking model change.",
        "Validate: video start-time latency up 2s on that version; buffering rate doubled.",
        "Action: roll back or hotfix; add latency as a guardrail metric in release checks; post-mortem."])
    box("tip", "Talk in hypotheses: \"If it were a tracking issue, I would expect X; if it were a competitor, I would expect "
               "a gradual drop concentrated in Y segment.\" This shows scientific thinking.")

    # ---------- feature prioritisation
    h2("5. Feature Prioritisation Cases")
    p("Example: \"You are the PM for Swiggy Instamart. Engineering can build only 2 of these 5 this quarter: (1) scheduled "
      "deliveries, (2) live chat with rider, (3) recipe-to-cart, (4) price-drop alerts, (5) membership-exclusive deals. Which "
      "two and why?\"")
    nl(["<b>Clarify the goal</b> — say the company goal this quarter is increasing order frequency (retention).",
        "<b>Define criteria</b> — impact on order frequency, reach, effort, confidence, strategic fit / differentiation.",
        "<b>Score quickly</b> (state rough assumptions):"])
    tbl([["Feature", "Impact on frequency", "Reach", "Effort", "Confidence", "Verdict"],
         ["Scheduled deliveries", "High — captures planned shopping", "Medium", "High (ops)", "Medium", "Next quarter"],
         ["Live chat with rider", "Low — helps CX, not frequency", "High", "Medium", "High", "No"],
         ["Recipe-to-cart", "Medium-High — new use case, larger baskets", "Medium", "Medium", "Medium", "<b>Yes</b>"],
         ["Price-drop alerts", "High — re-engagement trigger", "High", "Low", "High", "<b>Yes</b>"],
         ["Member deals", "Medium — only for members", "Low", "Low", "Medium", "Later"]], [1.6, 2.2, 0.8, 0.9, 0.9, 1])
    nl(["<b>Decide and justify</b> — Price-drop alerts (quick win: low effort, high reach, direct trigger to reopen app) + "
        "Recipe-to-cart (differentiated, increases frequency and basket size).",
        "<b>Mention what you would revisit</b> — scheduled delivery is high-value but effort-heavy; plan for next quarter.",
        "<b>Metrics</b> — orders per user per week, alert click-to-order rate, notification opt-outs (guardrail)."])

    # ---------- trade-offs
    h2("6. Trade-off Decisions")
    p("Trade-off questions have no right answer — interviewers test judgment. Example prompts: \"Instagram can increase ad "
      "load by 10% to raise revenue, but time spent may drop 2%. Should it?\" or \"YouTube Shorts is growing but long-form "
      "watch time is dropping. What do you do?\"")
    h3("Framework")
    nl(["<b>Clarify</b> both sides with numbers: how big is each effect, over what time frame, for which users?",
        "<b>Anchor to company goal and strategy</b> — what does the company care about most right now (growth stage vs "
        "profitability stage)?",
        "<b>Quantify short-term vs long-term</b> — revenue now vs engagement/retention (lifetime value) later; which effect compounds?",
        "<b>Consider all stakeholders</b> — users, creators/sellers, advertisers, partners, regulators.",
        "<b>Look for a third option</b> — segment (show more ads only to highly engaged users), test, phase it, mitigate.",
        "<b>Decide</b>, state the metrics and the threshold that would make you reverse the decision."])
    h3("Worked example — More ads on Instagram feed")
    bl(["+10% ad load ≈ +8-10% ad revenue immediately. -2% time spent → fewer future ad impressions, and if it signals "
        "users disliking the experience, churn risk compounds over months.",
        "Meta is in a profitability-focused phase but engagement is its long-term moat against TikTok/YouTube.",
        "Third option: increase ad load only where ad relevance scores are high, or in Reels/Stories where ads feel native; "
        "improve ad quality instead of quantity.",
        "Decision: run a long-term holdout A/B test (at least 8-12 weeks, since short tests miss gradual fatigue). Proceed if "
        "net revenue per user over the period is positive AND 28-day retention drop is less than 0.5%."])
    tbl([["Common trade-off", "Things to weigh"],
         ["Speed vs quality", "Cost of a bug vs cost of delay; reversible decisions can move faster"],
         ["Growth vs profitability", "Company stage, funding, unit economics, competition"],
         ["Users vs advertisers / sellers", "Marketplace balance; long-term trust"],
         ["Personalisation vs privacy", "Regulation (DPDP Act 2023 in India), user trust"],
         ["New feature vs tech debt", "Velocity loss from debt; incident rate"],
         ["Simplicity vs power-user features", "Core segment; progressive disclosure"],
         ["Cannibalisation", "Will the new product eat the old? Better you than a competitor"]], [2, 4])

    # ---------- 5 cases
    h2("7. Practise 5 Cases Under Interview Conditions")
    p("<b>Rules:</b> set a 25-minute timer per case; speak aloud (record yourself on your phone or practise with a friend "
      "acting as interviewer); write a structure in the first 2 minutes on paper; no notes or internet. After each, "
      "score yourself with the rubric below and compare with the outline.")
    tbl([["Criterion", "1 (weak)", "3 (okay)", "5 (strong)"],
         ["Structure", "Random ideas", "Framework but rigid", "Clear, adapted framework, signposted"],
         ["Clarifying questions", "None", "Some, generic", "Few, sharp, change the answer"],
         ["User empathy", "\"All users\"", "Segments listed", "Specific persona with real pain points"],
         ["Prioritisation", "No decision", "Decision, weak reason", "Explicit criteria, committed choice"],
         ["Creativity", "Obvious ideas", "Some variety", "At least one bold, relevant idea"],
         ["Metrics", "None", "Generic (DAU)", "NSM + input + guardrail, how to test"],
         ["Communication", "Rambling", "Mostly clear", "Concise, summarises, checks in with interviewer"]],
        [1.4, 1.2, 1.6, 2.2])

    cases = [
        ("Case 1 (Design) — Design a parking app for a busy Indian city market area",
         ["Clarify: for drivers or parking lot owners? car or two-wheeler? (Assume car drivers, Delhi/Mumbai markets.)",
          "Users: daily commuters, weekend shoppers, cab drivers, lot owners. Pick weekend shoppers.",
          "Pains: no idea where space is free, circling for 20 min, overcharging by attendants, cash-only payment, fear of towing.",
          "Solutions: live availability map (sensors/attendant app), pre-book slot, UPI payment with fixed digital receipt, "
          "\"valet at market entry\" bold idea.",
          "MVP: attendant-updated availability + pre-booking + UPI in 3 markets. Two-sided cold start: onboard lots first.",
          "Metrics: time-to-park, bookings per week, repeat users, lot occupancy (supply side)."]),
        ("Case 2 (Improvement) — Improve Google Pay for first-time users in Tier-3 towns",
         ["Goal: activation (first successful transaction within 7 days).",
          "Pains: fear of losing money, UPI PIN setup confusing, English UI, bank linking errors, no one to ask.",
          "Solutions: vernacular voice-guided onboarding, ₹1 practice payment to a trusted contact, assisted setup through "
          "local kirana merchants, clear failure messages.",
          "Pick: voice-guided vernacular onboarding + ₹1 practice payment. Metrics: setup completion rate, D7 first transaction, "
          "support tickets per new user."]),
        ("Case 3 (Market sizing) — Estimate the annual revenue of food delivery in Pune",
         ["Population ~75 lakh → ~18 lakh households (avg 4).",
          "Households ordering online at least monthly ~30% → ~5.4 lakh. Plus students/bachelors in PGs ~3 lakh individuals.",
          "Orders/month: families 4, bachelors 8 → 21.6 + 24 = ~45 lakh orders/month.",
          "AOV ~₹400 → GMV ~₹180 crore/month → ~₹2,200 crore/year. Platform take rate ~25% → ~₹550 crore platform revenue.",
          "Sanity-check with restaurant side: ~8,000 active restaurants × ~19 orders/day ≈ 45 lakh/month. Consistent."]),
        ("Case 4 (RCA) — Zomato's average delivery time rose by 8 minutes this week in Bengaluru",
         ["Clarify: all areas? all hours? Sudden or gradual?",
          "Data: change in how delivery time is measured? New app version logging?",
          "External: heavy rains (monsoon), road closures/metro construction, a big event, competitor poaching riders with incentives.",
          "Internal: rider incentive change, new batching algorithm (multiple orders per rider), restaurant prep-time increase, "
          "a big promo creating demand spike.",
          "Decompose: delivery time = restaurant prep + rider assignment wait + pickup travel + drop travel. Find which leg grew.",
          "Example finding: rider-assignment wait up 6 min → fewer riders online after incentive cut → fix incentives in peak hours."]),
        ("Case 5 (Trade-off) — Should Spotify make lyrics a Premium-only feature in India?",
         ["Pro: creates a visible reason to upgrade (Spotify did test this globally in 2024).",
          "Con: lyrics drive engagement (sing-along, regional music discovery); free users may switch to YouTube Music, "
          "which shows lyrics free. India's free base is the future paid funnel.",
          "Third option: limit free lyrics (e.g. a few songs per day), or keep free for regional songs while gating "
          "features like translation/lyrics-cards.",
          "Decision: A/B test the limited-lyrics model; success if conversion rises ≥ X% with listening-time drop under "
          "1% and no increase in free-user churn."]),
    ]
    for title, lines in cases:
        box("q", ["<b>%s</b>" % title, "<i>Model answer outline (try it yourself before reading):</i>"] + ["- " + l for l in lines],
            title="Timed case — 25 minutes")
