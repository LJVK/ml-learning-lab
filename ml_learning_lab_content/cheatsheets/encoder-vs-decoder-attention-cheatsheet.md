---
id: encoder-vs-decoder-attention
title: Encoder vs Decoder Attention — Cheat Sheet
group: attention
kind: cheatsheet
related_concept: /concepts/encoder-vs-decoder-attention
---

# Encoder vs Decoder Attention — Cheat Sheet

> Encoder attention can look everywhere, but decoder attention must look only backward when generating tokens.

Explains bidirectional encoder attention, causal decoder attention, and encoder-decoder cross-attention.

## One-line mental model

Encoder self-attention usually uses full bidirectional attention because the full input is already available. Decoder self-attention uses causal masking so each token can only attend to previous tokens. Encoder-decoder models also use cross attention, where decoder tokens query encoder outputs.

## Shape flow

```text
encoder input       → (B, T_src, D)
encoder self-attn   → (B, T_src, D)
decoder input       → (B, T_tgt, D)
causal self-attn    → (B, T_tgt, D)
Q from decoder      → (B, T_tgt, D)
K, V from encoder   → (B, T_src, D)
cross-attn output   → (B, T_tgt, D)
```

## Mechanism (7 steps)

1. Encoder receives the full input sequence.
2. Encoder self-attention lets every input token attend to every other input token.
3. Decoder generates output tokens step by step.
4. Decoder self-attention uses a causal mask to block future tokens.
5. In encoder-decoder models, decoder states become Q.
6. Encoder outputs become K and V for cross attention.
7. The decoder updates its tokens using both previous output context and encoded input context.

## Where you'll see it

- Encoder self-attention: BERT-style bidirectional understanding.
- Decoder self-attention: GPT-style causal generation.
- Encoder-decoder cross-attention: seq2seq (translation, summarization).

## Common mistakes

- ❌ Thinking all Transformer attention is causal.
- ❌ Forgetting that encoder self-attention can be bidirectional.
- ❌ Letting decoder self-attention see future tokens during training.
- ❌ Confusing decoder self-attention with encoder-decoder cross attention.
- ❌ Using raw encoder input as K/V instead of contextual encoder outputs.

## Key takeaways

- Encoder self-attention is usually bidirectional.
- Decoder self-attention is causal.
- GPT is decoder-only and uses causal self-attention.
- Encoder-decoder models use cross attention from decoder to encoder.
- Cross-attention output length follows the decoder/query sequence.

## The three attention roles

|  | Encoder self-attn | Decoder self-attn | Cross-attn |
| --- | --- | --- | --- |
| Mask | padding only | causal (+ padding) | padding on source |
| Q source | encoder tokens | decoder tokens | decoder tokens |
| K, V source | encoder tokens | decoder tokens | encoder tokens |
| Purpose | full-context understanding | autoregressive generation | conditioning on encoder |

## 30-second recall

1. Encoder self-attn = bidirectional understanding.
2. Decoder self-attn = causal, generates left-to-right.
3. Cross-attn = decoder reads from encoder's output.
4. GPT-only stack = decoder self-attn only, no cross-attn.
5. Same math, different masking + Q/K/V wiring per role.
