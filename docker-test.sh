#!/bin/bash

echo "====== 開始測試Docker構建 ======"

# 構建Docker鏡像
echo "正在構建Docker鏡像..."
docker build -t scam-detector-test .

# 檢查構建狀態
if [ $? -eq 0 ]; then
    echo "✅ Docker鏡像構建成功"
else
    echo "❌ Docker鏡像構建失敗"
    exit 1
fi

echo "====== Docker構建測試完成 ======" 