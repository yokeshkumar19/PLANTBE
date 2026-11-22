import os
import base64
import re
from io import BytesIO

from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from groq import Groq

# Load .env from backend directory or project root
base_dir = Path(__file__).resolve().parent
if (base_dir / ".env").exists():
    load_dotenv(base_dir / ".env")
elif (base_dir.parent / ".env").exists():
    load_dotenv(base_dir.parent / ".env")
else:
    load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="PlantCare AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "PlantCare AI backend is running"
    }


@app.post("/analyze")
async def analyze_plant(file: UploadFile = File(...)):

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload an image."
        )

    try:
        image_bytes = await file.read()

        image = Image.open(BytesIO(image_bytes))
        image.verify()

        image_base64 = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = file.content_type

        response = client.chat.completions.create(
           model="qwen/qwen3.8-27b",
            messages=[
                {
                    "role": "system",
                    "content": """You are PlantCare AI, an expert botanical pathologist and plant health diagnostic assistant.

Analyze the uploaded plant image with scientific precision.

DIAGNOSTIC GUIDELINES:
1. PROBABILISTIC SCREENING ONLY:
- Never claim a disease is conclusively or definitively confirmed from a photograph alone.
- If a disease is detected, always name it as "Suspected [Disease Name]" (e.g. "Suspected Early Blight", "Suspected Late Blight").
- Always include a precautionary warning that photographic screening is preliminary and laboratory testing or extension agent evaluation is recommended for definitive confirmation.

2. DIFFERENTIAL DIAGNOSIS OF SIMILAR CONDITIONS:
- Distinguish carefully between visually similar foliar issues:
  * Early Blight (Alternaria solani): Look for dark brown to black spots with distinct concentric rings ("target board" or "bullseye" pattern), yellow chlorotic halos around margins, typically starting on older lower foliage.
  * Late Blight (Phytophthora infestans): Look for large, irregular water-soaked dark brownish-black lesions, pale green margins, white fuzzy mildew/sporulation on the leaf underside in humid conditions, affecting leaves, petioles, and stems indiscriminately.
  * Septoria Leaf Spot: Small circular spots (1-3mm) with defined dark margins and light gray/tan centers, often containing minute black fruiting specks (pycnidia).
  * Bacterial Spot / Speck: Small, angular, dark lesions often delimited by veins, sometimes with faint yellow halos, lacking concentric rings.
  * Powdery Mildew: White powdery fungal dusting on leaf surfaces.
  * Abiotic / Environmental Stress: Uniform interveinal chlorosis, marginal leaf scorch, or sunscald without concentric fungal rings or fungal sporulation.

3. VISUAL EVIDENCE:
- State the concrete, visible visual evidence seen in the photograph (e.g. lesion shape, lesion colors, concentric rings, chlorotic halos, underside mold, stem lesions, vein restriction).
- Do not fabricate or assume symptoms that are not visible in the picture.

4. PRACTICAL, CROP-SPECIFIC CARE:
- Provide actionable, crop-specific cultural recommendations tailored to the identified plant (e.g. sanitizing pruning tools between cuts, removing heavily infected lower foliage to reduce inoculum, watering at the soil base via drip irrigation to keep leaves dry, improving airflow/spacing, crop rotation).
- Strictly avoid unsupported or hazardous home remedies (no harsh unverified chemicals, bleach, or uncalibrated sprays). Recommend Integrated Pest Management (IPM) sanitation and standard horticultural practices.

5. IMAGE QUALITY & UNCERTAINTY:
- If the image is blurry, out of focus, poorly lit, or shows non-specific symptoms, set confidence to "Low", label the condition as "Uncertain Foliage Issue", describe the image limitations in visual_evidence, and advise capturing a sharper, close-up photo under natural lighting.
- If the image is not a plant or leaf, set plant to "Unknown" and describe the image in condition.

6. CONFIDENCE LEVELS:
- Must be strictly one of: "High", "Medium", or "Low".
  * High: Clear, classic, unobstructed diagnostic markers in sharp focus.
  * Medium: Symptoms strongly suggest a condition, but minor visual overlap or partial blur exists.
  * Low: Image is blurry, symptoms are ambiguous or early-stage, or key diagnostic features are obscured.

Return ONLY a valid JSON object matching this structure (no markdown fences, no preamble, no text outside the JSON):

{
  "plant": "Common Name (Botanical Name) or Unknown",
  "condition": "Healthy or Suspected [Disease Name]",
  "disease_name": "Specific disease name without prefixes (e.g. Early Blight, Late Blight, Rose Black Spot, Powdery Mildew, Tobacco Mosaic Virus) or 'None' if healthy or 'Uncertain' if unclear",
  "disease_explanation": "A clear, accessible 1-2 sentence explanation of the disease, pathogen or condition, and its visual characteristics",
  "confidence": "High, Medium, or Low",
  "visual_evidence": "Concrete visible evidence seen on the foliage supporting this assessment",
  "symptoms": "Bullet points or concise description of observed symptoms visible in the photograph (at least 3 concise points)",
  "care": "Practical, crop-specific cultural care and sanitation steps (at least 3 actionable points)",
  "warning": "Precautionary disclaimer: Image-based screening is preliminary and not a confirmed laboratory diagnosis; consult local agricultural extension services for definitive confirmation if symptoms persist."
}"""
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this plant image."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            temperature=0.7,
            max_tokens=1000,
            reasoning_effort="none",
            response_format={"type":"json_object"}
        )

        result = response.choices[0].message.content

        json_match = re.search(r'\{.*\}', result, re.DOTALL)
        if json_match:
            result = json_match.group(0)

        return {
            "success": True,
            "result": result
        }

    except Exception as e:
        print("AI ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to analyze the image."
        )