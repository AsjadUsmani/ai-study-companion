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
    """
    Produce a concise summary of the provided text.
    
    Parameters:
        input (TextInput): Object containing the text to summarize. The text is stripped of leading and trailing whitespace; if the resulting text has fewer than 50 characters, it is returned unchanged.
    
    Returns:
        dict: A mapping with key `"summary"` whose value is the summarized text string.
    
    Raises:
        HTTPException: with status code 500 if the AI summarization call fails.
    """
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
    """
    Generate an answer to a question using the provided note as source material.
    
    Parameters:
        input (dict): Input dictionary with keys:
            - "note" (str): Source material to use for answering; must be at least 20 characters.
            - "question" (str): Question to answer based on the note; must be at least 5 characters.
    
    Returns:
        dict: A dictionary with a single key "answer" whose value is the generated answer text,
        or a validation message when input lengths are insufficient.
    
    Raises:
        HTTPException: Raised with status code 500 and detail "Tutor AI failed" if the AI generation fails.
    """
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