---
id: full-transformer-block
title: Full Transformer Block — Code
group: transformer-block
kind: code
related_concept: /concepts/full-transformer-block
source_files:
  - src/transformer_block.py
---

# Full Transformer Block — Code

One complete Transformer block: multi-head self-attention, position-wise FFN, two LayerNorms, and two residual connections. Shape is preserved end-to-end: (B, T, D) → (B, T, D).

## Source

### `src/transformer_block.py`

```python
from attention.multiheadselfattention import MultiHeadSelfAttention
from transformer.feed_forward import FeedForward

import torch.nn as nn

from attention.multiheadselfattention import MultiHeadSelfAttention
from transformer.feed_forward import FeedForward


class TransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_hidden_dim):
        super().__init__()

        self.attention = MultiHeadSelfAttention(embed_dim, num_heads)
        self.feed_forward = FeedForward(embed_dim, ff_hidden_dim)

        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)

    def forward(self, x):
        attention_out = self.attention(self.norm1(x))
        x = x + attention_out

        ffn_out = self.feed_forward(self.norm2(x))
        x = x + ffn_out

        return x
```

## Where this code lives

Source files above are checked in under `ml_learning_lab_content/code/src/` in this repo. They are kept in sync with the original working implementations in `~/My_Repos/attention-from-scracth/` via `scripts/regenerate_code.py`.
