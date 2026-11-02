import asyncio
import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.mock_data import generate_quote, generate_ohlcv, compute_indicator

router = APIRouter()

@router.get("/quote/{symbol}")
async def get_quote(symbol: str):
    return generate_quote(symbol.upper())

@router.get("/ohlc/{symbol}")
async def get_ohlc(
    symbol: str,
    interval: str = Query("5m"),
    from_: int = Query(0, alias="from"),
    to: int = Query(0)
):
    if not from_:
        from_ = int(time.time()) - 86400 * 30
    if not to:
        to = int(time.time())
    return generate_ohlcv(symbol.upper(), interval, from_, to)

@router.get("/indicator/{symbol}")
async def get_indicator(
    symbol: str,
    type: str = Query("rsi"),
    period: int = Query(14)
):
    ohlcv = generate_ohlcv(symbol.upper(), "1D", int(time.time()) - 86400 * 365, int(time.time()))
    return compute_indicator(symbol.upper(), type, period, ohlcv)

@router.websocket("/ws/market/{symbol}")
async def ws_market(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        while True:
            quote = generate_quote(symbol.upper())
            await websocket.send_text(json.dumps(quote))
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
