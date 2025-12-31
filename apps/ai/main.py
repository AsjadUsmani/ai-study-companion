from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prompts import summarize_prompt
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