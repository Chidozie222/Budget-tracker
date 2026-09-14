# CSS Animations — In-Depth Guide

## Table of Contents
1. Transitions vs Animations — When to Use Which
2. Transitions Deep Dive
3. Timing Functions Deep Dive
4. Keyframe Animations Deep Dive
5. Animation Properties — Full Reference
6. Transform Deep Dive (the animation workhorse)
7. Performance — What to Animate and Why
8. Advanced Techniques
9. Real-World Recipes
10. Debugging & Common Pitfalls
11. Cheat Sheet

---

# 1. Transitions vs Animations — When to Use Which

| | Transitions | Animations |
|---|---|---|
| Trigger | A state change (`:hover`, class toggle, media query) | Runs on its own once applied, or on trigger |
| Steps | Only 2 states: start and end | Multiple steps via `@keyframes` |
| Looping | No | Yes — `infinite`, or a set count |
| Control | Simple | Fine-grained (pause, direction, delays per stage) |
| Use for | Hover effects, simple UI feedback | Loaders, complex sequences, looping effects, entrance/exit choreography |

**Rule of thumb:** if it's "A becomes B when X happens," use a transition. If it's "a sequence with multiple stages," or it needs to loop, or run automatically without a trigger, use `@keyframes`.

---

# 2. Transitions Deep Dive

## 2.1 The Four Sub-Properties

```css
.box {
  transition-property: background-color, transform; /* which properties animate */
  transition-duration: 0.3s, 0.5s;                    /* how long each takes */
  transition-timing-function: ease-out, linear;        /* the easing curve for each */
  transition-delay: 0s, 0.1s;                          /* wait before starting */
}

/* Shorthand — property duration timing-function delay */
.box {
  transition: background-color 0.3s ease-out, transform 0.5s linear 0.1s;
}

/* Animate everything that changes (convenient but less precise, slightly worse for perf) */
.box {
  transition: all 0.3s ease;
}
```

## 2.2 What Can Be Transitioned

Only properties with an intermediate value can transition smoothly. Numbers, colors, lengths, and transforms work; things like `display` (none ↔ block) cannot — it's a hard toggle, not a range.

```css
/* These transition smoothly */
transition: width, height, color, background-color, opacity, transform, border-radius, box-shadow;

/* These CANNOT be smoothly transitioned */
transition: display, position, font-family; /* discrete values, no "in-between" */
```

### Workaround for `display: none` — use `visibility` + `opacity` instead
```css
.modal {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.modal.open {
  opacity: 1;
  visibility: visible;
}
/* visibility switches instantly, but opacity fades — combined effect looks like a smooth show/hide,
   and visibility:hidden still removes it from click/tab interaction, unlike opacity:0 alone */
```

## 2.3 Multiple Properties, Different Timings

```css
.card {
  transition:
    transform 0.2s ease-out,
    box-shadow 0.3s ease-out,
    background-color 0.15s linear;
}
.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  background-color: #fafafa;
}
```
Staggering durations slightly (e.g., transform faster than shadow) often reads as more natural than animating everything in lockstep.

## 2.4 Transitioning `height`/`width` — The Auto Problem

`height: auto` can't be transitioned directly (browsers can't interpolate to/from "auto"). Common workarounds:

```css
/* Workaround 1: max-height trick (simple, slight limitation — must guess a large-enough max) */
.accordion {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.accordion.open {
  max-height: 500px; /* must exceed actual content height */
}

/* Workaround 2 (modern browsers): the new calc-size() / interpolate-size, still gaining support */
/* Workaround 3 (most reliable): measure with JS and set an explicit height */
```
```javascript
const content = document.querySelector(".accordion-content");
content.style.height = content.scrollHeight + "px"; // set exact pixel height, then transition
```

---

# 3. Timing Functions Deep Dive

Timing functions control the *rate of change* over the duration — not just linear speed.

