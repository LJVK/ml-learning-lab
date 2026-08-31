---
id: stacking-transformer-blocks
title: Stacking Transformer Blocks — Code
group: transformer-block
kind: code
related_concept: /concepts/stacking-transformer-blocks
closest_source: src/transformer_block.py
---

# Stacking Transformer Blocks — Code

Stacking is trivial once one block is written: instantiate N TransformerBlock modules and run them sequentially. Because each block preserves (B, T, D), any depth composes without shape gymnastics.

## No dedicated implementation

See [`src/transformer_block.py`](src/transformer_block.py) for the closest reference implementation. The prose above explains why this concept does not have its own file.

## Where this code lives

This concept does not ship a dedicated module. The referenced file above is the closest reference implementation.
