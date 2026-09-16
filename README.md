# Image Search Hub

一次準備圖片，集中開啟多個反向圖片搜尋引擎。

## V1 foundation

- 拖放、檔案選擇、Ctrl/Cmd+V 貼上圖片
- 圖片 URL 輸入
- 瀏覽器端縮放、WebP 正規化、去除原始 EXIF
- 旋轉與重設
- Google Lens、Bing Visual Search、Yandex Images、TinEye、Lenso.ai、Copyseeker adapters
- Search Selected / Search All
- 深色模式
- 不建立本機或雲端搜尋歷史
- Cloudflare Pages Functions + R2 十分鐘暫存 URL
- 暫存圖片主動刪除 + R2 lifecycle 自動清理保險

## 搜尋策略

URL 型引擎使用短期公開圖片 URL 啟動搜尋；不支援穩定 URL 啟動的引擎則開啟官方搜尋頁，讓使用者自行完成上傳。這個策略刻意避免依賴網站私有 API、CAPTCHA 或容易變動的頁面 DOM。

## Cloudflare Pages

1. 在 Cloudflare Pages 連接此 GitHub repository。
2. Build command 留空，Build output directory 使用 `/`。
3. 建立 R2 bucket：`image-search-hub-temp`，或修改 `wrangler.toml` 的 bucket name。
4. 確認 Pages Functions 可取得 `IMAGE_BUCKET` R2 binding。
5. 部署後，`POST /api/image` 會建立 `temporary/` 下的暫存物件，`GET /api/image/:id` 會在期限到期後拒絕提供。

### R2 lifecycle

`r2-lifecycle.json` 已設定 `temporary/` prefix 的 600 秒（10 分鐘）Age expiration。Cloudflare R2 lifecycle 的 Age 條件以秒表示；物件實際刪除通常會有排程延遲，因此程式仍會在前端結束工作階段、換圖或計時到期時主動 DELETE，API 在過期後也會做 lazy deletion。citeturn467068view0

使用 Wrangler 套用設定：

```bash
npx wrangler r2 bucket lifecycle set image-search-hub-temp --file r2-lifecycle.json
```

也可以在 Cloudflare Dashboard → R2 → 該 bucket → Settings → Object Lifecycle Rules 檢查規則。Cloudflare 文件指出 lifecycle 是 bucket 層級設定，物件通常會在到期後於 24 小時內被移除。citeturn967340search0

## 開發

這是一個無 bundler 的 ES module 專案，可以直接在靜態伺服器上預覽。需要 Cloudflare Pages Functions + R2 時，使用 Wrangler 或 Cloudflare Dashboard 部署。

## 目前限制

- 本地檔案的自動 URL 搜尋需要設定 R2 binding。
- TinEye、Lenso、Copyseeker V1 尚未模擬網站內部上傳流程。
- 目前不包含圖片裁切、不保存搜尋紀錄、不建立帳號或雲端歷史。

## Roadmap

V1.1：搜尋預設組、自訂搜尋引擎、更多可直接使用圖片 URL 的引擎。

V2：瀏覽器擴充功能、PWA share target、engine health monitoring。

V3：在官方 API 或穩定資料來源可用的前提下，加入結果聚合、去重與來源摘要。
