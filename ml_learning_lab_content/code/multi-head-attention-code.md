---
id: multi-head-attention
title: Multi-Head Attention — Code
group: attention
kind: code
related_concept: /concepts/multi-head-attention
source_files:
  - src/multiheadselfattention.py
---

# Multi-Head Attention — Code

Extends single-head attention to H parallel heads. Splits the embedding dim D into H slices of size D_h = D/H, runs scaled dot-product attention independently per head, concatenates the head outputs back to D, and applies the output projection to mix information across heads.

## Source

### `src/multiheadselfattention.py`

```python
import math
import torch
import torch.nn as nn


class MultiHeadSelfAttention(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()

        if embed_dim % num_heads != 0:
            raise ValueError("embed_dim must be divisible by num_heads")

        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads

        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x):
        B, T, D = x.shape

        q = self.q_proj(x)
        k = self.k_proj(x)
        v = self.v_proj(x)

        q = q.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.num_heads, self.head_dim).transpose(1, 2)

        scores = torch.matmul(q, k.transpose(-2, -1))
        scores = scores / math.sqrt(self.head_dim)

        attention = torch.softmax(scores, dim=-1)

        out = torch.matmul(attention, v)

        out = out.transpose(1, 2).contiguous()
        out = out.view(B, T, D)

        out = self.out_proj(out)

        return out

    def test_multi_head_attention_shape():
        B, T, D = 2, 4, 8
        num_heads = 2

        x = torch.randn(B, T, D)

        mha = MultiHeadAttention(embed_dim=D, num_heads=num_heads)
        out = mha(x)

        assert out.shape == (B, T, D)
```
