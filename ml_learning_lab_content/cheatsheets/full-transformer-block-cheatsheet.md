---
id: full-transformer-block
title: Full Transformer Block — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/full-transformer-block
---

# Full Transformer Block — Cheat Sheet

> A Transformer block first lets tokens communicate, then transforms each token’s features, while residuals and LayerNorm keep training stable.

Combines attention, FFN, LayerNorm, and residual connections into one reusable block.

## One-line mental model

A Pre-LN Transformer block combines Multi-Head Attention, FFN/MLP, two LayerNorms, and two residual connections. Attention updates each token using context from other tokens. FFN then applies nonlinear feature transformation to each token independently.

## The math

```text
x = x + MHA(LN(x))
x = x + FFN(LN(x))
```

## Shape flow

```text
x                         → (B, T, D)
norm1(x)                  → (B, T, D)
attention(norm1(x))       → (B, T, D)
x + attention_out         → (B, T, D)
norm2(x)                  → (B, T, D)
ffn(norm2(x))             → (B, T, D)
x + ffn_out               → (B, T, D)
output                    → (B, T, D)
```

## Mechanism (8 steps)

1. Start with input x.
2. Apply LayerNorm before attention.
3. Run Multi-Head Self-Attention.
4. Add the attention output back to x using a residual connection.
5. Apply a second LayerNorm before FFN.
6. Run FFN/MLP.
7. Add the FFN output back using another residual connection.
8. Return the updated token representations.

## Where you'll see it

- The unit of a Transformer stack (GPT, BERT, T5, Llama, ...).
- Encoder blocks vs decoder blocks differ only in masking + optional cross-attention.
- Stacked N times (12, 24, 96+) to build the full model.

## Common mistakes

- ❌ Forgetting one of the two residual connections.
- ❌ Reusing the same LayerNorm for attention and FFN instead of separate LayerNorms.
- ❌ Applying LayerNorm after the sublayer when intending to implement Pre-LN.
- ❌ Forgetting that both attention and FFN must return shape (B, T, D).
- ❌ Thinking attention alone is the full block. FFN is also essential.

## Key takeaways

- A Transformer block has attention plus FFN.
- Pre-LN applies LayerNorm before each sublayer.
- There are usually two residual connections.
- The block preserves shape: (B, T, D).
- Transformer models are built by stacking these blocks.

## Two sublayers side by side

|  | Attention sublayer | FFN sublayer |
| --- | --- | --- |
| Purpose | mix info across tokens | transform per-token features |
| Uses | MHA + norm + residual | FFN + norm + residual |
| Sees | other tokens | one token at a time |
| Preserves shape | (B,T,D) → (B,T,D) | (B,T,D) → (B,T,D) |

## 30-second recall

1. Sublayer 1: LayerNorm → Multi-Head Attention → residual add.
2. Sublayer 2: LayerNorm → FFN → residual add.
3. Shape preserved end-to-end: (B, T, D) → (B, T, D).
4. Same structure for encoder and decoder; masking differs.
5. The unit that gets stacked N times.
