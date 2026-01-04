from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from prompts import summarize_prompt, tutor_prompt, quiz_prompt
from gemini_client import client
from google.genai import types
import json
import logging
import os

app = FastAPI()
logger = logging.getLogger(__name__)

class TextInput(BaseModel):
    text: str

class TutorInput(BaseModel):
    note: str
    question: str

def verify_internal_key(x_internal_key: str = Header(...)):
    if x_internal_key != os.getenv("INTERNAL_API_KEY"):
        raise HTTPException(status_code=401)

@app.get('/health')
def health():
    return {"status": "AI service running"}

@app.post("/summarize")
def summarize(input: TextInput):
    text = input.text.strip()

    if len(text) < 50:
        return {"summary": text}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash", config=types.GenerateContentConfig(
                system_instruction=summarize_prompt(),
            ),
            contents=text
        )
        return {
            "summary": response.text.strip()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail="AI summarization failed")
    
@app.post("/tutor")
def tutor(input: TutorInput):
    note = input.note.strip()
    question = input.question.strip()

    if len(note) < 20 or len(question) < 5:
        raise HTTPException(status_code=400, detail="Please provide a valid note and question.")
    try:
        prompt = tutor_prompt(note, question)
        response = client.models.generate_content(
            model="gemini-2.5-flash", config=types.GenerateContentConfig(
                system_instruction=prompt,
            ),
            contents=f"Please answer this question based on the material: {question}"
        )

        return {
            "answer": response.text.strip()
        }
    except Exception:
        raise HTTPException(status_code=500, detail="Tutor AI failed")

@app.post("/quiz")
def quiz(input: dict):
    note = input.get("note", "").strip()

    if len(note) < 100:
        return {"questions": []}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=quiz_prompt(),
                response_mime_type="application/json"
            ),
            contents=f"Generate a quiz based on this study material:\n{note}"
        )
        
        if not response.text:
            raise HTTPException(status_code=500, detail="AI returned empty response")

        return json.loads(response.text)

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format") from e
    except Exception as e:
        logger.exception("Quiz generation error")
        raise HTTPException(status_code=500, detail="Quiz generation failed") from e
