---
id: stacking-transformer-blocks
title: Stacking Transformer Blocks — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/stacking-transformer-blocks
---

# Stacking Transformer Blocks — Cheat Sheet

> Each block refines the token representations one more time, so deeper stacks can build richer patterns.

Shows how repeated blocks increase model capacity while preserving the (B, T, D) interface.

## One-line mental model

Transformer blocks are designed to preserve the same input/output shape. This lets us stack many blocks repeatedly. Each block performs another round of attention-based token mixing and FFN-based feature transformation.

## Shape flow

```text
x                  → (B, T, D)
block 1 output     → (B, T, D)
block 2 output     → (B, T, D)
block 3 output     → (B, T, D)
final output       → (B, T, D)
```

## Mechanism (6 steps)

1. Start with token representations x.
2. Pass x through the first Transformer block.
3. The block returns output with the same shape: (B, T, D).
4. Feed that output into the next Transformer block.
5. Repeat this process for many layers.
6. Later blocks operate on increasingly contextualized representations.

## Where you'll see it

- GPT-2 small: 12 blocks. GPT-3: 96. Llama-2-70B: 80. Depth is the main scaling knob alongside width.
- Each block preserves (B,T,D), so stacking is just a for-loop.
- Final LayerNorm at the top of the stack is standard (especially for Pre-LN).

## Common mistakes

- ❌ Thinking each block must change the tensor shape.
- ❌ Forgetting that residual connections require the same D dimension.
- ❌ Adding many blocks without considering memory and compute cost.
- ❌ Assuming deeper is always better. More depth can be harder to train and may have diminishing returns.
- ❌ Forgetting final LayerNorm in many Pre-LN Transformer designs.

## Key takeaways

- Transformer blocks can be stacked because they preserve (B, T, D).
- Each block adds another round of token mixing and feature transformation.
- More blocks usually increase capacity.
- More blocks also increase compute, memory, and latency.
- Stable shape is what makes deep Transformer stacks possible.

## Depth vs width tradeoffs

|  | More blocks (depth) | Bigger D (width) |
| --- | --- | --- |
| Adds | more nonlinear composition steps | more capacity per step |
| Cost scales | linear in N | quadratic in D (attention) |
| Sensitive to | Pre-LN vs Post-LN, init | compute + memory |
| Typical range | 12–96 blocks | 512–12288 |

## 30-second recall

1. Each block preserves (B, T, D).
2. Stack = sequential composition; nothing shape-tricky.
3. Add a final LayerNorm at the top (Pre-LN convention).
4. Depth adds compositional capacity; width adds per-step capacity.
5. Deep stacks need Pre-LN + residuals to train.
