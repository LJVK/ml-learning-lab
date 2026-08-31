---
id: positional-information
title: Positional Information — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/positional-information
---

# Positional Information — Cheat Sheet

> Attention can compare tokens, but by itself it does not know where tokens are located in the sequence.

Adds order information so attention can understand token positions and sequence structure.

## One-line mental model

Self-attention is permutation-invariant unless position information is added. Positional information tells the model token order, distance, and sequence structure so it can distinguish meanings that depend on order.

## The math in one line

`x' = x + PE(pos)     # or:  RoPE rotates Q, K by pos`

## Shape flow

```text
token embeddings    → (B, T, D)
position info       → (T, D) or applied to Q/K
position-aware x    → (B, T, D)
Q, K, V             → (B, T, D)
attention scores    → (B, T, T)
output              → (B, T, D)
```

## Mechanism (5 steps)

1. Start with token embeddings.
2. Add or inject position information into the token representation.
3. Use the position-aware representations to create Q, K, and V.
4. Attention scores now depend on both token meaning and position.
5. The model can distinguish different token orders and relative relationships.

## Where you'll see it

- Sinusoidal PE: original Transformer (deterministic, extrapolates).
- Learned PE: BERT, GPT-2 (simpler, capped at max_len).
- RoPE (rotary): most modern LLMs (Llama, GPT-NeoX) — encodes relative position via rotation.

## Common mistakes

- ❌ Thinking token embeddings alone tell the model order.
- ❌ Forgetting that attention without position is insensitive to token order.
- ❌ Confusing absolute position with relative position.
- ❌ Assuming all positional methods generalize equally well to longer context.
- ❌ Thinking RoPE changes V. RoPE is typically applied to Q and K.

## Key takeaways

- Attention needs positional information to understand order.
- Absolute position tells where a token is.
- Relative position tells how far tokens are from each other.
- RoPE makes Q/K interactions position-aware.
- Long-context models depend heavily on good positional handling.

## Positional encoding variants

|  | Sinusoidal | Learned | RoPE |
| --- | --- | --- | --- |
| Learned? | no | yes | no (formula-based) |
| Extrapolates past max_len | yes | no | yes |
| Encodes | absolute | absolute | relative (via rotation) |
| Applied | added to x before block 1 | added to x before block 1 | rotates Q, K per layer |

## 30-second recall

1. Attention alone is permutation-invariant — it needs a position signal.
2. Absolute PE tags each token with its position (sinusoidal or learned).
3. Relative PE encodes distance between tokens (RoPE, ALiBi).
4. PE is added to x, not concatenated — same dim as the embedding.
5. RoPE is a formula on Q/K per layer, not a lookup added to x.
