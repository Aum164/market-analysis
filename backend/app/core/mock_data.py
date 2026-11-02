import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any

BASE_PRICES = {
    "NIFTY50": 19800.0,
    "SENSEX": 66000.0,
    "BANKNIFTY": 44000.0,
    "RELIANCE": 2400.0,
    "TCS": 3500.0,
    "HDFCBANK": 1600.0,
    "INFY": 1450.0,
}

def get_base_price(symbol: str) -> float:
    return BASE_PRICES.get(symbol, 1000.0)

def generate_quote(symbol: str) -> Dict[str, Any]:
    base = get_base_price(symbol)
    ltp = base * (1 + random.uniform(-0.02, 0.02))
    open_ = base * (1 + random.uniform(-0.01, 0.01))
    high = max(ltp, open_) * (1 + random.uniform(0, 0.01))
    low = min(ltp, open_) * (1 - random.uniform(0, 0.01))
    change = ltp - base
    return {
        "symbol": symbol,
        "ltp": round(ltp, 2),
        "open": round(open_, 2),
        "high": round(high, 2),
        "low": round(low, 2),
        "close": round(base, 2),
        "change": round(change, 2),
        "change_pct": round((change / base) * 100, 2),
        "volume": random.randint(100000, 5000000),
        "timestamp": datetime.utcnow().isoformat(),
    }

def generate_ohlcv(symbol: str, interval: str = "5m", from_ts: int = 0, to_ts: int = 0) -> List[Dict]:
    if not from_ts:
        from_ts = int(time.time()) - 86400 * 30
    if not to_ts:
        to_ts = int(time.time())

    interval_seconds = {
        "1m": 60, "5m": 300, "15m": 900, "1h": 3600, "1D": 86400, "1W": 604800
    }.get(interval, 300)

    candles = []
    price = get_base_price(symbol)
    ts = from_ts - (from_ts % interval_seconds)

    while ts < to_ts:
        open_ = price
        change = random.gauss(0, 0.005)
        close = open_ * (1 + change)
        high = max(open_, close) * (1 + abs(random.gauss(0, 0.002)))
        low = min(open_, close) * (1 - abs(random.gauss(0, 0.002)))
        volume = random.randint(10000, 500000)
        candles.append({
            "time": ts,
            "open": round(open_, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close, 2),
            "volume": volume,
        })
        price = close
        ts += interval_seconds

    return candles

def compute_indicator(symbol: str, indicator_type: str, period: int, ohlcv: List[Dict]) -> Dict:
    closes = [c["close"] for c in ohlcv]
    times = [c["time"] for c in ohlcv]
    values = []

    if indicator_type == "rsi":
        for i in range(period, len(closes)):
            gains = [max(closes[j] - closes[j-1], 0) for j in range(i-period+1, i+1)]
            losses = [max(closes[j-1] - closes[j], 0) for j in range(i-period+1, i+1)]
            avg_gain = sum(gains) / period
            avg_loss = sum(losses) / period
            if avg_loss == 0:
                rsi = 100.0
            else:
                rs = avg_gain / avg_loss
                rsi = 100 - (100 / (1 + rs))
            values.append({"time": times[i], "value": round(rsi, 2)})
    elif indicator_type == "sma":
        for i in range(period - 1, len(closes)):
            sma = sum(closes[i-period+1:i+1]) / period
            values.append({"time": times[i], "value": round(sma, 2)})
    elif indicator_type == "ema":
        if len(closes) >= period:
            k = 2 / (period + 1)
            ema = sum(closes[:period]) / period
            for i in range(period, len(closes)):
                ema = closes[i] * k + ema * (1 - k)
                values.append({"time": times[i], "value": round(ema, 2)})
    elif indicator_type == "macd":
        if len(closes) > 26:
            k12, k26 = 2/13, 2/27
            ema12 = ema26 = sum(closes[:12]) / 12
            for i in range(12, len(closes)):
                ema12 = closes[i] * k12 + ema12 * (1 - k12)
                if i >= 25:
                    ema26 = closes[i] * k26 + ema26 * (1 - k26)
                    values.append({"time": times[i], "value": round(ema12 - ema26, 2)})
    elif indicator_type == "bb":
        for i in range(period - 1, len(closes)):
            window = closes[i-period+1:i+1]
            mean = sum(window) / period
            std = (sum((x - mean)**2 for x in window) / period) ** 0.5
            values.append({"time": times[i], "value": round(mean + 2 * std, 2)})
    else:
        values = [{"time": t, "value": round(c, 2)} for t, c in zip(times[-50:], closes[-50:])]

    return {"type": indicator_type, "values": values[-200:]}

def generate_prediction(symbol: str) -> Dict[str, Any]:
    directions = ["up", "down", "sideways"]
    weights = [0.45, 0.35, 0.20]
    direction = random.choices(directions, weights=weights)[0]
    confidence = random.uniform(0.52, 0.81)

    rationales = {
        "up": f"{symbol} shows bullish momentum with RSI recovering from oversold levels and PCR above 1.2. FII net buying of ₹2,400 Cr yesterday supports upside. GIFT Nifty indicating a positive open.",
        "down": f"{symbol} faces resistance at key levels with RSI in overbought territory at 72. FII net selling ₹1,800 Cr. Crude oil spike and USD/INR weakening adding pressure.",
        "sideways": f"{symbol} consolidating near support. Mixed signals: neutral PCR, balanced FII/DII flows. Awaiting RBI policy cues and global market direction.",
    }

    features = {
        "rsi_14": round(random.uniform(30, 75), 1),
        "macd_signal": round(random.uniform(-50, 50), 2),
        "pcr": round(random.uniform(0.8, 1.5), 2),
        "fii_net_cr": round(random.uniform(-3000, 3000), 0),
        "news_sentiment": round(random.uniform(-1, 1), 2),
        "vix": round(random.uniform(12, 22), 1),
        "gift_nifty_pct": round(random.uniform(-0.5, 0.5), 2),
    }

    return {
        "symbol": symbol,
        "direction": direction,
        "confidence": round(confidence, 3),
        "rationale": rationales[direction],
        "features": features,
        "timestamp": datetime.utcnow().isoformat(),
    }

def run_backtest(symbol: str, capital: float, start_date: str, end_date: str) -> Dict[str, Any]:
    total_return = random.uniform(-10, 45)
    cagr = total_return * 0.6
    sharpe = random.uniform(0.5, 2.5)
    max_drawdown = random.uniform(-25, -3)
    win_rate = random.uniform(40, 65)
    num_trades = random.randint(15, 120)

    equity = capital
    curve = []
    d = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    while d <= end:
        equity *= (1 + random.gauss(0.0003, 0.008))
        curve.append({"time": d.strftime("%Y-%m-%d"), "value": round(equity, 2)})
        d += timedelta(days=1)

    return {
        "strategy_id": "demo",
        "symbol": symbol,
        "metrics": {
            "total_return": round(total_return, 2),
            "cagr": round(cagr, 2),
            "sharpe": round(sharpe, 2),
            "max_drawdown": round(max_drawdown, 2),
            "win_rate": round(win_rate, 2),
            "num_trades": num_trades,
        },
        "equity_curve": curve,
    }
