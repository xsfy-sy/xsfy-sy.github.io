/* 宁波赫力格斯 HEILIGS PIER · 交互脚本 */
(function () {
  "use strict";

  var doc = document;

  /* ---------- 顶部导航滚动状态 ---------- */
  var header = doc.getElementById("siteHeader");
  var topNav = doc.getElementById("topNav");

  function onScrollHeader() {
    var scrolled = window.scrollY > 12;
    if (header) {
      if (scrolled) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    if (topNav) {
      if (scrolled) topNav.classList.add("scrolled");
      else topNav.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Hero 图片轮播（自动 + 手动） ---------- */
  var heroSlides = doc.querySelectorAll(".hero-slide");
  var heroDots = doc.querySelectorAll(".hero-dot");
  var heroPrev = doc.getElementById("heroPrev");
  var heroNext = doc.getElementById("heroNext");
  var heroIndex = 0;
  var heroTimer = null;

  function showHeroSlide(idx) {
    heroIndex = idx;
    heroSlides.forEach(function (slide, i) {
      if (i === idx) {
        slide.classList.add("active");
        slide.setAttribute("tabindex", "0");
        slide.style.animation = "none";
        void slide.offsetWidth;
        slide.style.animation = "";
      } else {
        slide.classList.remove("active");
        slide.setAttribute("tabindex", "-1");
      }
    });
    heroDots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === idx);
      dot.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
  }

  function restartHeroTimer() {
    if (heroTimer) clearInterval(heroTimer);
    if (heroSlides.length > 1) {
      heroTimer = setInterval(function () {
        showHeroSlide((heroIndex + 1) % heroSlides.length);
      }, 2000);
    }
  }

  if (heroSlides.length > 1) {
    restartHeroTimer();

    if (heroPrev) {
      heroPrev.addEventListener("click", function () {
        showHeroSlide((heroIndex - 1 + heroSlides.length) % heroSlides.length);
        restartHeroTimer();
      });
    }
    if (heroNext) {
      heroNext.addEventListener("click", function () {
        showHeroSlide((heroIndex + 1) % heroSlides.length);
        restartHeroTimer();
      });
    }
    heroDots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showHeroSlide(i);
        restartHeroTimer();
      });
    });

    /* 暂停自动轮播：鼠标悬停时 */
    var heroSection = doc.getElementById("hero");
    if (heroSection) {
      heroSection.addEventListener("mouseenter", function () {
        if (heroTimer) clearInterval(heroTimer);
      });
      heroSection.addEventListener("mouseleave", restartHeroTimer);
    }
  }

  /* ---------- 最近参展轮播（自动 + 手动按钮） ---------- */
  var exList = doc.getElementById("exhibitionList");
  if (exList) {
    var exItems = exList.querySelectorAll(".exhibition-item");
    var exPrev = doc.getElementById("exhibitionPrev");
    var exNext = doc.getElementById("exhibitionNext");
    var exIndex = 0;
    var exTimer = null;

    function showExhibition(idx) {
      exIndex = idx;
      exList.style.transform = "translateX(-" + idx * 100 + "%)";
    }

    function restartExTimer() {
      if (exTimer) clearInterval(exTimer);
      if (exItems.length > 1) {
        exTimer = setInterval(function () {
          showExhibition((exIndex + 1) % exItems.length);
        }, 5000);
      }
    }

    if (exItems.length > 1) {
      restartExTimer();

      if (exPrev) {
        exPrev.addEventListener("click", function () {
          showExhibition((exIndex - 1 + exItems.length) % exItems.length);
          restartExTimer();
        });
      }
      if (exNext) {
        exNext.addEventListener("click", function () {
          showExhibition((exIndex + 1) % exItems.length);
          restartExTimer();
        });
      }

      /* 触屏滑动切换 */
      var exTouchX = null;
      exList.addEventListener("touchstart", function (e) {
        exTouchX = e.touches[0].clientX;
        if (exTimer) clearInterval(exTimer);
      }, { passive: true });
      exList.addEventListener("touchend", function (e) {
        if (exTouchX === null) return;
        var dx = e.changedTouches[0].clientX - exTouchX;
        if (Math.abs(dx) > 40) {
          if (dx < 0) showExhibition((exIndex + 1) % exItems.length);
          else showExhibition((exIndex - 1 + exItems.length) % exItems.length);
        }
        exTouchX = null;
        restartExTimer();
      }, { passive: true });

      /* 暂停自动轮播：鼠标悬停时 */
      var exSlider = doc.getElementById("exhibitionSlider");
      if (exSlider) {
        exSlider.addEventListener("mouseenter", function () {
          if (exTimer) clearInterval(exTimer);
        });
        exSlider.addEventListener("mouseleave", restartExTimer);
      }
    }
  }

  /* ---------- 侧滑抽屉菜单 ---------- */
  var navToggle = doc.getElementById("navToggle");
  var mobileMenu = doc.getElementById("mobileMenu");
  var menuBackdrop = doc.getElementById("menuBackdrop");
  var drawerClose = doc.getElementById("drawerClose");

  function setMenu(open) {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    if (open) {
      mobileMenu.hidden = false;
      requestAnimationFrame(function () {
        mobileMenu.classList.add("open");
        if (menuBackdrop) menuBackdrop.classList.add("open");
      });
      doc.body.style.overflow = "hidden";
    } else {
      mobileMenu.classList.remove("open");
      if (menuBackdrop) menuBackdrop.classList.remove("open");
      doc.body.style.overflow = "";
      setTimeout(function () { mobileMenu.hidden = true; }, 420);
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    if (drawerClose) {
      drawerClose.addEventListener("click", function () { setMenu(false); });
    }

    if (menuBackdrop) {
      menuBackdrop.addEventListener("click", function () { setMenu(false); });
    }

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- 滚动显现 ---------- */
  var revealEls = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ============================================================
     产品筛选 + 加载更多
     ============================================================ */
  var tabBtns = doc.querySelectorAll(".tab-btn");
  var cards = Array.prototype.slice.call(doc.querySelectorAll("#series .product-card"));
  var noResults = doc.getElementById("noResults");
  var loadMoreBtn = doc.getElementById("loadMore");
  var seriesSection = doc.getElementById("series");

  var VISIBLE_STEP = 20;
  var currentFilter = "all";
  var currentKeyword = "";
  var currentPage = 1;
  var paginationEl = doc.getElementById("pagination");
  var productCountEl = doc.getElementById("productCount");

  /* 判断单张卡片是否同时满足当前筛选 + 关键词 */
  function matchesCriteria(card) {
    // 分类筛选：premium / luxury / trendy 按 data-category；hot 按 data-tag
    var filterMatch = false;
    if (currentFilter === "all") {
      filterMatch = true;
    } else if (currentFilter === "hot") {
      filterMatch = card.getAttribute("data-tag") === "hot";
    } else {
      filterMatch = card.getAttribute("data-category") === currentFilter;
    }
    if (!filterMatch) return false;

    // 关键词搜索
    var kw = currentKeyword.trim().toLowerCase();
    if (!kw) return true;

    var name = (card.querySelector("h3") || {}).textContent || "";
    var desc = (card.querySelector(".product-info p") || {}).textContent || "";
    var badge = (card.querySelector(".product-badge") || {}).textContent || "";
    var img = card.querySelector("img");
    var imgAlt = img ? (img.getAttribute("alt") || "") : "";
    var hay = (name + " " + desc + " " + badge + " " + imgAlt).toLowerCase();
    return hay.indexOf(kw) !== -1;
  }

  /* 统一应用筛选 + 分页 */
  function applyFilterAndPagination() {
    // 重新查询卡片（兼容动态加载的产品）
    cards = Array.prototype.slice.call(doc.querySelectorAll("#series .product-card"));
    var visible = [];
    cards.forEach(function (card) {
      if (matchesCriteria(card)) {
        visible.push(card);
      } else {
        card.style.display = "none";
      }
    });

    var start = (currentPage - 1) * VISIBLE_STEP;
    var end = start + VISIBLE_STEP;

    visible.forEach(function (card, i) {
      if (i >= start && i < end) {
        card.style.display = "";
        // 翻页后新出现的卡片：确保 .reveal 不会被滚动显现动画永久隐藏
        if (currentPage > 1) card.classList.add("visible");
        card.style.animation = "none";
        void card.offsetWidth;
        card.style.animation = "";
      } else {
        card.style.display = "none";
      }
    });

    if (noResults) noResults.hidden = visible.length !== 0;

    // 顶部"共 N 款"：按当前实际可见的产品数量实时标注
    if (productCountEl) {
      productCountEl.textContent = visible.length ? "共 " + visible.length + " 款" : "";
    }

    renderPagination(visible.length);
  }

  function renderPagination(total) {
    if (!paginationEl) return;
    var totalPages = Math.ceil(total / VISIBLE_STEP);
    if (total === 0) {
      paginationEl.style.display = "none";
      return;
    }
    paginationEl.style.display = "";

    var html = "";
    html += '<button class="page-btn' + (currentPage === 1 ? " disabled" : "") + '" data-page="' + (currentPage - 1) + '">&#8249;</button>';
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="page-btn' + (i === currentPage ? " active" : "") + '" data-page="' + i + '">' + i + "</button>";
    }
    html += '<button class="page-btn' + (currentPage === totalPages ? " disabled" : "") + '" data-page="' + (totalPages + 1) + '">&#8250;</button>';
    html += '<span class="page-info">第 ' + currentPage + " / " + totalPages + " 页（共 " + total + " 款）</span>";
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll(".page-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var page = parseInt(btn.getAttribute("data-page"), 10);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        applyFilterAndPagination();
        if (seriesSection) seriesSection.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  /* 激活某个 tab（不触发 click 事件，避免循环） */
  function setActiveTab(filter) {
    tabBtns.forEach(function (b) {
      var active = b.getAttribute("data-filter") === filter;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    currentFilter = filter;
  }

  /* ---------- Tab 按钮点击 ---------- */
  tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      if (!filter || filter === currentFilter) {
        // 重复点击同一 tab：依然重置分页 + 重跑动画
        currentPage = 1;
        applyFilterAndPagination();
        return;
      }

      setActiveTab(filter);

      // 重置分页 + 清空搜索
      currentPage = 1;
      searchInputs.forEach(function (input) { input.value = ""; });
      currentKeyword = "";

      applyFilterAndPagination();
    });
  });

  /* ---------- 加载更多按钮（保留兼容） ---------- */
  if (loadMoreBtn) {
    loadMoreBtn.style.display = "none";
  }

  /* ============================================================
     品类卡片 / 视图全部链接：滚动到 #series + 联动筛选
     ============================================================ */
  // 任何带 data-filter 且 href="#series" 的元素：点击后激活对应 tab
  var categoryLinks = doc.querySelectorAll('[data-filter][href="#series"]');
  categoryLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var filter = link.getAttribute("data-filter");
      if (!filter) return;

      // 激活对应 tab 并重置分页
      setActiveTab(filter);
      currentPage = 1;
      searchInputs.forEach(function (input) { input.value = ""; });
      currentKeyword = "";
      applyFilterAndPagination();
    });
  });

  /* ---------- 数字滚动（保留以兼容可能的 data-count 节点） ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1400;
    var start = null;

    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("zh-CN");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var statEls = doc.querySelectorAll("[data-count]");
  if (statEls.length) {
    if ("IntersectionObserver" in window) {
      var statIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              statIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      statEls.forEach(function (el) { statIO.observe(el); });
    } else {
      statEls.forEach(function (el) {
        el.textContent = parseInt(el.getAttribute("data-count"), 10).toLocaleString("zh-CN");
      });
    }
  }

  /* ---------- 锚点平滑滚动（修正固定导航偏移） ---------- */
  doc.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var hash = link.getAttribute("href");
      if (hash.length < 2) return;
      var target = doc.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      // 顶部偏移：促销条 + header
      var offset = 100;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.replaceState(null, "", hash);
    });
  });

  /* ---------- 产品关键词搜索 ---------- */
  var searchInputs = doc.querySelectorAll("#searchInput, #searchInputMobile");

  function scrollToSeries() {
    if (!seriesSection) return;
    var rect = seriesSection.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 80) {
      var top = rect.top + window.pageYOffset - 100;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
  }

  function onSearchInput(input) {
    var kw = input.value;
    // 同步另一个输入框
    searchInputs.forEach(function (other) {
      if (other !== input) other.value = kw;
    });

    currentKeyword = kw;
    // 搜索时重置分类为"全部"并重置分页
    if (kw && currentFilter !== "all") {
      setActiveTab("all");
    }
    currentPage = 1;

    // 移动端：输入时关闭菜单
    if (input.id === "searchInputMobile" && kw && mobileMenu && !mobileMenu.hidden) {
      setMenu(false);
    }

    applyFilterAndPagination();
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () { onSearchInput(input); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var val = input.value.trim();
        if (val) {
          window.location.href = "search.html?q=" + encodeURIComponent(val);
        }
      }
    });
  });
  var searchForms = doc.querySelectorAll("#productSearch, #productSearchMobile");
  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var val = input ? input.value.trim() : "";
      if (val) {
        window.location.href = "search.html?q=" + encodeURIComponent(val);
      }
    });
  });

  /* ---------- 心愿清单 ---------- */
  var wishlistBtn = doc.getElementById("wishlistBtn");
  var wishlistPanel = doc.getElementById("wishlistPanel");
  var wishlistBackdrop = doc.getElementById("wishlistBackdrop");
  var wishlistClose = doc.getElementById("wishlistClose");
  var wishlistCount = doc.getElementById("wishlistCount");
  var wishlistItems = doc.getElementById("wishlistItems");
  var wishlistEmpty = doc.getElementById("wishlistEmpty");
  var wishlist = [];

  /* 为单个产品卡添加心形按钮 */
  var wishIdCounter = 0;
  function addWishButton(card) {
    var media = card.querySelector(".product-media");
    if (!media) return;
    if (card.querySelector(".wish-btn")) return; /* 防止重复添加 */
    var img = card.querySelector("img");
    var h3 = card.querySelector("h3");
    var priceNow = card.querySelector(".price-now");
    var id = "w" + (wishIdCounter++);
    /* 从产品详情链接提取数据库产品 id，用于异步补全报价表规格 */
    var link = card.querySelector(".product-link");
    var dbId = "";
    if (link) {
      var href = link.getAttribute("href") || "";
      var mId = href.match(/[?&]id=([^&]+)/);
      if (mId) dbId = decodeURIComponent(mId[1]);
    }
    var data = {
      id: id,
      dbId: dbId,
      specsLoaded: false,
      weight: "",
      size: "",
      color: "",
      packaging: "",
      sewing: "",
      qty: 1000,
      img: img ? img.src : "",
      alt: img ? img.alt : "",
      name: h3 ? h3.textContent.trim() : "",
      price: priceNow ? priceNow.textContent : ""
    };
    card.setAttribute("data-wish-id", data.id);

    var btn = doc.createElement("button");
    btn.className = "wish-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", "加入心愿清单");
    btn.innerHTML = "♡";
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleWish(data, btn);
    });
    media.appendChild(btn);
  }

  /* 为所有现有产品卡添加心形按钮 */
  var allCards = doc.querySelectorAll(".product-card");
  for (var ai = 0; ai < allCards.length; ai++) {
    addWishButton(allCards[ai]);
  }

  /* MutationObserver: 监听动态添加的产品卡，自动注入心形按钮 */
  if (typeof MutationObserver !== "undefined") {
    var wishObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains("product-card")) {
            addWishButton(node);
          }
          if (node.querySelectorAll) {
            var nested = node.querySelectorAll(".product-card");
            for (var ni = 0; ni < nested.length; ni++) {
              addWishButton(nested[ni]);
            }
          }
        });
      });
    });
    wishObserver.observe(doc.body, { childList: true, subtree: true });
  }

  function toggleWish(data, btn) {
    var idx = wishlist.findIndex(function (w) { return w.id === data.id; });
    if (idx >= 0) {
      wishlist.splice(idx, 1);
      btn.classList.remove("active");
      btn.innerHTML = "♡";
    } else {
      wishlist.push(data);
      hydrateWishSpec(data);
      btn.classList.add("active");
      btn.innerHTML = "♥";
    }
    updateWishlistUI();
  }

  /* 异步从产品库补全报价表规格（克重/尺寸/颜色/包装辅料/缝制工艺/价格） */
  function hydrateWishSpec(item) {
    if (item.specsLoaded) return;
    item.specsLoaded = true;
    if (!item.dbId || typeof ProductsDB === "undefined" || !ProductsDB.getById) return;
    ProductsDB.getById(item.dbId).then(function (p) {
      if (!p) return;
      item.weight = p.weight || item.weight || "";
      item.size = p.size || item.size || "";
      item.color = p.color || item.color || "";
      item.packaging = p.packaging || item.packaging || "";
      item.sewing = p.sewing || item.sewing || "";
      if (p.price) item.price = p.price;
      updateInquireSummary();
    }).catch(function () { /* 忽略补全失败，报价表显示 — */ });
  }

  function updateWishlistUI() {
    var count = wishlist.length;
    if (wishlistCount) wishlistCount.textContent = count;
    if (wishlistEmpty) wishlistEmpty.style.display = count ? "none" : "block";
    /* 清单变化后立即可继续询价：清除旧成功提示并恢复提交按钮 */
    if (inquireResetTimer) resetInquireForm();
    var inquireSection = doc.getElementById("wishlistInquire");
    if (inquireSection) inquireSection.style.display = count ? "block" : "none";
    if (wishlistItems) {
      wishlistItems.innerHTML = "";
      wishlist.forEach(function (w) {
        var item = doc.createElement("div");
        item.className = "wishlist-item";
        item.innerHTML =
          '<img src="' + w.img + '" alt="' + w.alt + '" />' +
          '<div class="wishlist-item-info">' +
            '<h4>' + w.name + '</h4>' +
            '<span class="wishlist-item-price">' + w.price + '</span>' +
          '</div>' +
          '<button class="wishlist-remove" aria-label="移除" type="button">✕</button>';
        item.querySelector(".wishlist-remove").addEventListener("click", function () {
          wishlist = wishlist.filter(function (x) { return x.id !== w.id; });
          var card = doc.querySelector('[data-wish-id="' + w.id + '"]');
          if (card) {
            var btn = card.querySelector(".wish-btn");
            if (btn) { btn.classList.remove("active"); btn.innerHTML = "♡"; }
          }
          updateWishlistUI();
        });
        wishlistItems.appendChild(item);
      });
    }
    updateInquireSummary();
  }

  /* 报价表内文本转义 */
  function wishEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* 询价报价表：图片/产品/克重/尺寸/颜色/包装辅料/缝制工艺/采购数量/价格 */
  function updateInquireSummary() {
    var summary = doc.getElementById("inquireSummary");
    if (!summary) return;
    if (wishlist.length === 0) { summary.innerHTML = ""; return; }
    var html = '<p class="inquire-summary-title">询价报价表 (' + wishlist.length + ' 款)</p>';
    html += '<div class="inquire-quote-scroll"><table class="inquire-quote"><thead><tr>' +
      '<th>图片</th><th>产品</th><th>克重</th><th>尺寸</th><th>颜色</th><th>包装辅料</th><th>缝制工艺</th><th>采购数量</th><th>价格</th>' +
      '</tr></thead><tbody>';
    wishlist.forEach(function (w) {
      html += '<tr>' +
        '<td class="q-cell-img">' + (w.img ? '<img class="q-img" src="' + wishEsc(w.img) + '" alt="' + wishEsc(w.alt || w.name) + '" />' : '<span class="q-noimg">—</span>') + '</td>' +
        '<td class="q-name">' + wishEsc(w.name || "—") + '</td>' +
        '<td>' + wishEsc(w.weight || "—") + '</td>' +
        '<td>' + wishEsc(w.size || "—") + '</td>' +
        '<td>' + wishEsc(w.color || "—") + '</td>' +
        '<td>' + wishEsc(w.packaging || "—") + '</td>' +
        '<td>' + wishEsc(w.sewing || "—") + '</td>' +
        '<td><input type="number" class="inquire-qty" min="1" step="1" value="' + (w.qty || 1000) + '" data-wid="' + wishEsc(w.id) + '" aria-label="采购数量" /></td>' +
        '<td class="q-price">' + wishEsc(w.price || "—") + '</td>' +
        '</tr>';
    });
    html += '</tbody></table></div>';
    html += '<p class="inquire-quote-note">※ 采购数量可直接修改，发送时自动带入；带“—”的规格项请在后台补录产品信息。</p>';
    summary.innerHTML = html;
  }

  /* 采购数量输入：事件委托，输入变更即写回心愿单项 */
  (function bindQtyInput() {
    var summaryEl = doc.getElementById("inquireSummary");
    if (!summaryEl) return;
    summaryEl.addEventListener("change", function (e) {
      var input = e.target;
      if (!input || !input.classList || !input.classList.contains("inquire-qty")) return;
      var item = null;
      for (var i = 0; i < wishlist.length; i++) {
        if (wishlist[i].id === input.getAttribute("data-wid")) { item = wishlist[i]; break; }
      }
      if (!item) return;
      var v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1000;
      item.qty = v;
      input.value = v;
    });
  })();

  var inquireSubmit = doc.getElementById("inquireSubmit");
  var inquireSuccess = doc.getElementById("inquireSuccess");
  var inquireResetTimer = null;
  function resetInquireForm() {
    if (inquireResetTimer) { clearTimeout(inquireResetTimer); inquireResetTimer = null; }
    if (inquireSuccess) inquireSuccess.style.display = "none";
    if (inquireSubmit) inquireSubmit.style.display = "";
  }
  if (inquireSubmit) {
    inquireSubmit.addEventListener("click", function () {
      var nameEl = doc.getElementById("inquireName");
      var emailEl = doc.getElementById("inquireEmail");
      var companyEl = doc.getElementById("inquireCompany");
      var phoneEl = doc.getElementById("inquirePhone");
      var msgEl = doc.getElementById("inquireMessage");
      var nameVal = nameEl ? nameEl.value : "";
      var emailVal = emailEl ? emailEl.value : "";
      if (!nameVal.trim() || !emailVal.trim()) {
        alert("请填写姓名和邮箱");
        return;
      }
      /* 邮件正文：文字版报价表（邮件无法嵌图，图片见网页端报价表） */
      var lines = [];
      wishlist.forEach(function (w, i) {
        lines.push((i + 1) + ". " + w.name);
        lines.push("   克重/Weight: " + (w.weight || "—"));
        lines.push("   尺寸/Size: " + (w.size || "—"));
        lines.push("   颜色/Color: " + (w.color || "—"));
        lines.push("   包装辅料/Packaging: " + (w.packaging || "—"));
        lines.push("   缝制工艺/Sewing: " + (w.sewing || "—"));
        lines.push("   采购数量/Qty: " + (w.qty || 1000));
        lines.push("   价格/Price: " + (w.price || "—"));
      });
      var subject = encodeURIComponent("询价请求 - " + (companyEl ? companyEl.value : "个人"));
      var body = encodeURIComponent(
        "询价报价表 / QUOTATION REQUEST\n" +
        "----------------------------------------\n" +
        "姓名: " + nameVal + "\n" +
        "公司: " + (companyEl ? companyEl.value : "-") + "\n" +
        "邮箱: " + emailVal + "\n" +
        "电话: " + (phoneEl ? phoneEl.value : "-") + "\n" +
        "----------------------------------------\n" +
        "询价产品明细:\n" + lines.join("\n") + "\n" +
        "----------------------------------------\n" +
        "留言: " + (msgEl ? msgEl.value : "-")
      );
      /* 先给出成功反馈，再触发邮件客户端，避免 mailto 导航中断 UI 更新 */
      inquireSuccess.style.display = "block";
      inquireSubmit.style.display = "none";
      inquireResetTimer = setTimeout(resetInquireForm, 3000);
      try {
        window.location.href = "mailto:pierlin@vip.163.com,cherry@nbheiligs.com,jessica@nbheiligs.com,helena@nbheiligs.com?subject=" + subject + "&body=" + body;
      } catch (mailErr) { /* 邮件客户端唤起失败也不影响页面反馈 */ }
    });
  }

  function openWishlist(open) {
    if (!wishlistPanel) return;
    if (open) {
      wishlistPanel.hidden = false;
      requestAnimationFrame(function () {
        wishlistPanel.classList.add("open");
        if (wishlistBackdrop) wishlistBackdrop.classList.add("open");
      });
      doc.body.style.overflow = "hidden";
    } else {
      wishlistPanel.classList.remove("open");
      if (wishlistBackdrop) wishlistBackdrop.classList.remove("open");
      doc.body.style.overflow = "";
      setTimeout(function () { wishlistPanel.hidden = true; }, 420);
    }
  }

  if (wishlistBtn) wishlistBtn.addEventListener("click", function () { openWishlist(true); });
  if (wishlistClose) wishlistClose.addEventListener("click", function () { openWishlist(false); });
  if (wishlistBackdrop) {
    wishlistBackdrop.addEventListener("click", function () { openWishlist(false); });
  }

  /* ---------- 初始化 ---------- */
  applyFilterAndPagination();

  // 暴露给外部：动态加载产品后重新筛选
  window.refreshProductFilter = function () {
    currentPage = 1;
    applyFilterAndPagination();
  };
})();
