const DATA = window.PUBLIC_DASHBOARD_DATA || {};
const state = {
  activeView: "achievements",
  filters: { search: "", type: "", online: "", public: "" },
};
const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  renderAll();
  createIcons();
});

function cacheElements() {
  Object.assign(els, {
    sourceSummary: document.querySelector("#sourceSummary"),
    headlineMeta: document.querySelector("#headlineMeta"),
    heroOverview: document.querySelector("#heroOverview"),
    metricsGrid: document.querySelector("#metricsGrid"),
    smartSummary: document.querySelector("#smartSummary"),
    searchInput: document.querySelector("#searchInput"),
    typeFilter: document.querySelector("#typeFilter"),
    onlineFilter: document.querySelector("#onlineFilter"),
    publicFilter: document.querySelector("#publicFilter"),
    resetFiltersButton: document.querySelector("#resetFiltersButton"),
    achievementTable: document.querySelector("#achievementTable"),
    achievementCards: document.querySelector("#achievementCards"),
    achievementCount: document.querySelector("#achievementCount"),
    typeChart: document.querySelector("#typeChart"),
    gradeChart: document.querySelector("#gradeChart"),
    levelChart: document.querySelector("#levelChart"),
    onlineDonut: document.querySelector("#onlineDonut"),
    publicityDonut: document.querySelector("#publicityDonut"),
    storyWall: document.querySelector("#storyWall"),
    storyCount: document.querySelector("#storyCount"),
    experienceList: document.querySelector("#experienceList"),
    experienceCount: document.querySelector("#experienceCount"),
    publicityFeed: document.querySelector("#publicityFeed"),
    publicityCount: document.querySelector("#publicityCount"),
    promoWorkbench: document.querySelector("#promoWorkbench"),
    readinessList: document.querySelector("#readinessList"),
    studentGrid: document.querySelector("#studentGrid"),
    studentCount: document.querySelector("#studentCount"),
    schemaGrid: document.querySelector("#schemaGrid"),
    toast: document.querySelector("#toast"),
  });
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      setView(button.dataset.view);
      renderAll();
      createIcons();
    });
  });
  els.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    renderDataViews();
  });
  [
    [els.typeFilter, "type"],
    [els.onlineFilter, "online"],
    [els.publicFilter, "public"],
  ].forEach(([select, key]) => {
    select.addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      renderDataViews();
    });
  });
  els.resetFiltersButton.addEventListener("click", () => {
    state.filters = { search: "", type: "", online: "", public: "" };
    els.searchInput.value = "";
    renderAll();
    notify("筛选已重置");
  });
}

function renderAll() {
  renderShell();
  renderTopOverview();
  renderFilters();
  renderMetrics();
  renderSmartSummary();
  renderDataViews();
  renderSchema();
  createIcons();
}

function renderShell() {
  const stats = DATA.stats || {};
  els.sourceSummary.textContent = `公开版 · ${stats.students || 0} 名学生 · ${stats.achievements || 0} 项成果`;
  els.headlineMeta.textContent = `${stats.students || 0} 名学生，${stats.achievements || 0} 项成果，${stats.experiences || 0} 条学习体会。公开版不包含全量数据下载。`;
}

function renderTopOverview() {
  const stats = DATA.stats || {};
  const items = [
    { label: "学生", value: stats.students || 0 },
    { label: "成果", value: stats.achievements || 0 },
    { label: "可宣传", value: stats.publicity || 0 },
    { label: "已上线", value: stats.online || 0 },
  ];
  els.heroOverview.innerHTML = items.map((item) => `
    <div class="hero-stat"><strong>${item.value}</strong><span>${escapeHtml(item.label)}</span></div>
  `).join("");
}

function renderFilters() {
  syncSelect(els.typeFilter, "全部类型", (DATA.distributions?.type || []).map((item) => item.label), state.filters.type);
  syncSelect(els.onlineFilter, "全部上线状态", (DATA.distributions?.online || []).map((item) => item.label), state.filters.online);
  syncSelect(els.publicFilter, "全部公开状态", ["是", "需确认", "否"], state.filters.public);
  els.searchInput.value = state.filters.search;
}

