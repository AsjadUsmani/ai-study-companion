from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prompts import summarize_prompt, tutor_prompt
from gemini_client import client
from google.genai import types

app = FastAPI()

class TextInput(BaseModel):
    text: str

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
def tutor(input: dict):
    note = input.get("note", "").strip()
    question = input.get("question", "").strip()

    if len(note) < 20 or len(question) < 5:
        return {"answer": "Please provide a valid note and question."}
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