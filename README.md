# Neon Coast Cover Studio

![make.fun bounty](https://make.fun/badge/gta6-cover-art-01.svg)
![rank](https://make.fun/badge/gta6-cover-art-01/tpmtling/gta6-cover-art-01-v2/rank.svg)
![reward](https://make.fun/badge/gta6-cover-art-01/tpmtling/gta6-cover-art-01-v2/reward.svg)

An offline web app that turns your own photos into GTA-style multi-panel
cover art with a Vice City neon-sunset grade, and exports it as a PNG to
share. Built for make.fun's
[Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty.
Everything runs in your browser from static files: photos are read on
your own machine and never uploaded.

## What it does

- **Photos**: add up to 9 of your own photos, or mix in the 2 bundled
  sample photos and 6 built-in hand-drawn scenes (Sunset Bay, Neon
  Street, Skyline Dusk, Yacht Party, Palm Boulevard, Rooftop Dusk).
- **7 layouts**: Grid Four, Duo Split, Nine Grid, Full Bleed, Tilted
  Snapshots, Banner Trio and Poster Hero.
- **7 colour grades**: Original, Neon Sunset, Neon Night, Golden Hour,
  Miami Pastel, Ink Poster and VHS Retro, each with its own wash and
  effects, plus film grain and a vignette on every cover.
- **Per-panel editing**: click a panel to select it, drag to reposition
  its picture, use the slider to zoom, and swap its picture from the
  picker.
- **Lettering**: a sunset-gradient title with an optional halftone dot
  block, a neon script subtitle, a bottom caption ribbon, a five-star
  heat meter and a round badge.
- **History**: undo and redo for your edits.
- **Export**: one-click PNG at 1080×1080, 1080×1350, 1920×1080 or
  1080×1920, or export all four sizes at once.

## Run it

```sh
node serve.ts
```

then open http://localhost:8080. No build step and no network requests:
`app/` is plain HTML, CSS and ES modules.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with
the vendored `vendor/makefun-app.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshots in `screenshots/` were taken by the app itself through
its `?shot=` scenes (see `shots.json` and `tools/shoot.mjs`): the first
is a wide Poster Hero cover, the second shows the editor with a cover
loaded, the third is a Tilted Snapshots cover and the fourth a Nine
Grid portrait cover.

## License

MIT. The two sample photos under `app/samples/` were made for make.fun
with an image model and are free to use.

---

New to make.fun? [Join with my referral link](https://make.fun/r/fpwjs2j2)
and build something of your own.
