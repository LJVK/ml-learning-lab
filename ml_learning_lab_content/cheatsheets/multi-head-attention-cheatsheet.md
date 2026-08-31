---
id: multi-head-attention
title: Multi-Head Attention — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/multi-head-attention
---

# Multi-Head Attention — Cheat Sheet

> Instead of asking one attention question, the model asks several different attention questions in parallel.

Runs multiple attention heads in parallel so the model can learn different relationship patterns.

## One-line mental model

Multi-head attention splits the model dimension into multiple heads. Each head learns its own Q, K, and V projections, attends over the full sequence, and captures different relationship patterns. The head outputs are then concatenated and projected back to the model dimension.

## The math in one line

`concat( attn_head_1, ..., attn_head_H ) · W_out`

## Shape flow

```text
x                  → (B, T, D)
Q, K, V            → (B, T, D)
reshape heads      → (B, H, T, Dh)
scores = QKᵀ       → (B, H, T, T)
attention          → (B, H, T, T)
attention @ V      → (B, H, T, Dh)
concat heads       → (B, T, D)
output             → (B, T, D)
```

## Mechanism (6 steps)

1. Project input x into Q, K, and V.
2. Reshape Q, K, and V from (B, T, D) into multiple heads: (B, H, T, Dh).
3. Run scaled dot-product attention independently inside each head.
4. Each head produces an output of shape (B, T, Dh).
5. Concatenate all heads back into (B, T, D).
6. Apply output projection to mix information across heads.

## Where you'll see it

- The attention sublayer in every Transformer block (H = 8, 12, 16, ...).
- Each head can learn a distinct relationship pattern: local, long-range, semantic.
- Compute stays similar to single-head attention at full D (heads are cheaper because D_h = D/H).

## Common mistakes

- ❌ Thinking each head sees different tokens. Each head usually sees the full sequence.
- ❌ Using sqrt(embed_dim) instead of sqrt(head_dim) for scaling inside each head.
- ❌ Forgetting to transpose into (B, H, T, Dh) before computing attention.
- ❌ Using view after transpose without calling contiguous or using reshape.
- ❌ Thinking concatenation alone is enough. The output projection mixes information across heads.

## Key takeaways

- H is the number of heads.
- Dh is head_dim, usually D / H.
- Each head has its own learned attention space.
- All heads attend over the full sequence.
- The final output preserves shape: (B, T, D).

## Single head vs multi-head

|  | Single Head | Multi Head |
| --- | --- | --- |
| Attention patterns learned | one | H (parallel) |
| Per-head dim | D | D_h = D / H |
| Total compute | ≈ same | ≈ same |
| Output projection | not always needed | required to mix heads |

## 30-second recall

1. Split embedding: D → H slices of size D_h = D/H.
2. Each head runs its own scaled dot-product attention over the full sequence.
3. Concatenate head outputs back to D.
4. Output projection mixes information across heads.
5. Shape preserved: (B, T, D) in and out.
