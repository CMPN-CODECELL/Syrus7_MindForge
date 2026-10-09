"""Kisan Vaani Multilingual AI Assistant Service using Google Gemini API."""

import os
import re
from typing import Dict, Any, List, Optional
import pandas as pd
from data_loader import get_df

# Fallback sequence of active Gemini models
CANDIDATE_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3-flash-preview"),
    "gemini-3.1-flash-lite-preview",
    "gemini-flash-lite-latest",
]

_GENAI_CLIENT = None


def get_gemini_client():
    """Lazily initialize Google GenAI Client with the environment API key."""
    global _GENAI_CLIENT
    if _GENAI_CLIENT is not None:
        return _GENAI_CLIENT

    from dotenv import load_dotenv
    from pathlib import Path

    candidate_envs = [
        Path("/Users/aaryagopale/Desktop/Syrus7_MindForge/backend/.env"),
        Path("/Users/aaryagopale/Desktop/CropBazaarr/backend/.env"),
        Path(__file__).resolve().parent.parent / ".env",
        Path("backend/.env"),
        Path(".env"),
    ]
    for env_file in candidate_envs:
        try:
            if env_file.is_file():
                load_dotenv(env_file)
        except Exception:
            pass

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not api_key.strip():
        raise ValueError(
            "GEMINI_API_KEY is not configured in backend/.env. Please configure your API key."
        )

    from google import genai
    _GENAI_CLIENT = genai.Client(api_key=api_key.strip())
    return _GENAI_CLIENT


# Common multilingual mappings for commodities and mandis in Nashik dataset
CROP_ALIASES = {
    "onion": "Onion",
    "kanda": "Onion",
    "pyaz": "Onion",
    "कांदा": "Onion",
    "प्याज": "Onion",
    "tomato": "Tomato",
    "tamatar": "Tomato",
    "टोमॅटो": "Tomato",
    "टमाटर": "Tomato",
    "potato": "Potato",
    "aloo": "Potato",
    "batata": "Potato",
    "आलू": "Potato",
    "बटाटा": "Potato",
    "garlic": "Garlic",
    "lasun": "Garlic",
    "lehsun": "Garlic",
    "लसूण": "Garlic",
    "लहसुन": "Garlic",
    "coriander": "Coriander(Leaves)",
    "kothmir": "Coriander(Leaves)",
    "dhaniya": "Coriander(Leaves)",
    "कोथिंबीर": "Coriander(Leaves)",
    "धनिया": "Coriander(Leaves)",
    "cabbage": "Cabbage",
    "patta gobhi": "Cabbage",
    "kobi": "Cabbage",
    "पत्तागोभी": "Cabbage",
    "कोबी": "Cabbage",
    "cauliflower": "Cauliflower",
    "phool gobhi": "Cauliflower",
    "flower": "Cauliflower",
    "फूलगोभी": "Cauliflower",
    "brinjal": "Brinjal",
    "baingan": "Brinjal",
    "vangi": "Brinjal",
    "बैंगन": "Brinjal",
    "वांगे": "Brinjal",
    "ginger": "Ginger(Green)",
    "adrak": "Ginger(Green)",
    "ale": "Ginger(Green)",
    "अदरक": "Ginger(Green)",
    "आले": "Ginger(Green)",
    "green chilli": "Green Chilli",
    "mirchi": "Green Chilli",
    "मिरची": "Green Chilli",
    "मिर्च": "Green Chilli",
    "methi": "Methi(Leaves)",
    "मेथी": "Methi(Leaves)",
    "spinach": "Spinach",
    "palak": "Spinach",
    "पालक": "Spinach",
    "cucumber": "Cucumbar(Kheera)",
    "kheera": "Cucumbar(Kheera)",
    "kakdi": "Cucumbar(Kheera)",
    "काकडी": "Cucumbar(Kheera)",
    "खीरा": "Cucumbar(Kheera)",
}

