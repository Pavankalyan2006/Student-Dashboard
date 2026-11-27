# Theme, dark mode and motion

How the look and feel works across all 148 pages, and how to keep new pages consistent.

## Light and dark theme

- The student picks **Light**, **Dark** or **Auto** (follow the device) from the sun/moon button in the top bar,
  or from **Appearance** in the profile menu. The choice is saved on the device (`btech.theme`).
- A small script in `index.html` sets the theme before the first paint, so pages never flash the wrong colours.
- `src/store/themeStore.ts` applies the theme by toggling the `dark` class on `<html>`.

### How dark mode reaches every page

Pages keep using the usual classes (`bg-white`, `text-slate-900`, `bg-blue-50`, `text-blue-700` …).
The colours behind those names change in dark mode, so no page had to be rewritten:

| File | What it does |
| --- | --- |
| `src/index.css` | The light palette ("Meridian"). |
| `src/styles/theme-palette.css` | **Generated.** Dark values for every palette step, plus "inverse islands". |
| `src/styles/theme.css` | Dark surfaces for `bg-white`, textures, global page entrance, focus, scrollbars, charts, toasts. |
| `scripts/gen_theme_palette.py` | Regenerates `theme-palette.css` from the light palette. |

- Neutral greys are fully inverted. Colour tints (`*-50` … `*-300`) become deep tints and dark text shades
  (`*-700` … `*-950`) become light, while mid tones (`400`–`600`) stay so buttons keep their colour.
- **Inverse islands**: inside an element that is already dark or saturated (`bg-slate-900`, `bg-blue-600`,
  `from-indigo-600`, `.hero-brand`, …) the light palette is restored, so text such as `text-slate-300` or
  `text-blue-100` stays readable. Add the class `inverse-island` to any other dark panel you build.
- Old one-off `dark:` classes are switched off on purpose (`@custom-variant dark` now needs `.legacy-dark`);
  they would fight the token remap. Do not add new `dark:` classes.

After changing a colour in `index.css`, regenerate the dark palette:

```bash
python scripts/gen_theme_palette.py src/index.css > src/styles/theme-palette.css
```

## Texture

- `.app-canvas` (app shell, public pages, sign-in, onboarding): soft indigo/violet/teal glows, a fine dot grid and
  a faint film grain. All three adapt to the theme.
- `.sidebar-surface`: deep navy with an aurora in the corner.
- `.glass-bar`: the frosted top bar.
- `.hero-brand`: the navy banner used for page heroes (dashboard welcome, sign-in showcase).
- `.text-gradient`: brand gradient text for display headings.

## Motion

Everything respects the device's **reduce motion** setting (`MotionProvider` sets `reducedMotion="user"`, and
CSS loops stop under `prefers-reduced-motion`).

- **Every page** fades in, and its top-level sections rise in one after another (`#main-content > * > *` in
  `theme.css`). This needs no code in the page.
- `src/components/motion/index.tsx` has the shared pieces:
  - `Reveal`, `Stagger` / `StaggerItem`: enter on scroll or in sequence
  - `HoverLift`: lift on hover, press on tap
  - `AnimatedNumber`: count up (used by every `MetricCard`)
  - `ProgressRing`, `AnimatedBar`: animated progress
  - `SpotlightCard`: pointer-following glow
  - `ScrollProgress`, `BackToTop`
  - `celebrate()`: a confetti burst for finished work
- Dialogs, menus and toasts animate through `tw-animate-css` (`animate-in`, `fade-in-0`, `zoom-in-95` …).

## Checking a change

A quick end-to-end check is to open every sidebar route in both themes and look for:
- horizontal overflow
- error or 404 text
- text below 3:1 contrast

The sweep used for this redesign covered 100 routes in light and dark.
