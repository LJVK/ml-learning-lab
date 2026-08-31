---
id: attention-internals
title: Attention Internals — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/attention-internals
---

# Attention Internals — Cheat Sheet

> Attention is not manually programmed. The model learns what to look for, how to match, and what information to pass through training.

Explains how Q, K, and V learn routing and content roles through gradients.

## One-line mental model

Q, K, and V are learned projections. Q and K learn a routing space that decides which tokens should attend to which other tokens. V learns the content representation that gets passed when attention weights mix information.

## Shape flow

```text
x                  → (B, T, D)
Wq, Wk, Wv         → learned parameters
Q, K, V            → (B, T, D)
routing scores     → (B, T, T)
attention weights  → (B, T, T)
mixed V output     → (B, T, D)
loss gradients     → update Wq, Wk, Wv
```

## Mechanism (6 steps)

1. Start with token representations x.
2. Apply learned linear layers to create Q, K, and V.
3. Use Q and K to compute attention scores.
4. Softmax turns scores into routing probabilities.
5. Use those probabilities to mix V.
6. Backpropagation updates Wq, Wk, and Wv based on how useful the routed information was for reducing loss.

## Where you'll see it

- Debugging attention maps (are they meaningful, or artifacts?).
- Head-specialization studies: which heads do what.
- Attribution / interpretability: what does a high weight actually prove?

## Common mistakes

- ❌ Thinking Q, K, and V have fixed meanings before training.
- ❌ Assuming high attention always means causal importance.
- ❌ Thinking V controls where attention goes. Q and K control matching; V carries content.
- ❌ Assuming each head is manually assigned a role like syntax or color.
- ❌ Interpreting attention maps without testing interventions such as masking, replacing, or ablating tokens.

## Key takeaways

- Q and K learn how tokens match.
- V learns what content gets passed.
- Backpropagation teaches attention by rewarding useful routing paths.
- Heads specialize because they have separate learned projections.
- Attention maps are useful clues, but not proof of causality.

## Attention weights vs attention outputs

|  | Weights | Outputs |
| --- | --- | --- |
| Shape | (B, T_q, T_k) | (B, T_q, D) |
| What it shows | who attends to whom | the mixed information |
| Interpretability | misleading if trusted alone | the actual signal downstream layers use |
| Debugging | start here, but verify with intervention | check for NaN, saturation, dead heads |

## 30-second recall

1. Q · Kᵀ picks WHERE to route information.
2. V decides WHAT information flows through.
3. Softmax normalization means attention is a probability, not a similarity.
4. High weight ≠ high causal importance — always verify with an intervention.
5. Dead heads and saturated softmax are the two main failure modes.
