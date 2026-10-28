/**
 * 产品数据库管理（IndexedDB）
 * 支持产品的增删改查，图片以 base64 存储
 */
(function (global) {
  var DB_NAME = "heiligs_products";
  var DB_VERSION = 1;
  var STORE_NAME = "products";
  var db = null;
  var migrated = false;

  // 旧数据分类修正表：早期版本只保存主分类（如 bedding），
  // 导致细分类页面（如 bedding-blanket）查不到这些产品。
  // 按产品名称归入对应的细分类（合并式分类值）。
  var LEGACY_CATEGORY_MAP = {
    "BEDDING-Blanket": "bedding-blanket",
    "BEDDING-Cushion": "bedding-cushion",
    "BEDDING-Mattress protector": "bedding-mattress-protector",
    "BEDDING-Duvet Cover & Pillowcase Set": "bedding-duvet-cover-pillowcase-set",
    "Grommet Curtains": "curtains-grommet",
    "Track Curtains": "curtains-track",
    "MATS-Placemat": "rugs-placemat"
  };

  // 按标题归类（大小写、首尾空格不敏感），由上面的映射表派生。
  // 查询时兜底使用：只要产品标题是 BEDDING-Blanket，就一定会出现在
  // BEDDING-Blanket 分类页面，不受数据库里存的主分类影响。
  var NAME_TO_CATEGORY = (function () {
    var map = {};
    Object.keys(LEGACY_CATEGORY_MAP).forEach(function (label) {
      map[label.trim().toLowerCase()] = LEGACY_CATEGORY_MAP[label];
    });
    return map;
  })();

  // 产品的实际归类：优先按标题识别，其次用存储的 category
  function effectiveCategory(p) {
    // 如果 category 明确是空字符串（"移出分类"操作的结果），
    // 不再按 name 兜底，让它保持"未分类"状态
    if (p && p.category === '') return '';
    var byName = NAME_TO_CATEGORY[String(p && p.name || "").trim().toLowerCase()];
    return byName || (p && p.category) || "";
  }

  // 把存量产品从主分类（bedding / curtains）归位到细分类
  function migrateLegacyCategories() {
    return new Promise(function (resolve) {
      var tx = db.transaction(STORE_NAME, "readwrite");
      var store = tx.objectStore(STORE_NAME);
      var req = store.getAll();
      req.onsuccess = function () {
        (req.result || []).forEach(function (p) {
          var fixed = NAME_TO_CATEGORY[String(p.name || "").trim().toLowerCase()];
          // 仅当当前分类是修正值的上级（如 bedding → bedding-blanket）时才改写
          if (fixed && fixed.indexOf((p.category || "") + "-") === 0) {
            p.category = fixed;
            store.put(p);
          }
        });
      };
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { resolve(); };
      tx.onabort = function () { resolve(); };
    });
  }

  // 只打开一次：首页有多个区块同时调用 getAll，
  // 反复 indexedDB.open 在部分移动端/隐私模式下会卡住不回调
  var _dbPromise = null;
  function openDB() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          var store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("category", "category", { unique: false });
        }
      };
      req.onsuccess = function (e) {
        db = e.target.result;
        if (migrated) { resolve(db); return; }
        migrated = true;
        migrateLegacyCategories().then(function () { resolve(db); });
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
      // 其它标签页占用旧版本时不要让页面一直等下去
      req.onblocked = function () {
        reject(new Error('indexedDB blocked'));
      };
    });
    return _dbPromise;
  }

  function getAllRaw() {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readonly");
        var store = tx.objectStore(STORE_NAME);
        var req = store.getAll();
        req.onsuccess = function () {
          var list = req.result || [];
          // 最新上传的排在最前，保证新品在分类页第一个就能看到
          list.sort(function (a, b) {
            return (b.createdAt || 0) - (a.createdAt || 0);
          });
          resolve(list);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  /* 站点自带的产品数据（兜底 JSON）：
     静态站点把产品存在浏览器本地 IndexedDB，新访客/新设备/隐私模式
     等场景下本地库可能是空的或不可用。这里把 js/default-products.json
     作为数据源，每次 getAll 都会先查本地库；若为空或 IndexedDB 挂了，
     直接用 JSON 的内容。JSON 只 fetch 一次并缓存，顺手写进 IndexedDB
     让 admin 后台也能看到。 */
  var SEED_URL = "js/default-products.json?v=20261071";
  var _seedCache = null;

  /* 删除墓碑：后台删掉的播种产品 id 记进 localStorage，
     防止增量合并时把它们重新加回来 */
  var TOMBSTONE_KEY = "heiligs_deleted_seed_ids";
  function getTombstones() {
    try { return JSON.parse(localStorage.getItem(TOMBSTONE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function addTombstone(id) {
    try {
      var list = getTombstones();
      if (list.indexOf(id) === -1) {
        list.push(id);
        localStorage.setItem(TOMBSTONE_KEY, JSON.stringify(list));
      }
    } catch (e) { /* localStorage 不可用时静默 */ }
  }

  function fetchSeedJSON() {
    if (_seedCache) return _seedCache;
    _seedCache = fetch(SEED_URL)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (items) {
        items = Array.isArray(items) ? items : [];
        // 顺手写入 IndexedDB，让 admin 也能看到
        if (items.length) {
          addAllSilently(items);
        }
        return items;
      })
      .catch(function () { return []; });
    return _seedCache;
  }

  /* 批量写入但忽略重复错误（admin 可能已导入） */
  function addAllSilently(items) {
    openDB().then(function () {
      var tx = db.transaction(STORE_NAME, "readwrite");
      var store = tx.objectStore(STORE_NAME);
      items.forEach(function (p) {
        try { store.add(p); } catch (e) { /* 忽略重复 key */ }
      });
    }).catch(function () { /* IndexedDB 不可用时静默 */ });
  }

  /* 超时兜底：IndexedDB 在隐私模式 / 存储被禁用时可能永远不回调，
     不能让首页产品区一直空白 */
  function withTimeout(promise, ms, fallback) {
    return Promise.race([
      promise,
      new Promise(function (resolve) {
        setTimeout(function () { resolve(fallback); }, ms);
      })
    ]);
  }

  function getAll() {
    return withTimeout(getAllRaw().catch(function () { return []; }), 1500, [])
      .then(function (list) {
        if (!list || !list.length) {
          return withTimeout(fetchSeedJSON(), 6000, []);   // 空库 → 直接用 JSON
        }
        /* 增量合并：JSON 里新部署而本地库还没有、且未被后台删除过的产品，
           补写进 IndexedDB，让首页和 admin 都能看到 */
        return withTimeout(fetchSeedJSON(), 6000, []).then(function (seed) {
          if (!seed || !seed.length) return list;
          var tomb = getTombstones();
          var known = {};
          list.forEach(function (p) { known[p.id] = true; });
          var fresh = seed.filter(function (p) {
            return p && p.id && !known[p.id] && tomb.indexOf(p.id) === -1;
          });
          if (fresh.length) {
            addAllSilently(fresh);
            list = list.concat(fresh);
          }
          return list;
        });
      });
  }

  /* 按产品 id 精确查询单条记录（用于心愿清单报价表补全规格） */
  function getById(id) {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readonly");
        var store = tx.objectStore(STORE_NAME);
        var req = store.get(id);
        req.onsuccess = function () {
          resolve(req.result || null);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function getByCategory(category) {
    return getAll().then(function (products) {
      return products.filter(function (p) {
        return effectiveCategory(p) === category;
      });
    });
  }

  /**
   * 按分类前缀查询（用于"全部"页面展示所有子分类）
   * 例如 getByCategoryPrefix('bedding') 会返回 category 为
   * 'bedding'、'bedding-blanket'、'bedding-cushion' 等所有产品
   */
  function getByCategoryPrefix(prefix) {
    return getAll().then(function (products) {
      return products.filter(function (p) {
        var cat = effectiveCategory(p);
        return cat === prefix || cat.indexOf(prefix + '-') === 0;
      });
    });
  }

  function add(product) {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        var store = tx.objectStore(STORE_NAME);
        var req = store.add(product);
        req.onsuccess = function () {
          resolve(product);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function update(product) {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        var store = tx.objectStore(STORE_NAME);
        var req = store.put(product);
        req.onsuccess = function () {
          resolve(product);
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function remove(id) {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        var store = tx.objectStore(STORE_NAME);
        var req = store.delete(id);
        req.onsuccess = function () {
          addTombstone(id);
          resolve();
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function clearAll() {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        var store = tx.objectStore(STORE_NAME);
        var req = store.clear();
        req.onsuccess = function () {
          resolve();
        };
        req.onerror = function () {
          reject(req.error);
        };
      });
    });
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
      reader.readAsDataURL(file);
    });
  }

  function exportData() {
    return getAll().then(function (products) {
      var dataStr = JSON.stringify(products, null, 2);
      var blob = new Blob([dataStr], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "heiligs-products-backup.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function importData(jsonStr) {
    var products = JSON.parse(jsonStr);
    return clearAll().then(function () {
      var promises = products.map(function (p) {
        return add(p);
      });
      return Promise.all(promises);
    });
  }

  global.ProductsDB = {
    openDB: openDB,
    getAll: getAll,
    getById: getById,
    getByCategory: getByCategory,
    getByCategoryPrefix: getByCategoryPrefix,
    add: add,
    update: update,
    remove: remove,
    clearAll: clearAll,
    fileToBase64: fileToBase64,
    exportData: exportData,
    importData: importData,
    withTimeout: withTimeout,
  };
})(window);
