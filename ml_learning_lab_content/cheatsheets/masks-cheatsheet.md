---
id: masks
title: Masks — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/masks
---

# Masks — Cheat Sheet

> A mask tells attention: “You are not allowed to look at these positions.”

Controls which tokens are allowed to attend to which other tokens.

## One-line mental model

Masks modify attention scores before softmax so certain positions receive zero attention probability. This is used to ignore padding tokens and to prevent decoder/GPT models from looking at future tokens.

## The math in one line

`scores = QKᵀ; scores[~mask] = -inf; attention = softmax(scores)`

## Shape flow

```text
scores             → (B, H, T, T)
padding mask       → blocks PAD tokens
causal mask        → blocks future tokens
masked scores      → (B, H, T, T)
softmax            → masked positions become 0
attention @ V      → (B, H, T, Dh)
```

## Mechanism (6 steps)

1. Compute attention scores from Q and K.
2. Identify positions that should not be attended to.
3. Set blocked score positions to a very negative value like -inf.
4. Apply softmax over the key dimension.
5. Masked positions become probability 0.
6. Use the masked attention weights to mix V.

## Where you'll see it

- Causal mask: any decoder / GPT-style LM.
- Padding mask: variable-length batches (translation, chat, etc.).
- Bidirectional encoder: usually only padding mask.

## Common mistakes

- ❌ Applying the mask after softmax instead of before softmax.
- ❌ Masking with 0 instead of -inf before softmax, which can still give blocked positions probability.
- ❌ Forgetting that causal masks are required for GPT-style next-token prediction.
- ❌ Creating a mask shape that does not broadcast correctly to attention scores.
- ❌ Masking all positions in a row, which can produce NaN after softmax.

## Key takeaways

- Padding masks block meaningless PAD tokens.
- Causal masks block future tokens.
- Masks are applied before softmax.
- Masked scores should become -inf or a very large negative value.
- Causal masking is essential for autoregressive models.

## Causal vs padding masks

|  | Causal Mask | Padding Mask |
| --- | --- | --- |
| Shape | (T, T) | (B, T) |
| Blocks | future positions | PAD positions |
| Where used | decoder self-attention | any attention with padded inputs |
| Combined? | often used together in decoders | - |

## 30-second recall

1. Mask is applied to raw scores BEFORE softmax.
2. Blocked positions get a very negative score (-inf or -1e9).
3. Softmax then assigns them ~0 probability.
4. Two flavors: causal (block future) and padding (block PAD).
5. Common bug: never let a row be fully masked — you'll get NaN.
