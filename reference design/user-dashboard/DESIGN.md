# Verdant Ethos: A Design System for Sustainable Luxury

### 1. Overview & Creative North Star
**Creative North Star: The Curated Conservatory**
Verdant Ethos is a design system that rejects the sterile, "flat" aesthetic of modern SaaS in favor of a tactile, editorial experience. It draws inspiration from high-end botanical journals and sustainable architecture. The system prioritizes organic depth, utilizing a "Glass-on-Green" layering philosophy that makes the interface feel like light filtering through a canopy. We break the traditional grid through intentional whitespace (Spacing 3) and large-scale typographic statements that demand attention without shouting.

### 2. Colors
The palette is rooted in a "Deep Forest" primary green (`#317d36`), supported by a high-clarity white and neutral stone background.
- **The "No-Line" Rule:** Visual boundaries are created via color-blocking and tonal shifts (e.g., a `surface_container_low` section against a `surface` background). Never use a solid 1px border to divide sections; if a divider is needed, use `primary` at 10% opacity.
- **Surface Hierarchy:** The system uses a clean `ffffff` base. Depth is achieved by nesting `surface_container` (a soft off-white/grey-green) for card backgrounds and utility bars.
- **The Glass & Gradient Rule:** Floating elements, such as navigation bars and secondary hero buttons, must utilize `backdrop-blur-md` and semi-transparent fills (e.g., `white/80`). 
- **Signature Textures:** Use "Nature-Wash" gradients—low-opacity photographic overlays of organic textures (leaves, recycled paper) set to `mix-blend-multiply` or `screen` to add tactile depth to banners.

### 3. Typography
Verdant Ethos utilizes **Inter** across all roles but differentiates through extreme weight variance and tight tracking for headings.
- **Display & Headline:** 2.25rem (36px) to 4rem (64px). These should be `extrabold` with a -0.02em tracking to create an "editorial masthead" feel.
- **Body & Title:** 1.125rem (18px) for primary body text to maintain an airy, premium feel, and 1rem (16px) for secondary.
- **Label & Small:** 0.875rem (14px) and 0.75rem (12px). Labels often use `font-bold` and `uppercase` with `tracking-widest` to denote category hierarchy.
*Ground Truth:* The typography scale follows a rhythmic progression: 12px, 14px, 18px, 20px, 24px, 30px, 36px.

### 4. Elevation & Depth
Elevation is expressed through light and atmosphere rather than physical height.
- **The Layering Principle:** Stack `surface` on `surface_container_low`. For example, a white card on a light green background.
- **Ambient Shadows:** We use two specific shadow profiles extracted from the environment:
    - **Soft Elevation (MD):** Used for interactive triggers (like 'Favorite' buttons).
    - **Feature Elevation (LG):** Used for primary CTAs and hover states on cards. These shadows are tinted with the primary color (`primary/30`) to create a "glow" rather than a grey smudge.
- **Glassmorphism:** Navigation and overlays use a 80% opacity fill with a 12px-16px blur radius to maintain context of the underlying content.

### 5. Components
- **Buttons:** Primary buttons are high-contrast (`primary` with `on_primary` text). Secondary buttons are "Ghost Glass"—transparent with a white border and backdrop blur.
- **Product Cards:** Use `aspect-square` containers with a 0.75rem (`xl`) border radius. Interaction is defined by a 110% image scale on hover and the sliding "Quick Add" utility.
- **Chips/Badges:** Pill-shaped (`rounded-full`) with `tracking-widest` typography. These act as the "Metadata" layer.
- **Inputs:** Soft, tinted backgrounds (`primary/5`) instead of white boxes, creating a "recessed" look.

### 6. Do's and Don'ts
- **Do:** Use large-scale imagery that bleeds to the edge of containers.
- **Do:** Experiment with asymmetrical layouts where text blocks overlap image containers.
- **Don't:** Use sharp corners. The system requires at least a 0.25rem radius even for small elements.
- **Don't:** Use pure black (#000) for text. Use `slate-900` or our `on_surface` to keep the tone "organic."
- **Do:** Use `primary/10` (soft green tint) for hover states on icons to reinforce the brand identity without overwhelming the user.