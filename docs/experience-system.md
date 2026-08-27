# Atelier experience system

The three candidates should feel like one carefully authored product family without collapsing into the same visual idea. The shared language is quiet confidence: dark ink, warm paper, precise type, restrained colour, and motion that explains agent state.

## Interaction hierarchy

Every agent action follows the same visible sequence:

1. **Intent** — show the human request and the exact tool selected.
2. **Preview** — reveal inputs, affected state, and constraints before mutation.
3. **Consent** — reserve the strongest visual emphasis for the human approval boundary.
4. **Result** — animate only the changed region and append a durable receipt.
5. **Recovery** — keep undo or restore adjacent to the result, never hidden in a menu.

The interface must remain usable before tool registration, while a tool is running, after an abort, and when the browser does not expose WebMCP.

## Motion grammar

- Use motion to communicate causality, hierarchy, and continuity. Do not animate decoration continuously.
- Prefer CSS transitions or the Web Animations API for predetermined motion; restrict animation to `transform`, `opacity`, and `clip-path` where practical.
- Use ease-out for enter motion and a faster exit. Most UI transitions should complete in 150–250 ms.
- Stagger related ledger entries by 30–60 ms without blocking interaction.
- Set popover transform origins from their triggers. Avoid `scale(0)`; enter near `scale(0.95)` with opacity.
- Use a deliberate hold treatment only for the final simulated commit. Releasing or cancelling must respond immediately.
- Gate hover motion behind `(hover: hover) and (pointer: fine)`.
- Under `prefers-reduced-motion`, retain short opacity and colour transitions while removing spatial travel.

## Tool-state surfaces

Each tool invocation renders as a compact receipt with a stable layout:

- tool name and human-readable purpose;
- read-only, untrusted-content, or approval annotation;
- input summary with sensitive or verbose values collapsed;
- status: proposed, running, awaiting approval, completed, aborted, rejected, or failed;
- before/after state reference;
- deterministic duration and result summary;
- recovery action when one exists.

Rapid updates must retarget existing transitions instead of restarting keyframes. Keyboard-triggered actions update immediately without decorative motion.

## Candidate identities

### Toolglass

Graphite control-room surfaces, cool spectral accents, a mono detail face, and clipped light sweeps that reveal diffs. Motion is crisp and technical. Approval is amber; committed simulated state is mint; untrusted content is visibly isolated rather than rendered as ordinary prose.

### Roastweave

Warm parchment, espresso ink, mineral blue and fruit accents, with a tactile flavour constellation. Curves and nodes move through direct manipulation with gentle damping. The locked recipe card should feel editorial and printable, not like an ecommerce product tile.

### GatherGraph

Night-map navy, civic cream, venue coral, food saffron, and logistics cyan. Independent surfaces retain their own accent but join through a shared constraint graph. Conflicts pulse once, then settle into a persistent, non-colour-only marker.

## Accessibility and performance gates

- Full keyboard completion of the three-minute proof path.
- Visible focus, semantic headings, named controls, status announcements, and no colour-only state.
- WCAG AA contrast for text and interactive state.
- Touch targets of at least 44 by 44 CSS pixels.
- No `transition: all`, layout-thrashing animation, or interaction blocked by stagger.
- Test reduced motion, 200% zoom, narrow mobile width, and a busy main thread.
- Review the winning interaction frame-by-frame and on a physical touch device before recording.

## Demo requirement

The first 30 seconds must show a person and agent changing the same visible object together. The final frame must pair the human-facing outcome with its execution ledger so the WebMCP value is understood without narration alone.
