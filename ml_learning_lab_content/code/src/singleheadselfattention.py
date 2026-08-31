import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SingleHeadSelfAttention(nn.Module):
    """
    Single Head Scaled Dot-Product Self Attention

    Purpose
    -------
    Implements the original attention mechanism from
    "Attention Is All You Need" using a single attention head.

    Input
    -----
    x : (B, T, D)
        B = Batch Size
        T = Number of Tokens
        D = Embedding Dimension

    Output
    ------
    (B, T, D)

    Evolution
    ---------
    Single Head Self Attention
            ↓
    Multi Head Attention
            ↓
    Cross Attention
    """
    def __init__(self, embed_dim):
        super().__init__()
        # Store embedding dimension.
        # Every token entering attention has this many features.
        #
        # Example:
        # embed_dim = 512
        self.embed_dim = embed_dim

        # ------------------------------------------------------------------
        # Learn WHAT each token is searching for.
        #
        # Input : (B, T, D)
        # Output: (B, T, D)
        #
        # This projects embeddings into Query space.
        # ------------------------------------------------------------------
        self.q_proj = nn.Linear(embed_dim, embed_dim)

        # ------------------------------------------------------------------
        # Learn HOW each token should be matched.
        #
        # Projects embeddings into Key space.
        # ------------------------------------------------------------------
        self.k_proj = nn.Linear(embed_dim, embed_dim)

        # ------------------------------------------------------------------
        # Learn WHAT information each token contributes.
        #
        # Projects embeddings into Value space.
        # ------------------------------------------------------------------
        self.v_proj = nn.Linear(embed_dim, embed_dim)

        # ------------------------------------------------------------------
        # After attention, project features back into the model's
        # embedding space.
        #
        # Why?
        # ----
        # Attention gathers information.
        # This layer learns how that gathered information should be
        # reorganized before being passed to the next layer.
        # ------------------------------------------------------------------
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, x):
        """
        Parameters
        ----------
        x : Tensor
            Shape: (B, T, D)

            B = Batch Size
            T = Number of Tokens
            D = Embedding Dimension

        Returns
        -------
        Tensor
            Shape: (B, T, D)
        """
        # -------------------------------------------------------------
        # Project the same input embeddings into three different
        # learned representation spaces.
        #
        # Q : What am I looking for?
        # K : What can I match?
        # V : What information can I provide?
        #
        # Input :
        # (B, T, D)
        #
        # Output:
        # (B, T, D)
        # -------------------------------------------------------------
        q = self.q_proj(x)
        k = self.k_proj(x)
        v = self.v_proj(x)
        # -------------------------------------------------------------
        # Compare every Query against every Key.
        #
        # Why?
        # ----
        # Every token asks:
        # "Which other tokens are relevant to me?"
        #
        # Shape:
        #
        # Q : (B, T, D)
        # K : (B, T, D)
        #
        # Kᵀ : (B, D, T)
        #
        # Scores:
        # (B, T, T)
        #
        # Every row = one query token.
        # Every column = one key token.
        # -------------------------------------------------------------
        scores = torch.matmul(q, k.transpose(-2, -1))
        # ---------------------------------------------------------
        # Step 3
        # Scale attention scores.
        # ---------------------------------------------------------

        scores = scores / math.sqrt(self.embed_dim)

        # ---------------------------------------------------------
        # Step 4
        # Convert raw similarity scores into attention probabilities.
        # ---------------------------------------------------------

        attention = F.softmax(
            scores,
            dim=-1
        )

        # ---------------------------------------------------------
        # Step 5
        # Gather information from Value vectors.
        #
        # (B,T,T) x (B,T,D)
        #
        # ->
        #
        # (B,T,D)
        # ---------------------------------------------------------

        output = torch.matmul(
            attention,
            v
        )

        # ---------------------------------------------------------
        # Step 6
        # Final learned projection.
        # ---------------------------------------------------------

        output = self.out_proj(output)

        return output