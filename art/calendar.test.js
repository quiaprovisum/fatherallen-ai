/* node art/calendar.test.js */
var cal = require("./calendar.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed += 1;
    console.error("FAIL " + msg);
  }
}

function eq(date, ymd, msg) {
  assert(cal.format(date) === ymd, (msg || "") + " expected " + ymd + " got " + cal.format(date));
}

function day(ymd, id, mode) {
  var observed = cal.observe(ymd, { calendar: mode || "roman" });
  assert(observed && observed.id === id, ymd + " id expected " + id + " got " + (observed && observed.id));
  return observed;
}

var easters = {
  1818: "1818-03-22",
  1997: "1997-03-30",
  2000: "2000-04-23",
  2016: "2016-03-27",
  2017: "2017-04-16",
  2018: "2018-04-01",
  2019: "2019-04-21",
  2020: "2020-04-12",
  2021: "2021-04-04",
  2022: "2022-04-17",
  2023: "2023-04-09",
  2024: "2024-03-31",
  2025: "2025-04-20",
  2026: "2026-04-05",
  2027: "2027-03-28",
  2028: "2028-04-16",
  2029: "2029-04-01",
  2030: "2030-04-21"
};

Object.keys(easters).forEach(function (year) {
  eq(cal.easter(Number(year)), easters[year], "Easter " + year);
});

eq(cal.ashWednesday(2027), "2027-02-10", "Ash Wednesday 2027");
eq(cal.ascension(2027, "roman"), "2027-05-06", "Ascension 2027");
eq(cal.pentecost(2027), "2027-05-16", "Pentecost 2027");
eq(cal.corpusChristi(2027, "roman"), "2027-05-27", "Corpus Christi 2027");
eq(cal.corpusChristi(2027, "us"), "2027-05-30", "Corpus Christi US 2027");
eq(cal.sacredHeart(2027), "2027-06-04", "Sacred Heart 2027");
eq(cal.adventSunday(2026), "2026-11-29", "Advent 2026");
eq(cal.adventSunday(2027), "2027-11-28", "Advent 2027");
eq(cal.adventSunday(2023), "2023-12-03", "Advent 2023");
eq(cal.adventSunday(2024), "2024-12-01", "Advent 2024");
eq(cal.adventSunday(2022), "2022-11-27", "Advent 2022");
eq(cal.christTheKing(2026), "2026-11-22", "Christ the King 2026");
eq(cal.christTheKing(2027), "2027-11-21", "Christ the King 2027");
eq(cal.epiphany(2026, "roman"), "2027-01-06", "Epiphany 2027");
eq(cal.epiphany(2026, "us"), "2027-01-03", "Epiphany US 2027");
eq(cal.baptism(2026, "roman"), "2027-01-10", "Baptism 2027");
eq(cal.baptism(2026, "us"), "2027-01-10", "Baptism US 2027");
eq(cal.holyFamily(2026), "2026-12-27", "Holy Family 2026");
eq(cal.holyFamily(2027), "2027-12-26", "Holy Family 2027");
eq(cal.annunciationDate(2027), "2027-04-05", "Annunciation 2027");
eq(cal.annunciationDate(2016), "2016-04-04", "Annunciation 2016");
eq(cal.josephDate(2027), "2027-03-19", "Joseph 2027");
eq(cal.josephDate(2023), "2023-03-20", "Joseph 2023");
eq(cal.immaculateDate(2026), "2026-12-08", "Immaculate 2026");
eq(cal.immaculateDate(2024), "2024-12-09", "Immaculate 2024");
eq(cal.josephDate(1818), "1818-03-14", "Joseph in Holy Week 1818");

day("2026-11-21", "presentation-of-mary");
day("2026-11-22", "christ-the-king");
day("2026-11-29", "advent-1");
day("2026-11-30", "andrew");
day("2026-12-06", "advent-2");
day("2026-12-08", "immaculate-conception");
day("2026-12-12", "guadalupe");
day("2026-12-13", "advent-3");
day("2026-12-17", "advent-17");
day("2026-12-20", "advent-4");
day("2026-12-24", "advent-24");
day("2026-12-25", "christmas");
day("2026-12-26", "stephen");
day("2026-12-27", "holy-family");
day("2026-12-28", "holy-innocents");
day("2026-12-29", null);
day("2027-01-01", "mary-mother-of-god");
day("2027-01-03", null);
day("2027-01-06", "epiphany");
day("2027-01-10", "baptism-of-the-lord");
day("2027-01-11", null);
day("2027-02-02", "presentation-of-the-lord");
day("2027-02-07", null);
day("2027-02-10", "ash-wednesday");
day("2027-02-11", null);
day("2027-02-14", "lent-1");
day("2027-02-21", "lent-2");
day("2027-02-22", "chair-of-peter");
day("2027-02-28", "lent-3");
day("2027-03-07", "lent-4");
day("2027-03-14", "lent-5");
day("2027-03-19", "joseph");
day("2027-03-21", "palm-sunday");
day("2027-03-22", "holy-monday");
day("2027-03-24", "holy-wednesday");
day("2027-03-25", "holy-thursday");
day("2027-03-26", "good-friday");
day("2027-03-27", "holy-saturday");
day("2027-03-28", "easter");
day("2027-03-29", "easter-monday");
day("2027-04-04", "easter-2");
day("2027-04-05", "annunciation");
day("2027-04-11", "easter-3");
day("2027-04-18", "easter-4");
day("2027-04-25", "easter-5");
day("2027-05-02", "easter-6");
day("2027-05-03", "philip-and-james");
day("2027-05-06", "ascension");
day("2027-05-09", "easter-7");
day("2027-05-14", "matthias");
day("2027-05-16", "pentecost");
day("2027-05-17", "mary-mother-of-the-church");
day("2027-05-23", "trinity");
day("2027-05-27", "corpus-christi");
day("2027-05-30", null);
day("2027-05-31", "visitation");
day("2027-06-04", "sacred-heart");
day("2027-06-05", "immaculate-heart");
day("2027-06-06", null);
day("2027-06-24", "nativity-of-john");
day("2027-06-29", "peter-and-paul");
day("2027-08-06", "transfiguration");
day("2027-08-15", "assumption");
day("2027-09-14", "holy-cross");
day("2027-09-29", "archangels");
day("2027-10-04", "francis");
day("2027-11-01", "all-saints");
day("2027-11-02", "all-souls");
day("2027-11-21", "christ-the-king");
day("2027-11-28", "advent-1");
day("2027-11-30", "andrew");
day("2027-12-08", "immaculate-conception");
day("2027-12-12", "advent-3");
day("2027-12-19", "advent-4");
day("2027-12-25", "christmas");
day("2027-12-26", "holy-family");
day("2027-12-27", "john-apostle");

