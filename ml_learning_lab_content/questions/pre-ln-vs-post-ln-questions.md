---
id: pre-ln-vs-post-ln
title: Pre-LN vs Post-LN — Questions
group: transformer-block
kind: questions
related_concept: /concepts/pre-ln-vs-post-ln
source: Transformer_Block_Question_Bank.docx
---

# Pre-LN vs Post-LN — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## Pre-LN vs Post-LN

### Q1. Why is Pre-LN usually more stable for deep Transformers than Post-LN?

**A:** In Pre-LN, each sublayer receives normalized input, and the residual path remains a cleaner route for gradients. In Post-LN, gradients repeatedly pass through normalization after the residual addition, which can make very deep stacks harder to train.

### Q2. What is the downside of Pre-LN compared to Post-LN?

**A:** The residual stream is not immediately normalized after each addition, so its scale can drift across layers. Many Pre-LN designs use a final LayerNorm to stabilize the output of the whole stack.
