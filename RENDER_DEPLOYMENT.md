# Render部署指南

本文檔說明如何將網站詐騙檢測工具部署到Render平台。

## 前置準備

1. 確保您有一個GitHub或GitLab帳戶並已將專案代碼推送到倉庫中
2. 確保倉庫中包含以下文件：
   - `Dockerfile`
   - `render.yaml`
   - `.dockerignore`
3. 註冊一個Render帳戶：https://render.com

## 部署步驟

### 方法1：使用Blueprint（推薦）

1. 登錄Render帳戶
2. 點擊Render儀表板上的"New Blueprint"按鈕
3. 選擇包含專案的GitHub/GitLab倉庫
4. Render將自動檢測`render.yaml`文件並配置服務
5. 設置環境變量：
   - `OPENAI_API_KEY`: 您的OpenAI API密鑰（必需）
6. 點擊"Apply Blueprint"按鈕
7. 等待部署完成

### 方法2：手動配置Web服務

1. 登錄Render帳戶
2. 點擊Render儀表板上的"New" -> "Web Service"
3. 選擇包含專案的GitHub/GitLab倉庫
4. 配置服務：
   - 名稱：`website-scam-detector`（或您喜歡的名稱）
   - 環境：選擇"Docker"
   - 分支：選擇您的主分支（通常是`main`或`master`）
5. 點擊"Advanced"並設置環境變量：
   - `OPENAI_API_KEY`: 您的OpenAI API密鑰（必需）
   - `PORT`: `10000`
6. 點擊"Create Web Service"按鈕
7. 等待部署完成

## 部署後檢查

1. 部署完成後，Render會提供一個URL訪問您的應用
2. 使用瀏覽器訪問該URL確認應用是否正常運行
3. 如果出現問題，您可以在Render儀表板中查看日誌進行排查

## 常見問題解決

### 1. 部署失敗

- 檢查Render日誌查看具體錯誤信息
- 確認`Dockerfile`配置正確
- 確認所有必需的環境變量都已設置

### 2. npm ci相關錯誤

如果您看到類似以下錯誤：
```
npm 錯誤 `npm ci`只有當您的package.json和package-lock.json或npm-shrinkwrap.json同步時才能安裝套件
```

這表示package.json和package-lock.json不同步。解決方法：
- 在Dockerfile中將`RUN npm ci`改為`RUN npm install`
- 提交修改並重新部署

### 3. 應用啟動但無法工作

- 檢查是否已正確設置`OPENAI_API_KEY`環境變量
- 確認Render服務計劃是否有足夠的資源運行Puppeteer
- 檢查是否有網絡連接問題

### 4. Puppeteer相關錯誤

如果看到與Puppeteer或Chrome相關的錯誤，請確保：
- `Dockerfile`中包含所有必需的Chrome依賴
- 在`server.js`中正確配置了Puppeteer啟動選項

### 5. Puppeteer版本棄用警告

如果您在部署日誌中看到類似以下警告：
```
npm 警告 棄用 puppeteer@21.11.0 ： < 22.8.2 不再受支持
```

這表示您使用的Puppeteer版本已被棄用。解決方法：
- 在`package.json`中更新Puppeteer版本到`"puppeteer": "^22.8.2"`或更高版本
- 提交更改並重新部署
- 注意：如果更新Puppeteer版本後遇到兼容性問題，可能需要相應地更新Puppeteer相關代碼

## 更新應用

當您更新代碼並推送到倉庫時，Render會自動重新部署應用（如果在服務設置中啟用了自動部署）。 