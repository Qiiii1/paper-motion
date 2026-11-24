# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Keep moving paper cards physically separate, including bent edges and in-between scroll positions. Resolve intersections in depth while preserving each sheet's projected footprint and front-to-back occlusion. Keep size changes tied to the authored path.

Calibrate the opening light against Premotio at matched viewport sizes. Keep the paper-coloured background uniform and apply the white core and radial colour dispersion to the sheets.

Set the opening headline left-aligned above the research question. Blend both with the flying papers so only overlapping glyph areas change color. Place the report credit and date on solid cyan and sage strips.

Let users advance one stage at a time by tapping or clicking, including on the artwork, or scrub the animation with native scrolling. Manual scrolling takes over during click playback. Leave the opening centre clear of paper and omit the top navigation bar. Feed the upright radial deck through a single right-rear exit. Hold the finished grid flat with horizontal pointer parallax. Form the final tilted carousel from a handful of lower-left grid sheets in sequence, bending each sheet around the circumference.

Smooth scroll-driven visual progress while respecting the system's reduced-motion preference.

Integrate the study into the scroll-driven paper sequence. Prioritize the research opening, with a separate interaction sequence for the product-prototype material later in the story.

Pinned reading scenes: when a chapter's copy is designed as a fixed panel (the research-pathway ladder in 02, the task-context stack in 03), pin the white plate and change only its content step by step while the paper artwork above keeps moving. Do not let the plate scroll out from under a still-running animation, and keep the plate opaque so type never sits on sheets.

Chapter 03 follows the supplied 390×844 mock: paper grid bleeds off the top, then title, a five-layer card stack (initial goal, source material, working assumptions, revision notes, intermediate outputs) revealed one layer per scroll step, a connector into the current task with keep / update / discard branches, and a closing block that replaces the diagram with the "information is present, but what still matters" argument and its keywords. Give the white plate more of the viewport and use that space for larger cards, captions, and branches.

During chapter 03, slide the paper cards along their tilted rows as the panel advances. On forward scroll, the rows alternate toward the upper right and lower left, starting toward the upper right.

On leaving chapter 03, slide the opaque reading plate below the viewport before the grid reforms. Settle the papers in a carousel partly off the left edge of chapter 04, then reveal the heading and the right-hand research lenses. Scroll turns the carousel and emphasizes one lens at a time from top to bottom. Use a stationary carousel with the system's reduced-motion preference.

Keep chapter 04 pinned through all three lens highlights and hold briefly on the third. After the carousel settles, reveal the main title first and the subtitle second. Both rise through a mask while fading in, followed by the surrounding copy. On short viewports, scroll the lower lenses and source note into view during the reading hold. As chapter 05 rises, reverse the entrance with the masks fixed. Keep all chapter-title masks fixed during their upward reveals and give the lettering a brief rebound as it settles.

Make the current lens in chapter 04 easy to spot with an accent badge on its number, a heavier heading, and darker text. Keep the other two lenses readable in gray and preserve their positions as emphasis changes.

Bring chapter 05 in as a solid light panel rising from below chapter 04. Pin the editable task-context diagram while scroll emphasizes goals, constraints, materials, plan, and outputs in that order. Keep the selected circle saturated and soften the others. Reveal the title, introduction, and diagram text in sequence. Smooth vertical wheel movement across the site while retaining native touch momentum and yielding immediately between wheel input and click playback.

Use offset tinted halos around the five Research Scope circles. Connect them to the white Context circle with dashed lines and small colored junctions. Keep labels selectable and inside the viewport when the outer halos bleed offscreen.

Render the public site in English, including when a legacy language parameter is present. Follow Research Scope with the 02 Related Research cover, Search Keyword Map, Publication Trends, and Literature Map. Begin the cover's staggered paper entry as the scope footnote scrolls out. Feed the Literature Map sheets one by one through a fixed gate on the right of the orbit, turning both rings together to bring each slot to the gate. Reveal the Literature Map copy upward through masks.

Give incoming sheets visibly different arcs, tilt, and pace near the visible edge of the Literature Map. Allow enough scroll distance to see each entry. The sheets straighten and converge on the same point and heading before joining the rotating rings.

Place the full-screen Research Background cover after Research Approach. Frame moving paper ribbons above a large English title and a pale part number, and keep the next and previous scene controls at the bottom.

