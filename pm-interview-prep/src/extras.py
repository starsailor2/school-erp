from lib import *

def build():
    chapter("Bonus", "Other Topics Asked in PM Interviews",
            "Beyond the day-wise plan, campus PM interviews regularly touch the topics below. Skim them so no question "
            "catches you off guard.")

    h2("1. Execution: PRDs, User Stories and Agile")
    h3("PRD (Product Requirements Document) — typical sections")
    nl(["Problem statement and background (why now?)", "Goals and success metrics (and non-goals)",
        "Target users and personas", "User stories and use cases", "Functional requirements (with priority — MoSCoW)",
        "Non-functional requirements (performance, security, accessibility)", "Designs / wireframes",
        "Dependencies, risks and open questions", "Launch plan and timeline"])
    h3("User stories and acceptance criteria")
    p("<b>Format:</b> As a <i>[user]</i>, I want <i>[action]</i> so that <i>[benefit]</i>. "
      "<b>Acceptance criteria</b> (Given-When-Then): <i>Given</i> I have items in cart, <i>when</i> I tap \"Pay with UPI\", "
      "<i>then</i> my UPI app opens with the exact amount pre-filled. Good stories follow <b>INVEST</b>: Independent, "
      "Negotiable, Valuable, Estimable, Small, Testable.")
    h3("Agile / Scrum basics")
    tbl([["Term", "Meaning"],
         ["Sprint", "Fixed time-box (usually 2 weeks) to deliver a working increment"],
         ["Product backlog", "Prioritised list of everything that might be built; owned by PM/PO"],
         ["Sprint planning / Daily stand-up / Review / Retrospective", "The four Scrum ceremonies"],
         ["Story points", "Relative effort estimate (Fibonacci 1, 2, 3, 5, 8...)"],
         ["Velocity", "Story points completed per sprint"],
         ["Kanban", "Continuous flow with work-in-progress limits instead of sprints"],
         ["MVP", "Smallest product that lets you learn whether the core value works"],
         ["Waterfall", "Sequential phases; suits fixed, well-understood requirements"]], [2.2, 3.8])

    h2("2. User Research and Design Thinking")
    bl(["<b>Design thinking:</b> Empathise → Define → Ideate → Prototype → Test.",
        "<b>Qualitative methods:</b> user interviews, usability testing, contextual inquiry, diary studies — tell you <i>why</i>.",
        "<b>Quantitative methods:</b> surveys, analytics, A/B tests — tell you <i>what</i> and <i>how many</i>.",
        "<b>Personas</b> and <b>user journey maps</b> summarise research.",
        "<b>Jobs-to-be-Done:</b> \"When <i>[situation]</i>, I want to <i>[motivation]</i>, so I can <i>[outcome]</i>.\"",
        "Good interview questions are open, about past behaviour (\"Tell me about the last time you...\"), not hypothetical "
        "(\"Would you use...?\") — see <i>The Mom Test</i>.",
        "<b>Nielsen's usability heuristics</b> (know a few): visibility of system status, match with real world, user control, "
        "consistency, error prevention, recognition over recall."])

    h2("3. Go-to-Market (GTM), Pricing and Business Models")
    tbl([["Topic", "Key points"],
         ["GTM plan", "Target segment, positioning/messaging, channels (organic, paid, referral, partnerships, sales), pricing, launch "
                      "sequencing (beta → city → national), success metrics"],
         ["Pricing strategies", "Cost-plus, value-based, competitor-based, freemium, penetration (low to gain share — Jio), "
                                "skimming (high then lower — iPhone), sachet/micro-pricing, dynamic (Uber surge), bundling"],
         ["Business models", "Subscription (Netflix), advertising (Instagram), marketplace commission (Swiggy, Amazon), transaction fee "
                             "(Razorpay), freemium (Spotify), SaaS per seat (Zoho, Freshworks), hardware + services (Apple)"],
         ["Growth loops", "Viral (invite friends — referrals in CRED), content (user content attracts users — YouTube), paid "
                          "(revenue funds ads), sales-led"],
         ["AARRR (Pirate metrics)", "Acquisition, Activation, Retention, Referral, Revenue — use to structure growth questions"],
         ["Network effects", "Direct (WhatsApp — more users, more value), indirect / two-sided (Swiggy — more restaurants attract "
                             "more users and vice versa)"]], [1.5, 4.5])

    h2("4. Technical Basics for Non-CS PMs")
    tbl([["Concept", "One-line explanation"],
         ["Client-server", "App (client) sends requests to servers that store data and run logic"],
         ["API", "A contract that lets two systems talk (e.g. Swiggy calls Google Maps API for routes)"],
         ["Frontend / Backend / Database", "What users see / business logic / where data is stored (SQL vs NoSQL)"],
         ["Latency", "Time to respond; every extra 100 ms can reduce conversion"],
         ["Caching / CDN", "Store frequently used data close to the user for speed"],
         ["Scalability", "Handle more load: vertical (bigger server) vs horizontal (more servers)"],
         ["Cloud", "Renting compute/storage (AWS, Azure, GCP) instead of owning servers"],
         ["Microservices", "App split into small independent services"],
         ["Feature flags", "Turn features on/off for a % of users without a new release"],
         ["What happens when you type a URL", "DNS lookup → TCP/TLS connection → HTTP request → server response → browser renders"],
         ["AI/ML basics", "Training vs inference; precision vs recall; LLMs, prompts, hallucination, evaluation, cost per query"]], [2, 4])

    h2("5. AI Product Management (increasingly asked)")
    bl(["<b>When to use AI:</b> the problem involves prediction, personalisation, language or perception, and errors are tolerable or catchable.",
        "<b>Metrics:</b> model quality (accuracy, precision/recall, human eval scores) + product metrics (task success, time saved, "
        "retention) + guardrails (hallucination rate, safety incidents, latency, cost per request).",
        "<b>Trade-offs:</b> quality vs latency vs cost; automation vs human-in-the-loop; personalisation vs privacy.",
        "<b>Design:</b> set user expectations, show sources/confidence, easy correction and feedback, graceful fallback.",
        "Example question: \"How would you add an AI assistant to Swiggy?\" → goal (order conversion for undecided users), "
        "use case (\"suggest dinner for 4 under ₹800, one vegetarian\"), risks (wrong dietary info), metrics."])

    h2("6. Behavioural and HR Questions")
    p("Use the <b>STAR</b> format: <b>S</b>ituation, <b>T</b>ask, <b>A</b>ction (most of your time — what <i>you</i> did), "
      "<b>R</b>esult (quantified) — plus what you learned. Prepare 5-6 stories from projects, internships, clubs, fests "
      "and reuse them across questions.")
    tbl([["Question", "What they are testing"],
         ["Why product management?", "Genuine motivation; link to an experience where you solved a user problem"],
         ["Tell me about a product you love / dislike", "Product sense, depth of observation"],
         ["Tell me about a time you led without authority", "Influence — the core PM skill"],
         ["Describe a conflict with a teammate", "Empathy, data-driven resolution, maturity"],
         ["Tell me about a failure", "Ownership, learning; avoid fake failures"],
         ["A time you used data to make a decision", "Analytical thinking"],
         ["How do you say no to a stakeholder?", "Prioritisation with reasoning, alternatives offered"],
         ["Where do you see yourself in 5 years?", "Commitment to the PM path"],
         ["Why this company?", "Research: product, recent launches, competitors, metrics"]], [2.6, 3.4])
    box("tip", ["Before each interview, research the company: use the product for a week, read the last 3 months of news, "
                "know the business model, main competitors, and have one improvement idea ready. Prepare 2-3 sharp "
                "questions to ask the interviewer (e.g. \"How do PMs here decide between growth and profitability work?\")."])

    chapter("Revision", "Last-Minute Cheat Sheet")
    tbl([["Topic", "Remember"],
         ["Lifecycle", "Intro → Growth → Maturity → Decline; dev cycle: Discover → Define → Design → Build → Test → Launch → Iterate"],
         ["PM vs Project M.", "What &amp; why (outcomes) vs how &amp; when (outputs)"],
         ["PMF", "Flattening retention curve; Sean Ellis ≥ 40% \"very disappointed\"; organic growth"],
         ["RICE", "(Reach × Impact × Confidence) ÷ Effort"],
         ["MoSCoW", "Must, Should, Could, Won't (this time)"],
         ["North Star", "Single metric of customer value that leads revenue; + input metrics + guardrails"],
         ["Strategy", "Mission → Vision → Strategy → OKRs → Roadmap → Execution"],
         ["Improvement", "Clarify → Goal → Users → Pains → Prioritise → Solutions → Prioritise → Metrics/Risks"],
         ["Design", "CIRCLES: Comprehend, Identify, Report needs, Cut, List, Evaluate, Summarise"],
         ["Market sizing", "Clarify → top-down/bottom-up tree → round numbers → sanity check"],
         ["RCA", "Clarify → data validity → seasonality → external/internal → segment → funnel → hypotheses"],
         ["Trade-off", "Quantify both sides, short vs long term, stakeholders, third option, decide + reversal threshold"],
         ["Metrics", "Stickiness = DAU/MAU; LTV = ARPU × margin ÷ churn; LTV:CAC ≥ 3"],
         ["A/B test", "Hypothesis, 1 primary metric, guardrails, sample size (n ≈ 16p(1−p)/δ<super>2</super>), ≥ 1-2 weeks, no peeking, check SRM"],
         ["Stats", "p &lt; 0.05 → reject H0; Type I = false positive (α); power 80%"],
         ["SQL", "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY; LEFT JOIN + IS NULL; CTEs; ROW_NUMBER/RANK/LAG"],
         ["Behavioural", "STAR, quantified results, 5-6 reusable stories"]], [1.4, 4.6])
    h2("Golden rules in every case interview")
    nl(["Pause 30-60 seconds to structure; ask if you may take a moment.",
        "Ask 2-3 clarifying questions that actually change your answer.",
        "State the goal and the user before solutions.",
        "Think out loud and signpost (\"There are three parts to my answer...\").",
        "Always prioritise and commit to a recommendation.",
        "Always attach metrics (primary + guardrail) and risks.",
        "Check in with the interviewer (\"Does this direction make sense, or would you like me to go deeper on X?\").",
        "Close with a 20-second summary."])
    h2("Recommended resources")
    bl(["<b>Books:</b> <i>Decode and Conquer</i> (Lewis C. Lin), <i>Cracking the PM Interview</i> (McDowell &amp; Bavaro), "
        "<i>Inspired</i> (Marty Cagan), <i>The Lean Product Playbook</i> (Dan Olsen), <i>Hooked</i> (Nir Eyal), <i>The Mom Test</i> (Rob Fitzpatrick).",
        "<b>Practice:</b> mock interviews with peers; Exponent and Product Alliance-style question banks; Lenny's Newsletter; "
        "SQL practice on LeetCode (Database), HackerRank, StrataScratch, DataLemur.",
        "<b>Indian context:</b> company blogs/engineering blogs of Swiggy, Zomato, Flipkart, CRED, Razorpay; quarterly shareholder letters "
        "(Zomato/Eternal, Swiggy) for real metrics."])
