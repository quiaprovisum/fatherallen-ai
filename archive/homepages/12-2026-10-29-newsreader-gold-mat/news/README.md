# Church News

The home page and `/news/` read these files in the browser. There is no build step.

An automated job may change only:

- `news/feed.json` for a Church News edition
- `news/today.json` for the saint or scripture card
- a new image under `news/img/` for that card

Do not edit `index.html`, `news/index.html`, or `news/news.js`.

## Schema

UTF-8 JSON object. The page reads only the fields below. Other fields are ignored and are not shown.

```json
{
  "entries": [
    {
      "id": "2026-10-28-evening",
      "date": "2026-10-28",
      "edition": "Evening",
      "items": [
        {
          "text": "Plain sentence or sentences.",
          "links": [
            { "label": "Vatican News", "url": "https://www.vaticannews.va/..." }
          ]
        }
      ]
    }
  ]
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `entries` | yes | Array. Newest first. |
| `id` | yes | Unique string. Use `YYYY-MM-DD-` plus a lowercase edition slug: `2026-10-28-morning`, `2026-10-28-midday`, `2026-10-28-evening`. The page does not parse the id for display. A repeated id is skipped; the first copy in the file wins. |
| `date` | yes | `YYYY-MM-DD`. This becomes the heading date. It is read as a calendar date, not as a UTC timestamp. |
| `edition` | yes | Display word, shown after the date. Usual values: `Morning`, `Midday`, `Evening`. |
| `items` | yes | Array of stories, in reading order. |
| `items[].text` | yes | Plain text. One story. Not HTML. |
| `items[].links` | yes | Array. Use one link for the source. More than one is allowed. |
| `links[].label` | yes | Visible source name, plain text, such as `Vatican News`. |
| `links[].url` | yes | Absolute `http://` or `https://` URL. Any other scheme is dropped and not linked. |

Write the file pretty-printed with two-space indentation and a single trailing newline. No byte-order mark. No comments. `text`, `label`, `id`, `date`, and `edition` must be JSON strings.

The heading on the site looks like: `Wednesday, October 28, 2026 · Evening`.

## Order

Keep `entries` newest first. Prepend the new edition; do not append it.

The pages sort by `date` descending before display. The same calendar date keeps file order, so the prepended edition stays above older editions from that day. The home page shows up to seven editions after that sort. The newest is open. Each older one is a heading that opens when asked. `/news/` shows every edition, open.

## Add an entry

Use only the GitHub REST contents API. One file, one PUT. Repository `quiaprovisum/fatherallen-ai`, branch `master`, path `news/feed.json`.

1. `GET https://api.github.com/repos/quiaprovisum/fatherallen-ai/contents/news/feed.json?ref=master`
   - Header: `Accept: application/vnd.github+json`
2. Read `sha` from the response. That exact string goes in the PUT.
3. Base64-decode `content`. The API wraps that field with newlines; strip whitespace, then decode to UTF-8. Parse the JSON.
4. If `entries` already contains the new `id`, stop. It is already posted.
5. Insert the new object at the front of `entries`.
6. Serialize the whole object back to UTF-8 JSON (two-space indent, trailing newline).
7. Base64-encode those bytes (standard base64, not URL-safe).
8. `PUT https://api.github.com/repos/quiaprovisum/fatherallen-ai/contents/news/feed.json`

```json
{
  "message": "Church news: 2026-10-28 evening",
  "content": "<base64 of the entire file>",
  "sha": "<sha from the GET>",
  "branch": "master"
}
```

Omit `author` and `committer`. The token’s user is the author. If you send either object, GitHub requires both `name` and `email` on it.

A `409` means the `sha` is stale because another update landed. GET again, decode again, prepend again only if the id is still absent, and PUT with the new `sha`. Do the same after any other failed PUT. Run updates one at a time; two parallel PUTs will conflict.

## Saint of the Day / Scripture of the Day

`news/today.json` is one object, replaced each day. It is not a list. The home page shows whatever is in the file. If the file is missing, unreadable, or empty, the card stays hidden and Church News still loads.

```json
{
  "date": "2026-10-28",
  "kind": "Saint of the Day",
  "title": "Sts. Simon and Jude, Apostles",
  "subtitle": "Feast · Eph 2:19-22; Lk 6:12-16",
  "text": "One to three plain sentences.",
  "image": "/news/img/2026-10-28-sts-simon-and-jude.jpg",
  "imageAlt": "Short description of the picture",
  "credit": "Artist, title, date, collection. Public domain, via Wikimedia Commons.",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:..."
}
```