```css
transition-timing-function: linear;       /* constant speed throughout */
transition-timing-function: ease;         /* default: slow start, fast middle, slow end */
transition-timing-function: ease-in;      /* starts slow, accelerates — good for elements leaving */
transition-timing-function: ease-out;     /* starts fast, decelerates — good for elements arriving */
transition-timing-function: ease-in-out;  /* slow start AND end, symmetric */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55); /* fully custom curve */
transition-timing-function: steps(4, end); /* discrete jumps instead of smooth motion */
```

## 3.1 Cubic Bezier — Custom Easing

`cubic-bezier(x1, y1, x2, y2)` defines a curve between two control points. Values outside 0–1 (like `-0.55` or `1.55`) create overshoot/bounce effects.

```css
/* A "bounce back" overshoot effect — common for playful UI */
.button {
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
.button:active {
  transform: scale(0.9);
}
```
**Practical tip:** rather than guessing values, use a visual tool like cubic-bezier.com to drag control points and copy the resulting values.

## 3.2 `steps()` — Frame-by-Frame Motion

Useful for sprite-sheet animations or deliberately "mechanical" motion (like a loading dots indicator).

```css
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}
.typewriter {
  overflow: hidden;
  white-space: nowrap;
  animation: typing 2s steps(20, end); /* moves in 20 discrete steps, not smoothly */
}

/* Sprite-sheet animation — classic use case for steps() */
.sprite {
  width: 64px;
  height: 64px;
  background: url("walk-sprite.png") 0 0;
  animation: walk 1s steps(8) infinite; /* 8 frames in the sprite sheet */
}
@keyframes walk {
  to { background-position: -512px 0; } /* 8 frames × 64px = 512px */
}
```

## 3.3 Choosing the Right Curve — Practical Guidance

| Curve | Feels like | Use for |
|---|---|---|
| `ease-out` | Fast start, gentle stop | Elements entering the screen (feels responsive) |
| `ease-in` | Gentle start, fast finish | Elements leaving the screen |
| `ease-in-out` | Smooth both ends | Looping or symmetric motion |
| `linear` | Mechanical, constant | Spinners, progress bars, continuous rotation |
| Custom bezier w/ overshoot | Bouncy, playful | Buttons, toasts, playful micro-interactions |
| `steps()` | Choppy, deliberate | Sprite sheets, typewriter effects, tick marks |

---

# 4. Keyframe Animations Deep Dive

## 4.1 Basic Structure

```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.element {
  animation: slideIn 0.5s ease-out forwards;
}
```

## 4.2 Percentage-Based Keyframes — Multi-Stage Sequences

```css
@keyframes bounce {
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-30px); }
  50%  { transform: translateY(0); }
  70%  { transform: translateY(-15px); }
  100% { transform: translateY(0); }
}
.ball {
  animation: bounce 1s ease-in-out infinite;
}
```
Each percentage is a "keyframe" — a snapshot of styles at that point in the timeline. The browser interpolates smoothly between them using the timing function.

## 4.3 Animating Multiple Properties Together

```css
@keyframes cardEnter {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  60% {
    opacity: 1;
    transform: translateY(-4px) scale(1.02); /* slight overshoot */
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.card {
  animation: cardEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

# 5. Animation Properties — Full Reference

```css
.element {
  animation-name: bounce;               /* which @keyframes to use */
  animation-duration: 1s;                /* how long ONE cycle takes */
  animation-timing-function: ease-in-out;
  animation-delay: 0.2s;                  /* wait before starting */
  animation-iteration-count: 3;            /* number of loops, or "infinite" */
  animation-direction: alternate;           /* normal | reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards;             /* what styles apply before/after the animation runs */
  animation-play-state: running;              /* running | paused — can be toggled with JS/hover */

  /* Shorthand: name duration timing-function delay iteration-count direction fill-mode play-state */
  animation: bounce 1s ease-in-out 0.2s infinite alternate forwards running;
}
```

## 5.1 `animation-fill-mode` — Frequently Misunderstood

Controls what styles apply *outside* the animation's active duration.

```css
animation-fill-mode: none;       /* DEFAULT — element reverts to its original CSS styles after animation ends */
animation-fill-mode: forwards;   /* element KEEPS the styles from the LAST keyframe after it ends */
animation-fill-mode: backwards;  /* element gets the styles from the FIRST keyframe during animation-delay */
animation-fill-mode: both;       /* combines forwards + backwards */
```
**Use case:** a fade-in that should stay visible after finishing (very common — forgetting `forwards` is a classic bug where an element "flashes" and then disappears):
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.element {
  opacity: 0; /* hidden initially, before animation-delay finishes */
  animation: fadeIn 0.5s ease forwards; /* stays opacity: 1 after finishing */
}
```

