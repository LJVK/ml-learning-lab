---
id: cross-attention
title: Cross Attention — Questions
group: attention
kind: questions
related_concept: /concepts/cross-attention
source: Cross_Attention_Question_Bank.docx
---

# Cross Attention — Questions

> Senior-level revision set: design reasoning, tensor shapes, failure modes, debugging, and tests

Purpose: concise refresh document for Cross Attention after concept learning and implementation. Each item has the question and the ideal answer only.

## Contents

- [Core Architecture and Modality Roles](#core-architecture-and-modality-roles)
- [Tensor Shapes and Attention Mechanics](#tensor-shapes-and-attention-mechanics)
- [Conditioning, CFG, and Denoising Behavior](#conditioning-cfg-and-denoising-behavior)
- [Failure Modes and Debugging](#failure-modes-and-debugging)
- [Implementation and Testing](#implementation-and-testing)
- [Implementation Reference](#implementation-reference)
- [Test Checklist](#test-checklist)

## Core Architecture and Modality Roles

### Q1. Why does Cross Attention use image/latent tokens as Q?

**A:** Because the image/latent tokens are the generation target. Q represents the tokens asking for guidance. In text-to-image diffusion, each latent/image token asks which text tokens should guide it.

### Q2. Why do text tokens become K and V?

**A:** K from text provides the matchable representation of prompt tokens. V from text provides the actual conditioning information that gets injected into the image tokens.

### Q3. Why would alignment weaken if K came from text but V came from image?

**A:** The image could match against text, but would then pull image information again from V. Text would influence matching but not strongly pass prompt content into the image representation.

### Q4. Why not simply mix image and text tokens and use self-attention?

**A:** Mixing requires the model to learn role separation: which tokens are image, which are text, and which should be updated. Cross attention keeps roles explicit: image tokens are updated, text tokens provide fixed guidance.

### Q5. Why do we still need image self-attention if cross-attention gives text guidance?

**A:** Cross attention aligns image tokens with the prompt. Image self-attention keeps the image coherent internally, so object parts, layout, and regions are consistent with each other.

### Q6. What would go wrong if Q = text and K,V = image/latent?

**A:** The output would be updated text-shaped tokens, because attention returns one output per Q token. But text is the condition and image/latent is the thing being generated, so the image would not directly receive prompt guidance.

### Q7. Why is text usually kept fixed during diffusion instead of being updated with the image?

**A:** Text is the stable conditioning reference. If text embeddings drift during denoising, the guidance target can move away from the original prompt and weaken prompt adherence.

## Tensor Shapes and Attention Mechanics

### Q8. Why is the cross-attention score matrix T_img x T_txt instead of T_img x T_img?

**A:** Scores come from Q @ K^T. Q has image tokens and K has text tokens, so each image token compares against each text token. T_img x T_img would be image self-attention.

### Q9. Why should cross-attention output preserve T_img instead of becoming T_txt?

**A:** The output has one vector per Q token. Since Q comes from image tokens, cross attention returns updated image tokens with shape B x T_img x D.

### Q10. Why is multi-head useful in cross-attention?

**A:** Multiple heads allow different learned image-text relationship patterns. Heads are not manually assigned, but they can learn different useful alignments such as object, attribute, style, relation, or background cues.

### Q11. Why does cross-attention become expensive with many image tokens?

**A:** The score matrix grows as T_img x T_txt. Every image token attends to every text token. This is usually cheaper than image self-attention T_img^2 when text length is smaller, but still grows with image token count.

### Q12. Why do we divide cross-attention scores by sqrt(embed_dim) in single-head attention?

**A:** Dot products grow larger as embedding dimension increases. Scaling keeps logits stable so softmax does not become too sharp or saturated too early.

### Q13. Why is softmax applied over the text-token dimension?

**A:** For each image query token, attention must distribute probability across all text key tokens. That lets each image token decide which prompt tokens matter most.

### Q14. Why does attention @ V produce updated image tokens even though V comes from text?

**A:** Attention has one row per image token and weights over text tokens. Multiplying by text V gives each image token a weighted mixture of text information. Output follows Q tokens; V provides information.

## Conditioning, CFG, and Denoising Behavior

### Q15. If cross-attention already gives text guidance, why do we still need CFG?

**A:** Cross attention is how text enters the U-Net. CFG compares unguided and text-guided noise predictions, then amplifies the text-guided direction during sampling.

### Q16. How does cross-attention handle words like red, on, behind, or cinematic?

**A:** Each latent/image token attends to all text tokens. Local words may affect specific regions, relational words influence spatial relationships, and style words may affect many tokens globally.

### Q17. Why is cross-attention better than simply adding the same text embedding to all image tokens?

**A:** Adding the same text embedding gives every image token the same global conditioning. Cross attention gives token-specific conditioning, where each image token chooses relevant text tokens and pulls information through V.

### Q18. Why is cross-attention placed in multiple U-Net blocks instead of only once?

**A:** Different U-Net blocks operate at different feature resolutions and abstraction levels. Placing cross attention in multiple blocks lets text guide coarse layout, object/shape features, and later refinements.

### Q19. How does cross-attention behave across denoising timesteps?

**A:** At each denoising timestep, the current latent uses the same text condition. Early steps guide coarse/global structure, middle steps refine objects/layout, and later steps improve details and consistency.

### Q20. How is cross-attention different from conditioning through time embedding or class embedding?

**A:** Time embedding tells the U-Net where it is in the denoising process. Class embedding gives coarse label conditioning. Cross attention provides detailed token-level prompt guidance.

### Q21. How can increasing CFG scale make cross-attention failures worse instead of better?

**A:** CFG amplifies the text-guided direction. If cross attention already binds the wrong attribute or attends to the wrong region, high CFG can amplify the wrong guidance rather than fix it.

## Failure Modes and Debugging

### Q22. Why can cross-attention fail even when the prompt is clear?

**A:** Failure can come from tokenization, imperfect text embeddings, poor Q/K/V alignment, wrong attention focus, limited training data, or difficulty with global/style/relationship concepts.

### Q23. What happens if attention focuses on the wrong text tokens?

**A:** The latent receives the wrong conditioning signal through V. This can cause ignored words, misplaced attributes, wrong object properties, or incorrect spatial relationships.

### Q24. How would you debug poor prompt adherence using cross-attention maps?

**A:** Inspect whether expected image regions attend to expected prompt tokens. Low attention to a word suggests it is ignored; wrong regions attending to a word suggests spatial/attribute errors; shared attention across objects can indicate binding failure.

### Q25. Why can cross-attention still produce attribute binding errors even when it attends to the correct words?

**A:** Attending to the right words is not enough; the model must bind the right attribute to the right object region. Nearby or overlapping latent regions can mix attention and swap attributes.

### Q26. Why do compositional prompts fail even when cross-attention attends to the right tokens?

**A:** The model must combine objects, attributes, and relationships correctly. It may understand each word but still fail to bind red to car, blue to truck, or beside/under relationships to the correct regions.

### Q27. What could go wrong if cross-attention does not mask padded text tokens?

**A:** Image tokens may attend to meaningless PAD tokens. PAD tokens can steal softmax probability, weakening attention to real prompt words and silently hurting prompt alignment.

## Implementation and Testing

### Q28. Why does CrossAttention.forward() need both image_tokens and text_tokens, while self-attention only needs x?

**A:** Self-attention gets Q, K, and V from the same sequence. Cross attention gets Q from image tokens and K/V from text tokens, so both sources must be passed in.

### Q29. Why does q_proj take image_tokens but k_proj and v_proj take text_tokens?

**A:** Q represents image tokens asking for guidance. K represents text tokens available for matching. V carries the text information to inject into image tokens.

### Q30. Why do we transpose K before multiplying with Q?

**A:** To compute dot products between each image query token and each text key token: Q has shape B x T_img x D and K^T has shape B x D x T_txt, producing B x T_img x T_txt.

### Q31. Why do we still need out_proj after attention @ V already produces B x T_img x D?

**A:** attention @ V gives text-guided image features in the mixed attention/value space. out_proj learns how to remix them back into the model embedding space for downstream layers.

### Q32. What implementation bugs can pass shape tests but still break cross-attention semantics?

**A:** Using image tokens for V, applying softmax over the wrong dimension, missing padding masks, scaling by the wrong dimension, or accidentally swapping image/text roles can preserve output shape while breaking alignment.

### Q33. How would you test that image tokens are actually using text tokens correctly?

**A:** Use the same image tokens with different text tokens and verify the output changes; inspect attention maps; check no NaN/Inf; verify gradient flow through both Q and K/V paths; use generated-image prompt adherence as integration validation.

### Q34. Why should gradients flow to both image_tokens and text_tokens in a CrossAttention test?

**A:** image_tokens feed the Q path and text_tokens feed the K/V paths. If gradients are broken in either path, the model cannot learn the full image-text alignment mechanism.

## Implementation Reference

```python
import math
import torch
import torch.nn as nn

class CrossAttention(nn.Module):
    def __init__(self, embed_dim):
        super().__init__()
        self.embed_dim = embed_dim
        self.q_proj = nn.Linear(embed_dim, embed_dim)
        self.k_proj = nn.Linear(embed_dim, embed_dim)
        self.v_proj = nn.Linear(embed_dim, embed_dim)
        self.out_proj = nn.Linear(embed_dim, embed_dim)

    def forward(self, image_tokens, text_tokens):
        q = self.q_proj(image_tokens)
        k = self.k_proj(text_tokens)
        v = self.v_proj(text_tokens)

        scores = torch.matmul(q, k.transpose(-2, -1))
        scores = scores / math.sqrt(self.embed_dim)
        attention = torch.softmax(scores, dim=-1)
        out = torch.matmul(attention, v)
        out = self.out_proj(out)
        return out
```

## Test Checklist

- Output shape: same as image tokens, (B, T_img, D).
- Text sensitivity: same image tokens with different text tokens should produce different outputs.
- Finite output: no NaN or Inf values.
- Gradient flow: gradients should exist for both image_tokens and text_tokens.
- Semantic validation: inspect attention maps or generated images for prompt adherence.
