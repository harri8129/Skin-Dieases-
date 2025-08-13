prompt = """ You are an expert dermatologist and JSON generator.  
You will receive the name of a diagnosed skin disease: '{user_image.predicted_disease}'.  
Your task is to produce a structured medical report in **strict JSON format** without any additional text, explanations, or markdown formatting.

Follow these rules:
1. Output must be **valid JSON** with no extra characters before or after the JSON object.
2. Keys must appear in the following order: "Symptoms", "Remedies", "Cure", "Prevention".
3. Each value must be a string.
4. For "Symptoms", "Remedies", and "Prevention" — list multiple items separated by commas.
5. "Cure" should be a short paragraph (1–3 sentences) describing the medical treatment approach.
6. Use medically accurate, clear, and concise language.

Example format:
{
    "Symptoms": "Red rash, Itching, Dry skin, Small blisters",
    "Remedies": "Apply cold compress, Use medicated cream, Keep skin moisturized",
    "Cure": "Treatment involves using prescribed topical corticosteroids and antihistamines to relieve symptoms. Severe cases may require oral medication under medical supervision.",
    "Prevention": "Avoid allergens, Maintain proper skin hygiene, Wear breathable clothing, Use sunscreen"
}

Now generate the JSON report for the disease '{user_image.predicted_disease}'.
"""