MANDI_ALIASES = {
    "lasalgaon": "APMC Lasalgaon",
    "लासलगाव": "APMC Lasalgaon",
    "nashik": "APMC Nasik",
    "nasik": "APMC Nasik",
    "नाशिक": "APMC Nasik",
    "pimpalgaon": "APMC Pimpalgaon Baswant",
    "पिंपळगाव": "APMC Pimpalgaon Baswant",
    "yeola": "APMC Yeola",
    "येवला": "APMC Yeola",
    "dindori": "APMC Dindori",
    "दिंडोरी": "APMC Dindori",
    "chandwad": "APMC Chandwad",
    "चांदवड": "APMC Chandwad",
    "ghoti": "APMC Ghoti",
    "घोटी": "APMC Ghoti",
    "manmad": "APMC Manmad",
    "मनमाड": "APMC Manmad",
    "sinner": "APMC Sinner",
    "सिन्नर": "APMC Sinner",
    "satana": "APMC Satana",
    "सटाणा": "APMC Satana",
    "kalvan": "APMC Kalvan",
    "कळवण": "APMC Kalvan",
    "devala": "APMC Devala",
    "देवळा": "APMC Devala",
}


def extract_relevant_market_data(user_query: str) -> Dict[str, Any]:
    """Search dataset for crops or mandis mentioned in user query and return verified records."""
    df = get_df()
    query_lower = user_query.lower()

    detected_crops = []
    for alias, standard_name in CROP_ALIASES.items():
        if alias in query_lower:
            if standard_name not in detected_crops:
                detected_crops.append(standard_name)

    # Also check direct case-insensitive matching with standard commodity names
    for comm in df["commodity"].unique():
        if comm.lower() in query_lower and comm not in detected_crops:
            detected_crops.append(comm)

    detected_mandis = []
    for alias, standard_mandi in MANDI_ALIASES.items():
        if alias in query_lower:
            if standard_mandi not in detected_mandis:
                detected_mandis.append(standard_mandi)

    for market in df["market"].unique():
        if market.lower() in query_lower and market not in detected_mandis:
            detected_mandis.append(market)

    # If no specific crop detected, check if Onion can be used as primary example
    if not detected_crops and ("rate" in query_lower or "price" in query_lower or "mandi" in query_lower or "भाव" in query_lower or "दर" in query_lower):
        detected_crops = ["Onion"]

    # Filter records
    records_context = []
    observation_dates = []

    for crop in detected_crops[:2]:
        sub_df = df[df["commodity"].str.lower() == crop.lower()]
        if detected_mandis:
            sub_df = sub_df[sub_df["market"].isin(detected_mandis)]

        if not sub_df.empty:
            # Get latest 3 records
            idx_latest = sub_df.groupby("market")["date"].idxmax()
            latest_rows = sub_df.loc[idx_latest].sort_values(by="modal_price", ascending=False).head(4)

            for _, row in latest_rows.iterrows():
                obs_date = str(row["date"])
                observation_dates.append(obs_date)
                records_context.append(
                    f"- Crop: {row['commodity']} | Mandi: {row['market']} (District: {row['district']}, {row['state']}) | "
                    f"Observation Date: {obs_date} | Modal Price: ₹{row['modal_price']} {row['price_unit']} | "
                    f"Arrival Quantity: {row['arrival_quantity']} {row['arrival_unit']}"
                )

    # Weather check
    weather_context = []
    if any(w in query_lower for w in ["weather", "rain", "temperature", "मौसम", "बारिश", "हवामान", "पाऊस"]):
        target_mandi = detected_mandis[0] if detected_mandis else "APMC Lasalgaon"
        w_df = df[df["market"].str.lower() == target_mandi.lower()].sort_values(by="date").tail(3)
        for _, row in w_df.iterrows():
            weather_context.append(
                f"- Weather Date: {row['date']} at {row['market']}: Mean Temp: {row['temperature_mean_c']}°C (Max: {row['temperature_max_c']}°C, Min: {row['temperature_min_c']}°C), "
                f"Rainfall: {row['precipitation_mm']} mm, Humidity: {row['relative_humidity_mean_pct']}%"
            )

    return {
        "detected_crops": detected_crops,
        "detected_mandis": detected_mandis,
        "records_text": "\n".join(records_context) if records_context else "No specific commodity record matching query in dataset.",
        "weather_text": "\n".join(weather_context) if weather_context else "",
        "latest_observation_date": max(observation_dates) if observation_dates else None,
        "has_records": bool(records_context),
    }


