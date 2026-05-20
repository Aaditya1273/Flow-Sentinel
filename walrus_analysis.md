# Walrus.xyz Visual & UX Analysis Scratchpad

> **Status:** Complete Analysis  
> **Date:** May 2026  
> **Reference Site:** https://walrus.xyz/  
> **Analysis Width:** 1920px

---

## Progress Checklist

- [x] Initialize scratchpad and plan
- [x] Open https://walrus.xyz/ and set window to 1920px width
- [x] Capture full page screenshot at 1920px wide (partially loaded, will capture section-by-section)
- [x] Analyze Section 1: Navigation bar (sticky, logo, nav items, CTA, announcement banner)
- [x] Analyze Section 2: Hero section (heading, subtext, CTA, hero character, aurora, grain, star particles)
- [x] Analyze Section 3: "Your Verifiable Data Platform" section (features slider/cards)
- [x] Analyze Section 4: Partners section (the "future runs on Walrus" scrolling strip)
- [x] Analyze Section 5: Use Cases swiper section (AI, DeFi, Data Markets cards)
- [x] Analyze Section 6: WAL Token section (cream/beige background, token coin image)
- [x] Analyze Section 7: "Part of the Sui Stack" section (stack diagram)
- [x] Analyze Section 8: "Get your data right" section (3 feature cards)
- [x] Analyze Section 9: Aurora/marquee strip section (scrolling text strip)
- [x] Analyze Section 10: Footer (walrus mascot rising up, watermark, links)
- [x] Compile final structured report

---

## Technical Notes & Observations

### General Styles / Theme

