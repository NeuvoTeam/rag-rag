# User Prompts Log

This document records all the prompts provided during the project lifecycle.

---

### Prompt 1
* **Timestamp**: 2026-11-12T03:07:40-08:00
* **Request**:
```text
Build me an app with screens that look like this. You can hotlink images from the URL: https://tradingviews.com/markets
```
* **Summary of Actions**:
  - Initialized application structure and styling.
  - Implemented TradingView Markets dashboard with Global Indices Ticker Strip, Superchart (Candlestick, Line, Area), Movers Grid (Gainers, Losers, Most Active), Stock Screener, Crypto Dashboard, Forex Matrix, Bonds & US Yield Curve, Heatmap Treemap, and Economic Calendar / News.

---

### Prompt 2
* **Timestamp**: 2026-11-12T03:28:50-08:00
* **Request**:
```text
git push https://<PAT>@https://github.com/NeuvoTeam/rag-rag.git
```
* **Summary of Actions**:
  - Initialized git repository on `main` branch.
  - Added and committed initial 27 project files (commit `8775139`).
  - Identified `<PAT>` placeholder and requested actual Personal Access Token.

---

### Prompt 3
* **Timestamp**: 2026-11-12T03:32:57-08:00
* **Request**:
```text
git push https://<REDACTED_GH_TOKEN>@https://github.com/NeuvoTeam/rag-rag.git
```
* **Summary of Actions**:
  - Configured git remote origin with user token.
  - Successfully pushed initial commit to `https://github.com/NeuvoTeam/rag-rag.git`.
  - Sanitized git remote URL to remove plain-text token.

---

### Prompt 4
* **Timestamp**: 2026-11-12T03:47:40-08:00
* **Request**:
```text
would you make it like a pro?
```
* **Summary of Actions**:
  - Upgraded application into an institutional-grade TradingView Pro terminal:
    - Running Ticker Tape marquee ribbon.
    - Technical indicator overlays (Bollinger Bands with shaded channel, MACD oscillator sub-pane with color-coded histogram, RSI, SMA 20, SMA 50).
    - Drawing tools (Trendlines, Horizontal rays, Fibonacci Retracements, Measurement ruler).
    - Level 2 Depth of Market (DOM) Order Book ladder.
    - Synchronized Multi-Chart correlation layouts (2-Split and 4-Grid).
    - Paper Trading Portfolio ($100,000 cash balance, open positions, mark-to-market P&L, 1-click execution).
    - Custom price alert manager with notifications.
    - GICS 11 Sector Performance Matrix and Corporate Earnings Calendar.
  - Committed changes (`f5d9c2d`) and pushed to GitHub remote repository.

---

### Prompt 5
* **Timestamp**: 2026-11-12T03:57:13-08:00
* **Request**:
```text
collate all the prompts that I've given and store into file named prompts.md
```
* **Summary of Actions**:
  - Created `prompts.md` collating all user prompts and corresponding execution summaries.
