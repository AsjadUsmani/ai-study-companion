from fastapi import FastAPI, HTTPException, Header, Depends
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

@app.post("/summarize")
def summarize(input: TextInput, _: None = Depends(verify_internal_key)):
    text = input.text.strip()

    if len(text) < 50:
        return {"summary": text}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=text,
            config=types.GenerateContentConfig(
                system_instruction="You are a helpful assistant that summarizes text clearly."
            ),
        )

        text_out = getattr(response, "text", None)
        if not text_out:
            raise HTTPException(status_code=500, detail="Empty AI response")

        return {"summary": text_out.strip()}

    except Exception as e:
        logger.exception("Summarize failed")
        raise HTTPException(status_code=500, detail="AI summarization failed")
  
@app.post("/tutor")
def tutor(input: TutorInput, _: None = Depends(verify_internal_key)):
    note = input.note.strip()
    question = input.question.strip()

    if len(note) < 20 or len(question) < 5:
        raise HTTPException(status_code=400, detail="Invalid note or question")

    prompt = tutor_prompt(note, question)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a patient AI tutor who explains concepts clearly."
            ),
        )

        answer = getattr(response, "text", None)
        if not answer:
            raise HTTPException(status_code=500, detail="Empty tutor response")

        return {"answer": answer.strip()}

    except Exception:
        logger.exception("Tutor error")
        raise HTTPException(status_code=500, detail="Tutor AI failed")

@app.post("/quiz")
def quiz(input: dict, _: None = Depends(verify_internal_key)):
    note = input.get("note", "").strip()

    if len(note) < 100:
        return {"questions": []}

    prompt = quiz_prompt(note)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You generate simple quizzes."
            ),
        )

        text = getattr(response, "text", None)
        if not text:
            raise HTTPException(status_code=500, detail="Empty quiz response")

        # Return raw text (let Node/frontend parse if needed)
        return {"questions": text.strip()}

    except Exception:
        logger.exception("Quiz generation error")
        raise HTTPException(status_code=500, detail="Quiz generation failed")
