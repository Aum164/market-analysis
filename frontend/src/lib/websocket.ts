type TickHandler = (data: unknown) => void

export function createTickSocket(symbol: string, onTick: TickHandler) {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  const ws = new WebSocket(`${proto}://${window.location.host}/ws/market/${symbol}`)
  ws.onmessage = (e) => { try { onTick(JSON.parse(e.data)) } catch {} }
  ws.onerror = (e) => console.warn('WS error', e)
  return ws
}
