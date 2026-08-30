---
id: full-transformer-block
title: Full Transformer Block — Questions
group: transformer-block
kind: questions
related_concept: /concepts/full-transformer-block
source: Transformer_Block_Question_Bank.docx
---

# Full Transformer Block — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## Contents

- [Full Transformer Block](#full-transformer-block)
- [Implementation](#implementation)
- [Implementation + Testing](#implementation-testing)

## Full Transformer Block

### Q1. Why does a Transformer block usually apply Attention first and then FFN/MLP?

**A:** Attention first gathers context from other tokens. The FFN then transforms each token’s now-contextualized representation. This sequence separates token mixing from feature transformation.

### Q2. Why does a Transformer block have two residual connections?

**A:** Attention and FFN are separate sublayers, each producing a different kind of update. Each gets its own residual connection so the model can preserve the input representation while adding attention updates and FFN updates independently.

## Implementation

### Q3. What modules are needed in a Pre-LN TransformerBlock constructor?

**A:** A Pre-LN block needs multi-head self-attention, a feed-forward network, LayerNorm before attention, and LayerNorm before FFN. The attention and FFN outputs must both return shape (B, T, D).

### Q4. Why do we need two separate LayerNorms instead of reusing one?

**A:** They normalize different representations: norm1 sees the original block input before attention, while norm2 sees the attention-updated representation before FFN. Each LayerNorm needs its own gamma and beta for its location.

### Q5. Why call attention(norm1(x)) instead of norm1(attention(x))?

**A:** Because this is a Pre-LN block. The goal is to stabilize the input to the attention sublayer before attention runs, not to normalize only the attention output afterward.

### Q6. Why apply norm2 after the attention residual update and before FFN?

**A:** The FFN should receive the representation after attention has added contextual information. norm2 stabilizes that updated representation before the FFN performs feature transformation.

## Implementation + Testing

### Q7. Why should TransformerBlock preserve (B, T, D)?

**A:** Transformer blocks are stacked, so each block output becomes the next block input. Residual additions also require the sublayer output to match x. The model must keep one D-dimensional vector per token.

### Q8. What kinds of bugs could cause NaN or Inf?

**A:** Exploding attention scores, incorrect scaling, invalid masking where every key is masked, exploding gradients, or invalid input tensors can produce NaN or Inf. Negative scores alone are not a problem for softmax.

### Q9. Why is testing gradient flow important for a Transformer block?

**A:** It verifies that the block is trainable. After loss.backward(), gradients should reach the input and the parameters so optimization can update the model during training.

### Q10. Why is checking x.grad alone not enough to prove the Transformer block’s parameters are learning?

**A:** x.grad only proves the loss depends on the input. The model learns by updating parameters, so attention weights, FFN weights, and LayerNorm gamma/beta must also receive gradients.

### Q11. Why is it useful to test that TransformerBlock output is not exactly the same as input?

**A:** It confirms the block is doing real computation instead of returning x unchanged. This can catch missing attention calls, missing FFN calls, or accidentally zeroed residual updates.

### Q12. Why must embed_dim be divisible by num_heads in multi-head attention?

**A:** The embedding dimension is split evenly across heads. For example, D=24 and heads=4 gives head_dim=6. If D is not divisible by heads, the tensor cannot be reshaped into equal head dimensions.
