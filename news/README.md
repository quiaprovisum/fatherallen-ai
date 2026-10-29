# Church News

`news/feed.json` is the only file an automated poster should change. The home page and `/news/` read it in the browser. There is no build step.

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

The pages sort by `date` descending before display. The same calendar date keeps file order, so the prepended edition stays above older editions from that day. The home page shows the first three editions after that sort. `/news/` shows every edition.

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

Do not edit `index.html`, `news/index.html`, or `news/news.js` when posting. Do not add a second file.

## Escaping

Put plain text in JSON strings. A JSON serializer must escape quotes, backslashes, and control characters. Curly quotes and accents stay as Unicode (or as `\u` escapes; both render the same).

The pages insert text with `textContent`. Tags in `text` or `label` are shown as characters, not parsed as HTML. Do not send HTML or Markdown and expect formatting.

Only `http` and `https` URLs are turned into links. `javascript:`, `data:`, and site-relative URLs are omitted. Each source opens in a new tab.

## Size

This GET-then-PUT workflow needs the file at **1 MB or smaller**. At that size, the contents API returns both `sha` and the full base64 `content`. Between 1 MB and 100 MB the contents response leaves `content` empty unless you request a raw media type, and this poster must not do that. Above 100 MB the endpoint does not support the file.

Three short editions a day stay far under that for years. If the file approaches about 700 KB, delete the oldest entries from the end of `entries` in the same PUT. The site has no separate archive beyond this file.

## Caching

GitHub Pages publishes `master`. Allow a minute or so for that deploy after the PUT succeeds.

Fastly in front of Pages caches a URL for about 10 minutes. Both pages request `news/feed.json?v=<unix minute>` and use `cache: 'no-cache'`, so a new edition shows up on the next minute’s fetch after Pages has the file, rather than waiting out a 10-minute TTL. A visitor who already loaded the current minute can be a minute behind. Do not add your own cache-buster inside the file. The pages add the query.
