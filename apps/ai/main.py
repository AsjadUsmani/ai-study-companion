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
    """
    Report the AI service health status.
    
    Returns:
        dict: A JSON-serializable dictionary with key "status" set to "AI service running".
    """
    return {"status": "AI service running"}

@app.post("/summarize")
def summarize(input: TextInput):
    """
    Produce a short summary for the provided text.
    
    If the trimmed text is shorter than 50 characters, returns the original text as the summary. Otherwise requests a summary from the AI model and returns the model's trimmed response.
    
    Parameters:
        input (TextInput): Pydantic model containing the `text` field to summarize.
    
    Returns:
        dict: A mapping with the key `"summary"` whose value is the summarized text.
    
    Raises:
        HTTPException: With status code 500 and detail "AI summarization failed" if the AI request fails.
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