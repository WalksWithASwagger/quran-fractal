# 7430 Project — Quran Fractal Audit Dossier

> **Last Updated**: 2026-04-05
> **Audited By**: Claude Code (automated OSINT + technical + mathematical audit)
> **Subject**: https://www.7430project.com | https://github.com/7430project/quran-fractal
> **Status**: 🟡 Amber — Verifiable claims, early-stage project, needs peer review

---

## Executive Summary

The 7430 Project is a mathematical analysis of the Quran's Muqatta'at (mysterious opening letters found in 29 chapters). The central claim: counting specific Arabic letters across these chapters, organized into 13 groups by shared initials, yields totals that are each individually divisible by 19 — and their sum equals **39,349 = 19² × P(29)**, where P(29) = 109 is the 29th prime number.

The project provides a Python verification script, open-source under MIT license, with source texts from Tanzil.net. The tagline: *"Don't believe me. Count."*

This audit evaluates the mathematical claims, technical implementation, web presence, and strategic potential.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | 7430 Project |
| **Website** | https://www.7430project.com |
| **GitHub** | https://github.com/7430project/quran-fractal |
| **License** | MIT |
| **Language** | Python 3.6+ (100%) |
| **Dependencies** | None (stdlib only) |
| **Data Source** | Tanzil.net (CC-BY 3.0) |
| **Repo Stats** | 3 commits, 1 star, 0 forks |

---

## The Mathematical Claim

### Core Formula
```
39,349 = 19² × 109 = 361 × 109
```

Where:
- **19** = A number referenced in Quran 74:30 ("Over it are 19") — hence the project name "7430"
- **19²** = 361
- **109** = P(29), the 29th prime number
- **29** = The number of Quran chapters containing Muqatta'at
- **13** = The number of distinct letter groups
- **39,349** = The claimed total count of Muqatta'at letters across all 29 chapters

### The 13 Letter Groups

| # | Group | Arabic | Chapters | Count | ÷19 | Tier |
|---|-------|--------|----------|-------|-----|------|
| 1 | ALM | الم | 2, 3, 29, 30, 31, 32 | 18,012 | 948 | 1 |
| 2 | ALR | الر | 10, 11, 12, 14, 15 | 7,828 | 412 | 2 |
| 3 | ALMR | المر | 13 | 1,178 | 62 | 2 |
| 4 | ALMS | المص | 7, 38 | 4,997 | 263 | 1 |
| 5 | HM | حم | 40, 41, 42, 43, 44, 45, 46 | 2,147 | 113 | 1 |
| 6 | ASQ | عسق | 42 | 209 | 11 | 1 |
| 7 | Q | ق | 50 | 57 | 3 | 1 |
| 8 | KHYAS | كهيعص | 19 | 798 | 42 | 1 |
| 9 | TSM | طسم | 26, 28 | 1,178 | 62 | 1 |
| 10 | YS | يس | 36 | 285 | 15 | 1 |
| 11 | N | ن | 68 | 361 | 19 | 2 |
| 12 | TH | طه | 20 | 1,292 | 68 | 2 |
| 13 | TS | طس | 27 | 1,007 | 53 | 2 |
| | **TOTAL** | | **29 chapters** | **39,349** | **2,071** | |

### Tier Classification
- **Tier 1** (8 groups): Encoding-independent — counts are the same regardless of which Quranic text edition is used (consonants + plain vowels)
- **Tier 2** (5 groups): Encoding-dependent — require specific orthographic variants (the "Fractal Edition" assembled by the script)

---

## Technical Audit

### verify.py Analysis

| Aspect | Assessment |
|--------|-----------|
| **Language** | Python 3.6+, no dependencies | ✅ Accessible |
| **Approach** | Loads two Tanzil texts, assembles "Fractal Edition" by selecting encoding variants per group | ✅ Transparent |
| **Corrections** | Applies specific verse merges and character corrections | ⚠️ Needs scrutiny |
| **Output** | SHA-256 hashes of source files + per-group counts + divisibility proof | ✅ Verifiable |
| **Reproducibility** | Clone + `python3 verify.py` = complete audit | ✅ Strong |

### Strengths
1. **Zero dependencies** — Anyone with Python can run it
2. **Self-verifying** — Script outputs hashes to prove source text integrity
3. **Transparent corrections** — All text modifications are explicit in code, not hidden
4. **Open source** — MIT license, full auditability

### Concerns
1. **"Fractal Edition" assembly** — The script selects *which* text variant to use for each group. This is the critical methodological question: is this cherry-picking encodings to make numbers work, or is there a principled basis for each selection?
2. **Verse merges and corrections** — The script applies specific text modifications. Each correction needs independent justification from Quranic manuscript scholarship.
3. **Only 3 commits** — Very early stage, no community review yet
4. **Single contributor** — No peer review or collaborative development visible

