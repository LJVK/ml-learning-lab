---
id: masks
title: Attention Masks — Questions
group: attention
kind: questions
related_concept: /concepts/masks
source: Attention_Masks_Question_Bank.docx
---

# Attention Masks — Questions

> Padding mask, causal mask, mask placement, bugs, and testing

Purpose: Senior-level revision questions for attention masks. Answers are concise and focused on design, failure modes, shape reasoning, and testing.

## Questions and ideal answers

### Q1. Why is it dangerous if attention is allowed to attend to padding tokens?

**A:** Padding tokens are fake tokens with no semantic meaning. If attention attends to them, softmax can allocate probability mass to meaningless positions, reducing attention on real tokens and corrupting contextual embeddings.

### Q2. Why is the mask applied before softmax instead of after softmax?

**A:** Masking before softmax removes invalid positions from the probability distribution. Masked scores are set to -inf or a very large negative value, so softmax assigns them probability 0. If masking happens after softmax, padding or future tokens already influenced the normalization.

### Q3. Why does causal masking exist in decoder self-attention?

**A:** Causal masking prevents each token from attending to future tokens. This preserves autoregressive next-token prediction, where the model must predict using only past and current context.

### Q4. What breaks if causal mask is missing during GPT training?

**A:** The model can leak information from future tokens. Training loss may look artificially good, but inference fails because future tokens are unavailable during generation.

### Q5. How is padding mask different from causal mask?

**A:** Padding mask blocks fake PAD positions caused by variable-length batching. Causal mask blocks future positions in decoder/GPT-style self-attention. Padding protects semantic validity; causal masking protects autoregressive prediction.

### Q6. Can padding mask and causal mask be used together?

**A:** Yes. In decoder training with padded batches, padding mask blocks PAD tokens and causal mask blocks future tokens. A token should attend only to real tokens that are at or before its own position.

### Q7. What shape should a causal mask have for a sequence of length T?

**A:** The base causal mask is usually T x T because every query position checks every key position. In multi-head batched attention, it is commonly broadcast to B x H x T x T.

### Q8. Why do we use -inf or a very large negative value for masked positions before softmax?

**A:** Softmax turns -inf into probability 0. This guarantees masked positions cannot receive attention while valid positions still form the normalized distribution.

### Q9. What bug happens if the causal mask is flipped and the model blocks past tokens instead of future tokens?

**A:** The model loses useful past context and may allow future leakage. This breaks autoregressive learning because prediction should depend on previous tokens, not future tokens.

### Q10. How would you test that a causal mask is working correctly?

**A:** Check that future scores are -inf before softmax and future attention probabilities are 0 after softmax. Also use a controlled test: change future tokens and verify earlier token outputs do not change. mask = torch.triu(torch.ones(T, T), diagonal=1).bool()
scores = scores.masked_fill(mask, float('-inf'))
attention = torch.softmax(scores, dim=-1)
