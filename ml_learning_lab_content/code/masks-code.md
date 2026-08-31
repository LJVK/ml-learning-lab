---
id: masks
title: Attention Masks — Code
group: attention
kind: code
related_concept: /concepts/masks
source_files:
  - src/masks.py
---

# Attention Masks — Code

Causal and padding masks with a helper to apply them to raw attention scores before softmax. The demo composes both masks and verifies softmax rows sum to 1 even when combined.

## Source

### `src/masks.py`

```python
import torch
import torch.nn as nn


def causal_mask(seq_len, device=None):
    """
    Build a causal (autoregressive) mask that blocks each position from
    attending to future positions.

    Input
    -----
    seq_len : int
        Length of the sequence (T).
    device : torch.device or None
        Where to place the mask.

    Output
    ------
    mask : (T, T)  bool tensor
        mask[i, j] = True means position i is ALLOWED to attend to position j.
        Lower triangular including the diagonal → each token sees itself
        and everything before it.

    Example
    -------
        seq_len = 4  →
            1 0 0 0
            1 1 0 0
            1 1 1 0
            1 1 1 1
    """
    # torch.tril returns lower-triangular part (below and on the diagonal).
    # We build ones(T, T), take lower triangle, cast to bool.
    return torch.tril(torch.ones(seq_len, seq_len, device=device, dtype=torch.bool))


def padding_mask(token_lengths, max_len, device=None):
    """
    Build a padding mask from a list/tensor of true sequence lengths.

    Input
    -----
    token_lengths : (B,)  int tensor
        Actual (non-padded) length of each sequence in the batch.
    max_len : int
        Padded length of every sequence in the batch (T).

    Output
    ------
    mask : (B, T)  bool tensor
        mask[b, j] = True means position j in batch item b is a REAL token.
        False marks padding.

    Example
    -------
        token_lengths = [3, 5],  max_len = 5
        mask =
            [[T, T, T, F, F],
             [T, T, T, T, T]]
    """
    if not torch.is_tensor(token_lengths):
        token_lengths = torch.tensor(token_lengths, device=device)
    # positions: (T,) = [0, 1, 2, ..., T-1]
    positions = torch.arange(max_len, device=token_lengths.device)
    # Broadcast: (1, T) < (B, 1) → (B, T)
    return positions.unsqueeze(0) < token_lengths.unsqueeze(1)


def apply_mask(scores, mask):
    """
    Apply a boolean mask to raw pre-softmax attention scores.

    Convention: mask == True means "allowed", False means "blocked".
    We set blocked positions to a very negative number so softmax assigns
    them ~0 probability.

    Input
    -----
    scores : (..., T_q, T_k)  float tensor
        Raw Q · K^T scores, possibly per-head.
    mask : broadcastable to (..., T_q, T_k)  bool tensor
        True = allowed, False = blocked.

    Output
    ------
    (..., T_q, T_k)  float tensor
        Same shape; blocked positions replaced with -inf-ish.
    """
    # Using -1e9 (not -inf) avoids NaN downstream when a row is fully masked.
    # A fully-masked row → softmax outputs a uniform-ish tiny distribution
    # instead of NaN. Real code should avoid fully-masked rows regardless.
    return scores.masked_fill(~mask, -1e9)


if __name__ == "__main__":
    # Demo: causal + padding masks applied to a toy score matrix.
    torch.manual_seed(0)
    B, T = 2, 5
    D = 4

    # Fake scores: (B, T_q, T_k)
    scores = torch.randn(B, T, T)

    # Causal mask: (T, T) → broadcasts across batch
    c_mask = causal_mask(T)
    print("Causal mask:")
    print(c_mask.int())

    # Padding mask for batch item 0 having length 3, batch item 1 length 5.
    p_mask = padding_mask([3, 5], T)
    print("\nPadding mask:")
    print(p_mask.int())

    # Combine masks. For decoder self-attention we usually want BOTH:
    # a position is allowed only if it is a real token AND not in the future.
    # p_mask has shape (B, T) → expand to (B, T_q, T_k) by attending only
    # to real key positions:
    combined = c_mask.unsqueeze(0) & p_mask.unsqueeze(1)
    print("\nCombined causal + padding (batch 0):")
    print(combined[0].int())

    masked_scores = apply_mask(scores, combined)
    weights = torch.softmax(masked_scores, dim=-1)
    print("\nRow sums (should be ~1):", weights.sum(dim=-1))
```
