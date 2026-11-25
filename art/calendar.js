/* Roman liturgical calendar for the artwork on the home page.
   The General Roman Calendar (Novus Ordo). Movable feasts are computed from Easter.
   Set options.calendar to "us" for the United States transfers of Epiphany,
   the Ascension, and Corpus Christi to Sunday. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FatherAllenCalendar = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var ORDINALS = ["",
    "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
    "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth", "Sixteenth", "Seventeenth",
    "Eighteenth", "Nineteenth", "Twentieth", "Twenty-first", "Twenty-second", "Twenty-third",
    "Twenty-fourth", "Twenty-fifth", "Twenty-sixth", "Twenty-seventh", "Twenty-eighth",
    "Twenty-ninth", "Thirtieth", "Thirty-first", "Thirty-second", "Thirty-third", "Thirty-fourth"
  ];

  /* Higher numbers win the day. Aligned with the Universal Norms table. */
  var RANK = {
    feria: 10,
    memorial: 20,
    privilegedWeekday: 30,
    feast: 40,
    sunday: 50,
    feastLord: 60,
    solemnity: 70,
    privileged: 90,
    triduum: 100
  };

  var RANK_NAME = {
    memorial: RANK.memorial,
    feast: RANK.feast,
    "feast-lord": RANK.feastLord,
    solemnity: RANK.solemnity
  };

  /* Fixed celebrations whose date does not move. Transferred solemnities are added separately. */
  var FIXED = [
    { md: "01-01", id: "mary-mother-of-god", rank: RANK.solemnity, name: "Mary, the Holy Mother of God" },
    { md: "02-02", id: "presentation-of-the-lord", rank: RANK.feastLord, name: "The Presentation of the Lord" },
    { md: "06-24", id: "nativity-of-john", rank: RANK.solemnity, name: "The Nativity of Saint John the Baptist" },
    { md: "06-29", id: "peter-and-paul", rank: RANK.solemnity, name: "Saints Peter and Paul, Apostles" },
    { md: "08-06", id: "transfiguration", rank: RANK.feastLord, name: "The Transfiguration of the Lord" },
    { md: "08-15", id: "assumption", rank: RANK.solemnity, name: "The Assumption of the Blessed Virgin Mary" },
    { md: "09-14", id: "holy-cross", rank: RANK.feastLord, name: "The Exaltation of the Holy Cross" },
    { md: "11-01", id: "all-saints", rank: RANK.solemnity, name: "All Saints" },
    { md: "11-02", id: "all-souls", rank: RANK.solemnity, name: "The Commemoration of All the Faithful Departed" },
    { md: "11-09", id: "lateran", rank: RANK.feastLord, name: "The Dedication of the Lateran Basilica" },
    { md: "12-26", id: "stephen", rank: RANK.feast, name: "Saint Stephen, the First Martyr" },
    { md: "12-27", id: "john-apostle", rank: RANK.feast, name: "Saint John, Apostle and Evangelist" },
    { md: "12-28", id: "holy-innocents", rank: RANK.feast, name: "The Holy Innocents, Martyrs" },
    { md: "01-25", id: "conversion-of-paul", rank: RANK.feast, name: "The Conversion of Saint Paul" },
    { md: "02-22", id: "chair-of-peter", rank: RANK.feast, name: "The Chair of Saint Peter" },
    { md: "04-25", id: "mark", rank: RANK.feast, name: "Saint Mark, Evangelist" },
    { md: "05-03", id: "philip-and-james", rank: RANK.feast, name: "Saints Philip and James, Apostles" },
    { md: "05-14", id: "matthias", rank: RANK.feast, name: "Saint Matthias, Apostle" },
    { md: "05-31", id: "visitation", rank: RANK.feast, name: "The Visitation of the Blessed Virgin Mary" },
    { md: "07-03", id: "thomas-apostle", rank: RANK.feast, name: "Saint Thomas, Apostle" },
    { md: "07-22", id: "mary-magdalene", rank: RANK.feast, name: "Saint Mary Magdalene" },
    { md: "07-25", id: "james", rank: RANK.feast, name: "Saint James, Apostle" },
    { md: "08-10", id: "lawrence", rank: RANK.feast, name: "Saint Lawrence, Deacon and Martyr" },
    { md: "08-24", id: "bartholomew", rank: RANK.feast, name: "Saint Bartholomew, Apostle" },
    { md: "09-08", id: "nativity-of-mary", rank: RANK.feast, name: "The Nativity of the Blessed Virgin Mary" },
    { md: "09-21", id: "matthew", rank: RANK.feast, name: "Saint Matthew, Apostle and Evangelist" },
    { md: "09-29", id: "archangels", rank: RANK.feast, name: "Saints Michael, Gabriel, and Raphael" },
    { md: "10-18", id: "luke", rank: RANK.feast, name: "Saint Luke, Evangelist" },
    { md: "10-28", id: "simon-and-jude", rank: RANK.feast, name: "Saints Simon and Jude, Apostles" },
    { md: "11-30", id: "andrew", rank: RANK.feast, name: "Saint Andrew, Apostle" },
    { md: "11-21", id: "presentation-of-mary", rank: RANK.memorial, name: "The Presentation of the Blessed Virgin Mary" },
    { md: "12-12", id: "guadalupe", rank: RANK.memorial, name: "Our Lady of Guadalupe" },
    { md: "10-04", id: "francis", rank: RANK.memorial, name: "Saint Francis of Assisi" }
  ];

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function format(date) {
    return date.y + "-" + pad(date.m) + "-" + pad(date.d);
  }

  function monthDay(date) {
    return pad(date.m) + "-" + pad(date.d);
  }

  function valid(y, m, d) {
    if (!y || m < 1 || m > 12 || d < 1 || d > 31) return false;
    var dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
  }

  function parseDate(value) {
    if (typeof value === "string") {
      var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
      if (!match) return null;
      var y = Number(match[1]);
      var m = Number(match[2]);
      var d = Number(match[3]);
      return valid(y, m, d) ? { y: y, m: m, d: d } : null;
    }
    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return { y: value.getFullYear(), m: value.getMonth() + 1, d: value.getDate() };
    }
    if (value && typeof value === "object" && valid(value.y, value.m, value.d)) {
      return { y: value.y, m: value.m, d: value.d };
    }
    return null;
  }

  function utc(date) {
    return Date.UTC(date.y, date.m - 1, date.d);
  }

  function fromUtc(ms) {
    var dt = new Date(ms);
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
  }

  function addDays(date, days) {
    return fromUtc(utc(date) + days * 86400000);
  }

  function daysBetween(a, b) {
    return Math.round((utc(b) - utc(a)) / 86400000);
  }

  function compare(a, b) {
    return utc(a) - utc(b);
  }

  function dow(date) {
    return new Date(utc(date)).getUTCDay();
  }

  function sundayOnOrBefore(date) {
    return addDays(date, -dow(date));
  }

  function ordinal(n) {
    return ORDINALS[n] || String(n);
  }

  /* Anonymous Gregorian computus. Month is 3 (March) or 4 (April). */
  function easter(year) {
    var a = mod(year, 19);
    var b = Math.floor(year / 100);
    var c = mod(year, 100);
    var d = Math.floor(b / 4);
    var e = mod(b, 4);
    var f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3);
    var h = mod(19 * a + b - d - g + 15, 30);
    var i = Math.floor(c / 4);
    var k = mod(c, 4);
    var l = mod(32 + 2 * e + 2 * i - h - k, 7);
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var month = Math.floor((h + l - 7 * m + 114) / 31);
    var day = ((h + l - 7 * m + 114) % 31) + 1;
    return { y: year, m: month, d: day };
  }

  /* Advent begins on the Sunday that leaves four Sundays before Christmas. */
  function adventSunday(christmasYear) {
    var christmas = { y: christmasYear, m: 12, d: 25 };
    var christmasDow = dow(christmas);
    var fourth = addDays(christmas, christmasDow === 0 ? -7 : -christmasDow);
    return addDays(fourth, -21);
  }

  function holyFamily(christmasYear) {
    var christmas = { y: christmasYear, m: 12, d: 25 };
    var christmasDow = dow(christmas);
    if (christmasDow === 0) return { y: christmasYear, m: 12, d: 30 };
    return addDays(christmas, 7 - christmasDow);
  }

  function epiphany(christmasYear, mode) {
    var jan6 = { y: christmasYear + 1, m: 1, d: 6 };
    if (mode !== "us") return jan6;
    var day = dow(jan6);
    if (day === 0) return jan6;
    if (day <= 4) return addDays(jan6, -day);
    return addDays(jan6, 7 - day);
  }

  function baptism(christmasYear, mode) {
    var feast = epiphany(christmasYear, mode);
    if (mode === "us" && feast.m === 1 && (feast.d === 7 || feast.d === 8)) return addDays(feast, 1);
    if (mode === "us") return addDays(feast, 7);
    var day = dow(feast);
    return addDays(feast, day === 0 ? 7 : 7 - day);
  }

  function ashWednesday(year) {
    return addDays(easter(year), -46);
  }

  function ascension(year, mode) {
    return addDays(easter(year), mode === "us" ? 42 : 39);
  }

  function pentecost(year) {
    return addDays(easter(year), 49);
  }

  function trinity(year) {
    return addDays(pentecost(year), 7);
  }

  function corpusChristi(year, mode) {
    return addDays(trinity(year), mode === "us" ? 7 : 4);
  }

  function sacredHeart(year) {
    return addDays(pentecost(year), 19);
  }

  function immaculateHeart(year) {
    return addDays(pentecost(year), 20);
  }

  function maryMotherOfTheChurch(year) {
    return addDays(pentecost(year), 1);
  }

  function christTheKing(christmasYear) {
    return addDays(adventSunday(christmasYear), -7);
  }

  /* Sunday of Lent, other than Palm Sunday: the following Monday.
     Any day of Holy Week: the Saturday before Palm Sunday. */
  function josephDate(year) {
    var native = { y: year, m: 3, d: 19 };
    var palm = addDays(easter(year), -7);
    var holySaturday = addDays(easter(year), -1);
    if (compare(native, palm) >= 0 && compare(native, holySaturday) <= 0) return addDays(palm, -1);
    if (dow(native) === 0) return addDays(native, 1);
    return native;
  }

  /* Sunday of Lent: the following Monday.
     Any day from Palm Sunday through the Second Sunday of Easter: the Monday after that Sunday. */
  function annunciationDate(year) {
    var native = { y: year, m: 3, d: 25 };
    var palm = addDays(easter(year), -7);
    var secondSunday = addDays(easter(year), 7);
    if (compare(native, palm) >= 0 && compare(native, secondSunday) <= 0) return addDays(secondSunday, 1);
    if (dow(native) === 0) return addDays(native, 1);
    return native;
  }

  /* A Sunday of Advent outranks the solemnity, which moves to Monday. */
  function immaculateDate(year) {
    var native = { y: year, m: 12, d: 8 };
    if (dow(native) === 0) return { y: year, m: 12, d: 9 };
    return native;
  }

  function weekOf(date, anchorSunday) {
    return daysBetween(anchorSunday, sundayOnOrBefore(date)) / 7 + 1;
  }

  function sundayName(week, tail) {
    return ordinal(week) + " Sunday " + tail;
  }

  function weekdayName(date, week, tail) {
    return WEEKDAYS[dow(date)] + " of the " + ordinal(week) + " Week " + tail;
  }

  function datedName(date, tail) {
    return WEEKDAYS[dow(date)] + ", " + MONTHS[date.m] + " " + date.d + ", " + tail;
  }

  function same(a, b) {
    return a.y === b.y && a.m === b.m && a.d === b.d;
  }

  function classify(date, mode) {
    var year = date.y;
    var advent = adventSunday(year);
    var christmas = { y: year, m: 12, d: 25 };
    var baptismThisJanuary = baptism(year - 1, mode);
    var previousChristmas = { y: year - 1, m: 12, d: 25 };

    if ((date.m === 12 && date.d >= 25) || (date.m === 1 && compare(date, baptismThisJanuary) <= 0)) {
      var start = date.m === 12 ? christmas : previousChristmas;
      var seasonDay = daysBetween(start, date);
      var octaveDay = seasonDay + 1;
      var epiphanyDate = epiphany(start.y, mode);
      var name;
      var id = null;
      var rank = RANK.feria;
      if (same(date, start)) {
        id = "christmas";
        name = "The Nativity of the Lord";
        rank = RANK.privileged;
      } else if (octaveDay <= 8) {
        name = ordinal(octaveDay) + " Day within the Octave of the Nativity of the Lord";
        rank = RANK.privilegedWeekday;
      } else {
        name = datedName(date, "Christmas Time");
      }
      return { season: "christmas", id: id, rank: rank, name: name, seasonDay: seasonDay };
    }

    if (compare(date, advent) >= 0 && compare(date, christmas) < 0) {
      var adventWeek = weekOf(date, advent);
      var seasonDayAdvent = daysBetween(advent, date);
      if (dow(date) === 0) {
        return {
          season: "advent",
          id: "advent-" + adventWeek,
          rank: RANK.privileged,
          name: sundayName(adventWeek, "of Advent"),
          seasonDay: seasonDayAdvent
        };
      }
      if (date.m === 12 && date.d >= 17) {
        return {
          season: "advent",
          id: "advent-" + date.d,
          rank: RANK.privilegedWeekday,
          name: "December " + date.d + ", Advent",
          seasonDay: seasonDayAdvent
        };
      }
      return {
        season: "advent",
        id: null,
        rank: RANK.feria,
        name: weekdayName(date, adventWeek, "of Advent"),
        seasonDay: seasonDayAdvent
      };
    }

    var ash = ashWednesday(year);
    var easterDate = easter(year);
    var palm = addDays(easterDate, -7);
    var holyThursday = addDays(easterDate, -3);
    var pentecostDate = addDays(easterDate, 49);

    if (compare(date, baptismThisJanuary) > 0 && compare(date, ash) < 0) {
      var firstOrdinary = addDays(baptismThisJanuary, 1);
      var earlyWeek = weekOf(date, baptism(year - 1, mode));
      /* Baptism on a Monday (United States, when Epiphany falls on 7 or 8 January)
         is not itself a Sunday anchor. Count the week from the Sunday of Epiphany. */
      if (dow(baptismThisJanuary) !== 0) earlyWeek = weekOf(date, sundayOnOrBefore(baptismThisJanuary));
      var earlyName = dow(date) === 0
        ? sundayName(earlyWeek, "in Ordinary Time")
        : weekdayName(date, earlyWeek, "in Ordinary Time");
      return {
        season: "ordinary",
        id: null,
        rank: dow(date) === 0 ? RANK.sunday : RANK.feria,
        name: earlyName,
        seasonDay: daysBetween(firstOrdinary, date)
      };
    }

    if (compare(date, ash) >= 0 && compare(date, pentecostDate) <= 0) {
      if (same(date, ash)) {
        return { season: "lent", id: "ash-wednesday", rank: RANK.privileged, name: "Ash Wednesday", seasonDay: 0 };
      }
      if (compare(date, palm) < 0) {
        var lent1 = addDays(ash, 4);
        var lentSeasonDay = daysBetween(ash, date);
        if (compare(date, lent1) < 0) {
          return {
            season: "lent",
            id: null,
            rank: RANK.privilegedWeekday,
            name: WEEKDAYS[dow(date)] + " after Ash Wednesday",
            seasonDay: lentSeasonDay
          };
        }
        var lentWeek = weekOf(date, lent1);
        if (dow(date) === 0) {
          return {
            season: "lent",
            id: "lent-" + lentWeek,
            rank: RANK.privileged,
            name: sundayName(lentWeek, "of Lent"),
            seasonDay: lentSeasonDay
          };
        }
        return {
          season: "lent",
          id: null,
          rank: RANK.privilegedWeekday,
          name: weekdayName(date, lentWeek, "of Lent"),
          seasonDay: lentSeasonDay
        };
      }
      if (same(date, palm)) {
        return {
          season: "holy-week",
          id: "palm-sunday",
          rank: RANK.privileged,
          name: "Palm Sunday of the Passion of the Lord",
          seasonDay: 0
        };
      }
      if (compare(date, holyThursday) < 0) {
        var holyNames = { 1: "holy-monday", 2: "holy-tuesday", 3: "holy-wednesday" };
        return {
          season: "holy-week",
          id: holyNames[dow(date)],
          rank: RANK.privileged,
          name: WEEKDAYS[dow(date)] + " of Holy Week",
          seasonDay: daysBetween(palm, date)
        };
      }
      if (compare(date, easterDate) < 0) {
        var triduumIds = { 4: "holy-thursday", 5: "good-friday", 6: "holy-saturday" };
        var triduumNames = {
          4: "Thursday of the Lord's Supper",
          5: "Friday of the Passion of the Lord",
          6: "Holy Saturday"
        };
        return {
          season: "triduum",
          id: triduumIds[dow(date)],
          rank: RANK.triduum,
          name: triduumNames[dow(date)],
          seasonDay: daysBetween(holyThursday, date)
        };
      }
      var easterDay = daysBetween(easterDate, date);
      var easterWeek = Math.floor(easterDay / 7) + 1;
      if (easterDay === 0) {
        return { season: "easter", id: "easter", rank: RANK.privileged, name: "Easter Sunday of the Resurrection of the Lord", seasonDay: 0 };
      }
      if (easterDay < 7) {
        var octaveIds = ["", "easter-monday", "easter-tuesday", "easter-wednesday", "easter-thursday", "easter-friday", "easter-saturday"];
        return {
          season: "easter",
          id: octaveIds[easterDay],
          rank: RANK.privileged,
          name: WEEKDAYS[dow(date)] + " within the Octave of Easter",
          seasonDay: easterDay
        };
      }
      if (dow(date) === 0) {
        var sundayId = easterWeek === 8 ? "pentecost" : "easter-" + easterWeek;
        var sundayLabel = easterWeek === 8 ? "Pentecost Sunday" : sundayName(easterWeek, "of Easter");
        if (mode === "us" && easterWeek === 7) {
          sundayId = "ascension";
          sundayLabel = "The Ascension of the Lord";
        }
        return { season: "easter", id: sundayId, rank: RANK.privileged, name: sundayLabel, seasonDay: easterDay };
      }
      return {
        season: "easter",
        id: null,
        rank: RANK.feria,
        name: weekdayName(date, easterWeek, "of Easter"),
        seasonDay: easterDay
      };
    }

    var king = christTheKing(year);
    var lateStart = addDays(pentecostDate, 1);
    var lateWeek = 34 - daysBetween(sundayOnOrBefore(date), king) / 7;
    var lateName = dow(date) === 0
      ? sundayName(lateWeek, "in Ordinary Time")
      : weekdayName(date, lateWeek, "in Ordinary Time");
    return {
      season: "ordinary",
      id: null,
      rank: dow(date) === 0 ? RANK.sunday : RANK.feria,
      name: lateName,
      seasonDay: daysBetween(lateStart, date)
    };
  }

  function candidate(id, rank, name) {
    return { id: id, rank: rank, name: name };
  }

  function pushIf(list, date, target, item) {
    if (target && same(date, target)) list.push(item);
  }

  function observe(value, options) {
    var date = parseDate(value);
    if (!date) return null;
    options = options || {};
    var mode = options.calendar === "us" ? "us" : "roman";
    var base = classify(date, mode);
    var list = [candidate(base.id, base.rank, base.name)];
    var year = date.y;

    pushIf(list, date, holyFamily(year), candidate("holy-family", RANK.feastLord, "The Holy Family of Jesus, Mary, and Joseph"));
    pushIf(list, date, holyFamily(year - 1), candidate("holy-family", RANK.feastLord, "The Holy Family of Jesus, Mary, and Joseph"));
    pushIf(list, date, epiphany(year, mode), candidate("epiphany", RANK.privileged, "The Epiphany of the Lord"));
    pushIf(list, date, epiphany(year - 1, mode), candidate("epiphany", RANK.privileged, "The Epiphany of the Lord"));
    pushIf(list, date, baptism(year, mode), candidate("baptism-of-the-lord", RANK.feastLord, "The Baptism of the Lord"));
    pushIf(list, date, baptism(year - 1, mode), candidate("baptism-of-the-lord", RANK.feastLord, "The Baptism of the Lord"));
    if (mode !== "us") {
      pushIf(list, date, ascension(year, mode), candidate("ascension", RANK.privileged, "The Ascension of the Lord"));
    }
    pushIf(list, date, trinity(year), candidate("trinity", RANK.solemnity, "The Most Holy Trinity"));
    pushIf(list, date, corpusChristi(year, mode), candidate("corpus-christi", RANK.solemnity, "The Most Holy Body and Blood of Christ"));
    pushIf(list, date, sacredHeart(year), candidate("sacred-heart", RANK.solemnity, "The Most Sacred Heart of Jesus"));
    pushIf(list, date, immaculateHeart(year), candidate("immaculate-heart", RANK.memorial, "The Immaculate Heart of the Blessed Virgin Mary"));
    pushIf(list, date, maryMotherOfTheChurch(year), candidate("mary-mother-of-the-church", RANK.memorial, "The Blessed Virgin Mary, Mother of the Church"));
    pushIf(list, date, christTheKing(year), candidate("christ-the-king", RANK.solemnity, "Our Lord Jesus Christ, King of the Universe"));
    pushIf(list, date, josephDate(year), candidate("joseph", RANK.solemnity, "Saint Joseph, Spouse of the Blessed Virgin Mary"));
    pushIf(list, date, annunciationDate(year), candidate("annunciation", RANK.solemnity, "The Annunciation of the Lord"));
    pushIf(list, date, immaculateDate(year), candidate("immaculate-conception", RANK.solemnity, "The Immaculate Conception of the Blessed Virgin Mary"));

    var md = monthDay(date);
    var i;
    for (i = 0; i < FIXED.length; i += 1) {
      if (FIXED[i].md === md) list.push(candidate(FIXED[i].id, FIXED[i].rank, FIXED[i].name));
    }

    var extras = options.days || {};
    var extra = extras[md];
    if (extra && extra.id) {
      var extraRank = RANK_NAME[extra.rank] || RANK.memorial;
      list.push(candidate(String(extra.id), extraRank, extra.name || String(extra.id)));
    }

    var winner = list[0];
    for (i = 1; i < list.length; i += 1) {
      if (list[i].rank > winner.rank) winner = list[i];
    }

    return {
      id: winner.id || null,
      name: winner.name,
      feriaName: base.name,
      season: base.season,
      seasonDay: base.seasonDay,
      rank: winner.rank,
      calendar: mode,
      date: format(date)
    };
  }

  return {
    observe: observe,
    easter: easter,
    parseDate: parseDate,
    format: format,
    adventSunday: adventSunday,
    ashWednesday: ashWednesday,
    ascension: ascension,
    pentecost: pentecost,
    corpusChristi: corpusChristi,
    sacredHeart: sacredHeart,
    christTheKing: christTheKing,
    josephDate: josephDate,
    annunciationDate: annunciationDate,
    immaculateDate: immaculateDate,
    epiphany: epiphany,
    baptism: baptism,
    holyFamily: holyFamily,
    RANK: RANK
  };
});