| Field | Required | Notes |
| --- | --- | --- |
| `date` | yes | `YYYY-MM-DD`. Recorded for the job. The page does not compare it with the visitor’s clock, so a late job still shows the last card. |
| `kind` | yes | `Saint of the Day` or `Scripture of the Day`. Shown as the small label. |
| `title` | yes | Plain text. |
| `subtitle` | no | Plain text. Feast rank and readings, or the scripture reference. |
| `text` | yes | Plain text, one to three sentences. Not HTML. |
| `image` | yes | Either a same-site path `/news/img/<file>` or an `https://` URL. `http://`, `javascript:`, `data:`, and any other path are ignored. The same-site file must be `.jpg`, `.jpeg`, `.png`, `.gif`, or `.webp`, with no `..`. |
| `imageAlt` | yes | Plain text description of the picture. |
| `credit` | yes | Shown under the image. Plain text. |
| `sourceUrl` | yes | `http://` or `https://` link on the credit line. Any other scheme is not linked; the credit still shows as text. |

Write it pretty-printed, two-space indent, one trailing newline, UTF-8, no byte-order mark.

### Upload the image, then point today.json at it

Use a new filename each day, for example `news/img/2026-10-29-st-name.jpg`. A new path is a create, so the image PUT does not send `sha`.

1. Base64-encode the raw image bytes (standard base64, not URL-safe).
2. `PUT https://api.github.com/repos/quiaprovisum/fatherallen-ai/contents/news/img/2026-10-29-st-name.jpg`

```json
{
  "message": "Saint of the day image: 2026-10-29",
  "content": "<base64 of the image bytes>",
  "branch": "master"
}
```

Do not send `sha` for a path that does not exist yet. If the path already exists, GitHub rejects the PUT until you GET that path and send its `sha`. Prefer a new filename instead of replacing one.

3. `GET https://api.github.com/repos/quiaprovisum/fatherallen-ai/contents/news/today.json?ref=master` and read `sha`.
4. Replace the whole JSON object. Set `image` to `/news/img/2026-10-29-st-name.jpg` (leading slash, not `news/img/...`).
5. `PUT https://api.github.com/repos/quiaprovisum/fatherallen-ai/contents/news/today.json` with that `sha`, the new base64 JSON, a `message`, and `"branch": "master"`.

Put the image up first, then update `today.json`, so the card does not point at a missing file. On `409`, GET `today.json` again and PUT with the new `sha`. Leave older files in `news/img/`. Nothing lists them once `today.json` moves on.

The card requests `news/today.json?v=<unix minute>`, the same cache bust as `feed.json`. The image address is the path inside that file. A new filename is a new URL, so Fastly does not keep serving yesterday’s picture. Reusing a filename can leave the old bytes cached for about 10 minutes.

### Image size

The contents API accepts a file up to **100 MB**. A create does not need the bytes back from GitHub, so an image over 1 MB can still be uploaded. Above 1 MB, a later GET of that image path returns the `sha` and an empty `content`. You do not need those bytes if each day uses a new path.

Prefer a JPEG under about **2 MB**. The page sizes the picture with `max-height` and `object-fit: contain`, so a large original is not shown full size, but the phone still downloads the whole file. There is no resize step. SVG is not accepted for a `/news/img/` path.

## Escaping

Put plain text in JSON strings. A JSON serializer must escape quotes, backslashes, and control characters. Curly quotes and accents stay as Unicode (or as `\u` escapes; both render the same).

The pages insert text with `textContent`. Tags in `text` or `label` are shown as characters, not parsed as HTML. Do not send HTML or Markdown and expect formatting.

Only `http` and `https` URLs are turned into links. `javascript:`, `data:`, and site-relative URLs are omitted. Each source opens in a new tab.

## Size

This GET-then-PUT workflow needs the file at **1 MB or smaller**. At that size, the contents API returns both `sha` and the full base64 `content`. Between 1 MB and 100 MB the contents response leaves `content` empty unless you request a raw media type, and this poster must not do that. Above 100 MB the endpoint does not support the file.

Three short editions a day stay far under that for years. If the file approaches about 700 KB, delete the oldest entries from the end of `entries` in the same PUT. The site has no separate archive beyond this file.

## Caching

GitHub Pages publishes `master`. Allow a minute or so for that deploy after the PUT succeeds.

Fastly in front of Pages caches a URL for about 10 minutes. The pages request `news/feed.json?v=<unix minute>` and `news/today.json?v=<unix minute>` with `cache: 'no-cache'`, so a new edition or a new card shows up on the next minute’s fetch after Pages has the file, rather than waiting out a 10-minute TTL. A visitor who already loaded the current minute can be a minute behind. Do not add your own cache-buster inside the JSON. The pages add the query. Image files are not given that query; use a new `news/img/` filename each day.
