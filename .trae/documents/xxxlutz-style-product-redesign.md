# 参照 XXXLutz 首页全面改造方案

## Context

用户要求参照 www.xxxlutz.de 首页改造现有家纺品牌单页站，并明确希望**更接近原站**的视觉风格和布局结构。用户后续会上传大量产品照片，因此产品展示体系需可扩展。

**XXXLutz 视觉风格**：白底 + 红色(#D31145)点缀 + 黑色文字；粗体无衬线字体；卡片白底 + 微阴影 + 圆角(8-12px)；大图为主、文字精简；header 含全宽搜索栏 + 工具图标；页脚深色背景 + 多列链接。

**改造策略**：采用 XXXLutz 的页面结构和卡片式布局，保留品牌暖色调(米白/棕/金)但调整为更干净的商业风格。精简品牌叙事区(哲学/工艺)，聚焦产品展示。

## 新页面结构（对照 XXXLutz）

| 序号 | 区块 | 对标 XXXLutz | 现有状态 |
|:---|:---|:---|:---|
| 1 | 顶部促销条 | Promo bar | **新增** |
| 2 | Header（全宽搜索 + 工具图标） | Header | **重构** |
| 3 | Hero 轮播 | Hero carousel | 保留 |
| 4 | 主题活动卡片网格 | "Zeit für Gemütlichkeit" | **新增** |
| 5 | 按空间选购网格 | "Wohnträume" | **新增** |
| 6 | 热门品类网格 | "Kategorien im Rampenlicht" | **新增** |
| 7 | 热销产品区（标签切换） | "Besonders beliebt" | **重构** |
| 8 | 灵感与趋势 | "Wohnwelten" | 保留(生活方式) |
| 9 | 服务优势条 | "Ihre Vorteile" | **新增** |
| 10 | 品牌简介 SEO 文本 | Welcome text | **新增** |
| 11 | 页脚（多列链接） | Footer | **重构** |

> 现有「品牌哲学」「匠心工艺」区移除，「品牌故事」精简后并入 SEO 文本区。

## 详细设计

### 1. 顶部促销条

```html
<div class="promo-bar">
  <p>全店满 ¥399 包邮 · 30 天无理由退换 · 新人立减 ¥50</p>
</div>
```
- 深棕底白字，居中，高 36px，font-size 12px
- 固定在 header 上方

### 2. Header 重构

```
[汉堡菜单] [LOGO] [======= 全宽搜索栏 =======] [收藏♡] [购物车🛒]
```
- 搜索栏移至 header 中央，占满中间空间
- 新增收藏/购物车图标（纯前端，暂无实际功能）
- 汉堡菜单展开品类侧边栏（沙发毯/盖毯/抱枕/寝具）
- 白底 + 底部细线，sticky 固定

### 3. Hero 轮播 — 保留不变

### 4. 主题活动卡片网格

```html
<section class="campaign-grid section">
  <div class="container">
    <h2 class="block-title">秋冬新品 · 温暖上市</h2>
    <div class="campaign-cards">
      <a class="campaign-card" href="#series">
        <img src="..." />
        <div class="campaign-overlay">
          <h3>沙发毯系列</h3>
          <span>立即选购 →</span>
        </div>
      </a>
      <!-- 4 张：沙发毯/盖毯/抱枕/寝具 -->
    </div>
  </div>
</section>
```
- 2×2 网格，每张卡大图 + 左下角文字覆盖层
- hover 图片缩放 + 文字上移
- 卡片圆角 12px + 微阴影

### 5. 按空间选购网格

```html
<section class="room-cats section section-tint">
  <div class="container">
    <h2 class="block-title">按空间选购</h2>
    <div class="room-grid">
      <a class="room-card" href="#series">
        <img src="..." />
        <span class="room-label">客厅</span>
      </a>
      <!-- 6 个：客厅/卧室/书房/儿童房/餐厅/全部 -->
    </div>
  </div>
</section>
```
- 6 列网格(移动端 2 列)，圆形或圆角图片 + 下方标签
- 简洁、图标式风格

### 6. 热门品类网格

```html
<section class="cat-spotlight section">
  <div class="container">
    <h2 class="block-title">热门品类</h2>
    <div class="spotlight-grid">
      <a class="spotlight-card" href="#series">
        <img src="..." />
        <h3>灯芯绒</h3>
      </a>
      <!-- 5 个：灯芯绒/法兰绒/羊羔绒/长毛绒/全部分类 -->
    </div>
  </div>
</section>
```
- 5 列网格(移动端 2 列)，小卡 + 品类名

### 7. 热销产品区（核心重构）

```html
<section class="products section" id="series">
  <div class="container">
    <div class="products-head">
      <h2 class="block-title">热销臻品</h2>
      <div class="product-tabs">
        <button class="tab-btn active" data-filter="all">全部</button>
        <button class="tab-btn" data-filter="hot">热销</button>
        <button class="tab-btn" data-filter="new">新品</button>
        <button class="tab-btn" data-filter="suit">沙发毯·套装</button>
        <button class="tab-btn" data-filter="blanket">双面盖毯</button>
      </div>
    </div>
    <div class="product-grid">
      <article class="product-card" data-category="suit" data-tag="hot">
        <div class="product-media">
          <img src="..." />
          <span class="product-badge">热销</span>
        </div>
        <div class="product-info">
          <h3>珊瑚橘 · 灯芯绒沙发毯三件套</h3>
          <div class="price-row">
            <span class="price-now">¥399</span>
            <span class="price-was">¥599</span>
            <span class="price-save">省¥200</span>
          </div>
        </div>
      </article>
    </div>
    <div class="load-more-wrap">
      <button class="btn btn-outline" id="loadMore">查看更多产品 ↓</button>
    </div>
  </div>
</section>
```

**产品卡视觉**（参照 XXXLutz）：
- 白底 + 圆角 12px + 微阴影
- 大图 + 左上角角标(热销/新品 badge)
- 产品名(粗体) + 价格行(现价红色 + 原价划线 + 节省金额)
- hover 卡片上移 + 阴影加深

**标签切换**：热销/新品/分类筛选，复用并扩展现有 JS 筛选逻辑

**加载更多**：初始 8 个 → 每次加载 8 个 → 全部显示后隐藏按钮

### 8. 灵感与趋势 — 保留生活方式画廊，改标题为"灵感与趋势"

### 9. 服务优势条

```html
<section class="benefits section-tint">
  <div class="container">
    <div class="benefits-grid">
      <div class="benefit-item"><svg.../> <div><strong>30天退换</strong><p>无忧退货</p></div></div>
      <!-- 5 项 -->
    </div>
  </div>
</section>
```
- 5 列横排(移动端 2 列)，图标 + 标题 + 描述

### 10. 品牌简介 + SEO 文本

```html
<section class="brand-seo section">
  <div class="container">
    <h2 class="block-title">关于宁波赫力格斯</h2>
    <p>宁波赫力格斯 HEILIGS PIER，高端家纺品牌……（精简版品牌故事 + SEO 关键词）</p>
    <p>热门搜索：沙发毯、双面盖毯、抱枕套、灯芯绒、法兰绒……</p>
  </div>
</section>
```

### 11. 页脚重构

参照 XXXLutz 深色多列页脚：
```
[LOGO]                    服务与帮助    关于赫力格斯
[品牌简介]                配送说明      品牌故事
                          退换政策      门店查找
                          常见问题      联系我们
                          ─────────────────────────
                          支付方式图标 · 社交媒体 · 法律信息 · © 2026
```

## CSS 风格调整

| 属性 | 现有 | 调整后 |
|:---|:---|:---|
| 卡片圆角 | 0 (直角) | 12px (border-radius) |
| 卡片阴影 | hover 才有 | 始终微阴影 + hover 加深 |
| 产品价格 | 单一价格 | 现价(金/红) + 原价(划线) + 节省额 |
| 标签筛选 | border 按钮 | 下划线式 tab（参照 XXXLutz） |
| 区块标题 | serif 居中带 eyebrow | 粗体左对齐 + 右侧"查看全部→"链接 |
| 背景 | 纯色/浅色交替 | 保持，但更干净 |

## 实施步骤

| 步骤 | 内容 |
|:---|:---|
| 1 | index.html: 新增顶部促销条 + 重构 header(全宽搜索 + 工具图标) |
| 2 | index.html: Hero 后新增主题活动卡片网格 |
| 3 | index.html: 新增按空间选购 + 热门品类网格 |
| 4 | index.html: 重构产品区(标签 tab + 价格行 + badge + 加载更多) |
| 5 | index.html: 新增服务优势条 + 品牌简介 SEO 区 |
| 6 | index.html: 重构页脚(深色多列) |
| 7 | index.html: 移除品牌哲学 + 匠心工艺区(内容并入品牌简介) |
| 8 | css/style.css: 新增所有新区块样式 + 卡片圆角/阴影/价格行/tab 样式 |
| 9 | js/main.js: 扩展筛选(tab 式) + 加载更多 + 品类卡片联动 |

## 图片处理

- 主题活动/空间/品类卡片：暂时复用现有产品图，用户后续上传新品类图后替换
- 产品卡：现有 7 个产品保持，后续用户上传新品时按相同 product-card 结构添加
- 不新生成图片（避免与用户后续上传冲突）

## 验证方式

1. 打开 index.html，从上到下检查所有新区块显示正常
2. 标签切换(全部/热销/新品/分类)功能正常
3. 加载更多按钮正常工作(8→16→全部)
4. 搜索功能仍正常
5. 品类卡片点击 → 联动筛选 + 滚动到产品区
6. 移动端响应式正常(2 列卡片 + 搜索栏)
7. 页脚多列链接正确显示
