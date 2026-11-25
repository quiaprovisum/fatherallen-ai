/* node art/select.test.js */
var fs = require("fs");
var path = require("path");
require("./calendar.js");
var art = require("./artwork.js");
var root = path.join(__dirname, "..");
var data = JSON.parse(fs.readFileSync(path.join(__dirname, "art.json"), "utf8"));
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error("FAIL " + msg);
  }
}

function pick(ymd, id, titlePart) {
  var selected = art.select(ymd, data);
  assert(selected && selected.id === id, ymd + " id " + (selected && selected.id) + " expected " + id);
  assert(selected && selected.matched, ymd + " should use a mapped work");
  assert(selected && selected.work && selected.work.title.indexOf(titlePart) !== -1,
    ymd + " title " + (selected && selected.work && selected.work.title));
  assert(selected && fs.existsSync(path.join(root, selected.work.image)), ymd + " missing file");
}

pick("2026-11-21", "presentation-of-mary", "Presentation of the Virgin");
pick("2026-11-22", "christ-the-king", "Last Judgment");
pick("2026-11-29", "advent-1", "Wise and Foolish");
pick("2026-12-08", "immaculate-conception", "Immaculate");
pick("2026-12-12", "guadalupe", "Guadalupe");
pick("2026-12-25", "christmas", "Nativity");
pick("2027-01-06", "epiphany", "Magi");
pick("2027-01-10", "baptism-of-the-lord", "Baptism");
pick("2027-02-02", "presentation-of-the-lord", "Presentation of Christ");
pick("2027-02-10", "ash-wednesday", "Wilderness");
pick("2027-03-19", "joseph", "Joseph");
pick("2027-03-25", "holy-thursday", "Washing");
pick("2027-03-28", "easter", "Resurrection");
pick("2027-04-05", "annunciation", "Annunciation");
pick("2027-05-06", "ascension", "Ascension");
pick("2027-05-16", "pentecost", "Pentecost");
pick("2027-05-27", "corpus-christi", "Last Supper");
pick("2027-08-15", "assumption", "Assumption");
pick("2027-11-01", "all-saints", "Trinity");
pick("2027-11-21", "christ-the-king", "Last Judgment");
pick("2027-12-12", "advent-3", "John");

var us = JSON.parse(JSON.stringify(data));
us.calendar = "us";
var epiphany = art.select("2027-01-03", us);
assert(epiphany && epiphany.id === "epiphany", "US Epiphany");
var ascension = art.select("2027-05-09", us);
assert(ascension && ascension.id === "ascension", "US Ascension");

var cursor = { y: 2026, m: 11, d: 21 };
function fmt(c) {
  return c.y + "-" + String(c.m).padStart(2, "0") + "-" + String(c.d).padStart(2, "0");
}
while (fmt(cursor) <= "2027-12-31") {
  var selected = art.select(cursor, data);
  assert(selected && selected.work && selected.relation, "empty " + fmt(cursor));
  if (selected && selected.work) {
    assert(fs.existsSync(path.join(root, selected.work.image)), "file " + fmt(cursor));
  }
  var next = new Date(Date.UTC(cursor.y, cursor.m - 1, cursor.d + 1));
  cursor = { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
}

var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
assert(html.indexOf("Church News") !== -1, "Church News heading missing");
assert(html.indexOf("data-church-news") !== -1, "Church News mount missing");
assert(html.indexOf("God, at the beginning of time") === -1, "scripture plate still present");
assert(html.indexOf("Free and easy to leave") === -1, "unwanted phrase");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("artwork selection tests passed");
