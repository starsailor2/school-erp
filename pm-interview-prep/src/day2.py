from lib import *

def build():
    chapter("Day 2", "Product Management Fundamentals",
            "This day builds the vocabulary every PM interviewer assumes you know. For each concept, learn (1) a crisp "
            "one-line definition, (2) a framework you can draw on a whiteboard, and (3) one Indian-market example you can "
            "talk about for two minutes. Interviewers for APM / Associate PM / Business Analyst-PM roles test whether you "
            "can <b>think in users, metrics and trade-offs</b>, not whether you can recite textbook lines.")

    # ---------------- lifecycle
    h2("1. Product Lifecycle")
    p("The word \"lifecycle\" is used in two ways in interviews. Clarify which one is being asked, or cover both briefly.")
    h3("A. Product Life Cycle (market view: how a product ages in the market)")
    tbl([["Stage", "What is happening", "PM focus", "Key metrics", "Example"],
         ["Introduction", "New product, low awareness, high cost, few users", "Find product-market fit, learn fast, talk to users",
          "Activation, early retention, qualitative feedback", "Threads (2023), early ONDC apps"],
         ["Growth", "Demand rising fast, competitors enter", "Scale infra, acquisition channels, onboarding, new segments",
          "User growth rate, CAC, retention by cohort", "Quick-commerce (Blinkit, Zepto) 2022-25"],
         ["Maturity", "Growth slows, market saturated", "Differentiate, increase ARPU, efficiency, cross-sell, loyalty",
          "Market share, ARPU, margin, churn", "WhatsApp, Instagram, Swiggy food delivery"],
         ["Decline", "Users shift to substitutes", "Harvest, sunset, pivot or reinvent", "Churn, revenue per user, cost to serve",
          "Orkut, Nokia feature phones, DVDs"]],
        [1.1, 1.6, 1.8, 1.6, 1.5])
    h3("B. Product Development Lifecycle (team view: how a feature gets built)")
    nl(["<b>Discovery</b> — Identify the problem. User interviews, data analysis, competitor scans, support tickets. Output: problem statement + opportunity size.",
        "<b>Definition</b> — Decide what to build. Write a PRD (Product Requirements Document): goal, users, user stories, success metrics, scope / non-scope.",
        "<b>Design</b> — Wireframes → prototypes → usability tests. Design and engineering estimate effort.",
        "<b>Development</b> — Engineering builds in sprints (Agile/Scrum). PM grooms backlog, answers questions, unblocks.",
        "<b>Testing / QA</b> — Functional, regression, UAT (user acceptance testing), beta rollouts.",
        "<b>Launch</b> — Go-to-market plan, phased rollout (1% → 10% → 50% → 100%), A/B test, feature flags.",
        "<b>Measure &amp; Iterate</b> — Compare against success metrics, run post-launch review, decide: iterate, scale or kill."])
    box("tip", ["When asked \"walk me through how you would launch a feature\", use the development lifecycle above. When asked "
                "\"what stage is product X in and what should it do\", use the market lifecycle. Naming which one you are using "
                "shows structured thinking."])
    box("q", ["Which stage of the lifecycle is Paytm in? What should the PM priorities be?",
              "<i>Outline:</i> Mature in UPI payments (saturated, thin margins) → focus on monetisation through lending, "
              "insurance, merchant devices (Soundbox); defend retention against PhonePe and Google Pay; ARPU and margin "
              "over user growth."])

    # ---------------- product vs project
    h2("2. Product Management vs Project Management")
    p("<b>Product management</b> decides <i>what</i> to build and <i>why</i> (the right thing). <b>Project management</b> "
      "makes sure a defined piece of work is delivered <i>on time, on budget, within scope</i> (built the right way).")
    tbl([["Dimension", "Product Manager", "Project Manager"],
         ["Core question", "What should we build and why?", "How and when will we deliver it?"],
         ["Success measure", "Outcomes: user value, business metrics (retention, revenue)", "Outputs: delivered on time, on budget, in scope"],
         ["Time horizon", "Ongoing; owns the product for its whole life", "Finite; project has a start and end date"],
         ["Key artefacts", "Vision, strategy, roadmap, PRD, metrics dashboards", "Project plan, Gantt chart, RAID log, status reports"],
         ["Key skills", "User empathy, prioritisation, data, strategy, storytelling", "Planning, scheduling, risk and resource management"],
         ["Handles change by", "Welcoming it if it improves outcomes", "Controlling it (change requests) to protect scope"],
         ["Example", "Decides Swiggy should add 10-minute food delivery (Bolt)", "Ensures Bolt launches in 6 cities by 1 Oct"]],
        [1.2, 2.2, 2.2])
    p("Related roles: <b>Program Manager</b> coordinates multiple related projects; <b>Product Owner</b> (Scrum) manages the "
      "backlog for one team and is often a subset of the PM job; <b>Product Marketing Manager</b> owns positioning and go-to-market.")
    box("warn", "Do not say \"PM is the CEO of the product\". Interviewers dislike it: PMs have responsibility without authority. "
                "Say instead: \"A PM is responsible for the product's outcomes and leads through influence — aligning "
                "engineering, design, business and leadership around the user problem.\"")

    # ---------------- PMF
    h2("3. Product-Market Fit (PMF)")
    box("def", "Product-market fit means being in a good market with a product that can satisfy that market (Marc Andreessen). "
               "In practice: a clearly defined set of users want the product so much that they keep using it, pay for it and "
               "recommend it — without you having to push them.")
    h3("How do you know you have PMF? (quantitative signals)")
    bl(["<b>Retention curve flattens</b> — The percentage of a cohort still active stops falling and levels off (e.g. at 25-40% "
        "for a consumer app). A curve that keeps declining to zero means no PMF. This is the single best signal.",
        "<b>Sean Ellis test</b> — Ask users \"How would you feel if you could no longer use this product?\" If 40% or more say "
        "<i>Very disappointed</i>, you likely have PMF.",
        "<b>Organic growth</b> — A large share of new users come from word of mouth / referrals; CAC is falling.",
        "<b>Usage intensity</b> — Rising frequency, DAU/MAU going up, users finding new use cases themselves.",
        "<b>Willingness to pay</b> — Users convert to paid, renewal rates high, low price sensitivity.",
        "<b>Net Promoter Score (NPS)</b> — % promoters (9-10) minus % detractors (0-6); a strong NPS (above about 40) is a supporting signal."])
    h3("Qualitative signals")
    bl(["Sales cycles shorten; customers pull the product rather than you pushing it.",
        "Users complain loudly when it is down (a good sign!).",
        "Servers, support and delivery teams cannot keep up with demand."])
    h3("Reaching PMF: the loop")
    nl(["Define the target user precisely (not \"everyone\").",
        "Identify underserved needs (Jobs-to-be-Done interviews).",
        "Define the value proposition — why you are better than the alternative.",
        "Build the MVP (Minimum Viable Product) for the core value only.",
        "Test with users, measure retention, iterate. Repeat until the retention curve flattens. (Dan Olsen's \"Lean Product Process\".)"])
    box("example", ["<b>Blinkit (formerly Grofers)</b> struggled for years with next-day grocery delivery: low frequency, thin "
                    "margins, poor differentiation from BigBasket. In 2021 it pivoted to 10-minute delivery from dark stores. "
                    "Order frequency and retention jumped because it solved a new job — \"I need this now\" (forgot milk, sudden "
                    "guests). That is a classic example of finding PMF by changing the value proposition, not the category."])

    # ---------------- prioritisation
    h2("4. Prioritisation Frameworks: RICE, MoSCoW and Others")
    p("Prioritisation questions test whether you can make decisions with limited resources and explain <i>why</i>. Always "
      "start with the <b>goal</b> (what metric are we trying to move?) — a framework without a goal is meaningless.")
    h3("RICE scoring (from Intercom)")
    p("<b>RICE score = (Reach × Impact × Confidence) ÷ Effort</b>")
    tbl([["Factor", "Meaning", "How to estimate"],
         ["Reach", "How many users will this affect in a time period", "e.g. 50,000 users per month"],
         ["Impact", "How much it moves the goal for each user", "3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal"],
         ["Confidence", "How sure you are about the estimates", "100% = high (data), 80% = medium, 50% = low (gut)"],
         ["Effort", "Total team time required", "Person-months (design + eng + QA)"]], [1, 2.2, 2.6])
    p("<b>Worked example — Spotify India, goal: increase 7-day retention of new users</b>")
    tbl([["Feature", "Reach / month", "Impact", "Confidence", "Effort (p-m)", "RICE"],
         ["Regional-language onboarding playlists", "400,000", "2", "80%", "2", "<b>320,000</b>"],
         ["Social listening with friends", "100,000", "3", "50%", "6", "25,000"],
         ["Offline downloads for free tier", "600,000", "1", "80%", "8", "60,000"],
         ["Dark-mode tweaks", "800,000", "0.25", "100%", "1", "200,000"]], [2.6, 1.1, 0.8, 1, 1, 1])
    p("Regional playlists win. Note that dark-mode tweaks score high only because of low effort — this is why you should "
      "<b>sanity-check RICE output with strategic judgment</b>; it is a tool for discussion, not a calculator that decides.")
    h3("MoSCoW method")
    tbl([["Category", "Meaning", "Example: UPI payments in a college canteen app (MVP)"],
         ["Must have", "Without it the release fails or is illegal/unsafe", "Order menu, UPI payment, order confirmation"],
         ["Should have", "Important but release works without it; add soon", "Order history, push notification when ready"],
         ["Could have", "Nice to have if time permits", "Favourites, ratings, combo suggestions"],
         ["Won't have (this time)", "Explicitly out of scope for now", "Loyalty points, group ordering, delivery to hostels"]],
        [1.2, 2, 3])
    p("Best for: fixed deadlines and scoping an MVP. Weakness: no ranking <i>within</i> a bucket, and stakeholders push "
      "everything into \"Must\". Rule of thumb: Must-haves should be no more than about 60% of effort.")
    h3("Other frameworks you should be able to name")
    tbl([["Framework", "How it works", "Best used when"],
         ["ICE", "Impact × Confidence × Ease (each 1-10)", "Quick growth experiments; no reach data"],
         ["Value vs Effort (2×2)", "Quick wins (high value, low effort) → Big bets → Fill-ins → Money pits", "Whiteboard discussions with stakeholders"],
         ["Kano model", "Basic needs (expected), Performance (more is better), Delighters (unexpected joy)", "Deciding feature mix for user satisfaction"],
         ["Opportunity scoring", "Importance + (Importance − Satisfaction)", "Finding underserved needs from surveys"],
         ["Cost of Delay / WSJF", "(Value + Time criticality + Risk reduction) ÷ Job size", "Large organisations using SAFe/Agile"],
         ["Weighted scoring", "Score each feature on chosen criteria × weights", "Making trade-offs transparent to leadership"]],
        [1.4, 2.8, 2])
    box("tip", ["In a case, say: \"I will prioritise on three criteria — impact on our goal metric, effort, and strategic "
                "fit/risk — and use a quick RICE-style estimate.\" Then actually rank and <b>commit</b> to one. Interviewers "
                "penalise candidates who list options without choosing."])

    # ---------------- north star
    h2("5. North Star Metric (NSM)")
    box("def", "The North Star Metric is the single metric that best captures the core value a product delivers to customers. "
               "If it grows sustainably, the business grows. It aligns every team on one outcome.")
    h3("A good North Star metric is...")
    bl(["<b>A measure of customer value</b>, not just revenue (revenue is a lagging result of value).",
        "<b>A leading indicator</b> of long-term business success (predicts revenue and retention).",
        "<b>Actionable</b> — teams can influence it with their work.",
        "<b>Understandable</b> — anyone in the company can explain it.",
        "<b>Not a vanity metric</b> — total downloads or registered users are bad NSMs because they never go down."])
    tbl([["Product", "North Star Metric", "Why"],
         ["Spotify", "Time spent listening (per user per month)", "Listening = value received; drives retention and ads/subscriptions"],
         ["Instagram", "Daily active users engaging (posts, likes, shares)", "Engagement drives ad inventory and network effects"],
         ["Blinkit / Zepto", "Weekly orders delivered on time (in ~10 min) and complete", "Captures speed promise + frequency"],
         ["Swiggy / Zomato", "Orders delivered per week", "Each order = a satisfied customer, restaurant and rider"],
         ["Airbnb", "Nights booked", "Value to both guest and host"],
         ["Uber / Ola", "Completed rides per week", "Transaction-based marketplace value"],
         ["WhatsApp", "Messages sent per daily user", "Communication is the core value"],
         ["Netflix", "Hours of content watched / retained subscribers", "Watching = value; retention = revenue"],
         ["LinkedIn", "Weekly engaged professionals / quality connections", "Network value"],
         ["Duolingo", "Daily active learners (streaks)", "Habit formation drives learning and conversion"],
         ["Razorpay", "Total payment volume (TPV) processed", "Merchant success = Razorpay success"]], [1.2, 2.3, 2.6])
    h3("Input metrics (the metric tree)")
    p("A North Star is too high-level for a team to move directly, so break it into <b>input metrics</b> that each team owns:")
    code("""
Spotify NSM: Total listening time
 = Monthly active listeners  x  Sessions per listener  x  Minutes per session
     |                            |                          |
     +- New user activation        +- Habit (daily mixes,     +- Recommendation quality
     +- Resurrection of dormant      notifications)            +- Skip rate (lower is better)
     +- Churn prevention           +- Podcasts, audiobooks    +- Playlist completion
""")
    p("<b>Guardrail (counter) metrics</b> protect against gaming the NSM: e.g. if Instagram pushes engagement, track "
      "report/block rates, time well spent surveys and teen wellbeing. If Blinkit pushes speed, track rider safety incidents "
      "and order accuracy.")

    # ---------------- strategy
    h2("6. Product Strategy")
    p("Strategy is the bridge between a vision (where we want to be) and a roadmap (what we build next). A useful hierarchy:")
    code("""
Mission   -> why we exist          (Spotify: unlock the potential of human creativity)
Vision    -> the future we create  (the world's #1 audio platform)
Strategy  -> how we will win       (personalisation + every audio format + freemium funnel)
Goals/OKRs-> what we measure       (O: Win India; KR: 25% of MAU from Tier-2 cities)
Roadmap   -> what we build when    (Now / Next / Later themes)
Execution -> sprints, launches, experiments
""")
    h3("Components of a product strategy")
    bl(["<b>Target customer</b> — who exactly, and which segments you deliberately ignore.",
        "<b>Problem / job-to-be-done</b> — the need you solve.",
        "<b>Value proposition &amp; differentiation</b> — why users pick you over alternatives.",
        "<b>Business model</b> — how you make money (subscription, ads, commission, freemium, transaction fee).",
        "<b>Moat / defensibility</b> — network effects, switching costs, data, brand, scale economies, proprietary tech.",
        "<b>Go-to-market</b> — channels, pricing, launch markets.",
        "<b>Key metrics</b> — North Star + input metrics."])
    h3("Frameworks for strategy questions")
    tbl([["Framework", "Use for", "Quick example"],
         ["SWOT", "Internal (Strengths, Weaknesses) + external (Opportunities, Threats)", "Jio: S = cheap data; T = regulation"],
         ["Porter's Five Forces", "Industry attractiveness: rivalry, new entrants, substitutes, buyer power, supplier power", "Quick commerce: high rivalry, low switching cost"],
         ["Jobs-to-be-Done", "Understanding why customers \"hire\" a product", "People hire Blinkit to \"save an unplanned trip\""],
         ["Ansoff Matrix", "Growth: market penetration, market development, product development, diversification", "Zomato → Blinkit = diversification"],
         ["3C (Company, Customer, Competitor)", "Quick structured market entry thinking", "Should Spotify launch in-car hardware?"],
         ["Build / Buy / Partner", "Expanding capabilities", "Flipkart bought PhonePe; Zomato bought Blinkit"]],
        [1.4, 2.6, 2.2])
    box("q", ["Should Zomato enter the movie-ticketing business? (Answer structure)",
              "- Clarify goal: revenue diversification? increase app engagement? (Zomato did acquire Paytm's ticketing → District app.)",
              "- Market: size and growth of ticketing + events in India; competitors (BookMyShow dominant).",
              "- Fit: Zomato's assets — dining-out users, restaurant partners, brand, payments. Synergy: \"going out\" super-app.",
              "- Options: build vs buy vs partner. Risks: distraction from core, BookMyShow's network effects with cinemas.",
              "- Recommendation + metrics: e.g. buy, bundle with dining-out, measure cross-use rate and going-out GOV."])

    # ---------------- practice
    h2("7. Practice: Improve Blinkit, Instagram and Spotify")
    p("Product improvement questions are the most common PM interview question. Use this <b>8-step structure</b> (a version of "
      "the CIRCLES method) and speak each step out loud. Aim to finish in 20-25 minutes.")
    tbl([["Step", "What you do", "Time"],
         ["1. Clarify", "Restate the question; ask: which platform, geography, any constraint, what does \"improve\" mean?", "1-2 min"],
         ["2. Goal", "Pick ONE business goal: acquisition, engagement, retention, monetisation. Tie it to company mission.", "1-2 min"],
         ["3. Users", "List 3-4 user segments; pick one with a reason (size, underserved, strategic).", "2-3 min"],
         ["4. Journey &amp; pain points", "Walk through that user's journey; list 4-6 pain points.", "3-4 min"],
         ["5. Prioritise pain", "Pick the top 1-2 pain points (frequency × severity × fit to goal).", "1-2 min"],
         ["6. Solutions", "Brainstorm 3-4 solutions, from simple to bold.", "3-4 min"],
         ["7. Prioritise solutions", "Impact vs effort; choose one. Describe the MVP.", "2 min"],
         ["8. Metrics &amp; risks", "Success metric, guardrails, how you will test (A/B), risks and mitigations. Summarise.", "2-3 min"]],
        [1.3, 4.5, 0.8])

    h3("Case 7.1 — Improve Blinkit")
    bl(["<b>Clarify:</b> Blinkit app, India, consumer side (not dark-store ops). No constraints given — I will assume we want "
        "a feature that can ship in a quarter.",
        "<b>Goal:</b> Increase <b>order frequency of existing users</b> (retention/engagement). Quick commerce has high CAC, "
        "so making existing users order more often is the most profitable lever. Metric: orders per user per month.",
        "<b>Segments:</b> (a) young working professionals (top-up + impulse), (b) families/homemakers (planned monthly grocery), "
        "(c) students in PGs/hostels, (d) small businesses (cafés buying supplies). <b>Pick (b) families</b> — they have the "
        "largest grocery wallet but still do their big monthly shop on BigBasket/DMart because Blinkit is seen as an "
        "\"emergency\" app.",
        "<b>Pain points for families:</b> (1) re-adding 40+ regular items every time is tedious; (2) perceived higher prices "
        "vs DMart; (3) items out of stock at their dark store; (4) cannot schedule delivery for a convenient time; (5) fresh "
        "produce quality uncertainty.",
        "<b>Prioritise:</b> (1) Tedious repeat ordering — high frequency, Blinkit can solve it, directly drives orders.",
        "<b>Solutions:</b> (A) <i>Smart Monthly List</i> — auto-generated from past orders with predicted quantities, one-tap "
        "re-order; (B) <i>Subscriptions</i> for milk, bread, eggs with daily morning delivery; (C) <i>Household sharing</i> — "
        "shared cart for family members; (D) <i>Pantry tracker</i> that nudges \"you usually run out of atta around now\".",
        "<b>Choose:</b> A + D together as \"Smart Restock\": highest reach, uses data Blinkit already has, low effort (ML on "
        "order history). B is good but needs ops changes (morning slots) — next quarter.",
        "<b>Metrics:</b> Primary — orders/user/month for the family segment; adoption rate of Smart Restock; average basket "
        "size. Guardrails — average order margin, delivery time (larger baskets may slow pickers), notification opt-out rate. "
        "Test with an A/B test on 10% of users with 3+ months history for 4 weeks.",
        "<b>Risks:</b> annoying nudges (cap frequency), wrong predictions (let users edit), out-of-stock items in list (show substitutes)."])

    h3("Case 7.2 — Improve Instagram")
    bl(["<b>Clarify:</b> Instagram app overall, global but I will think with India in mind. Meta's mission: give people "
        "the power to build community and bring the world closer together.",
        "<b>Goal:</b> Increase <b>meaningful engagement among creators</b> — creators produce the content that keeps "
        "viewers coming back; if they churn, the platform loses supply. Metric: % of creators posting weekly.",
        "<b>Segments:</b> casual users, aspiring creators (under 10K followers), established creators, businesses. "
        "<b>Pick aspiring creators</b> — largest creator group, most likely to churn, future supply of top creators.",
        "<b>Pain points:</b> (1) low reach — posts get few views, feel demotivated; (2) do not understand why content "
        "underperforms; (3) hard to monetise below 10K followers; (4) editing Reels is time-consuming; (5) idea fatigue — "
        "what to post next.",
        "<b>Prioritise:</b> (1) + (2) — demotivation from unexplained low reach is the main reason small creators stop posting.",
        "<b>Solutions:</b> (A) <i>Creator Coach</i> — post-level insights in plain language (\"viewers dropped at 3s; try a "
        "stronger hook\") using AI; (B) <i>Fresh Creator Boost</i> — guaranteed test audience of 500 relevant non-followers "
        "for the first 20 Reels; (C) <i>Collab matching</i> — suggest similar-sized creators to collaborate with; "
        "(D) trending-audio and idea prompts by niche.",
        "<b>Choose:</b> A (Creator Coach) as MVP: builds on existing Insights data, scalable with AI, addresses the root "
        "cause (skill), and B as an experiment.",
        "<b>Metrics:</b> Primary — weekly posting rate of aspiring creators and 4-week creator retention. Secondary — average "
        "watch-through rate of their Reels over time. Guardrail — viewer time spent and content-quality reports (do not flood "
        "feeds with low-quality content).",
        "<b>Risks:</b> generic advice (personalise per niche), creators gaming signals, compute cost."])

    h3("Case 7.3 — Improve Spotify")
    bl(["<b>Clarify:</b> Spotify app in India. India is a price-sensitive market where free tier dominates and competitors "
        "(YouTube Music, JioSaavn, free YouTube) are strong.",
        "<b>Goal:</b> Increase <b>conversion from free to Premium</b> (monetisation) while keeping listening time healthy.",
        "<b>Segments:</b> college students, commuters, regional-language listeners in Tier-2/3 cities, podcast listeners. "
        "<b>Pick college students</b> — high listening time, price-sensitive but form lifelong habits; student plans exist.",
        "<b>Pain points:</b> (1) ads interrupt study sessions; (2) cannot download for low-connectivity hostels/metro; "
        "(3) Premium feels expensive vs free YouTube; (4) shuffle-only on mobile in free tier; (5) payment friction — many "
        "lack credit cards (UPI autopay adoption).",
        "<b>Prioritise:</b> (3) perceived value + (5) payment friction — these block conversion directly.",
        "<b>Solutions:</b> (A) <i>Sachet Premium</i> — ₹29 for 7 days or exam-season passes via UPI one-time payment; "
        "(B) <i>Group Student plan</i> for hostel roommates; (C) <i>Study Mode</i> — ad-free 2-hour focus session unlocked by "
        "watching one video ad; (D) campus ambassador referral rewards.",
        "<b>Choose:</b> A — sachet pricing is proven in India (telecom, shampoo, Netflix mobile plan), lowers the trial barrier, "
        "UPI makes it frictionless; after users experience Premium, a share converts to monthly plans.",
        "<b>Metrics:</b> Primary — free-to-paid conversion rate for students; % sachet buyers who repurchase or upgrade to "
        "monthly in 60 days. Guardrails — cannibalisation of monthly subscribers (are existing payers downgrading?), ARPU, "
        "ad revenue loss.",
        "<b>Risks:</b> cannibalisation (restrict sachets to users who have never paid / students), payment failures."])
    box("tip", ["Always end with a 20-second summary: \"To recap — goal X, user Y, problem Z, solution W, measured by M.\" "
                "It shows you can communicate like a PM to leadership."])
