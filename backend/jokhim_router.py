"""Risk indicators scoped to one model-supported crop and mandi."""

import os
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.jokhim_service import build_risk_analysis, build_risk_data
from forecast_router import STATUS_BY_CODE, config, forecast
from src.errors import ForecastError

router = APIRouter(prefix="/api/jokhim", tags=["Jokhim Risk"])


class JokhimAnalyzeRequest(BaseModel):
    commodity: str = Field(min_length=1)
    market: str = Field(min_length=1)


@router.get("/risk-data")
def _load_risk_data(commodity: str, market: str):
    if commodity.strip() not in config.SUPPORTED_SERIES or market not in config.SUPPORTED_SERIES.get(commodity.strip(), ()):
        raise HTTPException(
            status_code=404,
            detail={
                "code": "UNSUPPORTED_CROP_MANDI",
                "message": "Jokhim risk data is available only for evaluated crop/mandi pairs.",
                "supported": {crop: list(markets) for crop, markets in config.SUPPORTED_SERIES.items()},
            },
        )
    try:
        forecast_result = forecast(
            commodity,
            market,
            horizons="1-7",
            reference_date=os.getenv("CROPBAZAAR_FORECAST_REFERENCE_DATE") or None,
        )
    except ForecastError as exc:
        raise HTTPException(status_code=STATUS_BY_CODE.get(exc.code, 500), detail=exc.to_dict()) from exc
    result = build_risk_data(commodity, market, forecast_result)
    result["supported_model_pair"] = True
    return result


@router.get("/risk-data")
def get_risk_data(
    commodity: str = Query(..., min_length=1),
    market: str = Query(..., min_length=1),
):
    """Return historical risk indicators and shared ML forecast context."""
    return _load_risk_data(commodity, market)


@router.post("/analyze")
def analyze_risk(request: JokhimAnalyzeRequest):
    """Return calculated risk cards for one supported crop/mandi selection."""
    result = _load_risk_data(request.commodity, request.market)
    result["risk_analysis"] = build_risk_analysis(result)
    return result