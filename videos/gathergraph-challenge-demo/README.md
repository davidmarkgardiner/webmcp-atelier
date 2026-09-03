# GatherGraph challenge demo

This is the human-review cut of the GatherGraph WebMCP Challenge video. It uses
captured screens from the deployed product, six seek-safe HyperFrames chapters,
local British-English narration, and review captions.

## Current candidate

- Duration: 84.1 seconds
- Canvas: 1920 × 1080
- Chapters: coordination, native contract, one request, visible repair, human
  approval, shared control
- Product claim: 13 native tools across four document contexts
- Safety boundary: the dossier is simulated and browser-local; no booking,
  payment, message, or supplier contact occurs
- Audio: locally generated narration only; no music or third-party footage

## Review locally

```sh
npm run dev
```

Use HyperFrames Studio to scrub the complete timeline and inspect every
transition. The composition source is `index.html`; individual chapters live in
`compositions/frames/`.

Before accepting the cut, confirm that native-tool ownership is readable, the
caterer's 16:45 → 17:15 access repair is visible, the approval boundary cannot
be mistaken for a real transaction, captions remain clear, and the final lockup
holds long enough to read.

## Owner gates

Repository commit/push and deployment are authorised for this submission pass.
Public video upload and final challenge submission remain explicit owner gates.
