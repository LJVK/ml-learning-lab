---
id: encoder-vs-decoder-attention
title: Encoder vs Decoder Attention — Questions
group: attention
kind: questions
related_concept: /concepts/encoder-vs-decoder-attention
source: Encoder_vs_Decoder_Attention_Question_Bank.docx
---

# Encoder vs Decoder Attention — Questions

> Senior-level revision notes: concise answers focused on design, failure modes, and attention flow.

## Contents

- [Key mental model](#key-mental-model)
- [Questions and concise ideal answers](#questions-and-concise-ideal-answers)
- [Summary reference](#summary-reference)

## Key mental model

- Encoder self-attention = full-context understanding.
- Decoder self-attention = causal next-token generation.
- Encoder-decoder cross-attention = decoder queries grounded in encoder outputs.
- Decoder-only GPT = causal self-attention only; no separate encoder source exists.

## Questions and concise ideal answers

### Q1. Why can encoder self-attention look at all tokens, but decoder self-attention must block future tokens?

**A:** Encoder self-attention is used for understanding, so each token can use full bidirectional context. Decoder self-attention is used for generation, so each token must only use past/current tokens. If the decoder sees future tokens during training, it leaks the answer and will fail during inference where future tokens are unavailable.

### Q2. Why is decoder-only GPT enough for text generation, even without an encoder?

**A:** GPT does not need a separate encoder because decoder self-attention over past tokens is enough for autoregressive generation. During training, it learns to use previous context to predict the next token, so during inference it can keep generating one token at a time.

### Q3. Why does an encoder-decoder decoder need cross-attention after causal self-attention?

**A:** Decoder causal self-attention uses the tokens generated so far. Encoder-decoder cross-attention lets those decoder states look back at the encoded input sentence, so generation stays grounded in the source input. Self-attention gives output-side context; cross-attention gives input-side grounding.

### Q4. How is encoder-decoder cross-attention different from diffusion cross-attention?

**A:** Encoder-decoder cross-attention uses Q from decoder tokens and K/V from encoder outputs; its purpose is to ground output generation in the source input. Diffusion cross-attention uses Q from image/latent tokens and K/V from text prompt tokens; its purpose is to guide image generation using prompt meaning. Same rule: Q is the thing being updated, K/V is the conditioning source.

### Q5. Why does encoder-decoder cross-attention use encoder outputs as K/V instead of raw input token embeddings?

**A:** Encoder outputs are contextual representations, not raw isolated token embeddings. Raw embeddings mainly encode token identity, while encoder outputs include source-side context, relationships, order, and meaning. The decoder should attend to the understood input, not just raw input tokens.

### Q6. What breaks if encoder self-attention is causally masked like a decoder?

**A:** If encoder self-attention is causally masked, the encoder cannot build full bidirectional context. That weakens source representations, so decoder cross-attention receives incomplete input grounding. For understanding tasks, the encoder should use all available source tokens.

### Q7. Why does decoder self-attention happen before encoder-decoder cross-attention?

**A:** Decoder self-attention first builds output-side context from tokens generated so far. Then cross-attention uses that decoder state as Q to decide which encoder/input tokens are relevant. In translation, self-attention understands the current target prefix; cross-attention grounds it in the source sentence.

### Q8. Why does decoder-only GPT not have cross-attention, while encoder-decoder models do?

**A:** Decoder-only GPT has no separate encoder output, so there is no external source for cross-attention. It generates from prior context using causal self-attention. Encoder-decoder models need cross-attention because generation must be grounded in a separate encoded input sequence.

## Summary reference

| Type | Q source | K/V source | Mask / purpose |
| --- | --- | --- | --- |
| Encoder self-attention | Encoder tokens | Encoder tokens | No causal mask; full bidirectional understanding |
| Decoder self-attention | Decoder tokens | Decoder tokens | Causal mask; prevent future-token leakage |
| Encoder-decoder cross-attention | Decoder tokens | Encoder outputs | Ground generated output in source input |
| Diffusion cross-attention | Image/latent tokens | Text prompt tokens | Guide image generation with prompt meaning |
| Decoder-only GPT | Previous/generated tokens | Previous/generated tokens | Causal self-attention only; no separate encoder |
