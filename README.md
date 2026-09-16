# Image Search Hub

一次準備圖片，集中開啟多個反向圖片搜尋引擎。

## V1

- 拖放、檔案選擇、Ctrl/Cmd+V 貼上圖片
- 圖片 URL 輸入
- 瀏覽器端縮放、WebP 正規化、去除原始 EXIF
- 旋轉與重設
- Google Lens、Bing Visual Search、Yandex Images、TinEye、Lenso.ai、Copyseeker
- Search Selected / Search All
- 深色模式
- IndexedDB 本機搜尋歷史
- Cloudflare Pages Functions + R2 十分鐘暫存 URL

## 搜尋策略

Google Lens、Bing Visual Search、Yandex Images 目前使用圖片 URL 啟動搜尋；TinEye、Lenso.ai、Copyseeker 先開啟官方搜尋頁，讓使用者自行完成上傳。這樣可以避免依賴網站私有 API、CAPTCHA 或容易變動的頁面 DOM。

Google 官方說明支援上傳圖片、拖放及圖片 URL；Bing Visual Search 的目前頁面提供上傳、拖放以及 Paste image or URL；TinEye 官方說明支援上傳、拖放、剪貼簿及圖片 URL。citeturn678252search3turn581195search5turn581195search0

## Cloudflare Pages

1. 在 Cloudflare Pages 連接此 GitHub repository。
2. Build command 留空，Build output directory 使用 `/`。
3. 建立 R2 bucket：`image-search-hub-temp`，或修改 `wrangler.toml` 的 bucket name。
4. 確認 Pages Functions 可取得 `IMAGE_BUCKET` R2 binding。
5. 部署後，`POST /api/image` 會產生十分鐘暫存物件，`GET /api/image/:id` 只在有效期限內提供圖片。

## 開發

這是一個無 bundler 的 ES module 專案，可以直接在靜態伺服器上預覽。需要 Cloudflare Pages Functions + R2 時，使用 Wrangler / Cloudflare dashboard 部署。

## Roadmap

V2：瀏覽器擴充功能、PWA share target、多裁切、搜尋預設組、Custom engine。

V3：在官方 API 或穩定資料來源可用的前提下，加入結果聚合、去重與來源摘要。
