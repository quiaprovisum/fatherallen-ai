/* Chooses the day's sacred art from art/art.json and the Roman calendar. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FatherAllenArtwork = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function calendarApi() {
    return typeof globalThis !== "undefined" ? globalThis.FatherAllenCalendar : null;
  }

  function workById(data, id) {
    if (!id || !data || !data.works) return null;
    var work = data.works[id];
    if (!work || typeof work.image !== "string" || !work.image) return null;
    return work;
  }

  function poolFor(data, season) {
    var seasons = data.seasons || {};
    var list = seasons[season] || seasons.ordinary || [];
    var usable = [];
    list.forEach(function (id) {
      if (workById(data, id)) usable.push(id);
    });
    if (!usable.length && season !== "ordinary") {
      (seasons.ordinary || []).forEach(function (id) {
        if (workById(data, id)) usable.push(id);
      });
    }
    return usable;
  }

  function select(value, data) {
    var calendar = calendarApi();
    if (!calendar || !data) return null;
    var observed = calendar.observe(value, {
      calendar: data.calendar === "us" ? "us" : "roman",
      days: data.days || {}
    });
    if (!observed) return null;

    var entry = observed.id && data.feasts ? data.feasts[observed.id] : null;
    var monthDay = observed.date.slice(5);
    var extra = data.days && data.days[monthDay];
    if ((!entry || !entry.work) && extra && extra.id === observed.id && extra.work) entry = extra;

    var work = entry && workById(data, entry.work);
    var matched = false;
    var relation = observed.feriaName || observed.name;
    if (work) {
      matched = true;
      relation = entry.relation || observed.name;
    } else {
      var pool = poolFor(data, observed.season);
      var pick = pool.length ? pool[Math.abs(observed.seasonDay) % pool.length] : data.fallback;
      work = workById(data, pick) || workById(data, data.fallback);
    }
    if (!work) return null;
    return {
      date: observed.date,
      id: observed.id,
      name: observed.name,
      season: observed.season,
      matched: matched,
      relation: relation,
      work: work
    };
  }

  function text(node, value) {
    if (!node) return;
    var clean = value ? String(value) : "";
    node.textContent = clean;
    node.hidden = !clean;
  }

  function paint(selection) {
    var figure = document.getElementById("artwork");
    var image = document.getElementById("artwork-image");
    if (!figure || !image || !selection || !selection.work) return;
    var work = selection.work;
    image.alt = work.alt || work.title || "Sacred art";
    if (work.width) image.width = work.width;
    if (work.height) image.height = work.height;
    image.src = work.image;
    text(document.getElementById("artwork-title"), work.title || "");
    var by = [work.artist, work.year].filter(Boolean).join(", ");
    text(document.getElementById("artwork-by"), by);
    text(document.getElementById("artwork-relation"), selection.relation || "");
    var credit = document.getElementById("artwork-credit");
    if (credit) {
      credit.textContent = "";
      credit.hidden = false;
      if (work.sourceUrl) {
        var link = document.createElement("a");
        link.href = work.sourceUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = work.credit || "Source";
        credit.appendChild(link);
      } else {
        credit.textContent = work.credit || "";
        credit.hidden = !credit.textContent;
      }
    }
    figure.hidden = false;
  }

  function readDate() {
    var params;
    try { params = new URLSearchParams(window.location.search); }
    catch (err) { params = null; }
    var query = params && (params.get("art") || params.get("date"));
    var calendar = calendarApi();
    if (query && calendar && calendar.parseDate(query)) return query;
    var now = new Date();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    return now.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
  }

  function showFallback(data) {
    var work = data && workById(data, data.fallback);
    if (!work) return;
    paint({
      relation: "Sacred art for the liturgical year",
      work: work
    });
  }

  function init() {
    var figure = document.getElementById("artwork");
    if (!figure) return;
    var image = document.getElementById("artwork-image");
    var dataPromise = fetch("art/art.json", { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("status");
      return response.json();
    });
    dataPromise.then(function (data) {
      var selection = select(readDate(), data);
      if (!selection) {
        showFallback(data);
        return;
      }
      if (image) {
        image.addEventListener("error", function once() {
          image.removeEventListener("error", once);
          if (selection.work && data.fallback && selection.work !== data.works[data.fallback]) {
            showFallback(data);
          }
        });
      }
      paint(selection);
    }).catch(function () {
      figure.hidden = true;
    });
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }

  return { select: select, init: init };
});
