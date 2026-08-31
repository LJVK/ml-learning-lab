---
id: layernorm
title: LayerNorm — Code
group: transformer-block
kind: code
related_concept: /concepts/layernorm
source_files:
  - src/layer_norm.py
---

# LayerNorm — Code

LayerNorm implemented from scratch. Normalizes each token vector across its feature dimension, then applies a learned per-feature scale (γ) and shift (β). The demo verifies the output matches PyTorch's nn.LayerNorm.

## Source

### `src/layer_norm.py`

```python
import torch
import torch.nn as nn


class LayerNorm(nn.Module):
    """
    LayerNorm from scratch

    Purpose
    -------
    Normalizes each token vector independently across its feature dimension.
    Unlike BatchNorm (which normalizes across the batch), LayerNorm operates
    per-sample per-position, making it batch-size independent and well-suited
    for variable-length sequences.

    Input
    -----
    x : (..., D)
        Any tensor whose last dim is the feature dimension D.

    Output
    ------
    (..., D)
        Same shape. Each token's D features have been rescaled to have
        (approximately) mean 0 and variance 1, then affine-transformed.

    Formula
    -------
        mean = x.mean(dim=-1)
        var  = x.var(dim=-1, unbiased=False)
        x_norm = (x - mean) / sqrt(var + eps)
        out    = gamma * x_norm + beta

    Notes
    -----
    - `eps` prevents division by zero when variance is tiny.
    - `gamma` and `beta` are learnable per-feature affine parameters, so the
      network can undo normalization if a specific scale/shift is useful.
    - Statistics are computed per-token (per row of the last dim), not per
      batch or per position across the sequence.
    """
    def __init__(self, embed_dim, eps=1e-5):
        super().__init__()
        self.eps = eps

        # gamma: per-feature scale. Initialized to 1 so at init the layer
        # is (approximately) identity after normalization.
        self.gamma = nn.Parameter(torch.ones(embed_dim))

        # beta: per-feature shift. Initialized to 0.
        self.beta = nn.Parameter(torch.zeros(embed_dim))

    def forward(self, x):
        # x shape: (..., D). Statistics computed over the last dim only.

        # Mean across features for each token.
        # Shape: (..., 1) after keepdim so it broadcasts back to (..., D).
        mean = x.mean(dim=-1, keepdim=True)

        # Variance across features for each token.
        # unbiased=False matches PyTorch's nn.LayerNorm behavior.
        var = x.var(dim=-1, keepdim=True, unbiased=False)

        # Normalize: (x - mean) / sqrt(var + eps)
        x_norm = (x - mean) / torch.sqrt(var + self.eps)

        # Affine transform: gamma * x_norm + beta.
        # gamma and beta broadcast across all leading dims.
        return self.gamma * x_norm + self.beta


if __name__ == "__main__":
    # Quick sanity check: does our LayerNorm match torch's nn.LayerNorm?
    torch.manual_seed(0)
    B, T, D = 2, 5, 8
    x = torch.randn(B, T, D)

    ours = LayerNorm(D)
    theirs = nn.LayerNorm(D)

    # Copy their params so both start identically.
    with torch.no_grad():
        ours.gamma.copy_(theirs.weight)
        ours.beta.copy_(theirs.bias)

    out_ours = ours(x)
    out_theirs = theirs(x)
    print(f"Max abs diff vs nn.LayerNorm: {(out_ours - out_theirs).abs().max().item():.2e}")
    # Should be ~1e-7 or smaller. Sanity check passes.
```

## Where this code lives

Source files above are checked in under `ml_learning_lab_content/code/src/` in this repo. They are kept in sync with the original working implementations in `~/My_Repos/attention-from-scracth/` via `scripts/regenerate_code.py`.
