---
id: residual-connections
title: Residual Connections — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/residual-connections
---

# Residual Connections — Cheat Sheet

> A residual connection lets the model keep the original representation and add a learned update on top of it.

Allow each block to learn an update to the input instead of replacing the input completely.

## One-line mental model

Instead of forcing a layer to completely rewrite x, residual connections use x + sublayer(x). This makes optimization easier, preserves useful information, and gives gradients a more direct path through deep networks.

## The math in one line

`x = x + sublayer( norm(x) )`

## Shape flow

```text
x                  → (B, T, D)
sublayer(x)        → (B, T, D)
x + sublayer(x)    → (B, T, D)
output             → (B, T, D)
```

## Mechanism (5 steps)

1. Start with input representation x.
2. Pass x through a sublayer such as attention or FFN.
3. The sublayer produces an update with the same shape as x.
4. Add the update back to the original x.
5. Pass the updated representation to the next part of the block.

## Where you'll see it

- Every Transformer sublayer (attention + FFN each get a residual).
- Every modern deep vision network (ResNet, ViT).
- Any deep stack — residuals are what makes training past ~10 layers feasible.

## Common mistakes

- ❌ Trying to add tensors with different shapes.
- ❌ Forgetting that residual addition requires the same D dimension.
- ❌ Thinking residuals replace LayerNorm. Residuals help information and gradients flow, while LayerNorm stabilizes scale.
- ❌ Letting the learned branch dominate too much, which can destabilize training.

## Key takeaways

- Residual formula is x + update.
- The update must have the same shape as x.
- Residuals help preserve information.
- Residuals improve gradient flow in deep models.
- Transformer blocks usually have one residual around attention and one around FFN.

## Residual vs replacing x

|  | Residual (add) | Replace |
| --- | --- | --- |
| Formula | x = x + f(x) | x = f(x) |
| Gradient path | identity + f'(x) | f'(x) only |
| Init behavior | ≈ identity if f small | depends on f |
| Deep-stack stability | high | low without help |

## 30-second recall

1. Every sublayer learns an UPDATE to x, not a replacement.
2. Gradients flow through the identity path even if the sublayer is weak.
3. Requires the sublayer output shape to match input shape.
4. Combined with LayerNorm this is the Transformer sublayer template.
5. The reason 100-layer stacks train at all.
