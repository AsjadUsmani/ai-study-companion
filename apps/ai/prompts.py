def summarize_prompt():
    """
    Return a static prompt instructing an AI study assistant to summarize notes.
    
    The prompt directs the assistant to summarize provided study notes clearly and concisely, focus on key concepts, important definitions, and main ideas, use simple language, avoid unnecessary details, output plain text (no markdown), and format the response as paragraphs without literal '\n' markers.
    
    Returns:
        str: The fixed multi-line prompt string.
    """
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
    Constructs a formatted tutor prompt embedding provided study material and a student question.
    
    Produces a single prompt string suitable for an AI tutor. The prompt includes a RULES section that constrains the tutor's behavior (e.g., use only the given material, use simple language, be honest if the answer is not in the text, output plain text in paragraphs), followed by STUDY MATERIAL, STUDENT QUESTION, and an ANSWER placeholder.
    
    Parameters:
        note (str): The study material to include under the STUDY MATERIAL section.
        question (str): The student's question to include under the STUDENT QUESTION section.
    
    Returns:
        str: The complete tutor prompt text containing RULES, STUDY MATERIAL, STUDENT QUESTION, and an ANSWER header.
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