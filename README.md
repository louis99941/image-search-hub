# Image Search Hub

![Image Search Hub](https://img.shields.io/badge/Image%20Search-Hub-111827?style=for-the-badge)

一次準備圖片，集中開啟多個反向圖片搜尋引擎。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/louis99941/image-search-hub)

> 本 repo 使用 Cloudflare Workers + Static Assets。圖片暫存使用 Workers KV，不需要 R2、D1 或其他外部儲存。

## V1.3

- V1.2 的真人照片 / 人臉、一般圖片、動漫 / 插畫三組搜尋分類
- 真人照片快速搜尋：PimEyes、FaceCheck.ID、Google Lens、Yandex、TinEye、Lenso.ai、Copyseeker
- 每個站台可單獨搜尋；不支援穩定 URL 啟動的站台直接開啟官方網站供使用者上傳
- Search Selected / Search All
- 每個搜尋引擎顯示目前啟動狀態：可啟動、已啟動、啟動失敗
- 自動 URL 型與手動上傳型的能力狀態清楚標示
- 搜尋引擎勾選狀態可記住在目前瀏覽器，並可一鍵恢復預設
- 設定只使用瀏覽器 localStorage，不保存圖片或搜尋歷史
- 深色模式
- Cloudflare Worker + Static Assets
- Worker KV 十分鐘暫存 URL
- 上傳 API 僅接受同源請求
- 上傳 API 每個 IP 每分鐘最多 10 次
- 換圖、清除、頁面離開時主動刪除暫存內容
- 暫存到期後由 KV TTL 自然失效

## 搜尋策略

真人照片用途優先使用人臉與一般反向圖片搜尋服務交叉查找。URL 型引擎使用短期圖片 URL 啟動搜尋；不支援穩定 URL 啟動的引擎則開啟官方搜尋頁，讓使用者自行完成上傳。刻意避免依賴網站私有 API、CAPTCHA 或容易變動的頁面 DOM。

## 一鍵部署

點擊上方 **Deploy to Cloudflare**，使用 Cloudflare 官方 Workers 部署流程。部署後 Worker 同時提供網站與 `/api/image` 暫存圖片 API。

不需要建立 R2 bucket，也不需要設定 R2 binding。

**注意：Cloudflare 官方 Deploy to Cloudflare button 要求 GitHub repository 可被部署流程存取；repository visibility / access 需依 Cloudflare 當下的部署流程要求設定。**

## 暫存圖片

本機圖片只有在需要提供公開圖片 URL 給反向圖片搜尋引擎時，才會 POST 到 Worker。

Worker 會：

1. 驗證請求是否來自同一個網站來源。
2. 以 Cloudflare-Connecting-IP 做簡單的每分鐘上傳次數限制。
3. 產生隨機 UUID。
4. 將圖片放進 Workers KV。
5. 回傳 `/api/image/<uuid>` URL。
6. 將圖片 TTL 設為 600 秒。
7. 前端換圖、清除或離開頁面時盡可能發出 DELETE。
8. TTL 到期後 KV 自然失效，無法再取得圖片。

因此這個專案本身不建立圖片資料庫、永久圖片儲存或使用者歷史紀錄。

## 開發

這是一個無 bundler 的 ES module 專案。可直接用 Wrangler 本機預覽或部署：

```bash
npx wrangler dev
npx wrangler deploy
```

## 目前限制

- 本地檔案的自動 URL 搜尋需要 Cloudflare Worker 暫存 endpoint。
- TinEye、Lenso、Copyseeker 尚未模擬網站內部上傳流程。
- 不包含圖片裁切、不保存搜尋紀錄、不建立帳號或雲端歷史。
- 簡單 rate limit 使用 KV 計數，屬於基礎防濫用措施，不是嚴格的全域流量控制。
- PimEyes、FaceCheck.ID 等人臉搜尋服務的實際使用方式與結果受各服務本身的條款、地區與反自動化機制限制。
- V1.3 的「引擎健康狀態」是前端啟動狀態與已知能力提示，不代表遠端搜尋服務的即時可用性。

## Roadmap

V1.4：在官方 API 或穩定資料來源可用的前提下，加入結果聚合與來源整理。

V2：瀏覽器擴充功能、PWA share target、自訂搜尋組。

V3：在合法且穩定的資料來源前提下，加入結果去重、相似來源整理與跨引擎摘要。
