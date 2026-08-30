---
id: layernorm
title: LayerNorm — Questions
group: transformer-block
kind: questions
related_concept: /concepts/layernorm
source: Transformer_Block_Question_Bank.docx
---

# LayerNorm — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## LayerNorm

### Q1. Why do Transformers need LayerNorm if residual connections already help gradient flow?

**A:** Residuals preserve information and help gradients flow, but they do not control activation scale. LayerNorm stabilizes each token representation before or after sublayers, reducing drift and improving optimization in deep networks.

### Q2. Why does LayerNorm normalize across D for each token instead of across the batch?

**A:** Each token vector needs its own stable feature distribution. Normalizing across the batch would mix unrelated examples and make behavior depend on batch composition, which is especially problematic for variable-length sequences and inference.

### Q3. Why does LayerNorm need learnable gamma and beta after normalizing token features?

**A:** Normalization gives a stable baseline, but gamma and beta let the model learn the best scale and shift for each feature. This preserves flexibility instead of forcing all normalized features to remain zero-centered and unit-scaled forever.

### Q4. What breaks if LayerNorm is removed from a deep Transformer?

**A:** Representations can drift in scale across residual additions. Attention scores may become too large or unstable, gradients can become harder to optimize, and training deep stacks can become unreliable or much slower.

### Q5. Why is LayerNorm preferred over BatchNorm in Transformers?

**A:** LayerNorm works per token and does not depend on batch statistics. BatchNorm depends on other samples in the batch, is sensitive to batch size and sequence layout, and can behave inconsistently between training and inference.