function syncSelect(select, placeholder, values, current) {
  select.innerHTML = [`<option value="">${escapeHtml(placeholder)}</option>`]
    .concat(values.filter(Boolean).map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");
  select.value = values.includes(current) ? current : "";
}

function renderMetrics() {
  const stats = DATA.stats || {};
  const metrics = [
    { label: "学生", value: stats.students || 0, note: "高匿名汇总", icon: "users-round", color: "var(--sias-blue)" },
    { label: "成果", value: stats.achievements || 0, note: "总量统计", icon: "trophy", color: "var(--sias-red)" },
    { label: "数字作品", value: stats.digitalWorks || 0, note: "作品与原型", icon: "monitor-play", color: "var(--blue)" },
    { label: "已上线", value: stats.online || 0, note: "作品状态", icon: "rocket", color: "var(--green)" },
    { label: "可宣传", value: stats.publicity || 0, note: "成果授权", icon: "megaphone", color: "var(--gold)" },
    { label: "精选展示", value: (DATA.highlights || []).length, note: "非全量数据", icon: "shield-check", color: "var(--sias-blue-dark)" },
  ];
  els.metricsGrid.innerHTML = metrics.map((metric) => `
    <article class="metric-card">
      <div class="metric-top"><span>${escapeHtml(metric.label)}</span><span class="metric-icon" style="color: ${metric.color}"><i data-lucide="${metric.icon}"></i></span></div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-note">${escapeHtml(metric.note)}</div>
    </article>
  `).join("");
}

function renderSmartSummary() {
  const stats = DATA.stats || {};
  const topType = (DATA.distributions?.type || [])[0];
  els.smartSummary.innerHTML = `
    <div class="summary-main">
      <span class="section-kicker">公开版数据结论</span>
      <p>当前展示<strong>${stats.students || 0} 名学生</strong>、<strong>${stats.achievements || 0} 项成果</strong>的汇总统计，其中 <strong class="red">${stats.publicity || 0} 项可公开宣传</strong>、<strong class="green">${stats.online || 0} 项作品已上线</strong>。${topType ? `成果最集中在<strong>「${escapeHtml(topType.label)}」${topType.count} 项</strong>。` : ""}页面只包含汇总与精选内容，不提供全量行级数据。</p>
    </div>
    <div class="summary-chips">
      <span>不含学生名单</span><span>不含全量表格</span><span>不含外部链接</span><span>禁止索引</span>
    </div>
  `;
}

function renderDataViews() {
  renderAchievements();
  renderStoryWall();
  renderExperiences();
  renderPublicity();
  renderPublicNotice();
}

function getFilteredHighlights() {
  const query = state.filters.search.trim().toLowerCase();
  return (DATA.highlights || []).filter((item) => {
    if (query && !Object.values(item).some((value) => String(value || "").toLowerCase().includes(query))) return false;
    if (state.filters.type && item.type !== state.filters.type) return false;
    if (state.filters.online && item.online !== state.filters.online) return false;
    if (state.filters.public && !matchesOption(item.publicity, state.filters.public)) return false;
    return true;
  });
}

function renderAchievements() {
  const rows = getFilteredHighlights();
  const stats = DATA.stats || {};
  els.achievementCount.textContent = `${rows.length}/${stats.achievements || 0} 项`;
  els.achievementTable.innerHTML = rows.length ? rows.map((item) => `
    <tr>
      <td><strong>匿名来源</strong><br><span class="muted-cell">公开精选</span></td>
      <td>${escapeHtml(item.type || "未填写")}</td>
      <td><strong>${escapeHtml(item.name || "未命名成果")}</strong><br><span class="muted-cell">${escapeHtml(item.project || "项目名已泛化")}</span></td>
      <td>${escapeHtml(item.level || "未填写")}</td>
      <td>${escapeHtml(item.role || "未填写")}</td>
      <td>${escapeHtml(item.date || "未填写")}</td>
      <td>${statusTags(item.online, item.publicity)}</td>
      <td>${materialTags(item)}</td>
    </tr>
  `).join("") : `<tr><td colspan="8">${templateEmptyState("暂无公开精选成果")}</td></tr>`;
  els.achievementCards.innerHTML = rows.length ? rows.map((item) => achievementCard(item)).join("") : templateEmptyState("暂无公开精选成果");
  renderBars(els.typeChart, DATA.distributions?.type || [], "暂无类型分布");
  renderBars(els.gradeChart, DATA.distributions?.online || [], "暂无上线状态");
  renderBars(els.levelChart, DATA.distributions?.level || [], "暂无级别分布");
  renderDonut(els.onlineDonut, stats.online || 0, stats.achievements || 0, "已上线");
  renderDonut(els.publicityDonut, stats.publicity || 0, stats.achievements || 0, "可宣传");
}

function achievementCard(item) {
  return `
    <article class="achievement-card">
      <header><div><h3>${escapeHtml(item.name || "未命名成果")}</h3><p>${escapeHtml([item.type, item.level].filter(Boolean).join(" · ") || "公开精选")}</p></div><span class="pill">${escapeHtml(item.date || "未填时间")}</span></header>
      <p>${escapeHtml(item.intro || item.project || "暂无简介")}</p>
      <div class="meta-line">${statusTags(item.online, item.publicity)}${materialTags(item)}</div>
    </article>
  `;
}

function renderStoryWall() {
  const stories = DATA.stories || [];
  els.storyCount.textContent = `${stories.length} 张`;
  els.storyWall.innerHTML = stories.length ? stories.map((item, index) => `
    <article class="story-card ${stories.length === 1 ? "solo" : index < 2 ? "featured" : ""}">
      <div class="story-card-top"><span class="story-index">${String(index + 1).padStart(2, "0")}</span><span class="tag">${escapeHtml(item.type || "成果")}</span></div>
      <h3>${escapeHtml(item.name || "未命名成果")}</h3>
      <p>${escapeHtml(item.intro || item.project || "暂无宣传简介")}</p>
      <div class="story-meta"><span>匿名来源</span><span>身份画像已隐藏</span><span>${escapeHtml(item.level || "级别待补")}</span></div>
      <div class="story-actions">${materialTags(item)}</div>
    </article>
  `).join("") : templateEmptyState("暂无公开成果故事");
}

function renderExperiences() {
  const query = state.filters.search.trim().toLowerCase();
  const rows = (DATA.quotes || []).filter((item) => !query || `${item.question} ${item.content}`.toLowerCase().includes(query));
  els.experienceCount.textContent = `${rows.length} 条`;
  els.experienceList.innerHTML = rows.length ? rows.map((item) => `
    <article class="quote-card">
      <header><div><h3>匿名感言</h3><p>${escapeHtml(item.question || "学习体会")}</p></div>${publicTag(item.publicQuote)}</header>
      <p>${escapeHtml(item.content)}</p>
      <div class="meta-line"><span>高匿名展示</span><span>公开引用</span></div>
    </article>
  `).join("") : templateEmptyState("暂无公开学习体会");
}

function renderPublicity() {
  const achievements = getFilteredHighlights().filter((item) => isAffirmative(item.publicity));
  const quotes = DATA.quotes || [];
  const feed = [
    ...achievements.slice(0, 12).map((item) => ({ kind: "成果", title: item.name || item.type, body: item.intro || item.project, links: materialTags(item) })),
    ...quotes.slice(0, 8).map((item) => ({ kind: "感言", title: "匿名感言", body: item.content, links: "" })),
  ];
  els.publicityCount.textContent = `${feed.length} 条`;
  renderPromoWorkbench();
  els.publicityFeed.innerHTML = feed.length ? feed.map((item) => `
    <article class="publicity-item"><header><div><span class="section-kicker">${escapeHtml(item.kind)}</span><h3>${escapeHtml(item.title || "未命名素材")}</h3></div><span class="pill">匿名来源</span></header><p>${escapeHtml(item.body || "暂无简介")}</p><div class="meta-line">${item.links}</div></article>
  `).join("") : templateEmptyState("暂无可公开宣传素材");
  renderReadiness();
}

function renderPromoWorkbench() {
  const stats = DATA.stats || {};
  const configs = [
    { title: "可直接用于新闻稿", icon: "badge-check", count: stats.ready || 0, note: "只显示数量，不公开全量明细" },
    { title: "全量材料已隔离", icon: "shield-check", count: stats.withProof || 0, note: "证明材料不进入公开站点" },
    { title: "外部链接已隐藏", icon: "link-2-off", count: stats.withLinks || 0, note: "公开版不暴露个人链接" },
  ];
  els.promoWorkbench.innerHTML = configs.map((item) => `
    <section class="promo-bucket"><header><div><span class="bucket-icon"><i data-lucide="${item.icon}"></i></span><strong>${escapeHtml(item.title)}</strong></div><span class="pill">${item.count}</span></header><p>${escapeHtml(item.note)}</p><div class="bucket-list"><article><strong>公开站点仅保留摘要</strong><span>完整数据留在本地或后台</span></article></div></section>
  `).join("");
}

function renderReadiness() {
  els.readinessList.innerHTML = (DATA.readiness || []).map((row) => {
    const percent = row.total ? Math.round((row.count / row.total) * 100) : 0;
    return `<article class="readiness-item"><div class="surface-header compact"><h3>${escapeHtml(row.label)}</h3><span class="pill">${row.count}/${row.total || 0}</span></div><div class="bar-track"><div class="bar-fill" style="width: ${percent}%"></div></div><p>${percent}%</p></article>`;
  }).join("");
}

function renderPublicNotice() {
  els.studentGrid.innerHTML = [
    ["不含全量数据", "公开站点只发布统计、分布和精选展示，不包含完整成果表或完整体会表。"],
    ["不含可识别字段", "姓名、学号、联系方式、学院、年级、专业、小组、教师全名均已移除或泛化。"],
    ["不公开材料链接", "作品链接、证明材料和共享文档不进入静态托管公开版本。"],
    ["反爬虫边界", "已配置 noindex 与 robots.txt，可阻止正规搜索引擎索引，但不能替代访问控制。"],
  ].map(([title, body]) => `
    <article class="student-card"><header><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></div><span class="pill">public</span></header><dl><dt>策略</dt><dd>最小披露</dd><dt>数据</dt><dd>非全量</dd><dt>下载</dt><dd>无批量文件</dd><dt>索引</dt><dd>禁止</dd></dl></article>
  `).join("");
}

function renderSchema() {
  const sections = [
    ["部署目录", ["index.html", "public-app.js", "public-data.js", "styles.css", "sias-tech-bg.png", "lucide.min.js"]],
    ["未发布内容", ["全量预置数据文件", "原始 Excel / ZIP", "学生名单", "证明材料链接", "本地工作目录"]],
    ["静态托管设置", ["Source: Deploy from a branch", "Branch: main", "Folder: /docs", "发布前确认仓库不包含全量数据文件"]],
  ];
  els.schemaGrid.innerHTML = sections.map(([title, fields]) => `
    <article class="schema-card"><span class="section-kicker">静态托管</span><h3>${escapeHtml(title)}</h3><div class="field-list">${fields.map((field) => `<span>${escapeHtml(field)}</span>`).join("")}</div></article>
  `).join("");
}

function setView(view) {
  state.activeView = view;
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === view));
}

