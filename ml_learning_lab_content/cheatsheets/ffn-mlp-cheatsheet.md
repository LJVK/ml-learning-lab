---
id: ffn-mlp
title: FFN / MLP — Cheat Sheet
group: transformer-block
kind: cheatsheet
related_concept: /concepts/ffn-mlp
---

# FFN / MLP — Cheat Sheet

> Attention mixes information across tokens; FFN transforms each token’s features after that context has been gathered.

Adds nonlinear per-token feature transformation after attention has mixed token information.

## One-line mental model

The FFN is a small neural network applied independently to each token. It usually expands the model dimension D to a larger hidden dimension, applies a nonlinearity like GELU, and projects back to D so residual connections and stacking still work.

## The math in one line

`y = W_2 · GELU( W_1 · x + b_1 ) + b_2       # per token, D → hidden → D`

## Shape flow

```text
x                  → (B, T, D)
linear 1           → (B, T, hidden_dim)
GELU               → (B, T, hidden_dim)
linear 2           → (B, T, D)
residual add       → (B, T, D)
output             → (B, T, D)
```

## Mechanism (5 steps)

1. Take contextualized token representations after attention.
2. Apply a linear layer from D to hidden_dim.
3. Apply a nonlinear activation such as GELU.
4. Apply another linear layer from hidden_dim back to D.
5. Add the FFN output back to the residual stream.

## Where you'll see it

- The second sublayer of every Transformer block.
- Hidden dim is usually 4×D (GPT-2, GPT-3) or 8/3 × D with SwiGLU (Llama).
- This is where the bulk of a Transformer's parameters live.

## Common mistakes

- ❌ Thinking FFN mixes tokens. It is usually applied independently to each token.
- ❌ Removing the activation, which makes the two linear layers collapse into one linear transformation.
- ❌ Forgetting to project back to D, which breaks residual addition and stacking.
- ❌ Making hidden_dim too small, reducing capacity.
- ❌ Making hidden_dim too large, increasing compute, memory, and overfitting risk.

## Key takeaways

- Attention mixes across tokens.
- FFN transforms features within each token.
- FFN usually follows D → hidden_dim → D.
- The activation makes the FFN nonlinear and expressive.
- The output must return to D to preserve the Transformer block interface.

## Attention vs FFN sublayers

|  | Attention sublayer | FFN sublayer |
| --- | --- | --- |
| Mixes across | tokens (sequence) | features (channel) |
| Per-token? | no (looks at other tokens) | yes (independent per token) |
| Params scale | O(D²) per head | O(D · hidden) |
| Nonlinearity | softmax | GELU / ReLU / SwiGLU |

## 30-second recall

1. Applied per token, independently.
2. Two linear layers: D → hidden → D.
3. Nonlinearity in the middle (GELU / SwiGLU).
4. Hidden dim usually 4×D (or 8/3×D for SwiGLU).
5. Where most Transformer parameters actually live.
