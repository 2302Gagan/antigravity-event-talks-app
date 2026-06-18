# 🚀 BigQuery Release Hub

A modern, responsive dashboard web application designed to fetch, display, search, filter, and tweet the latest release notes from Google Cloud BigQuery.

---

## 🎨 Preview & Aesthetics

The application features a sleek, futuristic dark-theme interface built with:
*   **Glassmorphic Design**: Soft transparent layouts with background blur filters.
*   **Curated Color Palette**: Responsive glow elements, styled neon borders, and color-coded status badges for each category.
*   **Micro-animations**: Smooth hover transitions, interactive card selection states, and spinning loaders on refresh.

---

## ✨ Features

*   **Live XML Ingestion**: Automatically fetches and parses the official BigQuery release notes XML feed in real time.
*   **Granular Entry Parsing**: Google Cloud's feed packages multiple changes under a single day. This app parses and separates individual updates so they can be viewed, searched, and tweeted independently.
*   **Dynamic Categorization**: Classifies updates into distinct categories with visual indicators:
    *   🚀 **Feature**: Emerald Green
    *   📢 **Announcement**: Purple
    *   ⚠️ **Breaking**: Coral Red
    *   🐛 **Issue**: Amber Orange
    *   🔄 **Change**: Blue
*   **Interactive Search & Filter**: Instantly search updates by keywords or filter by category type using responsive header controls.
*   **Flexible Tweeting Options**:
    *   **Single Tweet**: Click "Tweet" on any card to share a pre-composed update.
    *   **Multi-Tweet**: Select multiple updates with the checkmark selectors to summon a floating selection panel. Click "Tweet Selected" to automatically compile and tweet a structured bulleted summary. (Long tweets are automatically capped at Twitter's 280-character limit).

---

## 🛠️ Technology Stack

*   **Backend**: Python Flask, `requests`, `BeautifulSoup4` (for HTML and XML parsing)
*   **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6)
*   **Icons**: Custom optimized inline SVGs

---

## 📂 Project Structure

```text
bq-release-notes/
├── .venv/                  # Python Virtual Environment
├── templates/
│   └── index.html          # Main HTML structure
├── static/
│   ├── css/
│   │   └── style.css       # CSS styling and dark theme tokens
│   └── js/
│       └── app.js          # JavaScript controller for UI & logic
├── app.py                  # Flask server and feed parser
├── requirements.txt        # Backend dependencies
├── .gitignore              # Files ignored in Git tracking
└── README.md               # Project documentation
```

---

## 🚀 How to Run Locally

### Prerequisites
Make sure you have Python 3 installed on your system.

### 1. Clone the repository
```bash
git clone https://github.com/2302gagan/antigravity-event-talks-app.git
cd antigravity-event-talks-app
```

### 2. Create and Activate a Virtual Environment
**On Windows:**
```powershell
python -m venv .venv
.\.venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Application
```bash
python app.py
```

Open your browser and navigate to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📝 License
Distributed under the Apache 2.0 License. See the official feed for Google Cloud terms of service.
