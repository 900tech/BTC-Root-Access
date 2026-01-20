
export interface BinanceTickerData {
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percentage
  c: string; // Last price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
}
