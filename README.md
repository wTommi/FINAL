# 📊 西瓜價格通膨觀察平台

**資訊二丁 王世銘**  
📌 GitHub：[https://github.com/wTommi/FINAL](https://github.com/wTommi/FINAL)

## 🆚 0. 和上次作業的差異：「通貨膨脹 - 你關心缺蛋嗎？」

### ✅ 本次新增重點：

- 通膨率趨勢圖
- 新增價格輸入表單

## 🎯 計畫目的

透過「使用者輸入歷年實際價格」，計算 **CPI（消費者物價指數）通膨率**，以觀察台灣西瓜價格通膨趨勢。  
用戶可以：

- 🔍 查詢歷史價格
- 📝 新增價格（平均更新資料庫）
- 📈 檢視趨勢圖與通膨變化

## 🔢 1. 通膨率（CPI）計算方式

### ✏️ 說明：

- 以 2004 年為基準點
- 計算三種西瓜的加權價格平均（大粒、小粒、無子），權重各為 `0.333`。
- 以 CPI 為基礎，計算逐年通膨率：通膨率 = ( 今年 CPI + 去年 CPI ) / 100

### ⚙️ 實作（`index.js`）：

- 透過 `calculateCPI(data)` 計算各年 CPI。
- 使用 Chart.js 繪製通膨率趨勢圖。
- data 資料來源為 `/api` 後端回傳的 JSON。

```javascript
const res = await fetch("/api", {
  method: "GET",
  headers: { "Content-Type": "application/json" },
});
const data = await res.json();
renderCPIChart(data);

function renderCPIChart(data) {
  const cpiData = calculateCPI(data);
  /*省略*/
}

function calculateCPI(data) {
  const watermelonTypes = ["西瓜(大粒)", "西瓜(小粒)", "西瓜(無子)"];
  /*省略*/
}

app.get("/api", (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {});
});
```

## ➕ 2. 新增價格

### ✏️ 說明：

- 用戶輸入：年份、價格、西瓜種類。
- 若資料庫中已有該筆資料，與新價格平均後再請求**更新**。
- 若資料庫無資料，則直接新增該筆資料。

### ⚙️ 實作：

- 前端利用 `fetch` 向 `/api/watermelon` 取得該輸入表單相同名稱、年份的舊價格。
- 使用 `POST` 向 `/api/watermelons` 傳送更新後的資料。
- 後端 `app.js`：
  - `GET /api/watermelon`：查詢是否已有該筆資料。
  - `POST /api/watermelons`：更新或 `INSERT` 新資料。

```javascript
app.get('/api/watermelon', (req, res) => {
  /*省略*/
  db.get('SELECT price FROM users WHERE date = ? AND name = ?', [year, type], (err, row) => {
   /*省略*/
  });
});

app.post('/api/watermelons', (req, res) => {
  /*省略*/
  db.run('UPDATE users SET price = ? WHERE date = ? AND name = ?', [price, year, type], function(err) {
    /*省略*/
    if (this.changes === 0) {
      // 若無此資料則新增
      db.run('INSERT INTO users (date, price, name) VALUES (?, ?, ?)', [year, price, type], function(err2) {
        /*省略*/
      });
    }
    /*省略*/
});

function setupInputForm() {
    /*省略*/
    const res = await fetch(`/api/watermelon?year=${year}&type=${type}`); // get 方法
    const data = await res.json();
    /*省略*/
    await fetch('/api/watermelons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, type, price: Number(newAvg) })
    });
    alert('資料已更新！');
    /*省略*/
}
```

## 📊 3. 圖表呈現與視圖切換

### 🖼️ 趨勢圖：

- 價格趨勢圖（Chart.js 折線圖）
- 表格列表
- 通膨率趨勢圖
- 新增資料表單（表單送出即更新資料庫）

### ⚙️ 函式：

- 使用 `.view-container` 類別搭配 `.active` 切換不同圖片或表格。
- JavaScript 中的 `setupViewToggle()` 處理畫面顯示切換。

```javascript
function setupViewToggle() {
  const chartViewBtn = document.getElementById("chart-view-btn");
  const tableViewBtn = document.getElementById("table-view-btn");
  const cpiViewBtn = document.getElementById("CPI");
  const inputDataBtn = document.getElementById("input-data-btn");
  const chartContainer = document.getElementById("chart-container");
  const cpiChartContainer = document.getElementById("cpi-chart-container");
  const tableContainer = document.getElementById("table-container");
  const inputFormContainer = document.getElementById("input-form-container");

  chartViewBtn.addEventListener("click", () => {
    chartViewBtn.classList.add("active");
    tableViewBtn.classList.remove("active");
    cpiViewBtn.classList.remove("active");
    inputDataBtn.classList.remove("active");
    chartContainer.style.display = "block";
    cpiChartContainer.style.display = "none";
    tableContainer.style.display = "none";
    inputFormContainer.style.display = "none";
  });

  tableViewBtn.addEventListener("click", () => {
    /*省略*/
  });

  cpiViewBtn.addEventListener("click", async () => {
    /*省略*/
  });

  inputDataBtn.addEventListener("click", () => {
    /*省略*/
  });
}
```

- `renderChart()`：繪製西瓜年均價格折線圖。
- `renderCPIChart()`：繪製通膨率折線圖，了解歷年趨勢。

## 🔎 4. 查詢功能（條件搜尋）

### ✏️ 說明：

用戶可輸入條件篩選歷史資料：

- 起始 / 結束年份
- 價格上限
- 西瓜種類（模糊搜尋）

### ⚙️ 技術實作：

- `GET /api/search` 支援條件組合查詢（SQL 語法拼接）。
- 查詢後更新圖表與表格資料內容。

## 🎨 前端樣式設計（style.css）

- 切換按鈕有 `.active` 樣式控制當前視圖的 display 顯示。
- 增加響應式設計，原本趨勢圖會跑版。

## 🧩 系統架構總覽

| 模組         | 功能描述                                 |
| ------------ | ---------------------------------------- |
| `index.html` | 前端畫面結構、按鈕、圖表容器、輸入欄位等 |
| `index.js`   | 控制畫面切換、圖表繪製、表單送出         |
| `style.css`  | 頁面風格與按鈕樣式                       |
| `app.js`     | Node.js + Express API 伺服器端邏輯       |
| `SQLite`     | 使用者輸入資料儲存與查詢，表名為 `users` |

### 🔮 改進內容：

- 用戶輸入價格時，可以根據數據的標準差，限制輸入標準差內
- 新增用戶登入、建議改進方向的留言區
- 在資料庫新增欄位[次數]，計算全部資料的平均，而不是舊價格和新價格取平均
