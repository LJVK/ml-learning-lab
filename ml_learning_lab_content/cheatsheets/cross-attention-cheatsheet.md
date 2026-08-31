---
id: cross-attention
title: Cross Attention — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/cross-attention
---

# Cross Attention — Cheat Sheet

> Target tokens ask questions, and source tokens provide the information used to answer them.

Lets target tokens attend to a separate source sequence, updating the target using information from that source.

## One-line mental model

Cross attention uses Q from the target sequence and K/V from the source sequence. The attention output updates the target tokens, because there is one output vector for each query token. The source sequence provides the context through K and V.

## The math in one line

`out = softmax( (Q_target · K_sourceᵀ) / √d_k ) · V_source`

## Shape flow

```text
target tokens       → (B, T_target, D)
source tokens       → (B, T_source, D)
Q from target       → (B, T_target, D)
K, V from source    → (B, T_source, D)
scores = QKᵀ        → (B, T_target, T_source)
attention           → (B, T_target, T_source)
attention @ V       → (B, T_target, D)
output              → (B, T_target, D)
```

## Mechanism (8 steps)

1. Take target tokens that need to be updated.
2. Take source tokens that provide external context.
3. Create Q from the target tokens.
4. Create K and V from the source tokens.
5. Compare Q with K to decide which source tokens each target token should attend to.
6. Apply softmax over the source/key tokens.
7. Use the attention weights to mix V from the source.
8. Return updated target-side token representations.

## Where you'll see it

- Encoder-decoder Transformers (translation, summarization).
- Text-to-image diffusion: image/latent tokens = Q, text tokens = K/V.
- Any multimodal model that conditions one modality on another.

## Common mistakes

- ❌ Confusing which side provides Q and which side provides K/V.
- ❌ Forgetting that the output shape follows the query/target sequence length.
- ❌ Thinking K alone injects information. K helps matching; V carries the information that gets mixed into the output.
- ❌ Using target tokens as V when the goal is to inject source information.
- ❌ Thinking cross attention replaces self-attention. Cross attention aligns with external context, while self-attention maintains internal coherence.

## Key takeaways

- Q comes from the tokens that will be updated.
- K and V come from the source/context tokens.
- Output length equals the query/target sequence length.
- K controls matching; V carries the information being passed.
- In text-to-image diffusion, image/latent tokens usually query text tokens.

## Self-attention vs cross-attention

|  | Self-Attention | Cross-Attention |
| --- | --- | --- |
| Q source | same sequence | target sequence |
| K, V source | same sequence | source sequence |
| Score matrix | T × T (square) | T_target × T_source |
| Output length | input length | query length |
| Typical use | internal coherence | external conditioning |

## 30-second recall

1. Two sequences.
2. Q from one, K/V from the other.
3. Output is Q-shaped.
4. Mechanism = softmax(QKᵀ/√d) · V.
5. Used for conditioning (encoder → decoder, text → image).
