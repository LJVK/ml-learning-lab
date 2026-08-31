---
id: encoder-vs-decoder-attention
title: Encoder vs Decoder Attention — Code
group: attention
kind: code
related_concept: /concepts/encoder-vs-decoder-attention
closest_source: src/singleheadselfattention.py
---

# Encoder vs Decoder Attention — Code

Encoder vs decoder attention is a structural distinction, not a separate module. Encoder self-attention runs bidirectional; decoder self-attention applies a causal mask; decoder cross-attention pulls K/V from the encoder. See the self-attention and cross-attention files for the underlying mechanisms.

## No dedicated implementation

See [`src/singleheadselfattention.py`](src/singleheadselfattention.py) for the closest reference implementation. The prose above explains why this concept does not have its own file.

## Where this code lives

This concept does not ship a dedicated module. The referenced file above is the closest reference implementation.
