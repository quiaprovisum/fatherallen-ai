(function () {
  var MINUTE = 60 * 1000;

  function asString(value) {
    return typeof value === 'string' ? value : '';
  }

  function safeUrl(value) {
    var raw = asString(value).trim();
    if (!raw) return '';
    try {
      var url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return url.href;
    } catch (err) {
      return '';
    }
  }

  function headingText(entry) {
    var date = asString(entry.date).trim();
    var when = date;
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (match) {
      var year = Number(match[1]);
      var month = Number(match[2]);
      var day = Number(match[3]);
      var parsed = new Date(year, month - 1, day);
      if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) {
        when = parsed.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    var edition = asString(entry.edition).trim();
    if (when && edition) return when + ' \u00b7 ' + edition;
    return when || edition || 'Church News';
  }

  function prepare(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.entries)) return null;
    var seen = Object.create(null);
    var rows = [];
    data.entries.forEach(function (entry, index) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
      var id = asString(entry.id).trim();
      if (id) {
        if (seen[id]) return;
        seen[id] = true;
      }
      rows.push({ entry: entry, index: index });
    });
    rows.sort(function (a, b) {
      var left = asString(a.entry.date).trim();
      var right = asString(b.entry.date).trim();
      if (left !== right) return left < right ? 1 : -1;
      return a.index - b.index;
    });
    return rows.map(function (row) { return row.entry; });
  }

  function renderItem(item) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    var text = asString(item.text);
    var links = Array.isArray(item.links) ? item.links : [];
    var anchors = [];
    links.forEach(function (link) {
      if (!link || typeof link !== 'object') return;
      var href = safeUrl(link.url);
      if (!href) return;
      var label = asString(link.label).trim() || href;
      anchors.push({ href: href, label: label });
    });
    if (!text.trim() && !anchors.length) return null;

    var li = document.createElement('li');
    if (text.trim()) {
      var paragraph = document.createElement('p');
      paragraph.textContent = text;
      li.appendChild(paragraph);
    }
    if (anchors.length) {
      var sources = document.createElement('p');
      sources.className = 'news-sources';
      anchors.forEach(function (anchor, index) {
        if (index > 0) {
          var sep = document.createElement('span');
          sep.className = 'news-sep';
          sep.setAttribute('aria-hidden', 'true');
          sep.textContent = '\u00b7';
          sources.appendChild(sep);
        }
        var a = document.createElement('a');
        a.className = 'textlink';
        a.href = anchor.href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = anchor.label;
        a.setAttribute('aria-label', anchor.label + ' (opens in a new tab)');
        sources.appendChild(a);
      });
      li.appendChild(sources);
    }
    return li;
  }

  function renderEntry(entry, level) {
    var article = document.createElement('article');
    article.className = 'edition';
    var slug = asString(entry.id).trim().replace(/[^A-Za-z0-9_-]/g, '');
    if (slug) article.id = 'edition-' + slug;

    var heading = document.createElement(level === 'h2' ? 'h2' : 'h3');
    heading.textContent = headingText(entry);
    article.appendChild(heading);

    var items = Array.isArray(entry.items) ? entry.items : [];
    var list = document.createElement('ul');
    list.className = 'news-items';
    items.forEach(function (item) {
      var rendered = renderItem(item);
      if (rendered) list.appendChild(rendered);
    });
    if (list.childNodes.length) article.appendChild(list);
    return article;
  }

  function statusParagraph(text) {
    var p = document.createElement('p');
    p.className = 'news-status';
    p.textContent = text;
    return p;
  }

  function showStatus(root, text) {
    root.textContent = '';
    root.appendChild(statusParagraph(text));
    root.setAttribute('aria-busy', 'false');
  }

  function mount(root, entries) {
    var limit = Number(root.getAttribute('data-limit'));
    var shown = entries;
    if (limit > 0) shown = entries.slice(0, limit);
    var level = root.getAttribute('data-heading') === 'h2' ? 'h2' : 'h3';
    root.textContent = '';
    if (!shown.length) {
      root.appendChild(statusParagraph('No church news yet.'));
    } else {
      shown.forEach(function (entry) {
        root.appendChild(renderEntry(entry, level));
      });
    }
    root.setAttribute('aria-busy', 'false');
  }

  function feedUrl(root) {
    var path = root.getAttribute('data-feed') || 'news/feed.json';
    var bucket = Math.floor(Date.now() / MINUTE);
    return path + (path.indexOf('?') === -1 ? '?' : '&') + 'v=' + bucket;
  }

  function init() {
    var nodes = document.querySelectorAll('[data-church-news]');
    if (!nodes.length) return;
    var root = nodes[0];
    fetch(feedUrl(root), { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('status');
        return response.text();
      })
      .then(function (raw) {
        var data = JSON.parse(raw.replace(/^\uFEFF/, ''));
        var entries = prepare(data);
        if (!entries) throw new Error('shape');
        Array.prototype.forEach.call(nodes, function (node) { mount(node, entries); });
      })
      .catch(function () {
        Array.prototype.forEach.call(nodes, function (node) {
          showStatus(node, 'Church news could not be loaded just now.');
        });
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
