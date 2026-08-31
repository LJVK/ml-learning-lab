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