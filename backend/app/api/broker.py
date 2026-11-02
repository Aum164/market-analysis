import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_orders: List[dict] = []

class OrderCreate(BaseModel):
    symbol: str
    side: str
    quantity: int
    price: float = 0.0
    mode: str = "paper"

@router.get("/orders")
async def list_orders():
    return _orders[-50:]

@router.post("/order")
async def place_order(body: OrderCreate):
    order = {
        "id": str(uuid.uuid4()),
        "symbol": body.symbol,
        "side": body.side,
        "quantity": body.quantity,
        "price": body.price,
        "mode": body.mode,
        "status": "COMPLETE" if body.mode == "paper" else "PENDING",
        "timestamp": datetime.utcnow().isoformat(),
    }
    _orders.append(order)
    return order

@router.get("/positions")
async def positions():
    return []
