import math
import torch
import torch.nn as nn

class CrossAttention(nn.Module):
    def __init__(self, embed_dim):
        super.__init__()
        self.embed_dim = embed_dim

        self.query = nn.Linear(embed_dim, embed_dim)
        self.key = nn.Linear(embed_dim, embed_dim)
        self.value = nn.Linear(embed_dim, embed_dim)
        self.output = nn.Linear(embed_dim, embed_dim)

    def forward(self, image_tokens, text_tokens):
        q = self.query(image_tokens)
        k = self.key(text_tokens)
        v = self.value(text_tokens)

        scores = torch.matmul(q, k.transpose(-2,-1))
        scores = scores / math.sqrt(self.embed_dim)

        attention = torch.softmax(scores, dim=-1)

        out = torch.matmul(attention, v)

        out = self.output(out)

        return out
