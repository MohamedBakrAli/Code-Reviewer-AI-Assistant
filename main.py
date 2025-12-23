"""
Smart Code Reviewer - AI-Powered Code Analysis
Analyzes code for readability, structure, and maintainability
"""

import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(
    title="Smart Code Reviewer",
    description="AI-powered code review for readability, structure, and maintainability",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = os.getenv("OPENAI_MODEL", "gpt-4")


class CodeReviewRequest(BaseModel):
    code: str
    language: Optional[str] = "auto"
    focus_areas: Optional[list[str]] = None


class ReviewIssue(BaseModel):
    category: str
    severity: str  # "critical", "warning", "suggestion"
    line_start: Optional[int] = None
    line_end: Optional[int] = None
    message: str
    suggestion: Optional[str] = None


class CodeReviewResponse(BaseModel):
    overall_score: int  # 0-100
    readability_score: int
    structure_score: int
    maintainability_score: int
    summary: str
    issues: list[dict]
    highlights: list[str]  # Positive aspects
    language_detected: str


REVIEW_PROMPT = """You are an expert code reviewer. Analyze the following code and provide a comprehensive review focusing on:

1. **Readability** (0-100):
   - Variable/function naming conventions
   - Code formatting and indentation
   - Comments and documentation
   - Code clarity and self-documentation

2. **Structure** (0-100):
   - Code organization and modularity
   - Function/class design
   - Separation of concerns
   - Design patterns usage

3. **Maintainability** (0-100):
   - Code complexity (cyclomatic complexity)
   - DRY principle adherence
   - Error handling
   - Testability
   - Future extensibility

Provide your response in the following JSON format:
{
    "language_detected": "detected programming language",
    "overall_score": <0-100>,
    "readability_score": <0-100>,
    "structure_score": <0-100>,
    "maintainability_score": <0-100>,
    "summary": "Brief 2-3 sentence summary of the code quality",
    "issues": [
        {
            "category": "readability|structure|maintainability",
            "severity": "critical|warning|suggestion",
            "line_start": <line number or null>,
            "line_end": <line number or null>,
            "message": "Description of the issue",
            "suggestion": "How to fix it"
        }
    ],
    "highlights": ["List of positive aspects of the code"]
}

Be specific, actionable, and constructive. Reference specific line numbers when possible.
Focus on practical improvements that would help before human review.

CODE TO REVIEW:
```
{code}
```
"""


@app.post("/api/review", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    """Analyze code and return detailed review"""
    
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    
    if len(request.code) > 50000:
        raise HTTPException(status_code=400, detail="Code exceeds maximum length of 50,000 characters")
    
    try:
        prompt = REVIEW_PROMPT.format(code=request.code)
        
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert code reviewer. Always respond with valid JSON only, no markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        result_text = response.choices[0].message.content
        
        # Clean up potential markdown code blocks
        if result_text.startswith("```"):
            lines = result_text.split("\n")
            result_text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
        
        result = json.loads(result_text)
        
        return CodeReviewResponse(**result)
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model": MODEL}


# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    """Serve the main application"""
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)