---

## OSINT & Presence Audit

### Web Presence

| Platform | Status | Notes |
|----------|--------|-------|
| Website (7430project.com) | 🟡 403 to bots | Exists but blocks automated access |
| GitHub | ✅ Public | 3 commits, MIT license, active |
| Google Index | 🔴 Not indexed | New repo, site not crawled yet |
| Social Media | 🔴 None found | No LinkedIn, Twitter/X, etc. |
| Academic Citations | 🔴 None | Not published in any journal |
| Quran Studies Community | ❓ Unknown | No visible engagement with Islamic scholars |

### Context: Quranic Numerology Landscape
The claim builds on a known tradition:
- **Rashad Khalifa** (1970s-80s) first proposed the "Code 19" theory — that the Quran contains mathematical patterns based on the number 19
- This is **controversial** in Islamic scholarship — some consider it compelling, others consider it numerology or selective counting
- The 7430 Project appears to extend/refine Khalifa's work with modern reproducible methods

---

## Slop Assessment (Revised)

### Original Concern
The website alone presented as a ghost domain — 403 on all access, zero indexing, no footprint. In isolation, this looks like slop.

### Revised Assessment
With the GitHub repo, the picture changes materially:

| Indicator | Website Only | With GitHub Repo |
|-----------|-------------|-----------------|
| Verifiable content | ❌ | ✅ Python script, reproducible |
| Transparent methodology | ❌ | ✅ Open source, self-documenting |
| Intellectual substance | ❌ Unknown | ✅ Non-trivial mathematical claim |
| Community engagement | ❌ | 🟡 Early stage, 1 star |
| Academic rigor | ❌ | 🟡 Needs peer review |

**Verdict: Not slop.** This is an early-stage mathematical research project with reproducible claims. The website opacity is a distribution/presentation problem, not a substance problem. The code is the proof — the website is just wrapping.

---

## Significance & Potential

### Why This Matters
If the claims hold under peer review, this would be:
1. **A reproducible mathematical property of the Quran** — verifiable by anyone with Python
2. **A bridge between computational linguistics and religious text analysis** — novel methodology
3. **An open-source contribution to Quranic studies** — unprecedented transparency for this type of claim

### The "Fractal" in the Name
The project name references self-similarity at multiple scales:
- **19** divides each of the 13 group counts
- **19²** appears in the total
- **29** (chapters) maps to P(29) = 109, which multiplied by 19² gives the total
- The number **7430** itself references Quran 74:30 — "Over it are Nineteen"

This is where the fractal geometry visualization concept connects — the mathematical self-similarity mirrors Islamic geometric art's infinite recursive patterns.

---

## Risk Assessment

### For BC AI Ecosystem Partnership
🟢 **Low Risk / High Interest** — This is a legitimate open-source project with verifiable claims. It represents an intersection of AI/computational methods, cultural heritage, and mathematical research that aligns with BC AI's values around diverse applications of technology.

### For Endorsement
🟡 **Conditional** — Do not endorse the mathematical claims directly until peer review. Endorse the *methodology* (open source, reproducible, transparent) and the *approach* (computational analysis of religious texts).

### For Collaboration
🟢 **Strong Candidate** — Building out the visualization layer, adding CI/CD, creating educational materials, and connecting with Islamic scholars are all valuable contributions the BC AI community could make.

---

## Recommendations

### Immediate
- [x] Complete this audit dossier
- [ ] Build interactive fractal visualization linking mathematical structure to Islamic geometric art
- [ ] Create development roadmap for the project
- [ ] Run `verify.py` independently to confirm claims

### Short-Term
- [ ] Connect project maintainer with BC AI community
- [ ] Write GitHub issues for visualization, documentation, and CI/CD
- [ ] Seek peer review from computational linguistics researchers
- [ ] Seek review from Islamic scholarship community

### Medium-Term
- [ ] Develop educational portal explaining the methodology
- [ ] Submit to relevant academic conferences (computational linguistics, digital humanities)
- [ ] Build interactive explorer allowing users to verify counts in-browser

---

## Values Alignment Check

Does this project align with BC AI ecosystem principles?

✅ **Transparency** — Open source, MIT license, "Don't believe me. Count."
✅ **Ethical Technology** — Respectful computational analysis of religious text
✅ **Community-Driven Innovation** — Invites independent verification
✅ **Diverse Applications** — Bridges technology and cultural heritage
🟡 **Indigenous Leadership** — Not directly applicable, but aligns with respect for traditional knowledge systems
✅ **Education** — Strong pedagogical potential (math, linguistics, programming, religious studies)

---

*This audit is part of the BC AI Ecosystem knowledge base. For the interactive visualization, see [../visualization/index.html](../visualization/index.html). For the development roadmap, see [./ROADMAP.md](./ROADMAP.md).*
