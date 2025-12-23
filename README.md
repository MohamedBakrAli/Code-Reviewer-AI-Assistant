# 🔍 Smart Code Reviewer

An AI-powered code review assistant that analyzes your code for **readability**, **structure**, and **maintainability** — before human review.

![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

- **Readability Analysis**: Variable naming, formatting, comments, code clarity
- **Structure Analysis**: Code organization, modularity, design patterns
- **Maintainability Analysis**: Complexity, DRY principles, error handling, testability
- **Line-specific Feedback**: Issues are mapped to specific line numbers
- **Severity Levels**: Critical, Warning, and Suggestion classifications
- **Positive Highlights**: Recognizes what you're doing right

## 🚀 Quick Start

### Prerequisites

- OpenAI API key
- Python 3.10+ **OR** Docker

---

### Option 1: Run with Docker (Recommended)

The easiest way to get started:

```bash
# Clone the repository
git clone <repository-url>
cd "Code Reviewer"

# Create your .env file from the template
cp env.template .env

# Edit .env and add your OpenAI API key
nano .env  # or use any text editor

# Build and run with Docker Compose
docker-compose up --build
```

**Or run with Docker directly:**

```bash
# Build the image
docker build -t smart-code-reviewer .

# Run the container (pass env file)
docker run -p 8000:8000 --env-file .env smart-code-reviewer
```

Open your browser at **http://localhost:8000**

---

### Option 2: Run with Python

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Code Reviewer"
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file from the template:
   ```bash
   cp env.template .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-4  # Optional, defaults to gpt-4
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

6. **Open your browser** at **http://localhost:8000**

---

## 📖 How to Use

1. **Paste your code** into the editor on the left panel
2. **Select the language** (or use auto-detect)
3. **Click "Review Code"** to start the AI analysis
4. **View results** including:
   - Overall score and category breakdowns
   - Summary of code quality
   - Highlights (positive aspects)
   - Detailed issues with suggestions
5. **Filter issues** by severity (Critical, Warning, Suggestion)
6. **Apply suggestions** to improve your code before human review

## 🐳 Docker Commands

| Command | Description |
|---------|-------------|
| `docker-compose up --build` | Build and start the application |
| `docker-compose up -d` | Run in detached (background) mode |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View application logs |
| `docker-compose restart` | Restart the application |

## 🔧 API Endpoints

### `POST /api/review`

Analyze code and get detailed review.

**Request Body:**
```json
{
  "code": "your code here",
  "language": "auto"
}
```

**Response:**
```json
{
  "overall_score": 75,
  "readability_score": 80,
  "structure_score": 70,
  "maintainability_score": 75,
  "summary": "Brief summary of code quality",
  "issues": [...],
  "highlights": [...],
  "language_detected": "python"
}
```

### `GET /api/health`

Health check endpoint. Returns `{"status": "healthy", "model": "gpt-4"}`.

## 🎨 Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: Vanilla JavaScript, CSS3
- **AI**: OpenAI GPT-4
- **Fonts**: Outfit, JetBrains Mono
- **Container**: Docker

## 📝 Review Categories

### Readability (0-100)
- Variable/function naming conventions
- Code formatting and indentation
- Comments and documentation
- Code clarity and self-documentation

### Structure (0-100)
- Code organization and modularity
- Function/class design
- Separation of concerns
- Design patterns usage

### Maintainability (0-100)
- Code complexity (cyclomatic complexity)
- DRY principle adherence
- Error handling
- Testability and extensibility

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## 📁 Project Structure

```
Code Reviewer/
├── main.py              # FastAPI backend
├── requirements.txt     # Python dependencies
├── Dockerfile           # Docker image configuration
├── docker-compose.yml   # Docker Compose orchestration
├── env.template         # Environment variables template
├── .env                 # Your local config (create from template)
├── .dockerignore        # Docker build exclusions
├── .gitignore           # Git ignore rules
├── README.md            # Documentation
└── static/
    ├── index.html       # Main UI
    ├── styles.css       # Styling
    └── app.js           # Frontend logic
```

## 📄 License

This project is licensed under the MIT License.
