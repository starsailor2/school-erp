from lib import *

def build():
    chapter("Day 4", "Product Analytics",
            "PMs make decisions with data. Interviewers check that you know the standard metrics and their formulas, can read "
            "a funnel or cohort table, understand experiments and basic statistics, and can write simple SQL. The chapter "
            "ends with a full walk-through of the classic case: diagnosing a 20% drop in Blinkit's orders.")

    # ---------- engagement metrics
    h2("1. DAU, MAU, Retention and Churn")
    tbl([["Metric", "Formula / definition", "Notes"],
         ["DAU", "Unique users who did a meaningful action on a day", "Define \"active\" carefully: opened app vs played a song vs placed an order"],
         ["WAU / MAU", "Unique active users in the last 7 / 30 days", "Use for products not used daily (e.g. travel, quick commerce often uses WAU)"],
         ["Stickiness", "DAU ÷ MAU", "WhatsApp ~ 80%+; social apps 50%+ is great; 20% is typical for many apps"],
         ["N-day retention", "% of a cohort active exactly on day N (D1, D7, D30)", "Classic \"Day-7 retention\""],
         ["Rolling (unbounded) retention", "% of a cohort active on day N <i>or any day after</i>", "Always ≥ N-day retention"],
         ["Churn rate", "Users lost in period ÷ users at start of period", "Monthly churn 5% ⇒ ~46% lost in a year (1 − 0.95<super>12</super>)"],
         ["Retention rate", "1 − churn rate", "For subscriptions: % renewing"],
         ["Resurrection", "Users inactive last period who returned", "Growth = new + resurrected − churned"],
         ["ARPU / ARPPU", "Revenue ÷ all users / revenue ÷ paying users", "ARPPU ≥ ARPU"],
         ["Conversion rate", "Users completing goal ÷ users entering step", "e.g. free → paid"],
         ["AOV", "GMV ÷ number of orders", "Average order value"],
         ["CAC", "Sales + marketing spend ÷ new customers acquired", "Customer acquisition cost"],
         ["LTV (CLV)", "ARPU × gross margin × average lifetime  (lifetime ≈ 1 ÷ churn)", "Healthy if LTV : CAC ≥ 3 : 1"],
         ["Payback period", "CAC ÷ (monthly ARPU × gross margin)", "Months to recover acquisition cost"],
         ["NPS", "% promoters (9-10) − % detractors (0-6)", "Range −100 to +100"]],
        [1.3, 2.6, 2.6])
    box("example", ["<b>Mini calculation.</b> A subscription app has ARPU ₹150/month, 60% gross margin, 8% monthly churn, CAC ₹600.",
                    "Average lifetime = 1 ÷ 0.08 = 12.5 months. LTV = 150 × 0.6 × 12.5 = ₹1,125. LTV:CAC = 1.9 — below 3, "
                    "so either reduce churn, increase ARPU or reduce CAC. Payback = 600 ÷ 90 = 6.7 months."])
    box("warn", "Vanity metrics — total downloads, registered users, page views — look good but do not indicate value. "
                "Prefer actionable metrics like active users, retention and revenue per user.")

    # ---------- funnels
    h2("2. Conversion Funnels")
    p("A funnel shows how users move through the steps of a journey and where they drop off. For every step, compute "
      "<b>step conversion</b> (vs previous step) and <b>overall conversion</b> (vs first step).")
    tbl([["Blinkit order funnel (1 day, illustrative)", "Users", "Step conversion", "Overall conversion"],
         ["App opened", "1,000,000", "—", "100%"],
         ["Searched / browsed a product", "700,000", "70%", "70%"],
         ["Added to cart", "350,000", "50%", "35%"],
         ["Proceeded to checkout", "250,000", "71%", "25%"],
         ["Payment attempted", "220,000", "88%", "22%"],
         ["Order placed (payment success)", "200,000", "91%", "20%"],
         ["Order delivered", "196,000", "98%", "19.6%"]], [2.8, 1.1, 1.2, 1.3])
    h3("How to analyse a funnel")
    bl(["Find the step with the <b>biggest absolute drop</b> (browse → cart, 350K lost) and the step with the <b>biggest change vs "
        "last week</b> — the second one is what matters in an RCA.",
        "Segment each step: platform, new vs returning, city, category, traffic source.",
        "Typical causes by step: <i>browse→cart</i>: assortment, out-of-stock, price; <i>cart→checkout</i>: delivery fee, "
        "minimum order value, ETA shown; <i>payment</i>: gateway/UPI failures; <i>delivery</i>: cancellations, rider shortage.",
        "Remember funnels are not always linear — users loop back; define a time window (e.g. same session or 24 hours)."])

    # ---------- cohorts
    h2("3. Cohort Analysis")
    p("A <b>cohort</b> is a group of users who share a characteristic in the same time period — most often the week or "
      "month they signed up (acquisition cohort). Cohort analysis tracks each group's behaviour over time so you are not "
      "fooled by blended averages (e.g. strong new-user growth hiding worsening retention).")
    tbl([["Signup month", "Users", "Month 0", "Month 1", "Month 2", "Month 3", "Month 4"],
         ["Jan", "10,000", "100%", "42%", "33%", "30%", "29%"],
         ["Feb", "12,000", "100%", "45%", "36%", "33%", "—"],
         ["Mar", "15,000", "100%", "38%", "28%", "—", "—"],
         ["Apr", "20,000", "100%", "30%", "—", "—", "—"]], [1.2, 1, 0.9, 0.9, 0.9, 0.9, 0.9])
    h3("How to read it")
    bl(["<b>Read across a row</b> → how one cohort retains over time. Jan flattens at ~29-30%: a sign of product-market fit.",
        "<b>Read down a column</b> → are newer cohorts better or worse at the same age? Month-1 retention fell from 45% (Feb) "
        "to 30% (Apr) — something is wrong with recent acquisition.",
        "<b>Possible causes</b>: a new low-quality acquisition channel (e.g. heavy discount campaign attracting deal-seekers), "
        "onboarding change, expansion to a new city with poor service.",
        "Other cohort types: <b>behavioural cohorts</b> (users who used feature X in week 1 vs those who did not) — used to find "
        "\"aha moments\" (e.g. Facebook's famous \"7 friends in 10 days\")."])

    # ---------- A/B testing
    h2("4. A/B Testing")
    p("An A/B test (controlled experiment) randomly splits users into a <b>control</b> (A, current experience) and a "
      "<b>treatment</b> (B, new experience) to measure the causal effect of a change.")
    h3("Steps to design an A/B test")
    nl(["<b>Hypothesis</b> — \"Showing delivery ETA on the product page will increase add-to-cart rate because users value speed.\"",
        "<b>Primary metric</b> (one!) + secondary metrics + <b>guardrail metrics</b> (e.g. latency, cancellations, revenue).",
        "<b>Randomisation unit</b> — usually user ID (not session, to avoid the same user seeing both). For marketplaces or "
        "social networks consider city- or cluster-level randomisation because of network effects.",
        "<b>Sample size &amp; duration</b> — based on baseline rate, minimum detectable effect (MDE), significance level (α = 5%) "
        "and power (80%). Run at least 1-2 full weeks to cover weekly seasonality.",
        "<b>Run</b> — check sample ratio mismatch (SRM): if the split was 50/50 but you see 52/48, randomisation is broken.",
        "<b>Analyse</b> — statistical significance (p-value, confidence interval) AND practical significance (is the lift "
        "worth the cost?). Segment the results.",
        "<b>Decide</b> — launch, iterate, or kill. Document learnings."])
    h3("Sample size rule of thumb")
    p("For a conversion metric with baseline rate p and absolute minimum detectable effect δ, at α = 0.05 and 80% power: "
      "<b>n per group ≈ 16 × p(1 − p) ÷ δ<super>2</super></b>.")
    p("Example: baseline add-to-cart 10%, want to detect +1 percentage point → n ≈ 16 × 0.1 × 0.9 ÷ 0.0001 = <b>14,400 users per group</b>.")
    h3("Pitfalls interviewers love to ask about")
    tbl([["Pitfall", "What goes wrong", "Fix"],
         ["Peeking", "Stopping when p dips below 0.05 inflates false positives", "Fix the sample size in advance or use sequential testing"],
         ["Novelty / primacy effect", "Users click new things because they are new (or resist change)", "Run longer; look at returning-user effect over time"],
         ["Network effects / interference", "Treatment users affect control users (e.g. marketplace supply, social sharing)", "Cluster/geo randomisation, switchback tests"],
         ["Multiple comparisons", "Testing 20 metrics → ~1 is \"significant\" by chance", "Pre-register primary metric; Bonferroni correction"],
         ["Sample ratio mismatch", "Bug in assignment biases results", "SRM chi-square check before analysis"],
         ["Simpson's paradox", "Aggregate result reverses within segments", "Check segment-level results; stratify"],
         ["Seasonality / external events", "Diwali sale week is not representative", "Avoid unusual weeks; run full weeks"],
         ["Underpowered test", "Real effect missed", "Compute sample size first"]], [1.5, 2.6, 2.2])
    box("tip", "When you cannot A/B test (e.g. pricing law, brand change, very small user base): use pre/post analysis with a "
               "control group, difference-in-differences, staged geographic rollout, or holdout groups.")

    # ---------- hypothesis testing
    h2("5. Hypothesis Testing (Statistics Basics)")
    tbl([["Concept", "Plain-English meaning"],
         ["Null hypothesis (H0)", "No difference — the change has no effect (A = B)."],
         ["Alternative hypothesis (H1)", "There is a difference (A ≠ B, or B > A for one-sided)."],
         ["Significance level (α)", "Max acceptable chance of a false positive; usually 0.05."],
         ["p-value", "If H0 were true, the probability of seeing a result at least this extreme. p &lt; α ⇒ reject H0. "
                     "It is NOT the probability that H0 is true."],
         ["Type I error (false positive)", "Concluding B is better when it is not. Probability = α."],
         ["Type II error (false negative)", "Missing a real effect. Probability = β."],
         ["Power (1 − β)", "Chance of detecting a real effect; target 80%."],
         ["Confidence interval", "Range likely to contain the true effect, e.g. +2% lift [95% CI: +0.5%, +3.5%]. If it excludes 0 → significant."],
         ["MDE", "Smallest effect worth detecting; smaller MDE ⇒ bigger sample."],
         ["Statistical vs practical significance", "A 0.01% lift can be significant with millions of users but not worth shipping."]], [1.8, 4.2])
    h3("Which test to use")
    tbl([["Situation", "Test"],
         ["Compare two proportions (conversion rates), large sample", "Two-proportion z-test / chi-square test"],
         ["Compare two means (AOV, time spent)", "Two-sample t-test (Welch's)"],
         ["Compare 3+ group means", "ANOVA"],
         ["Relationship between two categorical variables", "Chi-square test of independence"],
         ["Skewed metrics (revenue with outliers)", "Mann-Whitney U, bootstrap, or cap outliers"]], [3.5, 2.5])
    box("example", ["<b>Worked example.</b> Control: 10,000 users, 1,000 converted (10.0%). Treatment: 10,000 users, 1,100 converted (11.0%).",
                    "Pooled p = 2,100 ÷ 20,000 = 0.105. SE = √(0.105 × 0.895 × (1/10,000 + 1/10,000)) = √(0.0000188) ≈ 0.00434.",
                    "z = (0.11 − 0.10) ÷ 0.00434 ≈ 2.30 → two-sided p ≈ 0.021 &lt; 0.05 → statistically significant. "
                    "95% CI for lift ≈ 1.0% ± 1.96 × 0.00434 ≈ [+0.15%, +1.85%]. Relative lift = +10%."])

    # ---------- SQL
    h2("6. SQL for PMs: Joins, CTEs and Window Functions")
    p("Most PM interviews (especially analytics-heavy companies like Flipkart, Swiggy, Zomato, Meesho, Amazon) include "
      "basic SQL. You will usually write queries on paper or a shared doc. Practice schema used below:")
    code("""
users(user_id, signup_date, city, platform)
orders(order_id, user_id, order_date, amount, status)      -- status: 'delivered','cancelled'
events(user_id, event_name, event_time)                    -- 'app_open','add_to_cart','checkout'
""")
    h3("Joins")
    tbl([["Join", "Returns", "Typical PM use"],
         ["INNER JOIN", "Only rows with a match in both tables", "Orders with user details"],
         ["LEFT JOIN", "All rows of left table + matches (NULL if none)", "Users who have <b>never</b> ordered (WHERE o.order_id IS NULL)"],
         ["RIGHT JOIN", "All rows of right table + matches", "Rarely used; rewrite as LEFT JOIN"],
         ["FULL OUTER JOIN", "All rows from both, NULLs where no match", "Reconciling two data sources"],
         ["SELF JOIN", "Table joined to itself", "Referrals: user and the user who referred them"],
         ["CROSS JOIN", "Every combination (Cartesian product)", "Generate date × city grid for reports"]], [1.3, 2.4, 2.6])
    code("""
-- Users who signed up in 2026 but never placed an order (activation problem)
SELECT u.user_id, u.city
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
WHERE u.signup_date >= '2026-01-01'
  AND o.order_id IS NULL;

-- Revenue by city for delivered orders
SELECT u.city, COUNT(*) AS orders, SUM(o.amount) AS revenue, AVG(o.amount) AS aov
FROM orders o
JOIN users u ON u.user_id = o.user_id
WHERE o.status = 'delivered'
GROUP BY u.city
ORDER BY revenue DESC;
""")
    p("Remember the logical order of execution: <b>FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</b>. "
      "That is why you cannot use a SELECT alias in WHERE, and why filters on aggregates go in HAVING.")
    h3("CTEs (Common Table Expressions)")
    p("A CTE (<font name='Mono'>WITH name AS (...)</font>) is a named temporary result that makes multi-step queries "
      "readable — interviewers strongly prefer CTEs over nested subqueries.")
    code("""
-- Monthly active buyers and their average orders per buyer
WITH monthly AS (
    SELECT user_id,
           DATE_TRUNC('month', order_date) AS month,
           COUNT(*) AS n_orders
    FROM orders
    WHERE status = 'delivered'
    GROUP BY 1, 2
)
SELECT month,
       COUNT(DISTINCT user_id)  AS active_buyers,
       AVG(n_orders)            AS orders_per_buyer
FROM monthly
GROUP BY month
ORDER BY month;
""")
    h3("Window functions")
    p("Window functions compute a value across a set of related rows <b>without collapsing them</b> (unlike GROUP BY). "
      "Syntax: <font name='Mono'>FUNC() OVER (PARTITION BY ... ORDER BY ... [frame])</font>.")
    tbl([["Function", "What it does", "PM use case"],
         ["ROW_NUMBER()", "1, 2, 3... unique rank within partition", "First order of each user; de-duplication"],
         ["RANK()", "Ties share rank, gaps after (1,1,3)", "Leaderboards"],
         ["DENSE_RANK()", "Ties share rank, no gaps (1,1,2)", "Top-3 products per category"],
         ["LAG() / LEAD()", "Value from previous / next row", "Days between orders; week-over-week change"],
         ["SUM() OVER (ORDER BY ...)", "Running total", "Cumulative revenue / signups"],
         ["AVG() OVER (ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)", "Moving average", "7-day rolling DAU"],
         ["NTILE(n)", "Split into n buckets", "Users into spending deciles"],
         ["FIRST_VALUE()", "First value in window", "First city a user ordered in"]], [2.4, 2, 2])
    code("""
-- 1) Top 3 spenders in each city
WITH spend AS (
    SELECT u.city, o.user_id, SUM(o.amount) AS total_spend
    FROM orders o JOIN users u ON u.user_id = o.user_id
    WHERE o.status = 'delivered'
    GROUP BY u.city, o.user_id
), ranked AS (
    SELECT *, DENSE_RANK() OVER (PARTITION BY city ORDER BY total_spend DESC) AS rnk
    FROM spend
)
SELECT * FROM ranked WHERE rnk <= 3;

-- 2) Days between consecutive orders for each user (repeat-purchase gap)
SELECT user_id, order_date,
       order_date - LAG(order_date) OVER (PARTITION BY user_id
                                          ORDER BY order_date) AS days_since_prev
FROM orders;

-- 3) Daily orders with 7-day moving average and week-over-week % change
WITH daily AS (
    SELECT order_date, COUNT(*) AS orders FROM orders GROUP BY order_date
)
SELECT order_date, orders,
       AVG(orders) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7d,
       100.0 * (orders - LAG(orders, 7) OVER (ORDER BY order_date))
             / LAG(orders, 7) OVER (ORDER BY order_date)                    AS wow_pct
FROM daily;
""")
    h3("Classic PM queries: DAU, D7 retention, funnel")
    code("""
-- DAU and stickiness (DAU/MAU) for a month
SELECT DATE(event_time) AS day, COUNT(DISTINCT user_id) AS dau
FROM events WHERE event_name = 'app_open'
GROUP BY 1;

-- Day-7 retention by signup week
WITH cohort AS (
    SELECT user_id, signup_date, DATE_TRUNC('week', signup_date) AS cohort_week
    FROM users
), active_d7 AS (
    SELECT DISTINCT c.user_id
    FROM cohort c JOIN events e ON e.user_id = c.user_id
    WHERE DATE(e.event_time) = c.signup_date + INTERVAL '7 day'
)
SELECT c.cohort_week,
       COUNT(*)                                        AS signups,
       COUNT(a.user_id)                                AS retained_d7,
       ROUND(100.0 * COUNT(a.user_id) / COUNT(*), 1)   AS d7_retention_pct
FROM cohort c LEFT JOIN active_d7 a ON a.user_id = c.user_id
GROUP BY 1 ORDER BY 1;

-- Funnel: open -> add_to_cart -> checkout (same day)
SELECT DATE(event_time) AS day,
       COUNT(DISTINCT CASE WHEN event_name='app_open'    THEN user_id END) AS opened,
       COUNT(DISTINCT CASE WHEN event_name='add_to_cart' THEN user_id END) AS carted,
       COUNT(DISTINCT CASE WHEN event_name='checkout'    THEN user_id END) AS checked_out
FROM events
GROUP BY 1 ORDER BY 1;
""")
    box("tip", ["SQL interview habits: (1) ask about the table grain (one row per what?), duplicates and NULLs; (2) write CTEs step by "
                "step and explain each; (3) use COUNT(DISTINCT user_id) for user metrics; (4) watch for integer division — "
                "multiply by 100.0; (5) say how you would test the query on a small sample.",
                "Also know: WHERE vs HAVING, UNION vs UNION ALL (ALL keeps duplicates and is faster), CASE WHEN, COALESCE, "
                "DISTINCT, LIKE, date functions."])

    # ---------- Blinkit case
    h2("7. Case: Diagnosing a 20% Drop in Blinkit's Orders")
    p("This is the most important practice case of the plan. Below is a model answer, written as you would speak it. Target time: 25-30 minutes.")
    h3("Step 1 — Clarify")
    bl(["<b>Metric definition:</b> orders placed or orders delivered? (Assume orders placed; check delivered too.)",
        "<b>Time frame:</b> sudden (overnight) or gradual (over 4 weeks)? Compared to last week or same period last year?",
        "<b>Scope:</b> all cities or specific? All categories? (Assume: noticed this Monday, −20% week-on-week, nationally, sudden.)",
        "<b>Any known changes:</b> releases, pricing, campaigns? (Interviewer: \"You tell me.\")"])
    h3("Step 2 — Validate the data")
    bl(["Is the dashboard / data pipeline broken? Compare with another source (payments data, dark-store order logs).",
        "Was there a change in how orders are counted (e.g. cancelled orders excluded now)?",
        "New app version breaking order event tracking?",
        "→ If payment-gateway records also show −20%, the drop is real."])
    h3("Step 3 — Decompose the metric")
    code("""
Orders = Active users  x  Order conversion rate  x  Orders per converting user
            |                  |
            |                  +- funnel: open -> search -> cart -> checkout -> pay -> placed
            +- new users + returning users + resurrected users
Revenue side check: GMV = Orders x AOV  (did AOV change too?)
""")
    p("Ask: which component fell? Example finding: app opens are flat, but conversion fell from 20% to 16% (that is the 20% drop).")
    h3("Step 4 — Segment")
    tbl([["Cut", "What to look for"],
         ["Geography", "One city / some dark stores (local outage, flood, strike, permit closure) vs all India"],
         ["Platform &amp; app version", "Android vs iOS; latest version only → bug"],
         ["User type", "New vs returning; high-frequency vs occasional; Blinkit Pass holders"],
         ["Category", "Only fresh produce / dairy (supply issue) vs everything"],
         ["Time of day", "Peak evening slots → rider shortage or capacity limits"],
         ["Acquisition channel", "Paid campaign ended → fewer new-user orders"],
         ["Payment method", "UPI vs card vs COD → gateway failures"]], [1.5, 4.5])
    h3("Step 5 — Hypotheses (internal vs external)")
    tbl([["Type", "Hypothesis", "How to validate"],
         ["External", "Competitor (Zepto, Instamart, Flipkart Minutes, BigBasket Now) launched heavy discounts / free delivery",
          "Drop spread across cities where competitor is active; app-store rankings; social media"],
         ["External", "Seasonality / event: end of festival season, exams, month-end (before salary), IPL final, heavy rain", "Same week last year; weather data per city"],
         ["External", "UPI / bank outage, regulatory action on dark stores", "Payment failure rate by provider; news"],
         ["Internal", "Price increase, higher delivery fee, small-cart fee, raised minimum order value", "Cart → checkout drop; recent pricing changes"],
         ["Internal", "Bug in latest release (search, cart, payment)", "Drop concentrated on one app version / platform"],
         ["Internal", "Supply: stock-outs at dark stores, longer ETAs shown due to rider shortage", "In-stock rate, ETA shown, browse → cart drop"],
         ["Internal", "Marketing: discount campaign or push notifications stopped", "New-user and resurrected-user orders fell most"],
         ["Internal", "Search / recommendation algorithm change", "Search-to-cart conversion drop; A/B test logs"]], [0.9, 2.8, 2.6])
    h3("Step 6 — Investigate with data (example SQL)")
    code("""
-- Week-over-week orders by city and platform to locate the drop
WITH wk AS (
  SELECT u.city, u.platform,
         SUM(CASE WHEN o.order_date >= CURRENT_DATE - 7  THEN 1 ELSE 0 END) AS this_wk,
         SUM(CASE WHEN o.order_date <  CURRENT_DATE - 7
                   AND o.order_date >= CURRENT_DATE - 14 THEN 1 ELSE 0 END) AS last_wk
  FROM orders o JOIN users u ON u.user_id = o.user_id
  WHERE o.order_date >= CURRENT_DATE - 14
  GROUP BY 1, 2
)
SELECT city, platform, this_wk, last_wk,
       ROUND(100.0 * (this_wk - last_wk) / NULLIF(last_wk, 0), 1) AS wow_pct
FROM wk
ORDER BY wow_pct;
""")
    S.append(CondPageBreak(95*mm)); h3("Step 7 — Example conclusion")
    box("example", ["Finding: the drop is concentrated in the cart → checkout step, across all cities and platforms, starting the "
                    "same day a new <b>₹30 handling fee + higher small-cart fee</b> for orders under ₹199 went live. Users with "
                    "small baskets (top-up orders, ~40% of orders) abandoned at checkout.",
                    "<b>Recommendation:</b> (1) Immediate — roll back the fee for a test group to confirm causality (A/B test); "
                    "(2) Medium-term — redesign: show fees upfront on product pages, nudge to add items to cross ₹199 "
                    "(\"add ₹23 more for free delivery\"), make fees waived for Blinkit Pass members; (3) Monitor orders, AOV, "
                    "contribution margin per order (the fee was introduced for profitability — so decide on a "
                    "<b>trade-off</b> between order volume and margin, not volume alone).",
                    "<b>Prevention:</b> add checkout conversion as a guardrail in pricing experiments; alerting on hourly order deviation."])
    box("tip", ["Structure to say out loud at the start: \"I will first clarify the metric, confirm the drop is real, break "
                "orders into users × conversion × frequency, segment to find where it is concentrated, then list internal and "
                "external hypotheses and validate the most likely ones.\" Then summarise at the end with root cause, fix "
                "and prevention."])
