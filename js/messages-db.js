/**
 * 留言数据库管理（IndexedDB）
 * 前台"在线留言"表单提交后写入，产品管理后台可查看与删除
 */
(function (global) {
  var DB_NAME = "heiligs_messages";
  var DB_VERSION = 1;
  var STORE_NAME = "messages";
  var db = null;

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      req.onsuccess = function (e) {
        db = e.target.result;
        resolve(db);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  }

  function getAll() {
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readonly");
        var store = tx.objectStore(STORE_NAME);
        var req = store.getAll();
        req.onsuccess = function () {
          var list = req.result || [];
          // 最新的留言排在最前
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

  function add(msg) {
    msg.id = msg.id || "msg-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    msg.createdAt = msg.createdAt || Date.now();
    return openDB().then(function () {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE_NAME, "readwrite");
        var store = tx.objectStore(STORE_NAME);
        var req = store.add(msg);
        req.onsuccess = function () {
          resolve(msg);
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

  global.MessagesDB = {
    openDB: openDB,
    getAll: getAll,
    add: add,
    remove: remove,
    clearAll: clearAll,
  };
})(window);
