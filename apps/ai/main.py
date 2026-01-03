from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prompts import summarize_prompt, tutor_prompt, quiz_prompt
from gemini_client import client
from google.genai import types
import json

app = FastAPI()

class TextInput(BaseModel):
    text: str

class TutorInput(BaseModel):
    note: str
    question: str

@app.get('/health')
def health():
    """
    Report liveness status of the AI service.
    
    Returns:
        dict: Mapping with "status" set to "AI service running".
    """
    return {"status": "AI service running"}

@app.post("/summarize")
def summarize(input: TextInput):
    """
    Produce a concise summary of the provided text.
    
    Parameters:
        input (TextInput): Input model containing the text to summarize; whitespace is trimmed before processing.
    
    Returns:
        dict: A dictionary with key 'summary' whose value is the summarized text. If the trimmed input has fewer than 50 characters, the original trimmed text is returned as the summary.
    
    Raises:
        HTTPException: With status code 500 and detail "AI summarization failed" if the AI generation call fails.
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
def tutor(input: TutorInput):
    """
    Generate an answer to a question based on the provided study notes.
    
    Parameters:
        input (TutorInput): Contains `note` (the study material) and `question`. `note` must be at least 20 characters and `question` must be at least 5 characters.
    
    Returns:
        dict: A dictionary with the key `answer` whose value is the generated answer string.
    
    Raises:
        HTTPException: 400 if input validation fails (note or question too short).
        HTTPException: 500 if the AI generation fails.
    """
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
    """
    Create a quiz from the study material supplied in the input.
    
    Parameters:
        input (dict): A payload containing a "note" key with the study material as a string.
    
    Returns:
        dict: The quiz represented as parsed JSON produced by the AI. If the provided note is shorter than 100 characters, returns {"questions": []}.
    
    Raises:
        HTTPException: With status 500 and detail "AI returned invalid JSON format" if the AI response cannot be parsed as JSON.
        HTTPException: With status 500 and detail "Quiz generation failed" for other generation errors.
    """
    note = input.get("note", "").strip()

    if len(note) < 100:
        return {"questions": []}

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=types.GenerateContentConfig(
                system_instruction=quiz_prompt(note),
                response_mime_type="application/json"
            ),
            contents=f"Generate a quiz based on this study material:\n{note}"
        )

        return json.loads(response.text)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format")
    except Exception as e:
        print("Quiz error:", e)
        raise HTTPException(status_code=500, detail="Quiz generation failed")