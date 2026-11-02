from fastapi import APIRouter
from app.core.mock_data import generate_prediction

router = APIRouter()

@router.get("/predict/{symbol}")
async def predict(symbol: str):
    return generate_prediction(symbol.upper())
