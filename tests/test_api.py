import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_quote():
    r = client.get("/api/market/quote/NIFTY50")
    assert r.status_code == 200
    data = r.json()
    assert "ltp" in data
    assert "symbol" in data
    assert data["symbol"] == "NIFTY50"


def test_ohlc():
    r = client.get("/api/market/ohlc/NIFTY50?interval=1D")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "open" in data[0]
    assert "close" in data[0]


def test_indicator():
    r = client.get("/api/market/indicator/NIFTY50?type=rsi&period=14")
    assert r.status_code == 200
    data = r.json()
    assert "type" in data
    assert "values" in data


def test_predict():
    r = client.get("/api/predict/NIFTY50")
    assert r.status_code == 200
    data = r.json()
    assert "direction" in data
    assert data["direction"] in ["up", "down", "sideways"]
    assert "confidence" in data


def test_strategy_lifecycle():
    r = client.post("/api/strategy/", json={"name": "Test", "type": "visual", "rules": []})
    assert r.status_code == 200
    sid = r.json()["id"]

    r2 = client.get("/api/strategy/")
    assert any(s["id"] == sid for s in r2.json())


def test_backtest():
    r = client.post("/api/backtest/run", json={
        "symbol": "NIFTY50", "capital": 100000,
        "start_date": "2023-01-01", "end_date": "2023-06-01"
    })
    assert r.status_code == 200
    data = r.json()
    assert "metrics" in data
    assert "equity_curve" in data


def test_broker_order():
    r = client.post("/api/broker/order", json={
        "symbol": "NIFTY50", "side": "BUY", "quantity": 1, "price": 19800, "mode": "paper"
    })
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "COMPLETE"
    assert data["side"] == "BUY"


def test_broker_orders_list():
    r = client.get("/api/broker/orders")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
