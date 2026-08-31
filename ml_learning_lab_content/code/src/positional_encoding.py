import math

import torch
import torch.nn as nn


class SinusoidalPositionalEncoding(nn.Module):
    """
    Sinusoidal (non-learned) positional encoding from
    "Attention Is All You Need" (Vaswani et al., 2017).

    Purpose
    -------
    Self-attention is permutation-invariant: it sees a set of tokens with
    no inherent order. Adding a positional encoding tags each token with
    its position so attention can factor sequence order into the mix.

    The sinusoidal form encodes position with a bank of sines and cosines
    at geometrically increasing wavelengths. Two nice properties:
      1. Any relative offset PE(pos + k) can be expressed as a linear
         function of PE(pos), so the model can (in principle) learn
         relative-position patterns from absolute encodings.
      2. Positions beyond the training range still produce well-defined
         encodings — no learned lookup to run out of.

    Input
    -----
    x : (B, T, D)
        A batch of token embeddings.

    Output
    ------
    (B, T, D)
        Same shape; positional encoding has been added elementwise.

    Notes
    -----
    - PE is added, not concatenated. Same dim D as token embedding.
    - Deterministic; no parameters.
    - `max_len` caps the precomputed table. Requests past this raise.
    """
    def __init__(self, embed_dim, max_len=5000):
        super().__init__()

        # Build a (max_len, D) table once at construction time so forward()
        # is a cheap slice + add.
        pe = torch.zeros(max_len, embed_dim)

        # positions: shape (max_len, 1) → 0, 1, 2, ..., max_len-1
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)

        # div_term: shape (D/2,) → the frequency schedule from the paper.
        #   div_term[i] = exp(-2i * log(10000) / D)
        # which is the same as 1 / 10000^(2i / D).
        # Using log/exp for numerical stability at large D.
        div_term = torch.exp(
            torch.arange(0, embed_dim, 2, dtype=torch.float)
            * (-math.log(10000.0) / embed_dim)
        )

        # Even dims → sin; odd dims → cos.
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)

        # Register as a non-parameter buffer so it moves with .to(device)
        # but is not touched by the optimizer.
        self.register_buffer("pe", pe)

    def forward(self, x):
        # x: (B, T, D). Slice the first T rows of the table and add.
        # Broadcasts across the batch.
        T = x.size(1)
        return x + self.pe[:T].unsqueeze(0)


class LearnedPositionalEncoding(nn.Module):
    """
    Learned absolute positional embeddings, à la BERT / GPT-2.

    Each position 0..max_len-1 gets its own D-dim vector learned end-to-end.
    Simpler than sinusoidal, often equal or better on in-distribution length.
    Downside: cannot extrapolate beyond max_len (no signal for position T
    if T > max_len at inference).
    """
    def __init__(self, embed_dim, max_len):
        super().__init__()
        # nn.Embedding is just a learned lookup table.
        self.pe = nn.Embedding(max_len, embed_dim)

    def forward(self, x):
        # x: (B, T, D)
        T = x.size(1)
        # positions: (T,) → embedded to (T, D) → broadcast add to (B, T, D)
        positions = torch.arange(T, device=x.device)
        return x + self.pe(positions).unsqueeze(0)


if __name__ == "__main__":
    torch.manual_seed(0)
    B, T, D = 2, 6, 16
    x = torch.zeros(B, T, D)   # empty content → we can see PE alone

    pe_sin = SinusoidalPositionalEncoding(D)
    pe_learned = LearnedPositionalEncoding(D, max_len=T)

    out_sin = pe_sin(x)
    out_learned = pe_learned(x)

    print("Sinusoidal PE, batch 0 position 0 (first 8 dims):")
    print(out_sin[0, 0, :8])
    print("Sinusoidal PE, batch 0 position 5 (first 8 dims):")
    print(out_sin[0, 5, :8])
    print("\nLearned PE, batch 0 position 0 (first 8 dims):")
    print(out_learned[0, 0, :8])
