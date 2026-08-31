---
id: pre-ln-vs-post-ln
title: Pre-LN vs Post-LN — Code
group: transformer-block
kind: code
related_concept: /concepts/pre-ln-vs-post-ln
source_files:
  - src/pre_ln_vs_post_ln.py
---

# Pre-LN vs Post-LN — Code

Two Transformer block variants that differ only in where LayerNorm sits: Pre-LN normalizes INSIDE the residual branch; Post-LN normalizes AFTER the residual add. Pre-LN trains stably for deep stacks; Post-LN (the original paper) needs learning-rate warmup or diverges.

## Source

### `src/pre_ln_vs_post_ln.py`

```python
import torch
import torch.nn as nn


class PreLNBlock(nn.Module):
    """
    Pre-LN Transformer block:  x = x + Sublayer(LN(x))

    LayerNorm sits INSIDE the residual branch, BEFORE the sublayer.
    The residual (identity) path is unnormalized and untouched.

    Why it wins for deep stacks
    ---------------------------
    - Gradients flow through the clean identity path without going through
      a LayerNorm at every layer. That path can carry signal across many
      layers with less accumulated warping.
    - Training is stable without a learning-rate warmup schedule.
    - The original GPT / most modern LLM stacks use Pre-LN for this reason.

    Downside
    --------
    - After many layers, the residual stream can grow in magnitude because
      nothing normalizes it. A final LayerNorm at the top of the stack is
      usually added.
    """
    def __init__(self, embed_dim, mha, ffn):
        super().__init__()
        self.norm_attn = nn.LayerNorm(embed_dim)
        self.mha = mha
        self.norm_ffn = nn.LayerNorm(embed_dim)
        self.ffn = ffn

    def forward(self, x):
        # Attention sublayer: normalize INSIDE the residual branch.
        x = x + self.mha(self.norm_attn(x))
        # FFN sublayer: same structure.
        x = x + self.ffn(self.norm_ffn(x))
        return x


class PostLNBlock(nn.Module):
    """
    Post-LN Transformer block:  x = LN(x + Sublayer(x))

    LayerNorm sits AFTER the residual add. This is the formulation from
    the original Vaswani et al. paper.

    Why it lost for deep stacks
    ---------------------------
    - Every layer normalizes the combined output, so the residual signal
      gets rescaled at every layer. Deep stacks suffer from unstable
      gradients and typically need a careful learning-rate warmup to
      train at all.
    - Sensitive to initialization; often diverges without warmup for
      >12 layers.

    Where it still appears
    ----------------------
    - Some encoder-only models (e.g. original BERT) that trained with
      careful warmup schedules.
    - Historical or reproduction code.
    """
    def __init__(self, embed_dim, mha, ffn):
        super().__init__()
        self.mha = mha
        self.norm_attn = nn.LayerNorm(embed_dim)
        self.ffn = ffn
        self.norm_ffn = nn.LayerNorm(embed_dim)

    def forward(self, x):
        # Attention sublayer: normalize AFTER the residual add.
        x = self.norm_attn(x + self.mha(x))
        # FFN sublayer: same structure.
        x = self.norm_ffn(x + self.ffn(x))
        return x


if __name__ == "__main__":
    # Toy demo: same sublayer modules plugged into both variants; the
    # difference is purely in where LayerNorm sits.
    torch.manual_seed(0)
    B, T, D = 2, 5, 16

    class Identity(nn.Module):
        def forward(self, x): return x

    pre = PreLNBlock(D, Identity(), Identity())
    post = PostLNBlock(D, Identity(), Identity())

    x = torch.randn(B, T, D)
    print("Input stats:  mean={:.3f}  std={:.3f}".format(x.mean().item(), x.std().item()))
    y_pre = pre(x)
    y_post = post(x)
    print("Pre-LN out:   mean={:.3f}  std={:.3f}".format(y_pre.mean().item(), y_pre.std().item()))
    print("Post-LN out:  mean={:.3f}  std={:.3f}".format(y_post.mean().item(), y_post.std().item()))
    # Post-LN output is normalized; Pre-LN output preserves the growing residual stream.
```

## Where this code lives

Source files above are checked in under `ml_learning_lab_content/code/src/` in this repo. They are kept in sync with the original working implementations in `~/My_Repos/attention-from-scracth/` via `scripts/regenerate_code.py`.
