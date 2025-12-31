def summarize_prompt():
    """
    Provide a plain-text instruction template for a study assistant that describes how to summarize study notes.
    
    Returns:
        prompt (str): A multi-line plain-text prompt instructing a study assistant to summarize provided study notes clearly and concisely, focus on key concepts, important definitions, and main ideas, use simple language, avoid unnecessary details and markdown, and produce output in paragraphs without including the literal sequence "\n".
    """
    return f"""
You are a study assistant.
    Summarize the provided study notes clearly and concisely.
    Focus on key concepts, important definitions, and main ideas.
    Use simple language and avoid unnecessary details.
    Output in plain text (no markdown).
    
    Also give in paragraphs and do not add '/n' 
"""