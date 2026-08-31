---
id: ffn-mlp
title: FFN / MLP — Code
group: transformer-block
kind: code
related_concept: /concepts/ffn-mlp
source_files:
  - src/feed_forward.py
---

# FFN / MLP — Code

The position-wise feed-forward sublayer: two linear layers with a GELU (or ReLU) in the middle. Expands D → hidden_dim → D per token. This is where a Transformer block does its per-token nonlinear transformation.

## Source

### `src/feed_forward.py`

```python
import torch.nn as nn


class FeedForward(nn.Module):
    def __init__(self, embed_dim, hidden_dim):
        super().__init__()

        self.net = nn.Sequential(
            nn.Linear(embed_dim, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, embed_dim),
        )

    def forward(self, x):
        return self.net(x)
```
