FROM node:18-slim

# 設置工作目錄
WORKDIR /app

# 安裝Puppeteer所需的依賴
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 複製package.json和package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製所有檔案
COPY . .

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=10000

# 對外暴露端口
EXPOSE 10000

# 啟動應用
CMD ["node", "server.js"] 