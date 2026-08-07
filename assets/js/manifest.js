/* ============================================================
   SITE MANIFEST — single source of truth for site structure.
   site.js reads this to build the TOC, prev/next links and
   progress. Adding a page here adds it everywhere.
   `coming: true` marks modules not yet published (greyed in TOC).
   ============================================================ */
window.SITE_MANIFEST = {
  title: "The Missing Middle",
  subtitle: "Transformers, from the ends you know to the core you don't",
  modules: [
    {
      slug: "00-orientation",
      num: "M0",
      title: "Orientation",
      pages: [
        { slug: "the-map", title: "The Map: What You Know, What's Missing" }
      ]
    },
    {
      slug: "01-math",
      num: "M1",
      title: "The Math You Actually Need",
      pages: [
        { slug: "vectors-are-meaning", title: "Vectors Are Meaning" },
        { slug: "dot-product-similarity", title: "Dot Product = Similarity" },
        { slug: "matrices-transform", title: "Matrices Transform Meaning" },
        { slug: "slopes-and-gradients", title: "Slopes, Gradients & Learning" }
      ]
    },
    {
      slug: "02-embeddings",
      num: "M2",
      title: "Word Embeddings, For Real This Time",
      pages: [
        { slug: "one-hot-and-why-it-fails", title: "One-Hot & Why It Fails" },
        { slug: "word2vec-skip-gram", title: "word2vec: Skip-Gram Internals" },
        { slug: "negative-sampling", title: "Negative Sampling" },
        { slug: "embedding-properties-and-limits", title: "Properties & Limits of Embeddings" }
      ]
    },
    {
      slug: "03-neural-nets",
      num: "M3",
      title: "Neural Network Fundamentals",
      pages: [
        { slug: "the-neuron", title: "The Neuron" },
        { slug: "softmax-and-cross-entropy", title: "Softmax & Cross-Entropy" },
        { slug: "gradient-descent-training-loop", title: "The Training Loop" },
        { slug: "backprop-intuition", title: "Backpropagation, Intuitively" },
        { slug: "optimizers-and-regularization", title: "Optimizers & Regularization" },
        { slug: "measuring-models", title: "Measuring Models: Precision, Recall, F1" },
        { slug: "build-a-tiny-classifier", title: "Build: A Tiny Classifier" }
      ]
    },
    {
      slug: "04-sequences-attention",
      num: "M4",
      title: "Sequences & the Road to Attention",
      pages: [
        { slug: "language-modeling", title: "Language Modeling & Perplexity" },
        { slug: "rnns-and-lstms-briefly", title: "RNNs & LSTMs, Briefly" },
        { slug: "seq2seq-and-the-bottleneck", title: "Seq2Seq & the Bottleneck" },
        { slug: "attention-is-born", title: "Attention Is Born" }
      ]
    },
    {
      slug: "05-transformer",
      num: "M5",
      title: "The Transformer, Piece by Piece",
      pages: [
        { slug: "tokenization-bpe-wordpiece", title: "Tokenization: BPE & WordPiece" },
        { slug: "embeddings-and-positional-encoding", title: "Embeddings & Positional Encoding" },
        { slug: "self-attention-qkv", title: "Self-Attention: Q, K, V" },
        { slug: "multi-head-attention", title: "Multi-Head Attention" },
        { slug: "residuals-layernorm-ffn", title: "Residuals, LayerNorm & FFN" },
        { slug: "the-encoder-block-and-stacking", title: "The Encoder Block & Stacking" },
        { slug: "decoder-masking-and-generation", title: "Decoder, Masking & Generation" },
        { slug: "encoder-vs-decoder-vs-both", title: "Encoder vs Decoder vs Both" }
      ]
    },
    {
      slug: "06-model-families",
      num: "M6",
      title: "Model Families & Pretraining",
      pages: [
        { slug: "pretraining-the-big-idea", title: "Pretraining: The Big Idea" },
        { slug: "bert-and-masked-lm", title: "BERT & Masked Language Modeling" },
        { slug: "gpt-and-causal-lm", title: "GPT & Causal Language Modeling" },
        { slug: "t5-and-seq2seq-revived", title: "T5 & Seq2Seq Revived" },
        { slug: "the-model-zoo-map", title: "The Model Zoo Map" }
      ]
    },
    {
      slug: "07-compute-and-scale",
      num: "M7",
      title: "Compute, Hardware & Scale",
      pages: [
        { slug: "tensors-gpus-and-batching", title: "Tensors, GPUs & Batching" },
        { slug: "model-memory-math", title: "Model Memory Math" },
        { slug: "training-at-scale", title: "Training at Scale" },
        { slug: "scaling-laws-and-chinchilla", title: "Scaling Laws & Chinchilla" },
        { slug: "inference-economics", title: "Inference Economics" }
      ]
    },
    {
      slug: "08-fine-tuning",
      num: "M8",
      title: "Fine-tuning & Adaptation in Depth",
      pages: [
        { slug: "transfer-learning-and-heads", title: "Transfer Learning & Heads" },
        { slug: "the-finetune-recipe", title: "The Fine-tune Recipe" },
        { slug: "instruction-tuning-sft", title: "Instruction Tuning (SFT)" },
        { slug: "rlhf-and-dpo", title: "RLHF & DPO" },
        { slug: "lora-and-peft", title: "LoRA, QLoRA & PEFT" },
        { slug: "finetune-vs-rag-vs-prompt", title: "Fine-tune vs RAG vs Prompt" }
      ]
    },
    {
      slug: "09-sentence-embeddings",
      num: "M9",
      title: "How all-MiniLM Is Actually Made",
      pages: [
        { slug: "from-tokens-to-a-sentence-vector", title: "From Tokens to a Sentence Vector" },
        { slug: "siamese-networks-sbert", title: "Siamese Networks & SBERT" },
        { slug: "contrastive-training-mnr", title: "Contrastive Training & MNR Loss" },
        { slug: "distillation-the-minilm-part", title: "Distillation: The MiniLM Part" },
        { slug: "evaluating-and-tuning-embeddings", title: "Evaluating & Tuning Embeddings" }
      ]
    },
    {
      slug: "10-ner",
      num: "M10",
      title: "NER Internals: Demystifying GLiNER",
      pages: [
        { slug: "ner-as-token-classification", title: "NER as Token Classification" },
        { slug: "gliner-architecture", title: "GLiNER's Architecture" }
      ]
    },
    {
      slug: "11-llm-era",
      num: "M11",
      title: "The LLM Era",
      coming: true,
      pages: [
        { slug: "sampling-temperature-top-p", title: "Sampling: Temperature & Top-p" },
        { slug: "context-windows-and-kv-cache", title: "Context Windows & the KV Cache" },
        { slug: "quantization-and-inference-stack", title: "Quantization & the Inference Stack" },
        { slug: "llm-benchmarks-and-evaluation", title: "LLM Benchmarks & Evaluation" },
        { slug: "reasoning-and-test-time-compute", title: "Reasoning & Test-Time Compute" },
        { slug: "safety-and-guardrails", title: "Safety, Injection & Guardrails" }
      ]
    },
    {
      slug: "12-your-stack",
      num: "M12",
      title: "Demystifying Your Own Stack",
      coming: true,
      pages: [
        { slug: "rag-internals", title: "RAG Internals" },
        { slug: "reranking-and-retrieval-quality", title: "Reranking & Retrieval Quality" },
        { slug: "rag-evaluation", title: "RAG Evaluation" },
        { slug: "tool-calling-and-agents", title: "Tool Calling & Agents" },
        { slug: "what-you-know-now", title: "What You Know Now" }
      ]
    }
  ]
};
