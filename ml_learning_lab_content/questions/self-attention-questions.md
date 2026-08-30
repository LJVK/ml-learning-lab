---
id: self-attention
title: Self-Attention — Questions
group: attention
kind: questions
related_concept: /concepts/self-attention
source: Attention_Question_Bank_Recovered_v3.docx
---

# Self-Attention — Questions

> Recovered v3 - Senior Level Focus

Scope note: This is a recovered question bank built from the available conversation context and the missing follow-ups that were explicitly identified. It is intended as a practical revision/interview prep document, not a guarantee that every older chat turn was recoverable.

## Contents

- [1. Why Attention / Transformer Motivation](#1-why-attention-transformer-motivation)
- [2. Q / K / V Core Intuition](#2-q-k-v-core-intuition)
- [3. Attention Scores and Attention @ V](#3-attention-scores-and-attention-v)
- [4. Softmax and Normalization Direction](#4-softmax-and-normalization-direction)
- [5. Scaling by sqrt(d_k)](#5-scaling-by-sqrt-d-k)
- [6. Dot Product vs Cosine Similarity](#6-dot-product-vs-cosine-similarity)
- [7. Output Projection](#7-output-projection)
- [8. Single-Head Implementation](#8-single-head-implementation)
- [9. Testing Attention](#9-testing-attention)
- [10. Multi-Head Attention Architecture](#10-multi-head-attention-architecture)
- [11. Multi-Head Tensor Shapes](#11-multi-head-tensor-shapes)
- [12. PyTorch Memory, View, Reshape, Transpose](#12-pytorch-memory-view-reshape-transpose)
- [13. Attention in Diffusion U-Net](#13-attention-in-diffusion-u-net)

## 1. Why Attention / Transformer Motivation

### Q1. ATT-001: Why do we need Attention when RNNs/LSTMs already work?

**A:** Ideal answer: RNNs process tokens sequentially, so the information path grows with sequence length. Attention lets any token interact directly with any other token, improving long-range dependency handling and parallel training.

### Q2. ATT-002: Why is a long information path a problem even for LSTMs?

**A:** Ideal answer: Even with gates, information and gradients must pass through many recurrent steps and a compressed hidden state. Attention gives a direct path between related tokens.

### Q3. ATT-003: Why not just make the LSTM deeper, such as 500 layers?

**A:** Ideal answer: Depth does not remove sequential dependence across timesteps. It also makes optimization harder and still leaves long-context information traveling step by step.

### Q4. ATT-004: Attention is O(T^2) while RNNs are O(T). Why did industry still move to Transformers?

**A:** Ideal answer: Transformers parallelize across tokens, learn better long-range relationships, and scale better with data/compute. The O(T^2) cost is real, especially for long context, but the quality and training advantages were decisive.

## 2. Q / K / V Core Intuition

### Q5. ATT-101: Why do we need Q, K, and V instead of just X @ X^T?

**A:** Ideal answer: Q/K/V give learned role specialization. Without projections, the same raw representation must search, match, and carry information.

### Q6. ATT-102: Why do we need three projections instead of one learned projection Y = XW?

**A:** Ideal answer: One projection forces querying, matching, and value propagation to share a representation. Separate Q/K/V decouple these roles.

### Q7. ATT-103: What concrete capability is lost without Q/K/V?

**A:** Ideal answer: The model loses flexible role-specific matching. For example, an ambiguous word can separately advertise one meaning through keys and carry richer information through values.

### Q8. ATT-104: What are Q, K, and V roles?

**A:** Ideal answer: Q = what this token is looking for. K = how this token can be matched. V = what information this token provides if attended to.

### Q9. ATT-105: What happens if Q is identity but K and V are learned?

**A:** Ideal answer: The model can still work, but the query strategy is fixed. It cannot learn what questions each token should ask.

### Q10. ATT-106: Why is V different from K?

**A:** Ideal answer: K is optimized for matching/similarity. V is optimized for information propagation after attention weights are computed.

### Q11. ATT-107: What if output = Attention @ K instead of Attention @ V?

**A:** Ideal answer: It can train, but it copies the matching representation instead of a separate information representation, which is less expressive.

### Q12. ATT-108: Why use a linear projection D -> D if the shape does not change?

**A:** Ideal answer: The dimensionality stays the same, but the coordinate space/representation changes. Shape preservation does not mean identity.

## 3. Attention Scores and Attention @ V

### Q13. ATT-201: Why is the attention matrix T x T, not T x D?

**A:** Ideal answer: Attention scores represent pairwise token-token relationships. Each query token compares against every key token.

### Q14. ATT-202: What does each row of the attention matrix represent?

**A:** Ideal answer: One query token’s distribution over all key tokens.

### Q15. ATT-203: What does each column of the attention matrix represent?

**A:** Ideal answer: One key token as viewed by all queries. Columns are not the normalization target in standard self-attention.

### Q16. ATT-204: Architecturally, what does Attention @ V mean?

**A:** Ideal answer: Each query creates a weighted combination of all value vectors, producing a contextual embedding.

### Q17. ATT-205: Is Attention @ V selecting one token/value?

**A:** Ideal answer: No. It usually creates a weighted mixture, not a hard selection.

### Q18. ATT-206: Why does every query independently decide where to attend?

**A:** Ideal answer: Each token has its own context need based on its role and position, so each row is normalized independently.

### Q19. ATT-207: What happens if a token mostly attends to itself?

**A:** Ideal answer: It keeps mostly its own/local information, meaning it does not need much external context at that layer.

### Q20. ATT-208: What happens if a token attends to far-away/global tokens?

**A:** Ideal answer: It is using non-local context to resolve meaning, structure, or dependency.

## 4. Softmax and Normalization Direction

### Q21. ATT-301: Why use softmax after QK^T?

**A:** Ideal answer: Raw scores can be negative or large. Softmax converts them into nonnegative normalized attention weights.

### Q22. ATT-302: Why not use raw QK^T @ V?

**A:** Ideal answer: Raw weights are unbounded, can be negative, and have unstable scale. They do not form a clean attention distribution.

### Q23. ATT-303: Why softmax instead of sigmoid?

**A:** Ideal answer: Sigmoid treats each key independently. Softmax creates competition across keys and makes the row sum to one.

### Q24. ATT-304: Why not ReLU?

**A:** Ideal answer: ReLU removes negative scores but does not normalize or create competition. Large positives can still dominate unstably.

### Q25. ATT-305: What property breaks if softmax dim=0?

**A:** Ideal answer: It normalizes across the batch, causing different samples to compete with each other, which is meaningless.

### Q26. ATT-306: What property breaks if softmax dim=1?

**A:** Ideal answer: It normalizes across queries, so keys effectively decide who attends to them. That reverses the intended logic.

### Q27. ATT-307: Why use dim=-1 rather than dim=2?

**A:** Ideal answer: The last dimension is the keys dimension. dim=-1 remains correct even after adding a heads dimension in multi-head attention.

### Q28. ATT-308: Why rows and not columns?

**A:** Ideal answer: The query should decide how to distribute attention over keys, so each query row sums to one.

## 5. Scaling by sqrt(d_k)

### Q29. ATT-401: Why divide by sqrt(d_k)?

**A:** Ideal answer: Dot-product variance grows with dimension. Scaling keeps logits stable and prevents softmax saturation.

### Q30. ATT-402: Why does higher variance cause softmax saturation?

**A:** Ideal answer: Large logits make softmax nearly one-hot. That creates tiny gradients and unstable/slow training.

### Q31. ATT-403: Why not divide by d_k?

**A:** Ideal answer: That usually over-scales the logits, making attention too flat and weak.

### Q32. ATT-404: In single-head attention, why use embed_dim for scaling?

**A:** Ideal answer: The dot product is computed over the full embedding dimension.

### Q33. ATT-405: In multi-head attention, why use head_dim for scaling?

**A:** Ideal answer: Each head computes dot products over only head_dim, not the full embedding dimension.

## 6. Dot Product vs Cosine Similarity

### Q34. ATT-501: Why use dot product instead of cosine similarity?

**A:** Ideal answer: Dot product preserves both direction and magnitude. Cosine normalizes away magnitude, which the model may use for strength or confidence.

### Q35. ATT-502: What information does cosine throw away?

**A:** Ideal answer: Vector norm/magnitude. That can encode importance, certainty, or feature strength.

## 7. Output Projection

### Q36. ATT-601: Why do we need the output projection?

**A:** Ideal answer: It maps and mixes attended information back into the model embedding space for downstream layers.

### Q37. ATT-602: Would the network still train without out_proj?

**A:** Ideal answer: Yes, but it is less expressive because the output remains in value-space without a learned final mixing step.

### Q38. ATT-603: Why is output projection more important in multi-head attention?

**A:** Ideal answer: It mixes the specialized head outputs into one unified representation.

## 8. Single-Head Implementation

### Q39. ATT-701: What constructor layers are needed for single-head self-attention?

**A:** Ideal answer: q_proj, k_proj, v_proj, and out_proj.

### Q40. ATT-702: Why only embed_dim as constructor parameter for single-head attention?

**A:** Ideal answer: There is no head split, so head_dim = embed_dim.

### Q41. ATT-703: What is the shape after q_proj on input (B,T,D)?

**A:** Ideal answer: The shape remains (B,T,D), but the representation changes.

### Q42. ATT-704: Why use torch.matmul(q, k.transpose(-2,-1))?

**A:** Ideal answer: It computes batched token-token similarity scores.

### Q43. ATT-705: Why transpose K and not Q?

**A:** Ideal answer: For each batch/head, we need (T,D) @ (D,T) to produce a (T,T) score matrix.

### Q44. ATT-706: Why use math.sqrt instead of torch.sqrt for embed_dim/head_dim?

**A:** Ideal answer: embed_dim/head_dim are Python scalars. torch.sqrt expects tensors.

### Q45. ATT-707: Why preserve output shape (B,T,D)?

**A:** Ideal answer: Residual connections and downstream transformer layers expect the same embedding shape.

## 9. Testing Attention

### Q46. ATT-801: What is the first shape test for attention?

**A:** Ideal answer: Input (B,T,D) should produce output (B,T,D).

### Q47. ATT-802: Why not test the input shape when you created x yourself?

**A:** Ideal answer: That only tests your setup/PyTorch, not the module behavior.

### Q48. ATT-803: Why is a shape test alone insufficient?

**A:** Ideal answer: A broken identity-like forward pass can preserve shape while failing attention semantics.

### Q49. ATT-804: What behavioral properties should be tested?

**A:** Ideal answer: Gradients flow, no NaNs/Infs, deterministic eval behavior, attention rows sum to one if exposed, and output changes when input changes.

### Q50. ATT-805: What bug can pass shape tests but break semantics?

**A:** Ideal answer: Applying softmax over the wrong dimension.

### Q51. ATT-806: What should a constructor test verify?

**A:** Ideal answer: Stored embed_dim and correct in/out dimensions for q_proj, k_proj, v_proj, and out_proj.

## 10. Multi-Head Attention Architecture

### Q52. MHA-001: Why multi-head attention instead of one large head?

**A:** Ideal answer: Multiple heads learn multiple independent similarity functions and can specialize in different relationships.

### Q53. MHA-002: Why cannot one 512-dim head simply replace 8 heads of 64?

**A:** Ideal answer: One head still has one attention distribution/similarity function. Multiple heads provide separate attention mechanisms.

### Q54. MHA-003: Why cannot increasing embedding dimension replace multiple heads?

**A:** Ideal answer: More dimension gives more capacity, but still one attention mechanism unless split into separate heads.

### Q55. MHA-004: Why not keep increasing the number of heads forever?

**A:** Ideal answer: head_dim becomes too small, reducing per-head capacity and giving diminishing returns/overhead.

### Q56. MHA-005: What is the tradeoff between more heads and larger head_dim?

**A:** Ideal answer: More heads give more specialization. Larger head_dim gives richer per-head representations.

### Q57. MHA-006: Why does multi-head attention reduce optimization interference?

**A:** Ideal answer: Different heads have separate parameters and can learn different relations instead of forcing one function to satisfy all relations.

### Q58. MHA-007: Do heads learn different parts of a token or different relationships?

**A:** Ideal answer: They learn different projected views and relationships over the same sequence, not merely fixed token slices.

### Q59. MHA-008: Does each head see the whole sequence?

**A:** Ideal answer: Yes. Every head attends over all tokens using its own projections.

### Q60. MHA-009: Why does each head need its own Q/K/V projections?

**A:** Ideal answer: Independent projections create independent similarity and information spaces.

### Q61. MHA-010: Why concatenate heads?

**A:** Ideal answer: To combine specialized contextual outputs from all heads.

### Q62. MHA-011: Why output projection after concatenation?

**A:** Ideal answer: To mix head outputs into a unified model representation.

## 11. Multi-Head Tensor Shapes

### Q63. MHA-101: With embed_dim=512 and num_heads=8, what is head_dim?

**A:** Ideal answer: 64.

### Q64. MHA-102: What is the shape after q_proj?

**A:** Ideal answer: (B,T,512).

### Q65. MHA-103: What is the shape after view?

**A:** Ideal answer: (B,T,8,64).

### Q66. MHA-104: Why transpose (B,T,H,Dh) to (B,H,T,Dh)?

**A:** Ideal answer: To put heads before token dimension so attention runs independently per head.

### Q67. MHA-105: What is the shape after transpose?

**A:** Ideal answer: (B,8,T,64).

### Q68. MHA-106: What is the shape of attention scores?

**A:** Ideal answer: (B,8,T,T).

### Q69. MHA-107: What is the shape after Attention @ V?

**A:** Ideal answer: (B,8,T,64).

### Q70. MHA-108: What is the shape after transpose back?

**A:** Ideal answer: (B,T,8,64).

### Q71. MHA-109: What is the shape after concat/view?

**A:** Ideal answer: (B,T,512).

### Q72. MHA-110: Why assert embed_dim % num_heads == 0?

**A:** Ideal answer: The embedding must split evenly across heads.

### Q73. MHA-111: Why compute head_dim after validating divisibility?

**A:** Ideal answer: It avoids invalid derived values and makes failures explicit.

### Q74. MHA-112: Why prefer B,T,_ = x.shape over repeated q.shape indexing?

**A:** Ideal answer: It is clearer and reduces shape-indexing mistakes.

### Q75. MHA-113: Why use head_dim in scaling?

**A:** Ideal answer: Each head’s dot product is over head_dim.

## 12. PyTorch Memory, View, Reshape, Transpose

### Q76. PYT-001: What is contiguous memory?

**A:** Ideal answer: Tensor elements are stored in memory in the same order as the logical layout expects.

### Q77. PYT-002: What does view() do?

**A:** Ideal answer: It reinterprets contiguous memory with a new shape without copying.

### Q78. PYT-003: What does transpose() do?

**A:** Ideal answer: It changes shape/stride metadata without physically moving data.

### Q79. PYT-004: Why does transpose make a tensor non-contiguous?

**A:** Ideal answer: The logical traversal order no longer matches the physical memory order.

### Q80. PYT-005: What are strides?

**A:** Ideal answer: The memory step sizes needed to move along each tensor dimension.

### Q81. PYT-006: Why is contiguous() needed before view() after transpose?

**A:** Ideal answer: It creates a physical memory layout matching the current logical order.

### Q82. PYT-007: What is the difference between view() and reshape()?

**A:** Ideal answer: view requires compatible contiguous memory. reshape may copy if needed.

### Q83. PYT-008: Why can reshape work when view fails?

**A:** Ideal answer: reshape can internally make a contiguous copy.

### Q84. PYT-009: How can transpose return a transposed tensor without moving memory?

**A:** Ideal answer: By changing strides and metadata.

### Q85. PYT-010: Why is transpose O(1) but contiguous O(n)?

**A:** Ideal answer: transpose changes metadata; contiguous copies/reorders all elements.

### Q86. PYT-011: What happens with x.view(3,2) on memory [1,2,3,4,5,6]?

**A:** Ideal answer: It becomes [[1,2],[3,4],[5,6]] because view reads memory sequentially.

### Q87. PYT-012: What operation gives [[1,4],[2,5],[3,6]] from [[1,2,3],[4,5,6]]?

**A:** Ideal answer: transpose, not view.

## 13. Attention in Diffusion U-Net

### Q88. DIFATT-001: Why use Conv1d(kernel_size=1) instead of Linear in U-Net attention?

**A:** Ideal answer: The tensor is usually (B,C,Tokens). Conv1d projects channels per token without mixing tokens and avoids extra reshaping. It is equivalent to a Linear over channels per token.

### Q89. DIFATT-002: Why flatten an image feature map into tokens for attention?

**A:** Ideal answer: Each spatial location becomes a token, and channels become the embedding dimension.

### Q90. DIFATT-003: Why delay permute until after Conv1d Q/K/V projection?

**A:** Ideal answer: Conv1d expects (B,Channels,Tokens). After projection, permute to (B,Tokens,Channels) for attention matmul.

### Q91. DIFATT-004: Why does Conv1d(kernel=1) not mix spatial tokens?

**A:** Ideal answer: Kernel size 1 operates independently at each token position across channels.

### Q92. DIFATT-005: Why place attention at the bottleneck?

**A:** Ideal answer: There are fewer spatial tokens at the bottleneck, so O(T^2) attention is cheaper while still providing global context.

### Q93. DIFATT-006: Why GroupNorm in diffusion U-Net instead of BatchNorm/LayerNorm?

**A:** Ideal answer: Diffusion often uses small batches. BatchNorm can be unstable; GroupNorm normalizes channels per sample and works well for CNN feature maps.
