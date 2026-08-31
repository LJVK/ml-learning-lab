export const conceptGroups = [
  {
    id: "attention",
    title: "Attention Family",
    description:
      "Core attention mechanisms used in Transformers and generative AI systems.",
    topics: [
      {
  title: "Self-Attention",
  id: "self-attention",
  summary:
    "Lets each token attend to other tokens in the same sequence and build context-aware representations.",
  details: {
    intuition:
      "Each token asks: “Which other tokens should I use to update my own meaning?”",

    coreIdea:
      "Self-attention lets every token compare itself with every other token in the same sequence. The result is a new contextual representation for each token.",

    mechanismSteps: [
      "Create Q, K, and V projections from the input x.",
      "Compare Q with K using dot product similarity.",
      "Scale the scores by sqrt(d) to avoid unstable softmax behavior.",
      "Apply softmax over the key dimension to get attention weights.",
      "Multiply attention weights with V to create contextual token representations.",
      "Project the output back to the model dimension.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "Q, K, V            → (B, T, D)",
      "scores = QKᵀ       → (B, T, T)",
      "attention          → (B, T, T)",
      "attention @ V      → (B, T, D)",
      "output             → (B, T, D)",
    ],

    whyItMatters:
      "Self-attention gives Transformers long-range token interaction and parallel processing, avoiding the sequential bottleneck of RNN/LSTM-style models.",

    commonMistakes: [
      "Applying softmax over the wrong dimension. It should be over keys, usually dim=-1.",
      "Forgetting to scale scores by sqrt(d), which can make softmax too sharp.",
      "Thinking attention weights are the final output. They are used to mix V.",
      "Expecting self-attention alone to understand order. Positional information is still needed.",
    ],

    keyTakeaways: [
      "Q means what this token is looking for.",
      "K means how this token can be matched.",
      "V means what information this token provides.",
      "Attention output is a weighted mixture of value vectors.",
      "Self-attention preserves shape: (B, T, D) in and (B, T, D) out.",
    ],

    recallQuestion: {
      prompt:
        "In self-attention, what does the attention weight between token i and token j actually control?",
      options: [
        {
          text:
            "How much of token j's value vector is mixed into token i's output.",
          correct: true,
          feedback:
            "Right — attention[i][j] is the scalar coefficient on V[j] when computing output[i]. The output for token i is a weighted sum of every token's V vector.",
        },
        {
          text: "How similar token i and token j are in the input embedding.",
          correct: false,
          feedback:
            "Not quite — similarity is measured on Q and K projections, not on the raw input embeddings. Two tokens with similar embeddings can produce very different Q/K vectors.",
        },
        {
          text:
            "Whether token i is allowed to attend to token j (a binary decision).",
          correct: false,
          feedback:
            "That is what a mask does, not what the attention weight does. The weight is a continuous value in [0, 1] after softmax; masks are applied earlier by adding -infinity to blocked scores.",
        },
      ],
    },
  },
},
      {
  title: "Multi-Head Attention",
  id: "multi-head-attention",
  summary:
    "Runs multiple attention heads in parallel so the model can learn different relationship patterns.",
  details: {
    intuition:
      "Instead of asking one attention question, the model asks several different attention questions in parallel.",

    coreIdea:
      "Multi-head attention splits the model dimension into multiple heads. Each head learns its own Q, K, and V projections, attends over the full sequence, and captures different relationship patterns. The head outputs are then concatenated and projected back to the model dimension.",

    mechanismSteps: [
      "Project input x into Q, K, and V.",
      "Reshape Q, K, and V from (B, T, D) into multiple heads: (B, H, T, Dh).",
      "Run scaled dot-product attention independently inside each head.",
      "Each head produces an output of shape (B, T, Dh).",
      "Concatenate all heads back into (B, T, D).",
      "Apply output projection to mix information across heads.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "Q, K, V            → (B, T, D)",
      "reshape heads      → (B, H, T, Dh)",
      "scores = QKᵀ       → (B, H, T, T)",
      "attention          → (B, H, T, T)",
      "attention @ V      → (B, H, T, Dh)",
      "concat heads       → (B, T, D)",
      "output             → (B, T, D)",
    ],

    whyItMatters:
      "A single attention head learns one similarity pattern. Multiple heads let the model learn several different kinds of relationships at the same time, such as syntax, long-range dependency, local context, or semantic grouping.",

    commonMistakes: [
      "Thinking each head sees different tokens. Each head usually sees the full sequence.",
      "Using sqrt(embed_dim) instead of sqrt(head_dim) for scaling inside each head.",
      "Forgetting to transpose into (B, H, T, Dh) before computing attention.",
      "Using view after transpose without calling contiguous or using reshape.",
      "Thinking concatenation alone is enough. The output projection mixes information across heads.",
    ],

    keyTakeaways: [
      "H is the number of heads.",
      "Dh is head_dim, usually D / H.",
      "Each head has its own learned attention space.",
      "All heads attend over the full sequence.",
      "The final output preserves shape: (B, T, D).",
    ],

    recallQuestion: {
      prompt:
        "A model has embedding dim D = 512 and H = 8 heads. What is the per-head dimension D_h that each attention head operates on?",
      options: [
        {
          text: "64 — the model dimension D is split evenly across heads: D_h = D / H.",
          correct: true,
          feedback:
            "Right — D = H · D_h. Each head sees a 64-dim slice of every token vector. Total compute stays comparable to a single 512-dim head, but the H parallel patterns are the point.",
        },
        {
          text: "512 — every head operates on the full model dimension.",
          correct: false,
          feedback:
            "That would be 8 heads each doing single-head attention at full dim, costing 8× the compute. Multi-head attention splits the dim so total work stays similar to single-head.",
        },
        {
          text: "4096 — heads concatenate first, then attention is computed once.",
          correct: false,
          feedback:
            "Heads run in parallel, not concatenated first. Concatenation happens at the end (B, H, T, D_h) → (B, T, D), followed by the output projection.",
        },
      ],
    },
  },
},
      {
  title: "Cross Attention",
  id: "cross-attention",
  summary:
    "Lets target tokens attend to a separate source sequence, updating the target using information from that source.",
  details: {
    intuition:
      "Target tokens ask questions, and source tokens provide the information used to answer them.",

    coreIdea:
      "Cross attention uses Q from the target sequence and K/V from the source sequence. The attention output updates the target tokens, because there is one output vector for each query token. The source sequence provides the context through K and V.",

    mechanismSteps: [
      "Take target tokens that need to be updated.",
      "Take source tokens that provide external context.",
      "Create Q from the target tokens.",
      "Create K and V from the source tokens.",
      "Compare Q with K to decide which source tokens each target token should attend to.",
      "Apply softmax over the source/key tokens.",
      "Use the attention weights to mix V from the source.",
      "Return updated target-side token representations.",
    ],

    shapeFlow: [
      "target tokens       → (B, T_target, D)",
      "source tokens       → (B, T_source, D)",
      "Q from target       → (B, T_target, D)",
      "K, V from source    → (B, T_source, D)",
      "scores = QKᵀ        → (B, T_target, T_source)",
      "attention           → (B, T_target, T_source)",
      "attention @ V       → (B, T_target, D)",
      "output              → (B, T_target, D)",
    ],

    whyItMatters:
      "Cross attention is the main mechanism for conditioning one sequence or modality on another. In text-to-image diffusion, image or latent tokens usually form Q, while text tokens form K and V. This lets the image representation update itself using prompt information.",

    commonMistakes: [
      "Confusing which side provides Q and which side provides K/V.",
      "Forgetting that the output shape follows the query/target sequence length.",
      "Thinking K alone injects information. K helps matching; V carries the information that gets mixed into the output.",
      "Using target tokens as V when the goal is to inject source information.",
      "Thinking cross attention replaces self-attention. Cross attention aligns with external context, while self-attention maintains internal coherence.",
    ],

    keyTakeaways: [
      "Q comes from the tokens that will be updated.",
      "K and V come from the source/context tokens.",
      "Output length equals the query/target sequence length.",
      "K controls matching; V carries the information being passed.",
      "In text-to-image diffusion, image/latent tokens usually query text tokens.",
    ],

    recallQuestion: {
      prompt:
        "A decoder processes a target sequence of length 10 tokens by cross-attending to an encoder output of length 50 tokens. What is the shape of the cross-attention score matrix Q · Kᵀ (ignoring batch and heads)?",
      options: [
        {
          text: "10 × 50 — one row per target query, one column per source key.",
          correct: true,
          feedback:
            "Right — the matrix is rectangular. Rows index the target (query) sequence; columns index the source (key/value) sequence. Softmax runs across columns so each target row sums to 1.",
        },
        {
          text: "50 × 10 — one row per source, one column per target.",
          correct: false,
          feedback:
            "Rows come from the query side, not the key side. Q · Kᵀ has query-length rows because we're computing 'how much does each query attend to each key'.",
        },
        {
          text: "60 × 60 — cross-attention concatenates source and target first.",
          correct: false,
          feedback:
            "Cross-attention keeps the two sequences separate. Concatenating source + target and running self-attention on the combined sequence is a different mechanism (sometimes called prefix or joint attention).",
        },
      ],
    },
  },
},
      {
  title: "Attention Internals",
  id: "attention-internals",
  summary:
    "Explains how Q, K, and V learn routing and content roles through gradients.",
  details: {
    intuition:
      "Attention is not manually programmed. The model learns what to look for, how to match, and what information to pass through training.",

    coreIdea:
      "Q, K, and V are learned projections. Q and K learn a routing space that decides which tokens should attend to which other tokens. V learns the content representation that gets passed when attention weights mix information.",

    mechanismSteps: [
      "Start with token representations x.",
      "Apply learned linear layers to create Q, K, and V.",
      "Use Q and K to compute attention scores.",
      "Softmax turns scores into routing probabilities.",
      "Use those probabilities to mix V.",
      "Backpropagation updates Wq, Wk, and Wv based on how useful the routed information was for reducing loss.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "Wq, Wk, Wv         → learned parameters",
      "Q, K, V            → (B, T, D)",
      "routing scores     → (B, T, T)",
      "attention weights  → (B, T, T)",
      "mixed V output     → (B, T, D)",
      "loss gradients     → update Wq, Wk, Wv",
    ],

    whyItMatters:
      "Understanding the internals prevents treating attention as magic. It clarifies why heads specialize, why attention maps can be misleading, and how gradients teach the model useful token relationships.",

    commonMistakes: [
      "Thinking Q, K, and V have fixed meanings before training.",
      "Assuming high attention always means causal importance.",
      "Thinking V controls where attention goes. Q and K control matching; V carries content.",
      "Assuming each head is manually assigned a role like syntax or color.",
      "Interpreting attention maps without testing interventions such as masking, replacing, or ablating tokens.",
    ],

    keyTakeaways: [
      "Q and K learn how tokens match.",
      "V learns what content gets passed.",
      "Backpropagation teaches attention by rewarding useful routing paths.",
      "Heads specialize because they have separate learned projections.",
      "Attention maps are useful clues, but not proof of causality.",
    ],

    recallQuestion: {
      prompt:
        "You inspect a model and find that token 'it' has a 0.82 attention weight on token 'dog'. What is the safest conclusion you can draw from this alone?",
      options: [
        {
          text:
            "The 0.82 weight is a correlation — you cannot conclude causal importance without an intervention like ablating 'dog' and measuring the output change.",
          correct: true,
          feedback:
            "Right — this is the interpretability trap. High attention weight only shows that Q_it · K_dog is large; it does not prove the model actually relied on V_dog for its output. Ablation, replacement, or corruption is what turns a correlation into evidence of causal importance.",
        },
        {
          text:
            "The model has learned coreference and is resolving 'it' to refer to 'dog'.",
          correct: false,
          feedback:
            "Attention maps are suggestive, not conclusive. The model could be picking up a positional shortcut, an artifact of the training distribution, or a dead-head-style pattern. Without an intervention test, coreference is just one plausible story among many.",
        },
        {
          text:
            "The head is specialized for pronoun resolution because heads are manually assigned roles.",
          correct: false,
          feedback:
            "Heads are not manually assigned. Specialization emerges from training on the loss; you can only name a head's role by observing its behavior across many inputs — and even then, it is a summary, not a specification.",
        },
      ],
    },
  },
},
      {
  title: "Masks",
  id: "masks",
  summary:
    "Controls which tokens are allowed to attend to which other tokens.",
  details: {
    intuition:
      "A mask tells attention: “You are not allowed to look at these positions.”",

    coreIdea:
      "Masks modify attention scores before softmax so certain positions receive zero attention probability. This is used to ignore padding tokens and to prevent decoder/GPT models from looking at future tokens.",

    mechanismSteps: [
      "Compute attention scores from Q and K.",
      "Identify positions that should not be attended to.",
      "Set blocked score positions to a very negative value like -inf.",
      "Apply softmax over the key dimension.",
      "Masked positions become probability 0.",
      "Use the masked attention weights to mix V.",
    ],

    shapeFlow: [
      "scores             → (B, H, T, T)",
      "padding mask       → blocks PAD tokens",
      "causal mask        → blocks future tokens",
      "masked scores      → (B, H, T, T)",
      "softmax            → masked positions become 0",
      "attention @ V      → (B, H, T, Dh)",
    ],

    whyItMatters:
      "Without masks, models can learn from invalid positions. Padding masks prevent PAD tokens from stealing attention. Causal masks preserve autoregressive generation by ensuring each token only attends to previous tokens.",

    commonMistakes: [
      "Applying the mask after softmax instead of before softmax.",
      "Masking with 0 instead of -inf before softmax, which can still give blocked positions probability.",
      "Forgetting that causal masks are required for GPT-style next-token prediction.",
      "Creating a mask shape that does not broadcast correctly to attention scores.",
      "Masking all positions in a row, which can produce NaN after softmax.",
    ],

    keyTakeaways: [
      "Padding masks block meaningless PAD tokens.",
      "Causal masks block future tokens.",
      "Masks are applied before softmax.",
      "Masked scores should become -inf or a very large negative value.",
      "Causal masking is essential for autoregressive models.",
    ],

    recallQuestion: {
      prompt:
        "A decoder self-attention layer produces NaN in the output at inference. You inspect the mask and find that one row of the attention matrix is fully blocked (every key is either PAD or in the future). What is happening?",
      options: [
        {
          text:
            "The softmax denominator becomes exp(-inf) + exp(-inf) + … = 0, so every masked score divided by 0 gives NaN.",
          correct: true,
          feedback:
            "Right — softmax of an all-masked row is 0/0 = NaN. Common causes: a causal mask at position 0 combined with a padding mask that blocks position 0 too, or an off-by-one in mask construction. Production code guards against this by using a large negative constant (e.g. -1e9) with a small clamp, or by ensuring every query row has at least one allowed key.",
        },
        {
          text:
            "The −∞ values overflow float16 during the softmax and produce NaN downstream.",
          correct: false,
          feedback:
            "Softmax of finite scores in float16 is stable — the max-subtraction trick inside softmax handles range. The NaN here comes from a fully-masked row: 0 / 0 after normalization, not overflow.",
        },
        {
          text:
            "Applying the mask after softmax instead of before allows blocked positions to still leak probability, which corrupts the normalization.",
          correct: false,
          feedback:
            "That is a real bug, but it produces incorrect weights (not NaN) — blocked positions get some non-zero probability. The NaN symptom specifically points to an all-masked row.",
        },
      ],
    },
  },
},
      {
  title: "Encoder vs Decoder Attention",
  id: "encoder-vs-decoder-attention",
  summary:
    "Explains bidirectional encoder attention, causal decoder attention, and encoder-decoder cross-attention.",
  details: {
    intuition:
      "Encoder attention can look everywhere, but decoder attention must look only backward when generating tokens.",

    coreIdea:
      "Encoder self-attention usually uses full bidirectional attention because the full input is already available. Decoder self-attention uses causal masking so each token can only attend to previous tokens. Encoder-decoder models also use cross attention, where decoder tokens query encoder outputs.",

    mechanismSteps: [
      "Encoder receives the full input sequence.",
      "Encoder self-attention lets every input token attend to every other input token.",
      "Decoder generates output tokens step by step.",
      "Decoder self-attention uses a causal mask to block future tokens.",
      "In encoder-decoder models, decoder states become Q.",
      "Encoder outputs become K and V for cross attention.",
      "The decoder updates its tokens using both previous output context and encoded input context.",
    ],

    shapeFlow: [
      "encoder input       → (B, T_src, D)",
      "encoder self-attn   → (B, T_src, D)",
      "decoder input       → (B, T_tgt, D)",
      "causal self-attn    → (B, T_tgt, D)",
      "Q from decoder      → (B, T_tgt, D)",
      "K, V from encoder   → (B, T_src, D)",
      "cross-attn output   → (B, T_tgt, D)",
    ],

    whyItMatters:
      "This distinction explains why BERT-style encoders are good for understanding tasks, GPT-style decoders are good for generation, and encoder-decoder models are useful for sequence-to-sequence tasks like translation or summarization.",

    commonMistakes: [
      "Thinking all Transformer attention is causal.",
      "Forgetting that encoder self-attention can be bidirectional.",
      "Letting decoder self-attention see future tokens during training.",
      "Confusing decoder self-attention with encoder-decoder cross attention.",
      "Using raw encoder input as K/V instead of contextual encoder outputs.",
    ],

    keyTakeaways: [
      "Encoder self-attention is usually bidirectional.",
      "Decoder self-attention is causal.",
      "GPT is decoder-only and uses causal self-attention.",
      "Encoder-decoder models use cross attention from decoder to encoder.",
      "Cross-attention output length follows the decoder/query sequence.",
    ],

    recallQuestion: {
      prompt:
        "You are implementing an encoder-decoder Transformer with 6 encoder blocks and 6 decoder blocks. How many times does the encoder actually run per training step, and what does each decoder block use as its cross-attention K/V input?",
      options: [
        {
          text:
            "The encoder runs once. Its final output H_enc (shape B × T_source × D) is reused as the K/V input by all 6 decoder blocks' cross-attention sublayers.",
          correct: true,
          feedback:
            "Right — one encoder pass produces one H_enc tensor. Every decoder block re-projects that same H_enc into its own K and V using that block's W_k and W_v. This is why the cross-attention arrows fan out from the top of the encoder to every decoder block: same signal, block-specific projections.",
        },
        {
          text:
            "The encoder runs 6 times, once per decoder block, so each decoder block gets a freshly computed encoder representation.",
          correct: false,
          feedback:
            "That would multiply compute by 6× for no gain. The encoder is deterministic given its input, so running it repeatedly gives the same H_enc. Modern implementations cache the encoder output once per forward pass.",
        },
        {
          text:
            "Each decoder block cross-attends to the corresponding encoder block at the same depth (decoder 1 ↔ encoder 1, etc.).",
          correct: false,
          feedback:
            "Not the standard design. In the original Transformer, every decoder block attends to the encoder's TOP output. Some experimental variants use per-depth attention, but the default is 'top of encoder → every decoder block'.",
        },
      ],
    },
  },
},
      {
  title: "Positional Information",
  id: "positional-information",
  summary:
    "Adds order information so attention can understand token positions and sequence structure.",
  details: {
    intuition:
      "Attention can compare tokens, but by itself it does not know where tokens are located in the sequence.",

    coreIdea:
      "Self-attention is permutation-invariant unless position information is added. Positional information tells the model token order, distance, and sequence structure so it can distinguish meanings that depend on order.",

    mechanismSteps: [
      "Start with token embeddings.",
      "Add or inject position information into the token representation.",
      "Use the position-aware representations to create Q, K, and V.",
      "Attention scores now depend on both token meaning and position.",
      "The model can distinguish different token orders and relative relationships.",
    ],

    shapeFlow: [
      "token embeddings    → (B, T, D)",
      "position info       → (T, D) or applied to Q/K",
      "position-aware x    → (B, T, D)",
      "Q, K, V             → (B, T, D)",
      "attention scores    → (B, T, T)",
      "output              → (B, T, D)",
    ],

    whyItMatters:
      "Without positional information, a Transformer cannot reliably distinguish sequences with the same tokens in different orders. This is critical for language, code, time series, and image patches.",

    commonMistakes: [
      "Thinking token embeddings alone tell the model order.",
      "Forgetting that attention without position is insensitive to token order.",
      "Confusing absolute position with relative position.",
      "Assuming all positional methods generalize equally well to longer context.",
      "Thinking RoPE changes V. RoPE is typically applied to Q and K.",
    ],

    keyTakeaways: [
      "Attention needs positional information to understand order.",
      "Absolute position tells where a token is.",
      "Relative position tells how far tokens are from each other.",
      "RoPE makes Q/K interactions position-aware.",
      "Long-context models depend heavily on good positional handling.",
    ],

    recallQuestion: {
      prompt:
        "You train a model with learned positional embeddings and max_len = 2048. At inference you feed it a 4096-token document and outputs after position 2048 look garbled. Why?",
      options: [
        {
          text:
            "Learned positional embeddings are a lookup table of size max_len; there is no learned vector for positions ≥ 2048, so the model has never seen those positions during training.",
          correct: true,
          feedback:
            "Right — learned PE is essentially nn.Embedding(max_len, D), and inputs past max_len either index-out-of-bounds or fall back to garbage. Fixes: retrain with larger max_len, switch to sinusoidal PE (deterministic, extrapolates by formula), or switch to RoPE (relative, extrapolates via rotation). This is why most long-context LLMs use RoPE.",
        },
        {
          text:
            "The attention mechanism only supports up to 2048 tokens — beyond that, self-attention scores overflow.",
          correct: false,
          feedback:
            "Attention itself has no built-in length limit. The √d_k scaling keeps scores well-behaved regardless of sequence length. The failure is specifically at the positional-encoding layer, not attention.",
        },
        {
          text:
            "Sinusoidal PE gets ambiguous past max_len because sines and cosines wrap around.",
          correct: false,
          feedback:
            "This describes sinusoidal PE, but the question is about learned PE. Sinusoidal PE has a valid value at every integer position — high-frequency dims do repeat, but low-frequency dims stay unique enough that the fingerprint remains distinguishable well beyond training length.",
        },
      ],
    },
  },
},
    ],
  },
  {
    id: "transformer-block",
    title: "Transformer Block Family",
    description:
      "The building blocks that make modern Transformer architectures trainable and scalable.",
    topics: [
      {
  title: "Residual Connections",
  id: "residual-connections",
  summary:
    "Allow each block to learn an update to the input instead of replacing the input completely.",
  details: {
    intuition:
      "A residual connection lets the model keep the original representation and add a learned update on top of it.",

    coreIdea:
      "Instead of forcing a layer to completely rewrite x, residual connections use x + sublayer(x). This makes optimization easier, preserves useful information, and gives gradients a more direct path through deep networks.",

    mechanismSteps: [
      "Start with input representation x.",
      "Pass x through a sublayer such as attention or FFN.",
      "The sublayer produces an update with the same shape as x.",
      "Add the update back to the original x.",
      "Pass the updated representation to the next part of the block.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "sublayer(x)        → (B, T, D)",
      "x + sublayer(x)    → (B, T, D)",
      "output             → (B, T, D)",
    ],

    whyItMatters:
      "Residual connections make deep Transformers trainable. They help preserve information across layers and reduce the risk that useful token representations are destroyed too early.",

    commonMistakes: [
      "Trying to add tensors with different shapes.",
      "Forgetting that residual addition requires the same D dimension.",
      "Thinking residuals replace LayerNorm. Residuals help information and gradients flow, while LayerNorm stabilizes scale.",
      "Letting the learned branch dominate too much, which can destabilize training.",
    ],

    keyTakeaways: [
      "Residual formula is x + update.",
      "The update must have the same shape as x.",
      "Residuals help preserve information.",
      "Residuals improve gradient flow in deep models.",
      "Transformer blocks usually have one residual around attention and one around FFN.",
    ],
  },
},
      {
  title: "LayerNorm",
  id: "layernorm",
  summary:
    "Stabilizes token representations by normalizing across the feature dimension.",
  details: {
    intuition:
      "LayerNorm keeps each token’s feature values in a stable range before the next transformation.",

    coreIdea:
      "LayerNorm normalizes each token independently across its feature dimension D. This stabilizes activations inside deep Transformer blocks and helps attention and FFN layers receive better-conditioned inputs.",

    mechanismSteps: [
      "Take one token representation with D features.",
      "Compute the mean across that token’s D features.",
      "Compute the variance across that token’s D features.",
      "Normalize the token features.",
      "Apply learnable gamma and beta so the model can restore useful scale and shift.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "mean over D        → (B, T, 1)",
      "variance over D    → (B, T, 1)",
      "normalized x       → (B, T, D)",
      "gamma, beta        → (D)",
      "output             → (B, T, D)",
    ],

    whyItMatters:
      "Residual connections help information flow, but they do not control activation scale. LayerNorm prevents representations from drifting too large or too small as many Transformer blocks are stacked.",

    commonMistakes: [
      "Confusing LayerNorm with BatchNorm.",
      "Normalizing across the batch instead of across D for each token.",
      "Thinking gamma and beta are optional. They restore learned flexibility after normalization.",
      "Assuming LayerNorm and attention scaling solve the same problem. Attention scaling stabilizes scores; LayerNorm stabilizes representations.",
    ],

    keyTakeaways: [
      "LayerNorm normalizes each token independently.",
      "It normalizes across the feature dimension D.",
      "It preserves shape: (B, T, D).",
      "Gamma and beta are learnable scale and shift parameters.",
      "LayerNorm is critical for stable deep Transformer training.",
    ],
  },
},
      {
  title: "Pre-LN vs Post-LN",
  id: "pre-ln-vs-post-ln",
  summary:
    "Compares where LayerNorm is applied and why Pre-LN is usually more stable in deep Transformers.",
  details: {
    intuition:
      "Pre-LN normalizes before the sublayer; Post-LN normalizes after the residual update.",

    coreIdea:
      "In Post-LN, the block does x = LayerNorm(x + sublayer(x)). In Pre-LN, the block does x = x + sublayer(LayerNorm(x)). Pre-LN is usually more stable for deep Transformers because the sublayer receives normalized input and the residual path remains cleaner for gradient flow.",

    mechanismSteps: [
      "Post-LN sends x directly into the sublayer.",
      "Post-LN adds the sublayer output back to x.",
      "Post-LN applies LayerNorm after the residual addition.",
      "Pre-LN applies LayerNorm before the sublayer.",
      "Pre-LN adds the sublayer output back to the original residual stream.",
      "Pre-LN keeps the residual path less disrupted across many stacked layers.",
    ],

    shapeFlow: [
      "x                         → (B, T, D)",
      "Post-LN: LN(x + F(x))     → (B, T, D)",
      "Pre-LN: x + F(LN(x))     → (B, T, D)",
      "output                    → (B, T, D)",
    ],

    whyItMatters:
      "The placement of LayerNorm strongly affects training stability. Pre-LN usually trains deeper Transformers more reliably, while Post-LN can be harder to optimize without careful tuning.",

    commonMistakes: [
      "Thinking Pre-LN and Post-LN are just cosmetic changes.",
      "Forgetting that both versions preserve the same output shape.",
      "Assuming Pre-LN has no downside. Its residual stream may drift in scale, so many models use a final LayerNorm.",
      "Confusing LayerNorm placement with attention masking or attention scaling.",
    ],

    keyTakeaways: [
      "Post-LN applies LayerNorm after residual addition.",
      "Pre-LN applies LayerNorm before the sublayer.",
      "Pre-LN is usually more stable for deep Transformers.",
      "Post-LN can be more difficult to train at large depth.",
      "Both preserve the (B, T, D) interface.",
    ],
  },
},
      {
  title: "FFN / MLP",
  id: "ffn-mlp",
  summary:
    "Adds nonlinear per-token feature transformation after attention has mixed token information.",
  details: {
    intuition:
      "Attention mixes information across tokens; FFN transforms each token’s features after that context has been gathered.",

    coreIdea:
      "The FFN is a small neural network applied independently to each token. It usually expands the model dimension D to a larger hidden dimension, applies a nonlinearity like GELU, and projects back to D so residual connections and stacking still work.",

    mechanismSteps: [
      "Take contextualized token representations after attention.",
      "Apply a linear layer from D to hidden_dim.",
      "Apply a nonlinear activation such as GELU.",
      "Apply another linear layer from hidden_dim back to D.",
      "Add the FFN output back to the residual stream.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "linear 1           → (B, T, hidden_dim)",
      "GELU               → (B, T, hidden_dim)",
      "linear 2           → (B, T, D)",
      "residual add       → (B, T, D)",
      "output             → (B, T, D)",
    ],

    whyItMatters:
      "Attention decides how tokens exchange information, but it is not enough by itself. The FFN adds nonlinear feature transformation, increasing the model’s ability to form richer token representations.",

    commonMistakes: [
      "Thinking FFN mixes tokens. It is usually applied independently to each token.",
      "Removing the activation, which makes the two linear layers collapse into one linear transformation.",
      "Forgetting to project back to D, which breaks residual addition and stacking.",
      "Making hidden_dim too small, reducing capacity.",
      "Making hidden_dim too large, increasing compute, memory, and overfitting risk.",
    ],

    keyTakeaways: [
      "Attention mixes across tokens.",
      "FFN transforms features within each token.",
      "FFN usually follows D → hidden_dim → D.",
      "The activation makes the FFN nonlinear and expressive.",
      "The output must return to D to preserve the Transformer block interface.",
    ],
  },
},
      {
  title: "Full Transformer Block",
  id: "full-transformer-block",
  summary:
    "Combines attention, FFN, LayerNorm, and residual connections into one reusable block.",
  details: {
    intuition:
      "A Transformer block first lets tokens communicate, then transforms each token’s features, while residuals and LayerNorm keep training stable.",

    coreIdea:
      "A Pre-LN Transformer block combines Multi-Head Attention, FFN/MLP, two LayerNorms, and two residual connections. Attention updates each token using context from other tokens. FFN then applies nonlinear feature transformation to each token independently.",

    mechanismSteps: [
      "Start with input x.",
      "Apply LayerNorm before attention.",
      "Run Multi-Head Self-Attention.",
      "Add the attention output back to x using a residual connection.",
      "Apply a second LayerNorm before FFN.",
      "Run FFN/MLP.",
      "Add the FFN output back using another residual connection.",
      "Return the updated token representations.",
    ],

    shapeFlow: [
      "x                         → (B, T, D)",
      "norm1(x)                  → (B, T, D)",
      "attention(norm1(x))       → (B, T, D)",
      "x + attention_out         → (B, T, D)",
      "norm2(x)                  → (B, T, D)",
      "ffn(norm2(x))             → (B, T, D)",
      "x + ffn_out               → (B, T, D)",
      "output                    → (B, T, D)",
    ],

    whyItMatters:
      "The Transformer block is the reusable unit behind modern Transformer models. Stacking these blocks allows models to build richer representations while preserving a stable input/output interface.",

    commonMistakes: [
      "Forgetting one of the two residual connections.",
      "Reusing the same LayerNorm for attention and FFN instead of separate LayerNorms.",
      "Applying LayerNorm after the sublayer when intending to implement Pre-LN.",
      "Forgetting that both attention and FFN must return shape (B, T, D).",
      "Thinking attention alone is the full block. FFN is also essential.",
    ],

    keyTakeaways: [
      "A Transformer block has attention plus FFN.",
      "Pre-LN applies LayerNorm before each sublayer.",
      "There are usually two residual connections.",
      "The block preserves shape: (B, T, D).",
      "Transformer models are built by stacking these blocks.",
    ],
  },
},
      {
  title: "Stacking Transformer Blocks",
  id: "stacking-transformer-blocks",
  summary:
    "Shows how repeated blocks increase model capacity while preserving the (B, T, D) interface.",
  details: {
    intuition:
      "Each block refines the token representations one more time, so deeper stacks can build richer patterns.",

    coreIdea:
      "Transformer blocks are designed to preserve the same input/output shape. This lets us stack many blocks repeatedly. Each block performs another round of attention-based token mixing and FFN-based feature transformation.",

    mechanismSteps: [
      "Start with token representations x.",
      "Pass x through the first Transformer block.",
      "The block returns output with the same shape: (B, T, D).",
      "Feed that output into the next Transformer block.",
      "Repeat this process for many layers.",
      "Later blocks operate on increasingly contextualized representations.",
    ],

    shapeFlow: [
      "x                  → (B, T, D)",
      "block 1 output     → (B, T, D)",
      "block 2 output     → (B, T, D)",
      "block 3 output     → (B, T, D)",
      "final output       → (B, T, D)",
    ],

    whyItMatters:
      "Stacking blocks increases model capacity. More layers allow the model to learn more abstract relationships, but they also increase parameters, memory usage, training cost, and inference latency.",

    commonMistakes: [
      "Thinking each block must change the tensor shape.",
      "Forgetting that residual connections require the same D dimension.",
      "Adding many blocks without considering memory and compute cost.",
      "Assuming deeper is always better. More depth can be harder to train and may have diminishing returns.",
      "Forgetting final LayerNorm in many Pre-LN Transformer designs.",
    ],

    keyTakeaways: [
      "Transformer blocks can be stacked because they preserve (B, T, D).",
      "Each block adds another round of token mixing and feature transformation.",
      "More blocks usually increase capacity.",
      "More blocks also increase compute, memory, and latency.",
      "Stable shape is what makes deep Transformer stacks possible.",
    ],
  },
},
    ],
  },
];