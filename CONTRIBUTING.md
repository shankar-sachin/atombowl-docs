# Contributing to Atom Bowl Docs

This repo is the documentation site for [Atom Bowl](https://atombowl.web.app). Thank you for helping.

## Pull requests only

**Never push directly to `main`.** Every change goes through a pull request, with no exceptions.

1. Fork the repo, or create a branch (`git switch -c docs/short-description`).
2. Make your change and commit it.
3. Open a pull request into `main` and say what changed and why.
4. Wait for review. A maintainer merges.

Each pull request gets a preview URL from Cloudflare Pages so you can check it before it merges.

## What goes here

Only documentation changes belong in this repo: the pages in `public/`, their styles and scripts. For bugs or features in the app itself, open an issue or pull request in [shankar-sachin/atombowl](https://github.com/shankar-sachin/atombowl).

## Writing the docs

- The pages are plain HTML and CSS. There is no build step.
- Preview locally with `python3 -m http.server 8080 --directory public`. A plain server needs `.html` on links, and Cloudflare serves them without.
- Say "SI" for the Tutor and Generate features, never "AI".
- Keep it short and match the app: tell people what to click and what happens.
- Check the page at phone width as well as on a desktop.
- Please do not add packages or a build step without asking in an issue first.

## Reporting a problem

Open an [issue](https://github.com/shankar-sachin/atombowl-docs/issues) with the page and what is wrong or missing.
