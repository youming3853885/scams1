// 頁面切換功能
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 顯示指定頁面
    document.getElementById(pageId).classList.add('active');
}

function goToHome() {
    showPage('page-home');
    // 重置輸入
    document.getElementById('url-input').value = '';
    // 清除先前的錯誤消息
    document.getElementById('error-message').textContent = '';
    document.getElementById('error-message').style.display = 'none';
}

// 全局變量用於存儲最近一次的掃描結果
let lastScanResult = null;

function goToLoading() {
    const url = document.getElementById('url-input').value.trim();
    
    if (!url) {
        showError('請輸入有效的網址');
        return;
    }
    
    // 驗證URL格式
    if (!isValidUrl(url)) {
        showError('請輸入有效的網址，例如: https://example.com');
        return;
    }
    
    // 隱藏錯誤消息
    document.getElementById('error-message').style.display = 'none';
    
    // 顯示載入頁面
    showPage('page-loading');
    
    // 重置進度條
    document.querySelector('.progress').style.width = '0%';
    
    // 開始掃描
    scanWebsite(url);
}

// 顯示錯誤消息
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function updateLoadingStatus(message, progress) {
    document.querySelector('.status').textContent = message;
    document.querySelector('.progress').style.width = `${progress}%`;
}

function goToResults() {
    showPage('page-results');
}

function goToDetails() {
    showPage('page-details');
}

// URL驗證函數
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 掃描網站的主函數
async function scanWebsite(url) {
    try {
        // 更新載入狀態
        updateLoadingStatus('正在獲取網站資訊...', 20);
        
        // 調用後端API
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        updateLoadingStatus('正在分析網站內容...', 50);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '掃描過程中發生錯誤');
        }
        
        updateLoadingStatus('正在生成風險評估報告...', 80);
        
        // 解析後端返回的結果
        const result = await response.json();
        
        // 儲存結果供後續使用
        lastScanResult = result;
        
        // 顯示分析結果
        displayAnalysisResults(result);
        
        updateLoadingStatus('完成!', 100);
        
        // 導航到結果頁面
        setTimeout(() => {
            goToResults();
        }, 500);
    } catch (error) {
        console.error('掃描失敗:', error);
        updateLoadingStatus(`掃描失敗: ${error.message}`, 100);
        
        // 返回首頁並顯示錯誤
        setTimeout(() => {
            goToHome();
            showError(`掃描失敗: ${error.message}`);
        }, 2000);
    }
}