day("2027-01-03", "epiphany", "us");
day("2027-01-06", null, "us");
day("2027-05-06", null, "us");
day("2027-05-09", "ascension", "us");
day("2027-05-27", null, "us");
day("2027-05-30", "corpus-christi", "us");
day("2025-11-02", "all-souls");
day("2024-12-08", "advent-2");
day("2024-12-09", "immaculate-conception");
day("2023-03-19", "lent-4");
day("2023-03-20", "joseph");

var names = {
  "2026-11-21": "The Presentation of the Blessed Virgin Mary",
  "2026-11-22": "Our Lord Jesus Christ, King of the Universe",
  "2027-01-11": "Monday of the First Week in Ordinary Time",
  "2027-02-07": "Fifth Sunday in Ordinary Time",
  "2027-02-09": "Tuesday of the Fifth Week in Ordinary Time",
  "2027-02-11": "Thursday after Ash Wednesday",
  "2027-02-22": "The Chair of Saint Peter",
  "2027-03-19": "Saint Joseph, Spouse of the Blessed Virgin Mary",
  "2027-05-17": "The Blessed Virgin Mary, Mother of the Church",
  "2027-05-30": "Ninth Sunday in Ordinary Time",
  "2027-06-06": "Tenth Sunday in Ordinary Time",
  "2027-12-12": "Third Sunday of Advent",
  "2026-12-29": "Fifth Day within the Octave of the Nativity of the Lord",
  "2027-04-06": "Tuesday of the Second Week of Easter"
};

Object.keys(names).forEach(function (ymd) {
  var observed = cal.observe(ymd);
  assert(observed.name === names[ymd], ymd + " name expected “" + names[ymd] + "” got “" + observed.name + "”");
});

var ferias = {
  "2027-03-19": "Friday of the Fifth Week of Lent",
  "2027-05-17": "Monday of the Seventh Week in Ordinary Time",
  "2026-11-21": "Saturday of the Thirty-third Week in Ordinary Time",
  "2026-12-08": "Tuesday of the Second Week of Advent",
  "2027-02-22": "Monday of the Second Week of Lent"
};

Object.keys(ferias).forEach(function (ymd) {
  var observed = cal.observe(ymd);
  assert(observed.feriaName === ferias[ymd], ymd + " feria expected “" + ferias[ymd] + "” got “" + observed.feriaName + "”");
});

var cursor = cal.parseDate("2024-01-01");
var end = cal.parseDate("2032-12-31");
var previous = null;
while (cal.format(cursor) <= cal.format(end)) {
  var observed = cal.observe(cursor);
  assert(observed && observed.season && observed.name, "missing day " + cal.format(cursor));
  assert(observed.seasonDay >= 0, "negative season day " + cal.format(cursor));
  if (previous && observed.season === previous.season) {
    assert(observed.seasonDay === previous.seasonDay + 1, "season day jump " + observed.date);
  }
  previous = observed;
  cursor = {
    y: Number(observed.date.slice(0, 4)),
    m: Number(observed.date.slice(5, 7)),
    d: Number(observed.date.slice(8, 10))
  };
  var next = new Date(Date.UTC(cursor.y, cursor.m - 1, cursor.d + 1));
  cursor = { y: next.getUTCFullYear(), m: next.getUTCMonth() + 1, d: next.getUTCDate() };
}

var extra = cal.observe("2027-07-16", {
  days: { "07-16": { id: "mount-carmel", name: "Our Lady of Mount Carmel", rank: "memorial" } }
});
assert(extra.id === "mount-carmel", "JSON memorial");
var blocked = cal.observe("2027-03-17", {
  days: { "03-17": { id: "patrick", name: "Saint Patrick", rank: "memorial" } }
});
assert(blocked.id === null && blocked.season === "lent", "Lent blocks a memorial");
var blockedSunday = cal.observe("2027-10-18", {
  days: { "10-18": { id: "not-luke", name: "Not Luke", rank: "memorial" } }
});
assert(blockedSunday.id === "luke", "a feast outranks a JSON memorial");

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log("calendar tests passed");