def build_system_prompt(language: str, context_data: Dict[str, Any]) -> str:
    """Build grounded system prompt adhering to language and strict real-data rules."""
    lang_code = language.lower()
    if "hi" in lang_code:
        target_lang = "Hindi (हिंदी) in clear Devanagari script"
        greeting = "नमस्ते किसान भाई / बहन"
    elif "mr" in lang_code:
        target_lang = "Marathi (मराठी) in clear Devanagari script"
        greeting = "नमस्कार शेतकरी बंधू / भगिनी"
    else:
        target_lang = "English (Indian Agri Context)"
        greeting = "Namaste Kisan brother / sister"

    prompt = f"""You are 'Kisan Vaani' (किसान वाणी), an empathetic, expert agricultural advisor and mandi intelligence AI assistant for CropBazaar.
Your mission is to help Indian farmers make informed decisions about their crops, mandi prices, and marketing strategies.

LANGUAGE REQUIREMENT:
- You MUST answer completely in {target_lang}.
- Use a warm, respectful, supportive tone suitable for an Indian farmer ({greeting}).
- Always preserve numbers, dates, currency symbols (₹), mandi names, and units clearly.

GROUND TRUTH AGRICULTURAL DATASET (from Nashik APMC Division & Weather Stations):
{context_data['records_text']}

{f"HISTORICAL WEATHER OBSERVATIONS:\n{context_data['weather_text']}" if context_data.get('weather_text') else ""}

STRICT OPERATIONAL RULES:
1. ONLY cite the exact prices, arrival figures, units (e.g. ₹/Quintal or ₹/Bundle), and observation dates provided in the context above.
2. DO NOT fabricate future price forecasts, speculative profit guarantees, or fake live quotes. Always clarify that these figures come from recorded APMC observation data with the date mentioned.
3. If the user asks about a crop or mandi not present in the dataset (or asks an ambiguous question), politely explain what information is available in the Nashik APMC dataset and ask for clarification.
4. Keep explanations concise, practical, and farmer-friendly (avoid overly academic jargon). Highlight net take-home considerations like transport and handling when relevant.
"""
    return prompt


def generate_chat_response(
    message: str,
    language: str = "en",
    history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Query Google Gemini API with grounded agricultural context."""
    if not message or not message.strip():
        raise ValueError("Message cannot be empty.")

    client = get_gemini_client()
    context = extract_relevant_market_data(message)
    system_instruction = build_system_prompt(language, context)

    # Format conversation history
    bounded_history = (history or [])[-8:]  # max 8 previous turns
    contents = []

    for item in bounded_history:
        role = item.get("sender") or item.get("role")
        text = item.get("text") or item.get("content")
        if role and text:
            gemini_role = "user" if role in ("user", "human") else "model"
            contents.append({"role": gemini_role, "parts": [{"text": text}]})

    # Append current user prompt
    contents.append({"role": "user", "parts": [{"text": message.strip()}]})

    # Attempt calling models in candidate sequence
    last_error = None
    response_text = None
    used_model = None

    for model_name in CANDIDATE_MODELS:
        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
                max_output_tokens=800,
            )

            resp = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )

            if resp and resp.text:
                response_text = resp.text.strip()
                used_model = model_name
                break
        except Exception as exc:
            last_error = exc
            print(f"[Kisan Vaani] Warning: model {model_name} failed: {exc}")
            continue

    if not response_text:
        err_msg = str(last_error) if last_error else "Failed to get response from Gemini API"
        raise RuntimeError(f"Gemini service unavailable: {err_msg}")

    return {
        "reply": response_text,
        "language": language,
        "model_used": used_model,
        "source_information": "APMC Mandi Observation Records (merged_mandi_weather.csv)" if context.get("has_records") else "General Agricultural Knowledge Base",
        "data_observation_date": context.get("latest_observation_date"),
    }
