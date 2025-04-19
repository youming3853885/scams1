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

### 2. 應用啟動但無法工作

- 檢查是否已正確設置`OPENAI_API_KEY`環境變量
- 確認Render服務計劃是否有足夠的資源運行Puppeteer
- 檢查是否有網絡連接問題

### 3. Puppeteer相關錯誤

如果看到與Puppeteer或Chrome相關的錯誤，請確保：
- `Dockerfile`中包含所有必需的Chrome依賴
- 在`server.js`中正確配置了Puppeteer啟動選項

## 更新應用

當您更新代碼並推送到倉庫時，Render會自動重新部署應用（如果在服務設置中啟用了自動部署）。 