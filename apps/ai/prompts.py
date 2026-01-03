def summarize_prompt():
    return f"""
You are a study assistant.
    Summarize the provided study notes clearly and concisely.
    Focus on key concepts, important definitions, and main ideas.
    Use simple language and avoid unnecessary details.
    Output in plain text (no markdown).
    
    Also give in paragraphs and do not add '/n' 
"""

def tutor_prompt(note: str, question: str) -> str:
    """
    Builds an instruction prompt for an AI tutor that answers a student question using only the provided study material.
    
    The returned prompt is a multi-line instruction block containing RULES for the tutor, a STUDY MATERIAL section populated with `note`, a STUDENT QUESTION section populated with `question`, and an ANSWER placeholder.
    
    Parameters:
        note (str): Study material that must be used as the sole source for the answer.
        question (str): The student's question to be answered using the study material.
    
    Returns:
        str: A multi-line instruction prompt with the study material and question inserted.
    """
    return f"""
You are an AI tutor helping a student understand concepts.

RULES:
- Explain using ONLY the given study material
- Use simple language
- Use analogies if helpful
- Avoid jargon unless necessary
- Be friendly and clear
- If the answer is not in the text, say so honestly
- Output in plain text (no markdown).
- Also give in paragraphs and do not add '/n'

STUDY MATERIAL:
{note}

STUDENT QUESTION:
{question}

ANSWER:
"""

def quiz_prompt(note: str) -> str:
    # We move the data out of the system prompt for better performance
    """
    Return a reusable prompt template instructing an AI to generate practice questions from study material.
    
    Parameters:
    	note (str): Study material intended for question generation. (Note: this function returns a static template and does not interpolate or include `note`.)
    
    Returns:
    	str: A multi-line JSON-format prompt template specifying rules (use only given text, generate 5–7 questions, mix `qa` and `flashcard`) and the expected output schema.
    """
    return """
You are an AI study assistant. Create practice questions from provided study material.

RULES:
- Use ONLY the given text.
- Generate 5–7 questions.
- Mix short-answer (type: "qa") and flashcards (type: "flashcard").
- Output STRICT JSON only.

FORMAT:
{
  "questions": [
    {
      "type": "qa",
      "question": "...",
      "answer": "..."
    },
    {
      "type": "flashcard",
      "front": "...",
      "back": "..."
    }
  ]
}
"""