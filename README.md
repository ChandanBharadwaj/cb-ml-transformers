# The Missing Middle

A visual, animated, mobile-first course that bridges the gap between classical NLP
(bag-of-words, TF-IDF, word2vec) and the LLM application layer (RAG, chatbots,
embeddings, agents) — the "middle" that makes everything else make sense:
neural networks, attention, transformers, training, fine-tuning, compute and evaluation.

**Live site:** https://chandanbharadwaj.github.io/cb-ml-transformers/

## What's inside

- 13 modules, 62 pages — the full curriculum, complete
- Step-through SVG animations on every concept (play / pause / step / scrub)
- Math intuition in plain words, real numbers from real models
- "Connect the dots" callouts linking every idea to tools you've already used
- Build exercises and interview questions on every page
- A [Glossary](glossary.html) of every key term and an [Interview Index](interview-index.html)
  cross-referencing all 307 interview questions by theme

## The curriculum

- **M0 Orientation** — the map: what you know, what's missing
- **M1 Math** — vectors, dot products, matrices, gradients
- **M2 Embeddings** — one-hot → word2vec → negative sampling → limits
- **M3 Neural nets** — neuron, softmax, training loop, backprop, optimizers, metrics
- **M4 Sequences → attention** — language modeling, RNNs, seq2seq, attention is born
- **M5 The transformer** — tokenization, positional encoding, Q/K/V, multi-head, residuals, blocks, decoding
- **M6 Model families** — pretraining, BERT, GPT, T5, the model zoo
- **M7 Compute & scale** — tensors/GPUs, memory math, training at scale, scaling laws, inference economics
- **M8 Fine-tuning** — transfer learning, the recipe, SFT, RLHF/DPO, LoRA/QLoRA, fine-tune vs RAG vs prompt
- **M9 Sentence embeddings** — how all-MiniLM is actually made (pooling, SBERT, contrastive/MNR, distillation, evaluation)
- **M10 NER internals** — classic token classification, then GLiNER as similarity search
- **M11 The LLM era** — sampling, KV cache, quantization, benchmarks, reasoning, safety/injection
- **M12 Your stack** — RAG internals, reranking, RAG evaluation, tool calling & agents, and a closing recap

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

<!-- Pages enabled: 2026-08-07T16:56Z -->
