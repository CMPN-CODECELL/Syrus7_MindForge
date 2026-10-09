"""FastAPI router for Kisan Vaani multilingual chat assistant."""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException
from services import assistant_service

router = APIRouter(prefix="/api/assistant", tags=["Kisan Vaani Assistant"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="Farmer message/query")
    language: str = Field("en", description="Language code: en, hi, mr, en-IN, hi-IN, mr-IN")
    history: Optional[List[Dict[str, str]]] = Field(default=[], description="Previous conversation turns")


class ChatResponse(BaseModel):
    reply: str
    language: str
    source_information: Optional[str] = None
    data_observation_date: Optional[str] = None
    model_used: Optional[str] = None


@router.post("/chat", response_model=ChatResponse)
def assistant_chat(request: ChatRequest):
    """Chat endpoint for Kisan Vaani multilingual assistant powered by Google Gemini."""
    try:
        result = assistant_service.generate_chat_response(
            message=request.message,
            language=request.language,
            history=request.history,
        )
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except RuntimeError as run_err:
        raise HTTPException(status_code=503, detail=str(run_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Internal assistant error: {str(exc)}")