function renderBars(container, rows, emptyLabel) {
  if (!rows.length) {
    container.innerHTML = emptyState(emptyLabel, "small");
    return;
  }
  const max = Math.max(...rows.map((row) => row.count));
  container.innerHTML = rows.map((row) => `
    <div class="bar-row"><span class="bar-label" title="${escapeHtml(row.label)}">${escapeHtml(row.label)}</span><span class="bar-track"><span class="bar-fill" style="width: ${Math.max(8, (row.count / max) * 100)}%"></span></span><strong>${row.count}</strong></div>
  `).join("");
}

function renderDonut(container, value, total, label) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  container.innerHTML = `<div class="donut-card"><div class="donut" style="--percent: ${percent}"><strong>${percent}%</strong></div><div><strong>${escapeHtml(label)}</strong><span>${value}/${total || 0}</span></div></div>`;
}

function materialTags(item) {
  const tags = [];
  if (item.linkAvailable) tags.push("<span class=\"tag neutral\">作品链接已留存</span>");
  if (item.proofAvailable) tags.push("<span class=\"tag neutral\">证明材料已留存</span>");
  return tags.length ? tags.join("") : "<span class=\"tag neutral\">公开版不展示</span>";
}

function statusTags(online, publicity) {
  return `${onlineTag(online)}${publicTag(publicity)}`;
}