## 5.2 `animation-direction`

```css
animation-direction: normal;            /* plays 0% → 100% each cycle */
animation-direction: reverse;           /* plays 100% → 0% each cycle */
animation-direction: alternate;         /* forward, then backward, then forward... (ping-pong) */
animation-direction: alternate-reverse; /* backward first, then forward... */
```
**Use case:** a natural "breathing" pulse without writing separate keyframes for the return trip:
```css
@keyframes pulse {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
.pulse {
  animation: pulse 1s ease-in-out infinite alternate;
  /* alternate makes it grow then shrink smoothly, instead of snapping back at 100% */
}
```

## 5.3 Multiple Animations on One Element

```css
.element {
  animation: slideIn 0.5s ease-out forwards, pulse 2s ease-in-out infinite 0.5s;
  /* slideIn plays once; pulse starts after slideIn finishes (0.5s delay) and loops forever */
}
```

---

# 6. Transform Deep Dive (The Animation Workhorse)

`transform` is the most important property for animation because it's GPU-accelerated and doesn't trigger layout recalculation (see Performance section).

```css
transform: translateX(20px);       /* move right */
transform: translateY(-10px);      /* move up */
transform: translateZ(0);           /* forces GPU acceleration (a common performance hack) */
transform: translate3d(0, 0, 0);    /* same purpose, more explicit */
transform: scale(1.2);               /* uniform scale */
transform: scaleX(1.5);              /* horizontal only */
transform: scaleY(0.5);              /* vertical only */
transform: rotate(45deg);
transform: rotate3d(1, 1, 0, 45deg); /* rotate around a custom 3D axis */
transform: skew(10deg, 5deg);

/* Combine multiple transforms in one declaration — order matters! */
transform: translateX(50px) rotate(45deg) scale(1.2);
```

## 6.1 `transform-origin` — Where Transforms Pivot From

```css
.element {
  transform-origin: center; /* default */
  transform-origin: top left;
  transform-origin: 0 100%; /* bottom-left, using percentages */
}
```
**Use case:** a menu that expands from its top-right corner (like a dropdown, not from its center):
```css
.dropdown {
  transform-origin: top right;
  transform: scale(0);
  transition: transform 0.2s ease-out;
}
.dropdown.open {
  transform: scale(1);
}
```

## 6.2 Order Matters in Combined Transforms

```css
transform: translateX(100px) rotate(45deg); /* moves right, THEN rotates around its new position */
transform: rotate(45deg) translateX(100px); /* rotates first, so the translate happens along the ROTATED axis — different result! */
```

---

# 7. Performance — What to Animate and Why

## 7.1 The Rendering Pipeline (Simplified)

Browsers process style changes in three stages: **Layout** (calculate size/position) → **Paint** (fill in pixels) → **Composite** (layer everything together on the GPU).

| Triggers | Cost | Properties |
|---|---|---|
| Layout + Paint + Composite | Most expensive — avoid animating | `width`, `height`, `top`, `left`, `margin`, `padding` |
| Paint + Composite | Moderate | `background-color`, `box-shadow`, `border-color` |
| Composite only | Cheapest — GPU-accelerated | `transform`, `opacity` |

