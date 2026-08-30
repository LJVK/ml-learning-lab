---
id: ffn-mlp
title: FFN / MLP — Questions
group: transformer-block
kind: questions
related_concept: /concepts/ffn-mlp
source: Transformer_Block_Question_Bank.docx
---

# FFN / MLP — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## FFN / MLP

### Q1. Why do Transformers need an FFN/MLP after attention if attention already mixes token information?

**A:** Attention mixes information across tokens. The FFN transforms each token’s feature vector after it has received context. Without the FFN, the block would have weaker nonlinear feature processing.

### Q2. Why does the FFN expand from D to a larger hidden dimension and then project back to D?

**A:** Expansion gives the model a richer intermediate feature space for nonlinear transformations. Projection back to D restores the shape needed for residual addition and for feeding the next Transformer block.

### Q3. Why would an FFN without activation be much less expressive?

**A:** Two linear layers without a nonlinearity collapse into one linear transformation. The activation, such as GELU, lets the FFN model nonlinear feature interactions and conditional transformations.

### Q4. Why is FFN applied independently to each token instead of mixing tokens again?

**A:** Token mixing is already handled by attention. The FFN focuses on transforming each contextualized token vector independently, improving feature-level representation while preserving the (B, T, D) structure.

### Q5. What breaks if FFN hidden dimension is too small or too large?

**A:** Too small reduces capacity and can underfit because the model lacks enough feature space. Too large increases parameters, memory, compute cost, and can give diminishing returns or overfitting in smaller settings.
