---
id: self-attention
title: Self-Attention — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/self-attention
---

# Self-Attention — Cheat Sheet

> Each token asks: “Which other tokens should I use to update my own meaning?”

Lets each token attend to other tokens in the same sequence and build context-aware representations.

## One-line mental model

Self-attention lets every token compare itself with every other token in the same sequence. The result is a new contextual representation for each token.

## The math in one line

`out = softmax( (Q · Kᵀ) / √d_k ) · V`

## Shape flow

```text
x                  → (B, T, D)
Q, K, V            → (B, T, D)
scores = QKᵀ       → (B, T, T)
attention          → (B, T, T)
attention @ V      → (B, T, D)
output             → (B, T, D)
```

## Mechanism (6 steps)

1. Create Q, K, and V projections from the input x.
2. Compare Q with K using dot product similarity.
3. Scale the scores by sqrt(d) to avoid unstable softmax behavior.
4. Apply softmax over the key dimension to get attention weights.
5. Multiply attention weights with V to create contextual token representations.
6. Project the output back to the model dimension.

## Where you'll see it

- Every Transformer block (encoder self-attn, decoder self-attn).
- GPT-style causal LMs (self-attention with a causal mask).
- ViT / audio Transformers on patch/frame token sequences.

## Common mistakes

- ❌ Applying softmax over the wrong dimension. It should be over keys, usually dim=-1.
- ❌ Forgetting to scale scores by sqrt(d), which can make softmax too sharp.
- ❌ Thinking attention weights are the final output. They are used to mix V.
- ❌ Expecting self-attention alone to understand order. Positional information is still needed.

## Key takeaways

- Q means what this token is looking for.
- K means how this token can be matched.
- V means what information this token provides.
- Attention output is a weighted mixture of value vectors.
- Self-attention preserves shape: (B, T, D) in and (B, T, D) out.

## Self-attention vs cross-attention

|  | Self-Attention | Cross-Attention |
| --- | --- | --- |
| Q source | same sequence | target sequence |
| K, V source | same sequence | source sequence |
| Score matrix | T × T (square) | T_target × T_source |
| Output length | input length | query length |
| Typical use | internal coherence | external conditioning |

## 30-second recall

1. Every token asks Q, offers K, carries V.
2. Q · Kᵀ = pairwise scores.
3. Scale by √d, softmax over keys → attention weights.
4. Output = attention @ V (weighted mix of value vectors).
5. Shape preserved: (B, T, D) in and out.
