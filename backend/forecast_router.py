"""FastAPI routes for the evaluated ML price forecasting service."""

import os
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

ML_FORECASTING_DIR = Path(__file__).resolve().parent.parent / "ml" / "forecasting"
if str(ML_FORECASTING_DIR) not in sys.path:
    sys.path.insert(0, str(ML_FORECASTING_DIR))

from src import config
from src.errors import ForecastError
from src.forecasting.predict import forecast


STATUS_BY_CODE = {
    "UNSUPPORTED_COMMODITY": 404,
    "UNSUPPORTED_MARKET": 404,
    "INVALID_HORIZON": 400,
    "INVALID_DATE": 400,
    "STALE_DATA": 503,
    "INSUFFICIENT_HISTORY": 503,
    "DATA_UNAVAILABLE": 503,
    "POLICY_UNAVAILABLE": 503,
    "MODEL_FAILURE": 500,
}

router = APIRouter(prefix="/api/forecast", tags=["Forecasting"])


@router.get("/supported")
def supported():
    """Return the evaluated crop/market pairs available for forecasting."""
    return {
        "price_unit": config.PRICE_UNIT,
        "horizons": list(config.HORIZONS),
        "commodities": [
            {"commodity": commodity, "markets": list(markets), "default_market": markets[0]}
            for commodity, markets in config.SUPPORTED_SERIES.items()
        ],
    }


@router.get("/{commodity}")
def get_forecast(commodity: str, market: str | None = None, horizons: str = "1-7"):
    """Return separate exact-date forecasts for each requested horizon."""
    try:
        return forecast(
            commodity,
            market,
            horizons,
            reference_date=os.getenv("CROPBAZAAR_FORECAST_REFERENCE_DATE") or None,
        )
    except ForecastError as exc:
        raise HTTPException(
            status_code=STATUS_BY_CODE.get(exc.code, 500),
            detail=exc.to_dict(),
        ) from exc