| Property | Value |
|----------|-------|
| Font Family | Inter-style Sans-serif (custom Walrus sans weights, clean/geometric) |
| Global Background | Black (#000000) base, with rich colored auroras and star fields in hero |
| Spacing Grid | 8px grid spacing, highly structured |

### Detailed Section Analysis

---

### 1. Navigation Bar

#### Layout / Containers

| Element | Details |
|---------|---------|
| Announcement banner | Full-width, top of page, height ~56px |
| Sticky nav bar | ~94px height |
| Logo | Far left |
| Navigation links | Centered |
| CTA button | Far right |

#### Typography

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Announcement banner text | 15px | 500 | 0.04em |
| Nav items ("Discover", "Build", "Ecosystem") | 16px (18px on lg) | 430 | 0.72px |
| "Read the docs" button | ~16px | 430 | - |

#### Colors

| Element | Color |
|---------|-------|
| Announcement Banner | Purple-to-indigo gradient background |
| Banner button background | `rgba(0,0,0,0.3)` → `rgba(0,0,0,0.4)` on hover |
| Banner text | #FAF8F5 |
| Nav menu items | Text-inherit, subtle gray-white |
| "Read the docs" button | Text #faf8f5, dark background with glowing outline/glow-button shadow |

#### Animations / Hover

- Sticky header stays at the top of the viewport
- Centered navigation items have subtle background scale-up and color change (black/25 or light-gray-100 depending on active state/scroll)
- "Read the docs" button uses custom glow-button with overflow-hidden moving gradient highlight

#### Special Effects

- Announcement banner uses smooth responsive linear-gradient
- Sticky header uses backdrop-blur effect once scrolled

**Screenshot Ref:** walrus_full_page (top region)

---

### 2. Hero Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Hero heading | Centered |
| Subtext | Centered |
| Primary CTA | Centered, below subtext |
| 3D Walrus mascot | Below primary CTA, centering viewport |

#### Typography

| Element | Details |
|---------|---------|
| Heading | "Infra for data that matters" - large display font (~90px on desktop), semi-bold weight (~600/700) |
| Subtext | ~18px-20px font, normal letter spacing, weight 400. Contains emphasized bold words (provable, programmable, always available) |
| CTA Button | "Start building" - 1.125rem (18px), weight 430, tracking 0.04em |

#### Colors

| Element | Color |
|---------|-------|
| Main text | White (#ffffff) |
| Subtext | Dimmed grey-white |
| Highlight words in subtext | Bold white |
| CTA Button | Green outline (#00EF8B or similar custom green/white/transparent with hover transitions) |

#### Animations / Hover

- On page load: Hero heading and subtext fade-in or blur-reveal (powered by GSAP)
- Parallax/Hero Scroll: As you scroll down, the 3D Walrus character scales up and moves upwards, entering standard viewport focus, while the main hero heading and subtext scroll up and fade out
- Glowing auroras fade or change opacity

#### Special Effects

- Beautiful film grain overlay (grain.png pattern) covers entire hero background for premium, textured feel
- Backing aurora glow (purple-indigo radial gradient on left, deep cyan/teal radial gradient on right)
- Subtle glowing star particles scattered across dark space background

**Screenshot Ref:** walrus_full_page (top region)

---

### 3. "Your Verifiable Data Platform" Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Intro badge | Centered "YOUR VERIFIABLE DATA PLATFORM" |
| Heading | "No downtime. No compromises. No limits." + sub-paragraph |
| Secondary button | "Read the docs ->" (outline button) |
| "Power to the builder" title | Centered, display font ~70px |
| Tab bullet-container | 4 tabs: "Availability", "Programmability", "Verifiability", "Privacy" |
| Feature cards | Horizontal Swiper layout, large swipeable cards |

#### Typography

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Badge | 12px | 500 | - (uppercase) |
| Section 3 Heading | ~64px | - | - (display font) |
| Sub-paragraph | ~18px | - | - (grey-dimmed white) |
| "Power to the builder" title | ~70px | - | - (display font, white) |
| Slider bullet tabs | 15px | 430 | 0.04em |
| Card title | ~32px | - | - (white) |
| Card text | ~16px | - | - (grey) |

#### Colors

| Element | Color |
|---------|-------|
| Background | Black (#000000) |
| Outline button | Light purple glow border, transitions to light purple background on hover |
| Bullet tabs (active) | White background with black/dark text |
| Bullet tabs (inactive) | Grey text on dark-grey capsule backdrop (bg-walrus-dark-gray-150) |
| Cards | Dark card background (bg-walrus-dark-gray-150), white icons, white headings, grey text |
| Active card | Fully opaque |
| Adjacent cards | ~30% opacity or blurred overlay |

#### Animations / Hover

- Feature swiper/slider supports click on dots/bullets to scroll cards horizontally with smooth physics-based scroll animation (powered by Swiper/GSAP)
- Hovering over buttons highlights borders and applies light scaling/glow

#### Special Effects

- Film grain continues to overlay entire background
- Subtle blur effects on inactive cards to guide user's eye (UX focus)

**Screenshot Ref:** section_3_builder_power

---

### 4. Partners Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Container | Massive rounded card (rounded-3xl equivalent), centered on screen |
| Badge | Centered small "PARTNERS" |
| Heading | Giant "The future runs on Walrus" (~72px, bold) |
| Mascot | 3D Walrus mascot wearing blue knit beanie and dark sunglasses, saluting with right flipper |
| Logo strip | Scrolling strip overlaying bottom edge of card |

#### Typography

| Element | Details |
|---------|---------|
| Badge | Uppercase, 12px, grey text inside border |
| Main Heading | "The future runs on Walrus" - display font ~72px, bold, white |

#### Colors

| Element | Color |
|---------|-------|
| Card Background | Dark gradient overlaying rich back-glow |
| Backdrop glow | Multi-color neon aurora (purple-magenta on left, bright blue/turquoise on right) |
| Partner Logo pills | Semi-transparent grey/black capsule with white/grey partner logos |

#### Animations / Hover

- Partner logos scrolling strip: Infinite marquee animation scrolling horizontally from right to left at constant smooth speed
- Mascot: Appears to rise or peek from bottom of partners card

#### Special Effects

- Beautiful neon aurora background glow contained within card's rounded borders
- Semi-transparent glassmorphic logo capsules in marquee

**Screenshot Ref:** section_4_partners

---

### 5. Use Cases Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Container | Centered swiper section |
| Cards | Different use cases: "AI", "DeFi", "Data Markets" |
| Active card | Centered, enlarged, fully active |
| Side cards | Left/Right cards pushed partially offscreen and faded |
| Indicators | 3 wide slider indicator dots below swiper |

#### Typography

| Element | Size | Details |
|---------|------|---------|
| Card Heading | ~32px | "AI", "DeFi", or "Data Markets" in purple-indigo gradient or white |
| Sub-heading | ~28px | e.g., "Safe data in. Reliable AI platforms out." - display style, white |
| Body | ~16px | Grey |
| "Learn more" link | 16px | White text with underline |

#### Colors

| Element | Color |
|---------|-------|
| Background | Black (#000000) |
| Card backgrounds | Deep black/grey |
| Dots (active) | Solid white |
| Dots (inactive) | Dark grey (bg-walrus-dark-gray-200) |

#### Animations / Hover

- Swipe/drag or click on dots translates cards horizontally with smooth easing spring animation
- Underlined "Learn more" link shows smooth underline opacity change on hover

#### Special Effects

- Left/right cards masked with gradient blur to create depth-of-field/focus on active card

**Screenshot Ref:** section_5_use_cases

---

### 6. WAL Token Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Container | Full-screen-width with distinct warm ivory/cream background |
| Badge | "THE WAL TOKEN" - uppercase, 12px, weight 500 inside light grey pill with thin dark border |
| Heading | "The economic heart of Walrus" (~78px, bold, dark grey/black) |
| Sub-paragraph | ~20px, dark grey/black |
| Button | Lavender filled "Learn about WAL" |
| Mascot | 3D Walrus peeking upwards, holding 3D white tile with printed black "W" logo |

#### Typography

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Badge | 12px | 500 | - (uppercase) |
| Main Heading | ~78px | Bold | - |
| Sub-paragraph | ~20px | - | - |
| Button text | ~18px | 430 | 0.04em |

#### Colors

| Element | Color |
|---------|-------|
| Container Background | Cream (#FAF8F5 or #F6F4F0) |
| Main Text | Charcoal/Black (#111111) |
| Button background | Lavender/light purple filled with border |
| Mascot background glow | Backing aurora gradients (pink/purple on left, teal/green on right) fading into cream backdrop |

#### Animations / Hover

- Mascot and token tile float slightly when scrolled, providing depth parallax effect

#### Special Effects

- Radial auroras blend seamlessly into light cream background
- Film grain overlay continues to provide texture

**Screenshot Ref:** section_6_wal_token

---

### 7. "Part of the Sui Stack" Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Container | Centered within large dark rounded card |
| Heading | "Part of the Sui Stack" (~78px, bold, white) |
| Sub-paragraph | ~20px, light grey text with key terms in bold white |
| Stack diagram | Vertical, isometric 3D stacked plates diagram |
| Left side | Vertically aligned partner/layer logos ("Sui", "walrus", "SEAL", "Nautilus", "DeepBook") |
| Middle | 3D isometric glassmorphic stacked plates, active layer illuminated |
| Right side | Vertically aligned text labels ("Coordination Layer", "Verifiable Data", "Data Security", "Verifiable Compute", "Liquidity Management") |

#### Typography

| Element | Size | Details |
|---------|------|---------|
| Main Heading | ~78px | Display font, bold, white |
| Sub-paragraph | ~20px | Light grey, key terms in bold white |
| Stack layer labels | 14px | Grey |

#### Colors

| Element | Color |
|---------|-------|
| Background | Black/dark |
| "walrus" plate | Highlighted in bright white with "W" logo printed |
| Other plates | Dark semi-transparent glass |
| Radial back-glow | Neon blue/purple behind stack diagram |

#### Animations / Hover

- Hovering over layer logo or label highlights corresponding stack plate with active illuminated glow

#### Special Effects

- Clean isometric 3D projection of stack layers with distinct depth-of-field styling

**Screenshot Ref:** section_7_sui_stack

---

### 8. "Get your data right" Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Heading | Centered "Get your data right" |
| Cards | 3-column grid, 3 dark rectangular cards with rounded corners |

#### Card Details

| Card | Content |
|------|---------|
| Card 1 | "Step-by-step guides to get you up & running fast". Icon: Play/Video screen icon. Button: "Watch tutorials" |
| Card 2 | "Learn how to get started on Walrus". Icon: Stack icon. Button: "Start building" |
| Card 3 | "Get the support you need to build bigger". Icon: Bracket/target icon. Button: "Apply for grants & RFPs" |

#### Typography

| Element | Size | Weight | Details |
|---------|------|--------|---------|
| Main Heading | ~64px | - | White text, display style |
| Card Title | ~24px | Bold | White |
| Button text | ~16px | 430 | - |

#### Colors

| Element | Color |
|---------|-------|
| Background | Black |
| Cards | Dark blue-grey/black background (bg-walrus-dark-gray-150 style) |
| Buttons | Outline pill buttons (dark grey borders with white text) |

#### Animations / Hover

- Cards have subtle scale-up or hover-shadow glow transition when mouse hovered
- Button borders transition to white/glow on hover

**Screenshot Ref:** section_8_get_data_right

---

### 9. Aurora/Marquee Strip Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Container | Full-width horizontal strip located right above footer |
| Content | Scrolling marquee text: "Trust The Tusk" repeating with small circular bullet between each instance |

#### Typography

| Element | Size | Details |
|---------|------|---------|
| Marquee text | ~100px | Giant bold display font, uppercase, filled with neon blue/cyan/purple linear gradient |

#### Colors

| Element | Color |
|---------|-------|
| Background | Deep black |
| Text gradient | Neon blue to purple |

#### Animations / Hover

- Continuous smooth horizontal marquee scroll from right to left

**Screenshot Ref:** section_8_get_data_right (partially visible at bottom)

---

### 10. Footer Section

#### Layout / Containers

| Element | Details |
|---------|---------|
| Multi-column link layout | At bottom |
| Columns | DISCOVER, BUILD, USE CASES, ABOUT |

#### Column Details

| Column | Links |
|--------|-------|
| DISCOVER | About, WAL Token, Use WAL, Blog |
| BUILD | read_file the Docs, Ecosystem, Grants & RFPs, Cost Calculator, GitHub |
| USE CASES | AI, Data Markets, DeFi |
| ABOUT | Events, Media Kit, Release Schedule, Newsletter, Privacy, Terms of Service, Claim, Careers |

#### Additional Elements

| Element | Details |
|---------|---------|
| CTA | Right-aligned "fs_write the docs ->" button |
| Social icons | Discord, GitHub, X, LinkedIn, YouTube in a row |
| Watermark | Giant bold lowercase "walrus" stretching across screen (~250px font size) |
| Mascot | Cute 3D Walrus wearing blue knit cap and sunglasses, winking and sticking head out in front of watermark |

#### Typography

| Element | Size | Weight | Details |
|---------|------|--------|---------|
| Column headers | 12px | - | Uppercase, tracking 0.08em, light grey/blue |
| Link items | 15px | 400 | Grey, with external link arrows for external items |
| Copyright | 12px | - | Grey text |
| Giant watermark | ~250px | Semi-bold | Solid off-white/light grey, lowercase |

#### Colors

| Element | Color |
|---------|-------|
| Background | Deep black (#000000) |
| Links | Grey, hover transitions to white |
| Mascot | Turquoise/blue body, blue beanie, reflective rainbow sunglasses |

#### Animations / Hover

- Links have color shift hover effect (grey to white)
- Mascot has cute blinking/winking eye animation

**Screenshot Ref:** section_10_footer

---

## Implementation Status

| Section | Status | File |
|---------|--------|------|
| Navigation Bar | ✅ Implemented | `app/landing/navbar.tsx` |
| Hero Section | ✅ Implemented | `app/landing/hero.tsx` |
| Power Tabs Section | ✅ Implemented | `app/landing/sections/power-tabs.tsx` |
| Partners Section | ✅ Implemented | `app/landing/sections/partners.tsx` |
| Use Cases Section | ✅ Implemented | `app/landing/sections/use-cases.tsx` |
| Footer | ✅ Implemented | `app/landing/footer.tsx` |
| Full Page Clone | ✅ Implemented | `app/landing/walrus-clone.tsx` |

---

## Key Design Tokens (from globals.css)

```css
:root {
  /* Walrus-exact design tokens */
  --w-tusk:         #FAF8F5;
  --w-black:        #000000;
  --w-midnight:     #0D0D0D;
  --w-violet:       #CAB1FF;
  --w-mint:         #98EFDD;
  --w-dark-100:     #111111;
  --w-dark-150:     #1A1A1A;
  --w-dark-200:     #222222;
  --w-dark-300:     #333333;
  --w-dark-400:     #555555;
  --w-dark-500:     #888888;
  --w-border:       rgba(250,248,245,0.10);
  --w-border-hover: rgba(250,248,245,0.25);

  /* Sentinel brand accent */
  --sen-green:      #00EF8B;
  --sen-cyan:       #00F5D4;
  --sen-green-glow: rgba(0,239,139,0.35);
  --sen-cyan-glow:  rgba(0,245,212,0.35);
}
```

---

## Animation Keyframes

| Animation | Purpose |
|-----------|---------|
| `w-border-spin` | Rotating conic gradient border on glow buttons |
| `w-marquee-scroll` | Infinite horizontal marquee for partners/logo strips |
| `w-star-fade` | Twinkling star particles in hero section |
| `w-fade-up` | Fade-in with upward motion for sections |
| `w-fade-in` | Simple fade-in animation |

---

## File References

### Images Directory (`/images/`)

| File | Purpose |
|------|---------|
| `aurora-home.CAK82OYC_*.{webp,avif}` | Hero section background with 3D walrus mascot |
| `aurora-*.{webp,avif}` | Feature card images for power tabs and use cases |
| `sui-stack.BY_4m4E8_*.{webp,avif}` | Stack diagram image |
| `wal-wal.Bo3lhZKt_*.{webp,avif}` | WAL token coin image |
| `wal-footer.Pl37i72V_*.{webp,avif}` | Footer mascot image |
| `marquee.C_1u6O2j.svg` | Desktop partner logo strip |
| `marquee-small.kV55nHGx.svg` | Mobile partner logo strip |

---

## Notes

- All sections use `framer-motion` for smooth entrance animations
- Film grain overlay applied to hero and token sections for texture
- Responsive breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Typography uses custom `--font-authority` (Host Grotesk) with Inter fallback
- All animations respect `prefers-reduced-motion` where applicable