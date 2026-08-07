# The Missing Middle

A visual, animated, mobile-first course that bridges the gap between classical NLP
(bag-of-words, TF-IDF, word2vec) and the LLM application layer (RAG, chatbots,
embeddings, agents) — the "middle" that makes everything else make sense:
neural networks, attention, transformers, training, fine-tuning, compute and evaluation.

**Live site:** https://chandanbharadwaj.github.io/cb-ml-transformers/

## What's inside

- 13 modules, ~61 pages, published in phases (unpublished modules show as "coming soon")
- Step-through SVG animations on every concept (play / pause / step / scrub)
- Math intuition in plain words, real numbers from real models
- "Connect the dots" callouts linking every idea to tools you've already used
- Build exercises and interview questions on every page

## Tech

Pure static HTML/CSS/vanilla JS — no build step, no dependencies.

- `assets/js/manifest.js` — single source of truth for site structure (modules → pages)
- `assets/js/site.js` — injects header, TOC drawer, prev/next, progress from the manifest
- `assets/js/stepplayer.js` — declarative SVG step-animation engine
- `assets/css/site.css` — one mobile-first, light-theme stylesheet

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening files directly via `file://` also works — scripts are plain, no modules.)
