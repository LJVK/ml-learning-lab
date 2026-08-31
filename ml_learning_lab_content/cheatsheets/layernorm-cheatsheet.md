---
id: layernorm
title: LayerNorm — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/layernorm
---

# LayerNorm — Cheat Sheet

> LayerNorm keeps each token’s feature values in a stable range before the next transformation.

Stabilizes token representations by normalizing across the feature dimension.

## One-line mental model

LayerNorm normalizes each token independently across its feature dimension D. This stabilizes activations inside deep Transformer blocks and helps attention and FFN layers receive better-conditioned inputs.

## The math in one line

`y = γ · (x - mean(x)) / √(var(x) + ε) + β    # per-token, over D`

## Shape flow

```text
x                  → (B, T, D)
mean over D        → (B, T, 1)
variance over D    → (B, T, 1)
normalized x       → (B, T, D)
gamma, beta        → (D)
output             → (B, T, D)
```

## Mechanism (5 steps)

1. Take one token representation with D features.
2. Compute the mean across that token’s D features.
3. Compute the variance across that token’s D features.
4. Normalize the token features.
5. Apply learnable gamma and beta so the model can restore useful scale and shift.

## Where you'll see it

- Every Transformer sublayer wraps its input or output in LayerNorm.
- Batch-size-independent — works with batch size 1.
- Sequence-length-independent — works on variable-length sequences.

## Common mistakes

- ❌ Confusing LayerNorm with BatchNorm.
- ❌ Normalizing across the batch instead of across D for each token.
- ❌ Thinking gamma and beta are optional. They restore learned flexibility after normalization.
- ❌ Assuming LayerNorm and attention scaling solve the same problem. Attention scaling stabilizes scores; LayerNorm stabilizes representations.

## Key takeaways

- LayerNorm normalizes each token independently.
- It normalizes across the feature dimension D.
- It preserves shape: (B, T, D).
- Gamma and beta are learnable scale and shift parameters.
- LayerNorm is critical for stable deep Transformer training.

## LayerNorm vs BatchNorm

|  | LayerNorm | BatchNorm |
| --- | --- | --- |
| Normalizes over | features (D) | batch dim (B) |
| Depends on batch stats | no | yes |
| Works with batch size 1 | yes | no (uses running stats at eval) |
| Standard in | Transformers, RNNs | CNNs on images |

## 30-second recall

1. Normalize each token's D features to (mean 0, var 1).
2. Apply learned scale γ and shift β per feature.
3. Statistics come from THAT token's features, not the batch.
4. ε in the denominator prevents division by zero when variance is tiny.
5. Batch-size and sequence-length agnostic — perfect for Transformers.
