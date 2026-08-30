---
id: multi-head-attention
title: Multi-Head Attention — Questions
group: attention
kind: questions
related_concept: /concepts/multi-head-attention
source: Multi_Head_Attention_Question_Bank.docx
---

# Multi-Head Attention — Questions

> Senior-level revision set: design reasoning, failure modes, tensor shapes, implementation, and tests

Use this as the clean source of truth for Multi-Head Attention. Questions are grouped by reasoning category and include concise ideal answers.

## Contents

- [A. Core Design Reasoning](#a-core-design-reasoning)
- [B. Head Semantics and Specialization](#b-head-semantics-and-specialization)
- [C. Tensor Shapes and Shape-Based Reasoning](#c-tensor-shapes-and-shape-based-reasoning)
- [D. Scaling, Softmax, and Attention Behavior](#d-scaling-softmax-and-attention-behavior)
- [E. Output Projection and Head Mixing](#e-output-projection-and-head-mixing)
- [F. PyTorch Implementation Mechanics](#f-pytorch-implementation-mechanics)
- [G. Testing and Debugging](#g-testing-and-debugging)
- [H. Senior Interview Synthesis](#h-senior-interview-synthesis)

## A. Core Design Reasoning

### Q1. Why do we need multi-head attention instead of a single attention head?

**A:** A single head gives one learned similarity function. Multiple heads give multiple independent similarity spaces, so the model can capture different token relationships with less interference.

### Q2. Why can’t one large head fully replace multiple smaller heads?

**A:** One large head has more capacity, but still produces one attention pattern per layer position. Multiple heads allow parallel, independent attention patterns before being combined.

### Q3. Why can’t simply increasing embedding dimension replace multiple heads?

**A:** A larger embedding increases representation capacity, but does not create multiple independent attention distributions. Multi-head attention adds specialization, not just width.

### Q4. What is the main tradeoff between more heads and larger head_dim?

**A:** More heads increase specialization, but each head gets fewer dimensions. Larger head_dim gives richer per-head matching, but fewer independent views.

### Q5. What breaks when head_dim becomes too small?

**A:** Each head may not have enough representational capacity to compute useful Q/K similarity or carry useful V information, so attention becomes noisy or weak.

### Q6. Why does multi-head attention reduce optimization interference?

**A:** Different heads have separate projection spaces, so one head can learn one relationship while another learns a different one, instead of forcing all patterns into one attention map.

## B. Head Semantics and Specialization

### Q7. Do heads see different tokens or the same full sequence?

**A:** Each head sees the same full sequence, but through different learned Q/K/V projections.

### Q8. Do heads manually represent features like syntax, color, position, or object type?

**A:** No. Heads are not manually assigned roles. They can learn different useful relationships during training because their projection weights are independent.

### Q9. What does it mean for heads to specialize?

**A:** It means different heads may learn different attention patterns or relationships, such as local context, long-range dependency, object-attribute links, or structural relations.

### Q10. Why does each head need its own Q/K/V projection space?

**A:** Separate Q/K/V projections let each head define its own matching rules and value information. Without that, heads would not be truly independent.

### Q11. What would happen if all heads shared the exact same Q/K/V weights?

**A:** The heads would tend to duplicate the same attention behavior, reducing the benefit of multi-head attention.

## C. Tensor Shapes and Shape-Based Reasoning

### Q12. Given input shape (B, T, D), what is the shape after Q/K/V projection?

**A:** Each projection keeps the shape (B, T, D), but changes the representation space.

### Q13. If D=512 and num_heads=8, what is head_dim and why?

**A:** head_dim = 64 because 512 is split evenly across 8 heads.

### Q14. Why must embed_dim be divisible by num_heads?

**A:** Because the embedding dimension must split evenly into per-head dimensions.

### Q15. Why reshape from (B, T, D) to (B, T, H, Dh)?

**A:** This separates the full embedding into multiple heads, where H is number of heads and Dh is per-head dimension.

### Q16. Why transpose from (B, T, H, Dh) to (B, H, T, Dh)?

**A:** This places the head dimension before the token dimension so each head can compute attention independently over the full sequence.

### Q17. What is the attention score shape in multi-head self-attention?

**A:** (B, H, T, T): for each batch and head, every query token scores every key token.

### Q18. What is the shape after attention @ V?

**A:** (B, H, T, Dh): each head returns one contextual vector per token.

### Q19. Why transpose back and concatenate heads?

**A:** The output must return to model shape (B, T, D), so all head outputs are brought back together along the embedding dimension.

### Q20. Why does the final MHA output preserve (B, T, D)?

**A:** Transformer blocks use residual connections and stacked layers, so the module must preserve the same token count and embedding dimension.

## D. Scaling, Softmax, and Attention Behavior

### Q21. Why scale by sqrt(head_dim) instead of sqrt(embed_dim)?

**A:** Each head computes dot products over head_dim, so the variance growth depends on head_dim, not the full embedding dimension.

### Q22. What happens if we incorrectly scale by sqrt(embed_dim) in MHA?

**A:** The logits may be over-scaled, making attention too flat and weakening each head’s ability to focus.

### Q23. What happens if we do not scale at all?

**A:** Dot products can become large, softmax can saturate, gradients can weaken, and training becomes less stable.

### Q24. Why must softmax be applied over the key/token dimension?

**A:** Each query token must form a distribution over all keys. Applying softmax over the wrong dimension changes the meaning of attention.

### Q25. What bug can pass shape tests but break attention behavior?

**A:** Using softmax over the wrong dimension can preserve output shape while making queries or heads normalize incorrectly.

## E. Output Projection and Head Mixing

### Q26. Why concatenate head outputs instead of averaging them?

**A:** Concatenation preserves each head’s learned representation. Averaging would collapse specialized information too early.

### Q27. Why do we need an output projection after concatenating heads?

**A:** The output projection mixes information across heads and maps the concatenated result back into the model’s embedding space.

### Q28. Would MHA still run without output projection?

**A:** Yes, but it would be less expressive because head outputs would not be learned-mixed before entering the next layer.

### Q29. Why is output projection especially important in MHA?

**A:** Because multiple heads produce separate representations. The model needs a learned way to combine them into one usable representation.

## F. PyTorch Implementation Mechanics

### Q30. Why use view/reshape after Q/K/V projection?

**A:** To split the full embedding dimension into num_heads and head_dim.

### Q31. Why can transpose make a tensor non-contiguous?

**A:** Transpose changes the logical dimension order by changing strides, without physically rearranging memory.

### Q32. Why is contiguous() often needed before view() after transpose?

**A:** view() requires memory to match the requested logical layout. contiguous() creates that memory layout.

### Q33. What is the difference between view() and reshape()?

**A:** view() requires compatible contiguous memory. reshape() may return a view or create a copy if needed.

### Q34. What implementation bug can happen if you use view() after transpose without contiguous()?

**A:** PyTorch may raise an error, or the developer may switch to reshape without understanding when a copy is being made.

### Q35. Why prefer unpacking B, T, D = x.shape instead of repeatedly indexing shapes?

**A:** It makes tensor transformations easier to read and reduces shape bugs.

## G. Testing and Debugging

### Q36. What is the first basic test for a MultiHeadAttention module?

**A:** Input shape (B, T, D) should produce output shape (B, T, D).

### Q37. Why is shape testing alone insufficient?

**A:** A broken implementation can preserve shape while using wrong softmax dimension, wrong scaling, wrong transpose, or duplicated heads.

### Q38. What behavior should be tested beyond shape?

**A:** No NaNs/Infs, gradients flow, deterministic output in eval mode, attention rows sum to one if exposed, output changes when input changes.

### Q39. How would you test that heads are actually separated?

**A:** Check intermediate Q/K/V head shapes and verify different heads are not forced to share the exact same projected values unless intentionally tied.

### Q40. What common MHA bugs should tests catch?

**A:** Wrong head_dim calculation, missing divisibility check, softmax over wrong dimension, missing transpose, incorrect concat, missing output projection, device mismatch.

### Q41. How would you debug poor attention behavior in a model using MHA?

**A:** Inspect attention maps, validate tensor shapes, check softmax dimension and scaling, verify gradients, compare head diversity, and test with controlled inputs.

## H. Senior Interview Synthesis

### Q42. Explain MHA in one senior-level paragraph.

**A:** Multi-head attention projects the same sequence into multiple Q/K/V spaces, computes independent attention distributions per head, concatenates the resulting contextual vectors, and uses an output projection to mix them. It improves expressiveness by allowing multiple token relationships to be modeled in parallel while preserving the Transformer block shape.

### Q43. What is the strongest reason MHA works better than single-head attention?

**A:** It gives the layer multiple independent learned similarity functions, allowing different relationships to be captured simultaneously instead of forcing one attention distribution to explain everything.

### Q44. What is the main limitation of adding more heads?

**A:** Each head becomes lower-dimensional, which can reduce per-head capacity and create overhead or diminishing returns.

### Q45. How do tensor shapes prove that each head attends over the full sequence?

**A:** After reshaping to (B, H, T, Dh), the attention scores are (B, H, T, T), so each head has its own full token-token attention matrix.
