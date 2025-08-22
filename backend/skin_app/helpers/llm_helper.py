# helpers/llm_helper.py

import os
import json
from enum import Enum
from typing import Union
from dotenv import load_dotenv
import google.generativeai as genai
from skin_app.prompts.lmm_gen import prompt

# Load environment variables
load_dotenv()

# --- Enums for LLM Provider & Model ---
class LLMProvider(str, Enum):
    GEMINI = "Google Gemini",
    

class LLMModel(str, Enum):
    GEMINI_2_5_FLASH = "gemini-2.5-flash"
    GEMINI_2_5_PRO = "gemini-2.5-pro"

# --- Configure Gemini ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# --- Initialize LLM ---
def initialize_llm(
    provider: LLMProvider = LLMProvider.GEMINI,
    model: LLMModel = LLMModel.GEMINI_2_5_FLASH,
    temperature: float = 0
) -> Union[genai.GenerativeModel, None]:
    """
    Initialize the desired LLM model.
    """
    if provider == LLMProvider.GEMINI:
        return genai.GenerativeModel(model.value)
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")

# --- Generate Disease Report ---
def generate_disease_report(
    disease_name: str,
    provider: LLMProvider = LLMProvider.GEMINI,
    model: LLMModel = LLMModel.GEMINI_2_5_FLASH,
    temperature: float = 0
) -> str:
    """
    Generates a skin disease report in strict JSON format using the chosen LLM.
    """
    llm = initialize_llm(provider, model, temperature)

    # Format the strict JSON output prompt
    # formatted_prompt = prompt.format(disease=disease_name)

    # Generate content from the model
    response = llm.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature
        )
    )

    output_text = response.text.strip()

    # Extract JSON in case the model adds extra text
    try:
        start_idx = output_text.find("{")
        end_idx = output_text.rfind("}") + 1
        json_str = output_text[start_idx:end_idx]
        json.loads(json_str)  # Validate JSON
        return json_str
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON returned by LLM: {output_text}")
