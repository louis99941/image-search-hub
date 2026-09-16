# Image Search Hub

![Image Search Hub](https://img.shields.io/badge/Image%20Search-Hub-111827?style=for-the-badge)

一次準備圖片，集中開啟多個反向圖片搜尋引擎。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/louis99941/image-search-hub)

> 一鍵部署按鈕使用 Cloudflare Workers 的官方 Deploy to Cloudflare flow。Cloudflare 目前的官方按鈕支援 Workers，不支援 Pages；本 repo 已同時提供 Workers Static Assets + Worker API 部署模式。

## V1

- 拖放、檔案選擇、Ctrl/Cmd+V 貼上圖片
- 圖片 URL 輸入
- 瀏覽器端縮放、WebP 正規化、去除原始 EXIF
- 手動旋轉與重設；**不自動裁切**
- Google Lens、Bing Visual Search、Yandex Images、TinEye、Lenso.ai、Copyseeker adapters
- Search Selected / Search All
- 深色模式
- **不建立本機或雲端搜尋歷史**
- Cloudflare Worker + Static Assets
- R2 十分鐘暫存 URL
- 換圖、清除、頁面離開時主動刪除暫存物件
- Worker 每 10 分鐘定期掃描並刪除逾期物件

## 搜尋策略

URL 型引擎使用短期圖片 URL 啟動搜尋；不支援穩定 URL 啟動的引擎則開啟官方搜尋頁，讓使用者自行完成上傳。刻意避免依賴網站私有 API、CAPTCHA 或容易變動的頁面 DOM。

## 一鍵部署

點擊上方 **Deploy to Cloudflare** 後，Cloudflare 會讀取 repo 的 Wrangler 設定，建立 Worker，並處理設定裡宣告的 Cloudflare 資源；此 repo 宣告 `IMAGE_BUCKET` R2 binding。

部署時：

1. 選擇你的 GitHub 帳號與 repository。
2. 設定 Worker 名稱與 R2 bucket 名稱（預設 `image-search-hub-temp`）。
3. 完成部署後，Worker 同時提供網站與 `/api/image` API。
4. 後續推送到 production branch 可透過 Workers Builds 持續部署。

**注意：repo 必須是 public 才能使用 Cloudflare 官方 Deploy to Cloudflare button。**

## Cloudflare Pages

如果你仍然要使用 Pages，也可以用原本的 `functions/` 目錄與 Pages Git integration。Cloudflare Pages 支援把 GitHub repository 連接到 Pages，之後 push 到 production branch 會自動部署。

Pages 的 R2 binding 仍需在 Cloudflare Dashboard → Workers & Pages → 該 Pages project → Settings → Bindings → R2 bucket 綁定。

## R2 自動清理

暫存物件全部放在 `temporary/` prefix，metadata 內保存 `expiresAt`。

Worker 的 Cron Trigger 每 10 分鐘執行一次清理逾期物件；API 在讀取時也會檢查期限並立即刪除過期物件。前端換圖、清除圖片與離開頁面也會盡可能主動 DELETE。

`r2-lifecycle.json` 另外提供 bucket lifecycle 的 600 秒規則，供需要在 R2 bucket 層再加一道清理保險時使用。

套用 lifecycle：

```bash
npx wrangler r2 bucket lifecycle set image-search-hub-temp --file r2-lifecycle.json
```

## 開發

這是一個無 bundler 的 ES module 專案。純前端內容可直接用任何靜態伺服器預覽；啟用圖片 URL 暫存功能時，需要 Cloudflare Worker + R2。

## 目前限制

- 本地檔案的自動 URL 搜尋需要 R2 binding。
- TinEye、Lenso、Copyseeker V1 尚未模擬網站內部上傳流程。
- 不包含圖片裁切、不保存搜尋紀錄、不建立帳號或雲端歷史。

## Roadmap

V1.1：搜尋預設組、自訂搜尋引擎、更多可直接使用圖片 URL 的引擎。

V2：瀏覽器擴充功能、PWA share target、engine health monitoring。

V3：在官方 API 或穩定資料來源可用的前提下，加入結果聚合、去重與來源摘要。
