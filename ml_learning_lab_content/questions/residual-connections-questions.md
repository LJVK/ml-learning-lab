---
id: residual-connections
title: Residual Connections — Questions
group: transformer-block
kind: questions
related_concept: /concepts/residual-connections
source: Transformer_Block_Question_Bank.docx
---

# Residual Connections — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## Residual Connections

### Q1. Why is it useful for a Transformer layer to learn an update to x instead of replacing x completely?

**A:** Because the residual form x + sublayer(x) lets the model preserve the original representation while adding a learned update. This makes optimization easier: early in training the layer can behave close to identity, then gradually learn useful transformations.

### Q2. Why do residual connections help gradients flow in deep Transformers?

**A:** They create a direct path for gradients through the identity branch. Even if the attention or FFN branch has weak or unstable gradients, the residual path helps gradients reach earlier layers instead of vanishing across many blocks.

### Q3. Why must the residual branch output shape match the input shape?

**A:** Residual addition is elementwise. If x has shape (B, T, D), the sublayer output must also be (B, T, D). Otherwise x + sublayer(x) is invalid, and stacked blocks would no longer have a consistent interface.

### Q4. What breaks if the residual path or learned branch dominates too much?

**A:** If the residual path dominates, the model may underuse the learned transformation and behave too close to identity. If the learned branch dominates, it can overwrite useful information, destabilize scale, and make deep training harder.