// 顯示分析結果
function displayAnalysisResults(result) {
    // 更新頁面上的URL
    document.getElementById('website-url').textContent = result.url;
    
    // 更新掃描時間
    const scanDate = new Date(result.scanTime);
    const formattedTime = `${scanDate.getFullYear()}-${padZero(scanDate.getMonth() + 1)}-${padZero(scanDate.getDate())} ${padZero(scanDate.getHours())}:${padZero(scanDate.getMinutes())}`;
    document.getElementById('scan-time').textContent = formattedTime;
    
    // 清除之前可能存在的所有警告橫幅
    document.querySelectorAll('.api-warning, .app-warning-banner').forEach(el => el.remove());
    
    // 檢查是否為模擬數據
    if (result.analysis.isSimulatedData) {
        // 添加API配額不足的提示
        const warningBanner = document.createElement('div');
        warningBanner.className = 'api-warning';
        warningBanner.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>API配額不足，暫時顯示模擬數據。實際分析結果可能有所不同。</span>
        `;
        
        // 添加到結果容器的頂部
        const resultsContainer = document.querySelector('.results-container');
        resultsContainer.insertBefore(warningBanner, resultsContainer.firstChild);
    }
    
    // 檢查是否為應用程式連結
    if (result.appLinkInfo && result.appLinkInfo.isAppLink) {
        // 添加應用程式風險警告
        const appWarningEl = document.createElement('div');
        appWarningEl.className = 'app-warning-banner';
        appWarningEl.innerHTML = `
            <div class="warning-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="warning-text">
                <strong>應用程式連結警告！</strong> 
                <p>此網站可能連結到外部應用程式 (${result.appLinkInfo.appDomain || '未知應用'})。請格外警惕可能的詐騙風險。</p>
            </div>
        `;
        
        // 添加到結果容器的頂部
        const resultsContainer = document.querySelector('.results-container');
        if (document.querySelector('.api-warning')) {
            resultsContainer.insertBefore(appWarningEl, document.querySelector('.api-warning').nextSibling);
        } else {
            resultsContainer.insertBefore(appWarningEl, resultsContainer.firstChild);
        }
    }
    
    // 設置風險分數
    const riskScore = result.analysis.riskScore;
    document.getElementById('score-value').textContent = riskScore;
    
    // 根據風險分數更新樣式
    const scoreElement = document.getElementById('score-value');
    scoreElement.className = '';  // 清除現有的class
    if (riskScore < 30) {
        scoreElement.classList.add('low-risk');
    } else if (riskScore < 70) {
        scoreElement.classList.add('medium-risk');
    } else {
        scoreElement.classList.add('high-risk');
    }
    
    // 創建圓餅圖
    createScamChart(riskScore);
    
    // 更新截圖
    document.getElementById('website-screenshot').src = result.screenshot;
    
    // 清除現有標記
    document.querySelectorAll('.scam-marker').forEach(marker => {
        if (!marker.hasAttribute('style')) {
            marker.remove();
        }
    });
    
    // 添加詐騙標記
    result.markers.forEach(marker => {
        addScamMarker(marker.top, marker.left, marker.width, marker.height, marker.label);
    });
    
    // 更新詐騙特徵列表
    updateScamFeatures(result.analysis);
    
    // 更新詳細分析頁面
    updateDetailedAnalysis(result.analysis);
}

// 更新詐騙特徵列表
function updateScamFeatures(analysis) {
    const featuresContainer = document.querySelector('.scam-features');
    featuresContainer.innerHTML = ''; // 清空現有內容
    
    // 添加詐騙指標
    analysis.indicators.slice(0, 3).forEach(indicator => {
        const feature = document.createElement('div');
        feature.className = 'scam-feature warning';
        feature.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${indicator}</span>
        `;
        featuresContainer.appendChild(feature);
    });
    
    // 添加一些積極的指標（如果有的話）
    if (analysis.riskScore < 50) {
        const positiveFeature = document.createElement('div');
        positiveFeature.className = 'scam-feature';
        positiveFeature.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>網站使用安全連接</span>
        `;
        featuresContainer.appendChild(positiveFeature);
    }
}

// 更新詳細分析頁面
function updateDetailedAnalysis(analysis) {
    // 更新詳細卡片
    const detailsContent = document.querySelector('.details-content');
    detailsContent.innerHTML = ''; // 清空現有內容
    
    // 定義風險類別及其相應的圖標
    const riskCategories = [
        { name: '身份驗證風險', icon: 'fa-fingerprint', level: analysis.riskScore > 60 ? 'high-risk' : 'medium-risk', description: '評估網站身份驗證的可信度和安全性。' },
        { name: '資料安全', icon: 'fa-lock', level: analysis.riskScore > 70 ? 'high-risk' : 'medium-risk', description: '評估網站如何處理和保護用戶數據。' },
        { name: '網站可信度', icon: 'fa-history', level: analysis.riskScore > 50 ? 'high-risk' : 'low-risk', description: '評估網站的整體真實性和可信度。' },
        { name: '內容分析', icon: 'fa-comment-alt', level: analysis.riskScore > 40 ? 'high-risk' : 'medium-risk', description: '評估網站內容中的詐騙指標。' }
    ];
    
    // 如果是應用程式相關網站，添加特定風險類別
    if (analysis.isAppLink) {
        riskCategories.push({ 
            name: '應用程式安全', 
            icon: 'fa-mobile-alt', 
            level: analysis.riskScore > 50 ? 'high-risk' : 'medium-risk', 
            description: '評估與應用程式相關的特定風險。' 
        });
    }
    
    // 生成風險類別卡片
    riskCategories.forEach((category, index) => {
        const detailCard = document.createElement('div');
        detailCard.className = 'detail-card';
        
        const fillWidth = category.level === 'high-risk' ? 90 : (category.level === 'medium-risk' ? 60 : 30);
        
        detailCard.innerHTML = `
            <h3><i class="fas ${category.icon}"></i> ${category.name}</h3>
            <div class="risk-meter ${category.level}">
                <div class="meter-fill" style="width: ${fillWidth}%"></div>
                <span>${category.level === 'high-risk' ? '高風險' : (category.level === 'medium-risk' ? '中風險' : '低風險')}</span>
            </div>
            <p class="category-description">${category.description}</p>
        `;
        
        detailsContent.appendChild(detailCard);
    });
    
    // 安全建議部分
    const securityAdvice = document.createElement('div');
    securityAdvice.id = 'security-advice';
    securityAdvice.className = 'security-advice';
    securityAdvice.innerHTML = `<h3>安全建議</h3>`;
    
    const adviceList = document.createElement('ul');
    analysis.safetyAdvice.forEach(advice => {
        const adviceItem = document.createElement('li');
        adviceItem.textContent = advice;
        adviceList.appendChild(adviceItem);
    });
    
    securityAdvice.appendChild(adviceList);
    detailsContent.appendChild(securityAdvice);
    
    // 如果是應用程式相關，添加應用程式特定安全建議
    if (analysis.isAppLink) {
        // 添加應用程式特定的安全建議
        const appSecurityTips = [
            '不要安裝來源不明的應用程式',
            '檢查應用程式是否從官方應用商店下載',
            '謹慎掃描QR碼或點擊直接打開應用程式的連結',
            '避免在應用程式中輸入敏感個人資訊',
            '不要在應用程式中進行未經驗證的支付操作'
        ];
        
        const appTipsEl = document.createElement('div');
        appTipsEl.className = 'app-security-tips';
        appTipsEl.innerHTML = `
            <h3>應用程式安全提示</h3>
            <ul>
                ${appSecurityTips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        `;
        
        document.querySelector('#security-advice').appendChild(appTipsEl);
    }
    
    // 詐騙指標列表
    const indicatorSection = document.createElement('div');
    indicatorSection.className = 'fraud-indicators';
    indicatorSection.innerHTML = `<h3>詐騙指標</h3>`;
    
    const indicatorList = document.createElement('ul');
    analysis.indicators.forEach(indicator => {
        const indicatorItem = document.createElement('li');
        indicatorItem.textContent = indicator;
        indicatorList.appendChild(indicatorItem);
    });
    
    indicatorSection.appendChild(indicatorList);
    detailsContent.appendChild(indicatorSection);
}

// 補零函數（用於日期格式化）
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 創建詐騙風險圓餅圖
function createScamChart(riskScore) {
    const ctx = document.getElementById('scam-chart').getContext('2d');
    
    // 如果有舊的圖表實例，先銷毀
    if (window.scamChart) {
        window.scamChart.destroy();
    }
    
    // 創建新的圖表
    window.scamChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['詐騙風險', '安全指數'],
            datasets: [{
                data: [riskScore, 100 - riskScore],
                backgroundColor: [
                    riskScore < 30 ? '#2ecc71' : (riskScore < 70 ? '#f39c12' : '#e74c3c'),
                    '#ecf0f1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// 動態添加可疑標記
function addScamMarker(top, left, width, height, label) {
    const screenshot = document.querySelector('.screenshot');
    
    const marker = document.createElement('div');
    marker.className = 'scam-marker';
    marker.style.top = `${top}%`;
    marker.style.left = `${left}%`;
    marker.style.width = `${width}%`;
    marker.style.height = `${height}%`;
    
    const markerLabel = document.createElement('div');
    markerLabel.className = 'marker-label';
    markerLabel.textContent = label;
    
    marker.appendChild(markerLabel);
    screenshot.appendChild(marker);
}

// 報告URL函數
function reportUrl() {
    if (!lastScanResult) {
        alert('沒有可報告的URL');
        return;
    }
    
    alert(`感謝您的報告。我們已收到您對 ${lastScanResult.url} 的舉報，並將進行審核。`);
}

// 分享結果
function shareResults() {
    if (!lastScanResult) {
        alert('沒有可分享的結果');
        return;
    }
    
    // 構建要分享的文本
    const shareText = `我使用網站詐騙檢測工具檢測了 ${lastScanResult.url}，詐騙風險評分為 ${lastScanResult.analysis.riskScore}%。`;
    
    // 嘗試使用Web Share API
    if (navigator.share) {
        navigator.share({
            title: '網站詐騙檢測結果',
            text: shareText,
            url: window.location.href
        })
        .catch(error => {
            console.error('分享失敗:', error);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

// 後備分享方法
function fallbackShare(text) {
    // 創建臨時輸入框
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    
    // 選擇文本
    input.select();
    input.setSelectionRange(0, 99999);
    
    // 複製到剪貼板
    document.execCommand('copy');
    
    // 移除臨時輸入框
    document.body.removeChild(input);
    
    alert('分享文本已複製到剪貼板!');
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 入口頁面
    showPage('page-home');
    
    // 綁定回車鍵搜索
    document.getElementById('url-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            goToLoading();
        }
    });
    
    // 綁定詳細分析按鈕
    document.querySelector('.scam-score').addEventListener('click', function() {
        goToDetails();
    });
    
    // 分享按鈕
    document.getElementById('share-button').addEventListener('click', function() {
        shareResults();
    });
    
    // 回報按鈕
    document.getElementById('report-button').addEventListener('click', function() {
        reportUrl();
    });
}); 