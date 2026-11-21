# Sacred art on the home page

The blue scripture plate is gone. In its place the home page shows one work of sacred art for the visitor’s local date. Nothing has to be published each morning. The page computes the day and chooses the picture.

## How a picture is chosen

`art/calendar.js` follows the General Roman Calendar. Easter is calculated with the Gregorian computus, and the movable feasts are counted from it: Ash Wednesday, the Sundays of Lent, Holy Week, the Triduum, Easter, the Ascension (Thursday), Pentecost, Trinity Sunday, Corpus Christi (Thursday), the Sacred Heart, and Christ the King. Advent is the four Sundays before Christmas. When a solemnity cannot be kept on its own date, it is moved the way the Roman calendar moves it. In 2027 the Annunciation falls on Holy Thursday, so the page keeps Holy Thursday that day and shows the Annunciation on April 5.

A mapped feast or Sunday wins. If the day has no picture of its own, the page uses that season’s set and steps through it, so Ordinary Time still changes and a picture is always on the page. Seasons covered: Advent, Christmas, Lent, Holy Week, the Triduum, Easter, and Ordinary Time.

The calendar in the file is the universal Roman one: Epiphany on January 6, the Ascension on Thursday, Corpus Christi on Thursday. In the United States, including the Archdiocese of New Orleans, those three are kept on Sunday. To follow that calendar, set `"calendar": "us"` at the top of `art/art.json`.

`?art=2026-12-25` on the home page previews another date. Leave it off for the real day.

## How to add or change a picture

Images live in `art/img/`. They are public-domain or CC0, saved as JPEGs, and each record in `art/art.json` links the Wikimedia Commons file page.

1. Put a JPEG in `art/img/`. Keep the long edge around 1600 pixels.
2. Add a record under `works` with `title`, `artist`, `year`, `image`, `width`, `height`, `alt`, `credit`, and `sourceUrl`.
3. Point a day at it.
   - A feast the calendar already knows (Christmas, Guadalupe, a Sunday of Advent, and the rest of the ids in `feasts`) only needs `"work"` and `"relation"` under that id in `feasts`.
   - A new fixed memorial needs a `days` entry as well. Rank may be `memorial` or `feast`. A memorial does not replace a Sunday, Lent, or Holy Week.

```json
"days": {
  "10-04": {
    "id": "francis",
    "name": "Saint Francis of Assisi",
    "rank": "memorial"
  }
}
```

Francis is already in the calendar. For a saint who is not, the `days` entry is what makes the date win, and `feasts` (or `work` and `relation` on the day itself) supplies the picture.

4. To change what a season shows on ordinary days, edit the list under `seasons`. The page walks that list and always has the `fallback` work if a list is empty.

`relation` is the line under the artist: the feast or the reading the picture belongs to. `credit` is the collection and the license. Both are shown.

## What was not changed

Church News on the home page is the same section as before, including the saint or scripture card and the digests. This folder does not replace `news/today.json`.