**The practical rule: animate `transform` and `opacity` whenever possible.** They skip layout and paint entirely, running smoothly even on lower-powered devices.

```css
/* AVOID — triggers layout recalculation on every frame, can look janky */
.box:hover {
  width: 220px;
  left: 20px;
}

/* PREFER — GPU-composited, buttery smooth */
.box:hover {
  transform: translateX(20px) scale(1.1);
}
```

## 7.2 `will-change` — Hinting the Browser

```css
.element {
  will-change: transform, opacity;
}
```
Tells the browser to prepare an optimized rendering layer in advance. **Use sparingly** — applying it to too many elements, or leaving it on permanently, actually wastes memory. Best practice: add it just before an animation starts (e.g., on `:hover` or via JS right before triggering), and remove it after.

```javascript
el.addEventListener("mouseenter", () => el.style.willChange = "transform");
el.addEventListener("animationend", () => el.style.willChange = "auto");
```

## 7.3 Forcing GPU Layers (Older Technique, Rarely Needed Now)

```css
.element {
  transform: translateZ(0); /* or translate3d(0,0,0) — nudges the browser to use the GPU */
}
```
Modern browsers are generally smart enough to promote animated `transform`/`opacity` elements automatically — this hack is less necessary than it used to be, but still occasionally useful for stubborn cases.

---

# 8. Advanced Techniques

## 8.1 Animating with CSS Variables

```css
@keyframes colorShift {
  from { background: var(--start-color); }
  to { background: var(--end-color); }
}
.box {
  --start-color: red;
  --end-color: blue;
  animation: colorShift 2s ease infinite alternate;
}
```
**Use case:** JS can update a variable to control an animation without rewriting the whole rule:
```javascript
el.style.setProperty("--end-color", "green");
```

## 8.2 Staggered Animations (Sequential Delays)

```css
.list-item {
  opacity: 0;
  animation: fadeInUp 0.4s ease forwards;
}
.list-item:nth-child(1) { animation-delay: 0.1s; }
.list-item:nth-child(2) { animation-delay: 0.2s; }
.list-item:nth-child(3) { animation-delay: 0.3s; }
```
```javascript
// Dynamic version — no need to hardcode nth-child rules
document.querySelectorAll(".list-item").forEach((el, i) => {
  el.style.animationDelay = `${i * 0.1}s`;
});
```

## 8.3 Scroll-Triggered Animations (Intersection Observer + CSS)

CSS alone can't detect scroll position (outside of newer `animation-timeline: scroll()`, still gaining support) — pair it with JS for reliable cross-browser behavior.

```css
.fade-in-section {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-in-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
});
document.querySelectorAll(".fade-in-section").forEach(el => observer.observe(el));
```

## 8.4 Animating Gradients (Trickier Than It Looks)

`background-position` on an oversized gradient is the standard workaround, since gradients themselves don't interpolate well.

