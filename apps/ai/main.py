from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from prompts import summarize_prompt, quiz_prompt
from openrouter_client import client
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
        completion = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "system", "content": summarize_prompt()},
                {"role": "user", "content": text}
            ],
        )

        return {
            "summary": completion.choices[0].message.content.strip()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/tutor")
def tutor(input: TutorInput, _: None = Depends(verify_internal_key)):
    try:
        prompt = f"""
Study material:
{input.note}

Question:
{input.question}

Answer clearly and concisely.
"""

        completion = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "system", "content": "You are an AI tutor."},
                {"role": "user", "content": prompt}
            ],
        )

        return {
            "answer": completion.choices[0].message.content.strip()
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import HTTPException, Depends
import json
import time

import json
import re
from fastapi import HTTPException, Depends

def extract_json(text: str):
    """
    Extracts the first JSON object from a string.
    """
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found")
    return json.loads(match.group())

def is_code_heavy(text: str) -> bool:
    keywords = [
        "import ", "from ", "def ", "class ",
        "{", "}", ";", "=>", "()", "print(", "const "
    ]
    return sum(k in text for k in keywords) >= 3


@app.post("/quiz")
def quiz(input: dict, _: None = Depends(verify_internal_key)):
    note = input.get("note", "").strip()

    # Basic validation
    if len(note) < 100:
        return {"questions": []}

    # Limit input size to avoid timeouts
    note = note[:4000]

    # Build prompt depending on content type
    if is_code_heavy(note):
        prompt = f"""
{quiz_prompt()}

The study material is CODE or a TECHNICAL EXAMPLE.

Generate questions about:
- purpose of the code
- what problem it solves
- how it is used
- key concepts demonstrated

STUDY MATERIAL:
{note}
"""
    else:
        prompt = f"""
{quiz_prompt()}

STUDY MATERIAL:
{note}
"""

    try:
        completion = client.chat.completions.create(
            model="qwen/qwen-2.5-7b-instruct:free",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI quiz generator. "
                        "Return ONLY valid JSON. "
                        "No markdown. No explanations. "
                        "Never leave fields empty."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )

        raw = completion.choices[0].message.content.strip()

        # Extract JSON safely
        parsed = extract_json(raw)

        # Validate structure
        if "questions" not in parsed or not isinstance(parsed["questions"], list):
            raise HTTPException(
                status_code=500,
                detail="Invalid quiz structure returned by AI"
            )

        # Normalize & validate each question
        for q in parsed["questions"]:

            # MCQ detection
            if "options" in q:
                q["type"] = "mcq"

            if q.get("type") == "flashcard":
                if not q.get("front") or not q.get("back"):
                    raise HTTPException(
                        status_code=500,
                        detail="AI generated empty flashcard"
                    )

            elif q.get("type") == "qa":
                if not q.get("question") or not q.get("answer"):
                    raise HTTPException(
                        status_code=500,
                        detail="AI generated empty QA"
                    )

            elif q.get("type") == "mcq":
                if (
                    not q.get("question")
                    or not isinstance(q.get("options"), list)
                    or len(q["options"]) < 2
                    or not q.get("answer")
                ):
                    raise HTTPException(
                        status_code=500,
                        detail="AI generated invalid MCQ"
                    )

        return parsed

    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid JSON"
        )

    except Exception as e:
        print("QUIZ ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Quiz generation failed"
        )
