---
id: attention-internals
title: Attention Internals — Questions
group: attention
kind: questions
related_concept: /concepts/attention-internals
source: Attention_Internals_Head_Specialization_Debugging_Question_Bank.docx
---

# Attention Internals — Questions

> Senior-level revision set | Concise ideal answers

Scope: This question bank captures the missing depth layer of attention: how projections learn, how heads specialize, and how attention maps should be debugged without over-trusting them.

## Contents

- [A. Attention Learning Dynamics](#a-attention-learning-dynamics)
- [B. Attention Head Specialization](#b-attention-head-specialization)
- [C. Debugging Learned Attention](#c-debugging-learned-attention)
- [Quick Senior Summary](#quick-senior-summary)

## A. Attention Learning Dynamics

### Q1. Why do some Q · K attention scores become high after training instead of staying random?

**A:** Because training rewards useful attention patterns. If attending from token A to token B helps reduce loss, gradients update Wq and Wk so Q(A) and K(B) become more aligned. Higher alignment gives a larger dot product and higher softmax attention weight.

### Q2. How does backprop know whether a token pair was useful or not?

**A:** A token pair is useful if changing that attention path changes the loss in a helpful direction. Gradients flow from loss through output, attention weights, Q/K dot products, and then Wq/Wk, telling the model whether to strengthen or weaken that compatibility.

### Q3. How does V learn what information to pass forward?

**A:** Gradients flow through attention @ V. If the value information helped prediction, Wv is updated to preserve or amplify that information. If it hurt prediction, Wv is updated to change or weaken it.

### Q4. Why can Q/K learn matching behavior while V learns information-carrying behavior?

**A:** Q and K affect the attention distribution, so their gradients shape token compatibility and routing. V affects the content mixed into the output, so its gradients shape what information should be carried once a token is selected.

## B. Attention Head Specialization

### Q5. Why can different attention heads specialize even though they all receive the same input tokens?

**A:** Each head has its own Wq, Wk, and Wv. Even with the same input tokens, different initial weights and different gradient updates allow each head to learn different routing and content patterns.

### Q6. What does head specialization mean at the vector/relationship level?

**A:** A head specializes when its Q/K projections make certain token relationships produce high dot products, and its V projection carries useful content for those relationships. The specialization is about learned relational patterns, not manually assigned labels.

### Q7. Why is head specialization emergent instead of manually controlled?

**A:** No head is explicitly assigned a role. Specialization emerges from random initialization, separate projections, different gradient signals, and the shared training objective.

### Q8. How would you tell whether an attention head has learned something meaningful versus just noisy attention?

**A:** A meaningful head shows consistent, useful attention patterns across examples and contributes to lower loss or better predictions. Random high weights alone are not enough; the pattern must be stable and functionally useful.

## C. Debugging Learned Attention

### Q9. Can attention maps be misleading even when they look interpretable?

**A:** Yes. A high attention weight does not automatically prove causal importance. Attention maps are correlations unless supported by consistency across examples and intervention tests.

### Q10. How would you prove an attended token is actually important, not just visually highlighted?

**A:** Use an intervention: mask, remove, or replace the attended token and measure whether the loss increases or the output quality degrades. Attention weight alone is correlation; intervention effect gives stronger evidence of importance.

### Q11. What are the limits of using attention maps for debugging?

**A:** Attention maps show where the model attends, but not necessarily why it made a decision. They can be huge, noisy, diffuse, different across heads/layers, and non-causal. They should be paired with interventions or output/loss checks.

## Quick Senior Summary

| Concept | Senior takeaway |
| --- | --- |
| Q/K | Learn routing / compatibility: which tokens should connect. |
| V | Learns content: what information should be carried after attention selects a token. |
| Heads | Specialize because each head has separate projections and gradient paths. |
| Attention maps | Useful debugging signal, but not causal proof without interventions. |
