# CopyPrompt 🚀

> **Discover a prompt. Copy it. Use it with your favorite AI.**  
> 找到需要的 Prompt，一鍵複製，直接貼到你常用的 ChatGPT、Gemini、Claude 等 AI 工具。

---

## ✨ Features (功能特色)

- ⚡ **1-Click Copy (一鍵複製)**：點擊即可複製完整 Prompt，附帶流暢按鈕反饋與 Toast 提示。
- 🔍 **Real-time Search (即時搜尋)**：輸入關鍵字即時篩選標題、描述、標籤及內容。
- 🏷️ **9 Curated Categories (9 大實用分類)**：
  - 📸 Fun Photos & Stickers (趣味生圖與貼圖 - 10 個)
  - ✍️ Writing & Communication (寫作與溝通 - 8 個)
  - 💼 Productivity (效率提升 - 7 個)
  - 💻 Coding & Development (程式開發 - 8 個)
  - 📚 Learning & Education (學習與教育 - 7 個)
  - 📈 Business & Marketing (商業與行銷 - 6 個)
  - 🌐 Translation & Languages (翻譯與語言 - 5 個)
  - 🎨 Creativity (創意發想 - 5 個)
  - 🧠 Daily Life (日常生活 - 4 個)
- 🌐 **Dual-Language i18n (雙語支援)**：
  - 預設 English (US)，支援繁體中文（台灣）切換。
  - 支援 URL 參數切換：`?lang=en-US` 或 `?lang=zh-TW`。
- ❤️ **Local Favorites (離線收藏)**：基於瀏覽器 `localStorage`，無需登入、無需資料庫。
- 📱 **Mobile First & Dark Tech Theme (手機友善與深色科技風)**：深色背景、藍紫色漸層、觸控友好的按鈕設計。

---

## 📂 Project Structure (專案結構)

```text
copy-prompt/
├── index.html           # 網站主結構
├── styles.css           # 科技風深色主題樣式與響應式排版
├── app.js               # 搜尋、分類、多語言、收藏、複製等互動邏輯
├── data/
│   └── prompts.json     # 集中管理 60 個實用 Prompt（支援雙語）
├── locales/
│   ├── en-US.json       # 英文介面翻譯字典
│   └── zh-TW.json       # 繁體中文介面翻譯字典
├── assets/
│   └── favicon.svg      # 科技風漸層向量圖示
└── README.md
```

---

## 🚢 Deployment (部署到 Cloudflare Pages / GitHub Pages)

本專案為純靜態網站（Vanilla HTML + CSS + JS），無任何構建步驟（Build Step）。

### 部署到 Cloudflare Pages：
1. 將本專案推送到 GitHub。
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/) ➜ **Workers & Pages** ➜ **Create application** ➜ **Pages**。
3. 連結你的 GitHub 儲存庫。
4. **Build settings**：
   - **Framework preset**：`None`
   - **Build command**：*(留空)*
   - **Build output directory**：*(留空或設為 `/`)*
5. 點擊 **Save and Deploy**，幾秒鐘即可上線！
