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

  function safeImage(value) {
    var raw = asString(value).trim();
    if (!raw || raw.indexOf('\\') !== -1 || raw.indexOf('..') !== -1) return '';
    if (raw.charAt(0) === '/') {
      if (!/^\/news\/img\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:jpe?g|png|gif|webp)$/i.test(raw)) return '';
      return raw;
    }
    try {
      var url = new URL(raw);
      if (url.protocol !== 'https:') return '';
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

  function renderFoldedEntry(entry) {
    var article = document.createElement('article');
    article.className = 'edition edition--fold';
    var slug = asString(entry.id).trim().replace(/[^A-Za-z0-9_-]/g, '');
    if (slug) article.id = 'edition-' + slug;

    var details = document.createElement('details');
    var summary = document.createElement('summary');
    var heading = document.createElement('h3');
    heading.textContent = headingText(entry);
    summary.appendChild(heading);
    details.appendChild(summary);

    var items = Array.isArray(entry.items) ? entry.items : [];
    var list = document.createElement('ul');
    list.className = 'news-items';
    items.forEach(function (item) {
      var rendered = renderItem(item);
      if (rendered) list.appendChild(rendered);
    });
    if (list.childNodes.length) details.appendChild(list);
    article.appendChild(details);
    return article;
  }

  function statusParagraph(text) {
    var p = document.createElement('p');
    p.className = 'news-status';
    p.textContent = text;
    return p;
  }

  /* One quiet announcement for screen readers, instead of reading the whole feed aloud */
  function announce(text) {
    var nodes = document.querySelectorAll('[data-news-status]');
    Array.prototype.forEach.call(nodes, function (node) { node.textContent = text; });
  }

  function showStatus(root, text) {
    root.textContent = '';
    root.appendChild(statusParagraph(text));
    root.setAttribute('aria-busy', 'false');
    announce(text);
  }

  function mount(root, entries) {
    var limit = Number(root.getAttribute('data-limit'));
    var foldAfter = Number(root.getAttribute('data-fold'));
    var shown = entries;
    if (limit > 0) shown = entries.slice(0, limit);
    var level = root.getAttribute('data-heading') === 'h2' ? 'h2' : 'h3';
    root.textContent = '';
    if (!shown.length) {
      root.appendChild(statusParagraph('No church news yet.'));
    } else {
      shown.forEach(function (entry, index) {
        if (foldAfter > 0 && index >= foldAfter) root.appendChild(renderFoldedEntry(entry));
        else root.appendChild(renderEntry(entry, level));
      });
    }
    root.setAttribute('aria-busy', 'false');
    announce(shown.length ? 'Church news loaded.' : 'No church news yet.');
  }

  function cacheUrl(path) {
    var bucket = Math.floor(Date.now() / MINUTE);
    return path + (path.indexOf('?') === -1 ? '?' : '&') + 'v=' + bucket;
  }

  function renderToday(root, data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return;
    var kind = asString(data.kind).trim();
    var title = asString(data.title).trim();
    var subtitle = asString(data.subtitle).trim();
    var text = asString(data.text);
    var credit = asString(data.credit).trim();
    var image = safeImage(data.image);
    var alt = asString(data.imageAlt).trim() || title || kind || 'Illustration';
    var source = safeUrl(data.sourceUrl);
    if (!kind && !title && !subtitle && !text.trim() && !image) return;

    root.textContent = '';

    if (image) {
      var figure = document.createElement('figure');
      figure.className = 'today__figure';
      var img = document.createElement('img');
      img.className = 'today__photo';
      img.src = image;
      img.alt = alt;
      img.decoding = 'async';
      img.addEventListener('error', function () {
        if (figure.parentNode) figure.remove();
        if (!root.querySelector('.today__words')) root.hidden = true;
      });
      figure.appendChild(img);
      if (credit) {
        var caption = document.createElement('figcaption');
        caption.className = 'today__credit';
        if (source) {
          var link = document.createElement('a');
          link.href = source;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = credit;
          caption.appendChild(link);
        } else {
          caption.textContent = credit;
        }
        figure.appendChild(caption);
      }
      root.appendChild(figure);
    }

    var words = document.createElement('div');
    words.className = 'today__words';
    /* The kind leads the heading: "Saint of the Day: Saint Jude" */
    var heading = kind && title ? kind + ': ' + title : (title || kind);
    if (heading) {
      var titleEl = document.createElement('h2');
      titleEl.className = 'today__title';
      titleEl.textContent = heading;
      words.appendChild(titleEl);
    }
    if (subtitle) {
      var subtitleEl = document.createElement('p');
      subtitleEl.className = 'today__subtitle';
      subtitleEl.textContent = subtitle;
      words.appendChild(subtitleEl);
    }
    if (text.trim()) {
      var textEl = document.createElement('p');
      textEl.textContent = text;
      words.appendChild(textEl);
    }
    if (words.childNodes.length) root.appendChild(words);
    else if (!image) return;

    root.hidden = false;
  }

  function readJson(path) {
    return fetch(cacheUrl(path), { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) throw new Error('status');
      return response.text();
    }).then(function (raw) {
      return JSON.parse(raw.replace(/^\uFEFF/, ''));
    });
  }

  function initNews() {
    var nodes = document.querySelectorAll('[data-church-news]');
    if (!nodes.length) return;
    var path = nodes[0].getAttribute('data-feed') || 'news/feed.json';
    readJson(path).then(function (data) {
      var entries = prepare(data);
      if (!entries) throw new Error('shape');
      Array.prototype.forEach.call(nodes, function (node) { mount(node, entries); });
    }).catch(function () {
      Array.prototype.forEach.call(nodes, function (node) {
        showStatus(node, 'Church news could not be loaded just now.');
      });
    });
  }

  function initToday() {
    var nodes = document.querySelectorAll('[data-today]');
    if (!nodes.length) return;
    var path = nodes[0].getAttribute('data-feed') || 'news/today.json';
    readJson(path).then(function (data) {
      Array.prototype.forEach.call(nodes, function (node) { renderToday(node, data); });
    }).catch(function () {
      Array.prototype.forEach.call(nodes, function (node) { node.hidden = true; });
    });
  }

  function init() {
    initNews();
    initToday();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