function onlineTag(value) {
  const text = normalizeText(value) || "未填写";
  const cls = isOnline(text) ? "" : /未|否|不适用/.test(text) ? "neutral" : "warn";
  return `<span class="tag ${cls}">${escapeHtml(text)}</span>`;
}

function publicTag(value) {
  const text = normalizeText(value) || "未填写";
  const cls = isAffirmative(text) ? "" : /否|不同意/.test(text) ? "stop" : "warn";
  return `<span class="tag ${cls}">${escapeHtml(text)}</span>`;
}

function matchesOption(value, option) {
  const text = normalizeText(value);
  if (!option) return true;
  if (option === "是") return isAffirmative(text);
  if (option === "否") return /否|不同意|未上线/.test(text);
  if (option === "需确认") return /需确认|确认|内测|测试/.test(text);
  return text === option;
}

function isAffirmative(value) {
  const text = normalizeText(value);
  if (!text || /否|不同意|未授权/.test(text)) return false;
  return /是|同意|可公开|允许|实名/.test(text);
}

function isOnline(value) {
  return /已上线|上线中|正式发布/.test(normalizeText(value));
}

function templateEmptyState(text) {
  return `<div class="empty-state rich-empty"><div><span class="section-kicker">公开版</span><h3>${escapeHtml(text)}</h3><p>当前站点只展示汇总与精选内容，不暴露完整数据表。</p></div></div>`;
}

function emptyState(text, size = "normal") {
  const minHeight = size === "small" ? "88px" : "";
  return `<div class="empty-state" style="${minHeight ? `min-height: ${minHeight}` : ""}">${escapeHtml(text)}</div>`;
}

function createIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function notify(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2400);
}
