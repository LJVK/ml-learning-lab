---
id: pre-ln-vs-post-ln
title: Pre-LN vs Post-LN — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/pre-ln-vs-post-ln
---

# Pre-LN vs Post-LN — Cheat Sheet

> Pre-LN normalizes before the sublayer; Post-LN normalizes after the residual update.

Compares where LayerNorm is applied and why Pre-LN is usually more stable in deep Transformers.

## One-line mental model

In Post-LN, the block does x = LayerNorm(x + sublayer(x)). In Pre-LN, the block does x = x + sublayer(LayerNorm(x)). Pre-LN is usually more stable for deep Transformers because the sublayer receives normalized input and the residual path remains cleaner for gradient flow.

## The math

```text
Pre-LN:  x = x + sublayer(LN(x))
Post-LN: x = LN( x + sublayer(x) )
```

## Shape flow

```text
x                         → (B, T, D)
Post-LN: LN(x + F(x))     → (B, T, D)
Pre-LN: x + F(LN(x))     → (B, T, D)
output                    → (B, T, D)
```

## Mechanism (6 steps)

1. Post-LN sends x directly into the sublayer.
2. Post-LN adds the sublayer output back to x.
3. Post-LN applies LayerNorm after the residual addition.
4. Pre-LN applies LayerNorm before the sublayer.
5. Pre-LN adds the sublayer output back to the original residual stream.
6. Pre-LN keeps the residual path less disrupted across many stacked layers.

## Where you'll see it

- Pre-LN: modern deep stacks (GPT, most LLMs). Trains stably without warmup.
- Post-LN: original Vaswani paper, BERT (with careful warmup).
- Deep stacks (> 12 layers) almost always use Pre-LN for stability.

## Common mistakes

- ❌ Thinking Pre-LN and Post-LN are just cosmetic changes.
- ❌ Forgetting that both versions preserve the same output shape.
- ❌ Assuming Pre-LN has no downside. Its residual stream may drift in scale, so many models use a final LayerNorm.
- ❌ Confusing LayerNorm placement with attention masking or attention scaling.

## Key takeaways

- Post-LN applies LayerNorm after residual addition.
- Pre-LN applies LayerNorm before the sublayer.
- Pre-LN is usually more stable for deep Transformers.
- Post-LN can be more difficult to train at large depth.
- Both preserve the (B, T, D) interface.

## Pre-LN vs Post-LN

|  | Pre-LN | Post-LN |
| --- | --- | --- |
| LN placement | inside residual branch | after residual add |
| Residual path | clean identity | normalized every layer |
| Warmup needed? | no | yes (LR warmup) |
| Deep-stack stability | high | low |
| Where used | GPT, modern LLMs | original paper, BERT |

## 30-second recall

1. Pre-LN normalizes INSIDE the residual branch — identity path is clean.
2. Post-LN normalizes AFTER the residual add — every layer re-normalizes the stream.
3. Deep stacks need Pre-LN to train without warmup.
4. Pre-LN residuals can grow in magnitude — add a final LN at the top of the stack.
5. Modern default: Pre-LN.
