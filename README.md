# 홈인슈 (HomeInsu VR) — Home Page

A responsive, mobile-first React + TypeScript recreation of the HomeInsu VR
content platform home screen, built with Vite, Tailwind CSS, Framer Motion,
and lucide-react icons.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. Resize the window (or open dev tools'
device toolbar) — the layout goes from a single-column mobile view (matching
the reference screenshot) up to a multi-column desktop grid.

## Structure

```
src/
  components/
    TopBar.tsx          top app bar (logo, notifications)
    PromoBanner.tsx      auto-rotating event/promo carousel
    CategoryTabs.tsx     scrollable category pill filter
    LiveSection.tsx      "라이브 중" horizontal live-stream row
    LiveCard.tsx         individual live stream card
    ContentGrid.tsx      "전체 콘텐츠" responsive grid + sort tabs
    ContentCard.tsx      individual VOD content card
    BottomNav.tsx         mobile-only bottom tab bar
    ImageWithSkeleton.tsx shared image component (shimmer + fade-in)
  data/mockData.ts       mock categories / live items / content items
  types.ts                shared TypeScript types
  App.tsx                 page composition
```

## Swapping in real images

Every thumbnail goes through `ImageWithSkeleton`, which currently points at
`picsum.photos/seed/...` as a placeholder image service (seeded per item so
each card stays visually consistent between reloads). To wire up real
assets, just replace the `src` line in `src/components/ImageWithSkeleton.tsx`
— every other component only passes a `seed`/`alt`/`width`/`height`, so
nothing else needs to change.

## Notes

- Colors, type, and spacing are defined as design tokens in
  `tailwind.config.js` (see the `ink`, `signal`, `pulse`, `rose`, and `mist`
  color scales) — tweak them there to reskin the whole app at once.
- The bottom tab bar is hidden at the `md` breakpoint and replaced by a
  horizontal nav in `TopBar`, mirroring how the reference design shifts from
  a mobile app shell to a desktop web layout.
- Reduced-motion users get animations disabled automatically (see
  `index.css`).