Keep the Research Approach text masks fixed while their contents return downward. Continue the existing paper deck through the approach-to-background handoff so the same sheets form the first cover's ribbons.

List all seven parts in Research Approach, from Research Background through Next Steps. Keep the scroll-following arrow and link each row to its chapter.

Rotate the paper ribbons together as the reader scrolls through the Research Background cover, with the same path in reverse when scrolling back.

End Literature Map with Synthesis and the navy Research Gap summary connecting information, scope, and verification. Pin the final reading position while the letters descend and fade inside their masks. Then move from a close-up grid of papers into the four-case vertical reel. Reveal each case's title and lower text upward through fixed masks and keep the explanations and diagrams editable.

Keep the paper wall close to the Literature Map footer. Bend the paper surfaces around the vertical reel as they enter and leave. Place the illustrated Comparison & critique cover (03) after related research and before the comparison chapter.

Keep wheel scrolling light and responsive through the story, with smooth acceleration and deceleration. Limit queued travel during bursts and clear it along with the old velocity when the direction reverses. Preserve native touch momentum and explicit page-scroll distances.

Use the established paper tints and a matching crop and physical size across all four reel covers. Keep the front paper flat and square-cornered as papers exchange the front position. Reserve perspective tilt and curl for papers away from the front. Keep the focus lens lettering inside its reveal mask.

Feather the paper artwork into the task-context stack with a broad, eased gradient tied to the moving reading plate.

Bring the 02 Related Research cover papers in from above, one sheet after another, until they form the ribbons. Once they settle, reveal the cover title upward inside fixed line masks. On further scroll, lower the letters into those same masks, then send the sheets off the right edge one by one. Bring in Search Keyword Map with its center node visible. Pin the SVG while scroll grows its six branches outward through their topics and keywords. Reveal the summaries at the end and flow into Publication Trends. Rotate the upper-right paper cards as the reader scrolls through its header. Draw the annual trends as SVG and keep the counts selectable. Begin the Literature Map as it scrolls into view. Scrub the same sequence in reverse when scrolling back.

On the Comparison & critique cover, bring the sheets down individually to form one upright ring. After the ring forms, turn it on its vertical axis as the reader scrolls. Continue the turn while the ring and the opaque Research Support & Limits plate rise together. Keep the ring behind the plate during reading. After the footnote is in view, keep the reading plate fixed and fade it out as one surface. Once it clears, bring the papers down from the top one by one to re-form the centered ring. Reverse the same motion on upward scroll.

Draw the Research Support & Limits diagram with editable vector geometry and text. Use the page background behind the diagram. Start the three levels as they enter the viewport and overlap the soft top-to-bottom reveals enough to limit blank space while scrolling. After the reading plate settles, raise the title, subtitle, and introduction in sequence through fixed masks. Use the same upward reveal for diagram text and the footnote, keeping the label boxes in place. Reverse the reveals on upward scroll.

After Research Support & Limits clears, gather the comparison papers toward the center and let them scatter into the opening scene’s flight and lighting. Bring in the Research Gap SVG during the scatter. Raise the task-context reading plate in chapter 03 enough to give the stacked cards larger type and more room.

After Research Gap, hold its layout in place while the SVG content descends and fades. Send its papers off the right edge in sequence and bring new papers in along staggered arcs to form the 05 Research Questions cover ribbons. Ease the ribbons as they settle, then fold them into an upright paper ring behind the incoming reading plate. Keep the title and body reveals inside fixed masks and make the whole sequence reversible through scrolling.

After the Research Questions footnote, hold the reading position as the copy descends inside its masks. Open the exposed paper ring into the 06 Research Design ribbons with staggered diagonal turns. Unfold the ribbons into the tilted paper grid above Research Design. Follow Research Design with Research Process and its two controlled comparisons, using the supplied mobile compositions and editable diagram labels. Link citations directly to their sources.

After Research Process, bring in the 07 Next Steps ribbons in a staggered sweep and settle the papers before the title rebounds into place. Let the ribbon exit lead into Expected Contributions & Next Steps without an empty screen. Draw its contribution graphics, roadmap, and decorative reference sheets as SVG. Carry the muted Research Process palette into the contribution motifs and pair the roadmap's pale sector fills with dark step numbers. Keep the three contributions, six roadmap steps, and final Reference list as selectable text.
