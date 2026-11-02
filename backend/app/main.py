from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import market, predict, strategy, broker

app = FastAPI(title="MarketAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(strategy.router, prefix="/api", tags=["strategy"])
app.include_router(broker.router, prefix="/api/broker", tags=["broker"])

@app.get("/health")
async def health():
    return {"status": "ok"}
