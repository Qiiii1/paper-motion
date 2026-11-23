# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Keep moving paper cards physically separate, including bent edges and in-between scroll positions. Preserve natural front-to-back occlusion when they overlap on screen.

Calibrate the opening light against Premotio at matched viewport sizes. Keep the paper-coloured background uniform and apply the white core and radial colour dispersion to the sheets.

Let users advance one stage at a time by tapping or clicking, including on the artwork, or scrub the animation with native scrolling. Manual scrolling takes over during click playback. Leave the opening centre clear of paper and omit the top navigation bar. Feed the upright radial deck through a single right-rear exit. Hold the finished grid flat with horizontal pointer parallax. Form the final tilted carousel from a handful of lower-left grid sheets in sequence, bending each sheet around the circumference.

Smooth scroll-driven visual progress while respecting the system's reduced-motion preference.

Integrate the study into the scroll-driven paper sequence. Prioritize the research opening, with a separate interaction sequence for the product-prototype material later in the story.

Pinned reading scenes: when a chapter's copy is designed as a fixed panel (the research-pathway ladder in 02, the task-context stack in 03), pin the white plate and change only its content step by step while the paper artwork above keeps moving. Do not let the plate scroll out from under a still-running animation, and keep the plate opaque so type never sits on sheets.

Chapter 03 follows the supplied 390×844 mock: paper grid bleeds off the top, then title, a five-layer card stack (initial goal, source material, working assumptions, revision notes, intermediate outputs) revealed one layer per scroll step, a connector into the current task with keep / update / discard branches, and a closing block that replaces the diagram with the "information is present, but what still matters" argument and its keywords.

During chapter 03, slide the paper cards along their tilted rows as the panel advances. On forward scroll, the rows alternate toward the upper right and lower left, starting toward the upper right.

On leaving chapter 03, slide the opaque reading plate below the viewport before the grid reforms. Settle the papers in a carousel partly off the left edge of chapter 04, then reveal the heading and the right-hand research lenses. Scroll turns the carousel and emphasizes one lens at a time from top to bottom. Use a stationary carousel with the system's reduced-motion preference.

Keep chapter 04 pinned through all three lens highlights and hold briefly on the third. After the carousel settles, reveal the main title first and the subtitle second. Both rise through a mask while fading in, followed by the surrounding copy. As chapter 05 rises, play that entrance in reverse, keeping the masks fixed while their text slides down and fades.

Make the current lens in chapter 04 easy to spot with an accent badge on its number, a heavier heading, and darker text. Keep the other two lenses readable in gray and preserve their positions as emphasis changes.

Bring chapter 05 in as a solid light panel rising from below chapter 04. Pin the editable task-context diagram while scroll emphasizes goals, constraints, materials, plan, and outputs in that order. Keep the selected circle saturated and soften the others. Reveal the title, introduction, and diagram text in sequence. Smooth vertical wheel movement across the site while retaining native touch momentum and yielding immediately between wheel input and click playback.

Render the public site in English, including when a legacy language parameter is present. In chapter 06, use the supplied e-commerce example composition with editable text and diagram elements. Reveal the headings and body groups upward through masks, and slide paper screenshot cards in from the right.

Drive the example reveals by scroll position so upward scrolling retraces the same path. Continue the example with modification scope, result verification, failure cases, and the research gap. Keep the full scenario and research notes available in the details disclosure.

At the end of chapter 06, hold the text masks in place and reverse their entrance. Start chapter 10's paper sequence only after the example text is gone. Feed the sheets one by one through a fixed gate on the right, turning both rings together to bring each slot to the gate. Reveal the Literature Map copy upward through masks.
