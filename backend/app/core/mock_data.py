import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any

BASE_PRICES = {
    "NIFTY50": 25000.0,
    "SENSEX": 82000.0,
    "BANKNIFTY": 55000.0,
    "RELIANCE": 2900.0,
    "TCS": 4200.0,
    "HDFCBANK": 1750.0,
    "INFY": 1900.0,
}

def get_base_price(symbol: str) -> float:
    return BASE_PRICES.get(symbol, 1000.0)

def _get_seeded_current_price(symbol: str) -> float:
    """Return a deterministic-ish current price from base using today's date seed.
    This ensures quote endpoint and OHLCV last candle always agree within the same day."""
    base = get_base_price(symbol)
    today = datetime.utcnow().strftime("%Y%m%d")
    seed = int(today + str(abs(hash(symbol)) % 1000))
    rng = random.Random(seed)
    # Daily drift bounded to ±0.5% of base
    drift = rng.uniform(-0.005, 0.005)
    return base * (1 + drift)

def generate_quote(symbol: str) -> Dict[str, Any]:
    current = _get_seeded_current_price(symbol)
    # Small intra-day noise around the seeded current price
    ltp = current * (1 + random.uniform(-0.003, 0.003))
    open_ = current * (1 + random.uniform(-0.002, 0.002))
    high = max(ltp, open_) * (1 + random.uniform(0, 0.003))
    low = min(ltp, open_) * (1 - random.uniform(0, 0.003))
    base = get_base_price(symbol)
    change = ltp - base
    return {
        "symbol": symbol,
        "ltp": round(ltp, 2),
        "open": round(open_, 2),
        "high": round(high, 2),
        "low": round(low, 2),
        "close": round(current, 2),
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

    # Cap per-candle sigma so weekly drift stays well under 3%
    # Weekly candles = 604800/interval_seconds; total drift ~ sigma * sqrt(n)
    # For 5m: ~2016 candles/week; sigma=0.0008 → weekly ≈ 3.6% max (gauss tails), keep at 0.0006
    sigma_map = {
        "1m": 0.0004, "5m": 0.0006, "15m": 0.0008,
        "1h": 0.0012, "1D": 0.003, "1W": 0.006,
    }
    sigma = sigma_map.get(interval, 0.0006)

    # Seed the walk so the last candle ends at today's seeded current price
    current_price = _get_seeded_current_price(symbol)
    base = get_base_price(symbol)

    # Walk forward from base, then rescale so last candle lands at current_price
    candles_raw = []
    price = base
    ts = from_ts - (from_ts % interval_seconds)
    rng = random.Random(symbol + str(from_ts // 86400))  # stable per-day seed

    while ts < to_ts:
        open_ = price
        change = rng.gauss(0, sigma)
        close = open_ * (1 + change)
        high = max(open_, close) * (1 + abs(rng.gauss(0, sigma * 0.4)))
        low = min(open_, close) * (1 - abs(rng.gauss(0, sigma * 0.4)))
        volume = rng.randint(10000, 500000)
        candles_raw.append({
            "time": ts,
            "open": open_, "high": high, "low": low, "close": close,
            "volume": volume,
        })
        price = close
        ts += interval_seconds

    if not candles_raw:
        return []

    # Rescale all OHLC values so last close == current_price
    last_close = candles_raw[-1]["close"]
    if last_close == 0:
        last_close = base
    scale = current_price / last_close

    candles = []
    for c in candles_raw:
        candles.append({
            "time": c["time"],
            "open": round(c["open"] * scale, 2),
            "high": round(c["high"] * scale, 2),
            "low": round(c["low"] * scale, 2),
            "close": round(c["close"] * scale, 2),
            "volume": c["volume"],
        })
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

def _derive_direction_and_rationale(symbol: str, features: Dict) -> tuple:
    """Derive direction signal and rationale text from the actual feature values."""
    rsi = features["rsi_14"]
    pcr = features["pcr"]
    fii = features["fii_net_cr"]
    vix = features["vix"]
    gift = features["gift_nifty_pct"]
    sentiment = features["news_sentiment"]

    # Score: positive = bullish, negative = bearish
    score = 0.0
    score += 1.0 if rsi < 40 else (-1.0 if rsi > 65 else 0.0)
    score += 1.0 if pcr > 1.1 else (-1.0 if pcr < 0.9 else 0.0)
    score += 1.0 if fii > 500 else (-1.0 if fii < -500 else 0.0)
    score += 0.5 if gift > 0.1 else (-0.5 if gift < -0.1 else 0.0)
    score += 0.5 if sentiment > 0.2 else (-0.5 if sentiment < -0.2 else 0.0)
    score -= 0.5 if vix > 18 else 0.0

    if score >= 1.5:
        direction = "up"
        confidence = min(0.85, 0.55 + score * 0.05)
    elif score <= -1.5:
        direction = "down"
        confidence = min(0.85, 0.55 + abs(score) * 0.05)
    else:
        direction = "sideways"
        confidence = 0.52 + random.uniform(0, 0.08)

    # Build rationale sentences from actual values
    parts = []
    rsi_desc = f"RSI at {rsi:.1f} (oversold, potential recovery)" if rsi < 35 else \
               f"RSI at {rsi:.1f} (overbought, caution)" if rsi > 65 else \
               f"RSI at {rsi:.1f} (neutral range)"
    parts.append(rsi_desc)

    pcr_desc = f"PCR {pcr:.2f} indicating put buildup (bullish hedge)" if pcr > 1.1 else \
               f"PCR {pcr:.2f} indicating call dominance (bearish hedge)" if pcr < 0.9 else \
               f"PCR {pcr:.2f} balanced"
    parts.append(pcr_desc)

    fii_sign = "buying" if fii >= 0 else "selling"
    parts.append(f"FII net {fii_sign} ₹{abs(int(fii)):,} Cr")

    if vix > 18:
        parts.append(f"elevated VIX at {vix:.1f} signals uncertainty")

    gift_desc = f"GIFT Nifty +{gift:.2f}% pointing to positive open" if gift > 0.1 else \
                f"GIFT Nifty {gift:.2f}% pointing to weak open" if gift < -0.1 else \
                f"GIFT Nifty flat at {gift:.2f}%"
    parts.append(gift_desc)

    rationale = f"{symbol}: " + ". ".join(parts) + "."
    return direction, round(confidence, 3), rationale

def generate_prediction(symbol: str) -> Dict[str, Any]:
    features = {
        "rsi_14": round(random.uniform(30, 75), 1),
        "macd_signal": round(random.uniform(-50, 50), 2),
        "pcr": round(random.uniform(0.8, 1.5), 2),
        "fii_net_cr": round(random.uniform(-3000, 3000), 0),
        "news_sentiment": round(random.uniform(-1, 1), 2),
        "vix": round(random.uniform(12, 22), 1),
        "gift_nifty_pct": round(random.uniform(-0.5, 0.5), 2),
    }

    direction, confidence, rationale = _derive_direction_and_rationale(symbol, features)

    return {
        "symbol": symbol,
        "direction": direction,
        "confidence": confidence,
        "rationale": rationale,
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
