# Junior Cycle Higher Maths

A visual preparation guide with step-by-step explanations, browser narration,
interactive diagrams, practice questions and printable Chapter Toolkits.

Contact: [andresdiegolanda@gmail.com](mailto:andresdiegolanda@gmail.com)

## Use the guide

Download and extract [the complete guide ZIP](downloads/Junior-Cycle-Higher-Maths.zip),
then open `Junior-Cycle-Higher-Maths/index.html` in a browser. The 24 chapter
HTML files can also be opened individually. Keep the `toolkits` folder beside them.

The guide contains 158 lessons, 646 teaching steps, 316 skill checks, 96 written
problems, 222 visual reference cards and a glossary of 140 terms. The printable
PDF has 39 A3 landscape sheets across the 24 chapters.

Use a box's **Listen** button for its explanation, or **Play whole lesson** to
follow the complete sequence. The current box is marked; diagrams advance after
speech finishes. Pause retains your place. **Follow narration** controls scrolling.
Full workings are expandable below each visual reference card.

Browser voices vary by device. Local voices may work offline; online voices need
a connection and may send narration text to their provider. No microphone,
account, API key or recorded audio is required. Written explanations remain available.
Progress stays in local browser storage where supported and does not sync between devices.

## Repository layout

- `site/` — complete prebuilt website, including the printable PDF.
- `source/` — editable content, diagrams, interface, build scripts and checks.
- `downloads/` — the complete ready-to-use guide ZIP.
- `docs/` — verification notes and a preview.

Every distributed HTML file embeds its CSS, JavaScript, content and diagrams.
There are no third-party script dependencies or application server requirements.

## Cloudflare Pages

Connect this repository to Cloudflare Pages with these settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `site` |
| Root directory | Repository root |

The checked-in site is already built. Publish `site/`, keeping the source and
download archive outside the deployed site root. These settings follow
[Cloudflare's static HTML instructions](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

## Edit and rebuild

Python 3 builds the HTML using its standard library. From the repository root:

```sh
python source/build.py
```

Content lives in `source/data/chapters.json`, `source/data/visual-cards-*.json`,
`source/data/glossary.json` and `source/data/lab-narration.json`. Interface and
speech files live directly in `source/`.

The supplied PDF only needs rebuilding when its content or layout changes.
Install its dependencies with `python -m pip install -r source/requirements-print.txt`.
Set `MATHS_FONT_DIR` to a folder containing `DejaVuSans.ttf` and, preferably,
`DejaVuSans-Bold.ttf`. Then run:

```sh
python source/build.py
python source/make-toolkits.py
python source/build.py
```

The final HTML build refreshes chapter PDF page ranges. To preview the website:

```sh
python -m http.server 8767 --directory site --bind 127.0.0.1
```

Open `http://127.0.0.1:8767/`.

## Verify and package

Node.js runs the browser-controller checks. Python validation uses `pypdf`,
included in the print requirements above.

```sh
node source/test-speech.cjs
node source/test-guided-reading.cjs
node source/test-search.cjs
python source/validate.py
python source/package.py
```

Packaging updates `downloads/Junior-Cycle-Higher-Maths.zip`. See
[the review notes](docs/QA-SUMMARY.txt) for verification scope and limits.
