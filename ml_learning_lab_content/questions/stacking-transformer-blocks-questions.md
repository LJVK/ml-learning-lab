---
id: stacking-transformer-blocks
title: Stacking Transformer Blocks — Questions
group: transformer-block
kind: questions
related_concept: /concepts/stacking-transformer-blocks
source: Transformer_Block_Question_Bank.docx
---

# Stacking Transformer Blocks — Questions

> Residuals • LayerNorm • Pre-LN/Post-LN • FFN/MLP • Implementation • Tests • Stacking

## Stacking Transformer Blocks

### Q1. Why can Transformer blocks be stacked repeatedly without changing the input/output shape?

**A:** Each block preserves the same interface: (B, T, D) in and (B, T, D) out. Attention returns D, FFN projects back to D, and residual connections require the same shape.

### Q2. Why does stacking more Transformer blocks usually increase model capacity, but also increase training/inference cost?

**A:** Each block adds another attention layer, FFN layer, LayerNorms, parameters, and activations. This increases representational capacity, but also adds memory, compute, and latency during training and inference.
