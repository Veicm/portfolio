/* github-selected-repos (light DOM, no Shadow)
   - Full control: all markup lives in the page DOM
   - Usage:
     <script type="module" src="/components/github-selected-repos.js"></script>
     <github-selected-repos repos="Veicm/portfolio,octocat/Hello-World" class-prefix="ghr-"></github-selected-repos>

   - Attributes:
     repos: comma separated owner/repo
     class-prefix: optional prefix for classes (default: 'ghr-')
     proxy, cache-ttl work like before
*/

class GithubSelectedReposLight extends HTMLElement {
  constructor() {
    super();
    // we will render into this (light DOM)
    this.state = { items: [], loading: true };
  }

  connectedCallback() {
    this.proxy = this.getAttribute("proxy") || null;
    this.cacheTtl = parseInt(this.getAttribute("cache-ttl") || "300", 10);
    this.classPrefix = this.getAttribute("class-prefix") || "ghr-";
    this.itemsConfig = this.parseConfig();
    if (!this.itemsConfig.length) {
      this.innerHTML = `<div class="${this.classPrefix}msg">No repos configured.</div>`;
      return;
    }
    // placeholder while loading
    this.renderLoading();
    this.loadAll();
  }

  parseConfig() {
    const attr = this.getAttribute("repos");
    if (attr && attr.trim()) {
      return attr
        .split(",")
        .map((s) => ({ full: s.trim() }))
        .filter(Boolean);
    }
    const childScript = Array.from(this.children).find(
      (ch) => ch.tagName === "SCRIPT" && ch.type === "application/json"
    );
    if (childScript) {
      try {
        const parsed = JSON.parse(childScript.textContent);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => (typeof item === "string" ? { full: item } : item))
            .filter(Boolean);
        }
      } catch (e) {
        console.error("Invalid JSON in github-selected-repos child", e);
      }
    }
    return [];
  }

  cacheKey(full) {
    return `gh_selected_repo_${full.replace(/\//g, "__")}`;
  }

  async loadAll() {
    const results = [];
    for (const cfg of this.itemsConfig) {
      const full = cfg.full;
      if (!full || !full.includes("/")) {
        results.push({ cfg, error: "Invalid repo identifier" });
        continue;
      }
      const key = this.cacheKey(full);
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.ts < this.cacheTtl * 1000) {
            results.push({ cfg, data: parsed.data });
            continue;
          }
        } catch {}
      }
      try {
        const data = await this.fetchRepo(full);
        const mapped = {
          full,
          name: data.name,
          html_url: data.html_url,
          description: data.description,
          language: data.language,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          updated_at: data.updated_at,
          homepage: data.homepage,
        };
        localStorage.setItem(
          key,
          JSON.stringify({ ts: Date.now(), data: mapped })
        );
        results.push({ cfg, data: mapped });
      } catch (err) {
        results.push({ cfg, error: err.message || String(err) });
      }
    }
    this.state.items = results;
    this.state.loading = false;
    this.render(); // final render into light DOM
  }

  buildApiUrl(full) {
    if (this.proxy) return `${this.proxy.replace(/\/$/, "")}/repos/${full}`;
    return `https://api.github.com/repos/${full}`;
  }

  buildHeaders() {
    return { Accept: "application/vnd.github.v3+json" };
  }

  async fetchRepo(full) {
    const url = this.buildApiUrl(full);
    const res = await fetch(url, { headers: this.buildHeaders() });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    return res.json();
  }

  renderLoading() {
    this.innerHTML = `<div class="${this.classPrefix}container ${this.classPrefix}loading">Loading selected repos…</div>`;
  }

  render() {
    const items = this.state.items || [];
    const parts = items.map((it) => this.renderItem(it)).join("");
    this.innerHTML = `<div class="${this.classPrefix}container">${parts}</div>`;
  }

  renderItem(it) {
    const cfg = it.cfg || {};
    if (it.error) {
      return `<div class="${this.classPrefix}item ${
        this.classPrefix
      }error" data-repo="${this.escape(cfg.full || "")}">
                <div class="${this.classPrefix}title">${this.escape(
        cfg.full || "unknown"
      )}</div>
                <div class="${this.classPrefix}errmsg">${this.escape(
        it.error
      )}</div>
                </div>`;
    }
    const d = it.data;
    const label = cfg.label || d.name || d.full;
    const desc = cfg.overrideDescription ?? d.description ?? "";

    return `
        <a class="${this.classPrefix}item"
        href="${this.escape(d.html_url)}"
        target="_blank"
        rel="noopener noreferrer"
        data-repo="${this.escape(d.full)}">
        <div class="${this.classPrefix}head">
            <div class="${this.classPrefix}title">${this.escape(label)}</div>
            <div class="${this.classPrefix}meta">
            <span class="${this.classPrefix}lang">${this.escape(
      d.language || ""
    )}</span>
            <span class="${this.classPrefix}stars">★ ${
      d.stargazers_count
    }</span>
            <span class="${this.classPrefix}forks">forks ${d.forks_count}</span>
            </div>
        </div>
        <p class="${this.classPrefix}desc">${this.escape(desc)}</p>
        <div class="${this.classPrefix}foot">
            <span class="${this.classPrefix}updated">
            Updated ${new Date(d.updated_at).toLocaleDateString()}
            </span>
        </div>
    </a>`;
  }

  escape(s) {
    if (!s) return "";
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[c])
    );
  }
}

customElements.define("github-selected-repos-light", GithubSelectedReposLight);
