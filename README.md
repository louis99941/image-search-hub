# Image Search Hub

![Image Search Hub](https://img.shields.io/badge/Image%20Search-Hub-111827?style=for-the-badge)

一次準備圖片，集中開啟多個反向圖片搜尋引擎。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/louis99941/image-search-hub)

> 本 repo 使用 Cloudflare Workers + Static Assets。圖片暫存改用 Workers Cache API，不需要 R2、KV、D1 或其他外部儲存。

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
- Worker Cache API 十分鐘暫存 URL
- 換圖、清除、頁面離開時主動刪除暫存內容
- 暫存到期後由 Cache API TTL 自然失效

## 搜尋策略

URL 型引擎使用短期圖片 URL 啟動搜尋；不支援穩定 URL 啟動的引擎則開啟官方搜尋頁，讓使用者自行完成上傳。刻意避免依賴網站私有 API、CAPTCHA 或容易變動的頁面 DOM。

## 一鍵部署

點擊上方 **Deploy to Cloudflare**，使用 Cloudflare 官方 Workers 部署流程。部署後 Worker 同時提供網站與 `/api/image` 暫存圖片 API。

不需要建立 R2 bucket，也不需要設定 R2 binding。

**注意：Cloudflare 官方 Deploy to Cloudflare button 要求 GitHub repository 可被部署流程存取；repository visibility / access 需依 Cloudflare 當下的部署流程要求設定。**

## 暫存圖片

本機圖片只有在需要提供公開圖片 URL 給反向圖片搜尋引擎時，才會 POST 到 Worker。

Worker 會：

1. 產生隨機 UUID。
2. 將圖片放進 Workers Cache API。
3. 回傳 `/api/image/<uuid>` URL。
4. 將快取 TTL 設為 600 秒。
5. 前端換圖、清除或離開頁面時盡可能發出 DELETE。
6. TTL 到期後 cache miss，無法再取得圖片。

因此這個專案本身不建立圖片資料庫、永久圖片儲存或使用者歷史紀錄。

## 開發

這是一個無 bundler 的 ES module 專案。可直接用 Wrangler 本機預覽或部署：

```bash
npx wrangler dev
npx wrangler deploy
```

## 目前限制

- 本地檔案的自動 URL 搜尋需要 Cloudflare Worker 暫存 endpoint。
- TinEye、Lenso、Copyseeker V1 尚未模擬網站內部上傳流程。
- 不包含圖片裁切、不保存搜尋紀錄、不建立帳號或雲端歷史。

## Roadmap

V1.1：搜尋預設組、自訂搜尋引擎、更多可直接使用圖片 URL 的引擎。

V2：瀏覽器擴充功能、PWA share target、engine health monitoring。

V3：在官方 API 或穩定資料來源可用的前提下，加入結果聚合、去重與來源摘要。
