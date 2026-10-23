## By Haile Mihiret Fasika

# The Little Herb Garden

A small herb garden website built with plain HTML, CSS and JavaScript, as a
practice project for Frontend Development (day 1).

The garden is made up. The code is real.

## What it does

- shows the herbs of the garden as cards on the home page
- opens a page for each herb, for example `index.html#thyme`
- keeps the address and the page in sync, so the back button and shared links work

### The herb page

- a picture of the herb, with a shortcut to switch to the next herb
- name, Latin name, life cycle, use and a longer description
- **Growing & Care** button: opens the care tab and scrolls to it
- **Save to My Garden** button: remembers your favourite herbs in the browser
- three tabs: **Care & Growing**, **Culinary & Tea Uses**, **Video Guide**
  (use the left and right arrow keys to move between them)
- a **Visit** card with opening hours and the address, and a footer

### The Video Guide

If a herb has a YouTube video in its data file, it plays in the tab.
If not, the tab shows a "Search YouTube" button instead of a broken player.

## Run it

You need [Node.js](https://nodejs.org/) (LTS) and a browser.

```sh
npx serve
```

Open the address it prints, usually <http://localhost:3000>.
Stop the server with `Ctrl+C`.

Do not open `index.html` by double-clicking it. The herbs are loaded with
`fetch`, which needs a web server, not a `file://` address.

## Project files

```text
index.html    the page: header, home sections, Visit card, footer
style.css     the look: layout, herb page, tabs, video panel, focus styles
app.js        the behaviour: loading, routing, tabs, saving, video
data/         herbs.json (the list) and one JSON file per herb
images/       the logo and the pictures
```

## Adding or changing a herb

1. Add the herb to `data/herbs.json`.
2. Create `data/<name>.json`, named after the herb in lowercase
   (spaces become `-`).

```json
{
  "name": "Thyme",
  "latin": "Thymus vulgaris",
  "life": "evergreen perennial",
  "use": "A one-line use.",
  "description": "A longer description.",
  "image": "images/thyme.svg",
  "imageAlt": "What the picture shows",
  "care": ["Optional tip", "Another tip"],
  "culinary": "Optional text about cooking and tea.",
  "video": "https://www.youtube.com/watch?v=VIDEO_ID",
  "videoTitle": "How to Grow Thyme"
}
```

`care`, `culinary`, `video` and `videoTitle` are optional. Without `care` and
`culinary`, the tabs show `description` and `use`. `video` can be a YouTube
link or just the video id.

## How it works

1. `app.js` loads `data/herbs.json` and draws one card per herb.
2. The part of the address after `#` decides what is shown:
   a section of the home page, or the page of one herb.
3. For a herb, it loads `data/<name>.json` and builds the page with JavaScript.
4. The tabs, the save button and the video are all created in `app.js`.

## Accessibility

- real links and buttons, so everything works with the keyboard
- clear focus ring on links, buttons and tabs
- tabs follow the ARIA tab pattern, with arrow-key support
- pictures have alternative text
- focus moves to the herb's name when its page opens

## Credits

Based on the course project by @pepe Josef Pospisil.
Help from [MDN](https://developer.mozilla.org/).
