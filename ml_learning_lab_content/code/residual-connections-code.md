---
id: residual-connections
title: Residual Connections — Code
group: transformer-block
kind: code
related_concept: /concepts/residual-connections
closest_source: src/transformer_block.py
---

# Residual Connections — Code

A residual connection is one line: `x = x + sublayer(norm(x))`. The transformer_block.py file below shows the pattern in context — both the attention sublayer and the FFN sublayer are wrapped in a residual add.

## No dedicated implementation

See [`src/transformer_block.py`](src/transformer_block.py) for the closest reference implementation. The prose above explains why this concept does not have its own file.

## Where this code lives

This concept does not ship a dedicated module. The referenced file above is the closest reference implementation.
