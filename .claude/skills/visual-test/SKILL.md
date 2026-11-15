---
name: visual-test
description: Build, serve and screenshot the Maneki dashboard with synthetic data at phone and desktop widths in light and dark mode. Use for every change that affects what the dashboard renders (site/, styles, vite.config.ts, types.ts or format.ts output), before opening the PR.
---

# Visual test the dashboard

The real payload is licensed market data and is encrypted. Never use it for screenshots that leave
this machine. Use the synthetic fixture (`tests/fixtures/demo-dashboard.ts`), which
`tools/demo-dashboard.ts` encrypts under a fresh throwaway key.

## 1. Build with synthetic data

```bash
OUT="$(mktemp -d)"                                    # anywhere except site/data (the tool refuses it)
KEY="$(node tools/demo-dashboard.ts --dst "$OUT/data")" # prints the throwaway key on stdout
node tools/build.ts --data "$OUT/data"                # same build as CI, with the demo payload in dist/data
echo "$KEY"
```

If the change touches the payload shape, update the fixture first: `npm run typecheck` fails until
the fixture matches `site/src/lib/types.ts`. Add fixture rows for any new state the change renders
(a new flag, status or empty case), so the screenshot actually shows it.

## 2. Serve

```bash
npx vite preview --config vite.config.ts --port 4317 --strictPort   # run in the background
```

Use any free port. 4173, Vite's default, is often taken by another session. Don't kill a server you
didn't start.

## 3. Screenshot with the Playwright MCP

Load the tools with ToolSearch (`browser_navigate`, `browser_resize`, `browser_emulate_media`,
`browser_take_screenshot`, `browser_console_messages`, `browser_evaluate`). The MCP writes only
inside the repo. Save screenshots under `.playwright-mcp/`, which is gitignored.

For each width × scheme the change affects (at minimum phone light and desktop dark, or all four for
layout or theme work):

1. `browser_resize` to **390×844** (phone) or **1440×900** (desktop). Below 1024 px the tab bar moves to
   the bottom and the Record table becomes expandable rows.
2. `browser_emulate_media` with `colorScheme: "light"` or `"dark"`. The theme toggle is stored per
   device (`stonks.theme`), and "auto" follows the emulated scheme.
3. Navigate:
   - Latest: `http://localhost:4317/#k=<KEY>` (the key is stored, then stripped from the URL)
   - Archive day: `http://localhost:4317/#/day/2026-11-12`
   - Record: `http://localhost:4317/#/record`
   - Locked screen: `browser_evaluate` with `() => localStorage.removeItem('stonks.dashboardKey')`, then load `http://localhost:4317/`
4. `browser_take_screenshot` with `filename: ".playwright-mcp/<view>-<width>-<scheme>.png"` and
   `fullPage: true`. In a full-page phone shot the fixed bottom tab bar appears mid-page. That's
   a capture artifact. Take a viewport shot to check the bar itself.
5. `browser_console_messages` at level `warning`. Expect zero. A CSP violation shows up here.

Then **Read every screenshot** and check for clipped text, overflow or horizontal scroll at 390 px,
contrast in both schemes, tones (good, warn, bad) on the right numbers, and empty states.

## 4. Report and clean up

- In the PR, list each view × width × scheme you checked and what you saw. Screenshots of the
  synthetic data may be attached. Screenshots of real data may not.
- Stop the preview server.
- Run `npm run build` again if anything will use `dist/` afterwards. It now holds demo data.
