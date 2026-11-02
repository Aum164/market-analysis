import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.mock_data import run_backtest

router = APIRouter()

_strategies: List[dict] = []

class StrategyCreate(BaseModel):
    name: str
    type: str = "visual"
    rules: object = None

class BacktestRequest(BaseModel):
    symbol: str = "NIFTY50"
    capital: float = 100000
    start_date: str = "2023-01-01"
    end_date: str = "2024-01-01"
    strategy_id: str = "demo"

@router.get("/strategy/")
async def list_strategies():
    return _strategies

@router.post("/strategy/")
async def create_strategy(body: StrategyCreate):
    s = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "type": body.type,
        "rules": body.rules,
        "created_at": datetime.utcnow().isoformat(),
    }
    _strategies.append(s)
    return s

@router.post("/backtest/run")
async def backtest_run(body: BacktestRequest):
    return run_backtest(body.symbol, body.capital, body.start_date, body.end_date)