```css
.animated-gradient {
  background: linear-gradient(270deg, #ff6ec4, #7873f5, #4ade80, #ff6ec4);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
}
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

## 8.5 Pausing Animations with JS

```javascript
element.style.animationPlayState = "paused";
element.style.animationPlayState = "running";
```
```css
/* Common use case: pause a marquee/carousel on hover */
.marquee:hover {
  animation-play-state: paused;
}
```

## 8.6 Detecting When an Animation Ends

```javascript
element.addEventListener("animationend", (e) => {
  console.log(`Finished: ${e.animationName}`);
  element.classList.remove("animate"); // e.g., reset so it can be re-triggered
});
element.addEventListener("animationiteration", (e) => {
  console.log("Completed one loop");
});
element.addEventListener("transitionend", (e) => {
  console.log(`Transition on ${e.propertyName} finished`);
});
```
**Use case:** re-triggering a CSS animation on repeated clicks (by default, re-adding the same class doesn't restart an already-applied animation):
```javascript
function shake(el) {
  el.classList.remove("shake");
  void el.offsetWidth; // force a reflow — this "resets" the animation state
  el.classList.add("shake");
}
```

## 8.7 Respecting Reduced Motion (Accessibility)

Some users set a system preference to reduce motion (motion sensitivity, vestibular disorders). Respect it.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 9. Real-World Recipes

**Button ripple/press feedback:**
```css
.button {
  transition: transform 0.1s ease;
}
.button:active {
  transform: scale(0.96);
}
```

**Skeleton loading shimmer:**
```css
.skeleton {
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Attention-grabbing shake (form validation error):**
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}
.input-error {
  animation: shake 0.4s ease;
  border-color: red;
}
```

**Toast notification slide-in and auto-dismiss:**
```css
@keyframes slideInFade {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
.toast {
  animation: slideInFade 0.3s ease-out forwards;
}
```

**Rotating loading spinner:**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinner {
  border: 3px solid #eee;
  border-top-color: #333;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}
```

**Animated progress bar filling:**
```css
.progress-bar {
  width: 0%;
  height: 8px;
  background: #3b82f6;
  transition: width 0.5s ease-out;
}
/* JS sets .style.width = "70%" to trigger the transition */
```

**Modal pop-in with backdrop fade:**
```css
.backdrop {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.backdrop.open { opacity: 1; }

.modal {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal.open {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

---

# 10. Debugging & Common Pitfalls

- **Animation doesn't play at all:** check the `@keyframes` name matches exactly (typos are the #1 cause), and that the element isn't `display: none` when the animation starts (animations don't run on non-rendered elements).
- **Animation flashes then disappears:** missing `animation-fill-mode: forwards` — the element reverts to its base CSS after the animation completes.
- **Re-adding a class doesn't replay the animation:** the browser sees "same class, same state" and skips it. Force a reflow (`void el.offsetWidth`) between removing and re-adding the class.
- **Janky/stuttery animation:** likely animating a layout-triggering property (`width`, `top`, `margin`) instead of `transform`. Switch to `transform`/`opacity`.
- **Transition doesn't fire on page load:** if you set the "end state" styles at the same time as adding the element to the DOM, there's no state change to transition from. Add the triggering class on a subsequent frame:
  ```javascript
  el.classList.add("initial-state");
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("final-state")); // now it transitions
  ```
- **`transition: all` feels slow/inconsistent:** it re-evaluates every changed property, including ones you didn't intend to animate (like layout shifts from a sibling). Be explicit about which properties transition.
- **Animating `height: auto` doesn't work:** browsers can't interpolate to/from `auto` — use the `max-height` trick or measure with JS (see section 2.4).

---

# 11. Cheat Sheet

```css
/* Transitions */
transition: property duration timing-function delay;
transition: transform 0.3s ease-out, opacity 0.3s ease-out;

/* Timing functions */
ease | linear | ease-in | ease-out | ease-in-out
cubic-bezier(x1, y1, x2, y2)
steps(n, start|end)

/* Keyframes */
@keyframes name {
  0%   { }
  50%  { }
  100% { }
}
animation: name duration timing-function delay iteration-count direction fill-mode;

/* Key animation properties */
animation-iteration-count: infinite | <number>;
animation-direction: normal | reverse | alternate | alternate-reverse;
animation-fill-mode: none | forwards | backwards | both;
animation-play-state: running | paused;

/* Best-performance properties to animate */
transform (translate, scale, rotate) + opacity

/* Performance hint */
will-change: transform, opacity; /* apply sparingly, remove after use */

/* Accessibility */
@media (prefers-reduced-motion: reduce) { /* shorten/disable animations */ }

/* JS hooks */
element.addEventListener("animationend", handler);
element.addEventListener("transitionend", handler);
element.style.animationPlayState = "paused";
```
