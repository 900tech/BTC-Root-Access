
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MatrixRain from './components/MatrixRain';
import { BinanceTickerData, LogEntry } from './types';

const App: React.FC = () => {
  const [price, setPrice] = useState<string>('LOADING...');
  const [change, setChange] = useState<string>('0.00%');
  const [priceColor, setPriceColor] = useState<string>('text-[#00ff41]');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<'CONNECTING' | 'LIVE' | 'OFFLINE'>('CONNECTING');
  
  const lastPriceRef = useRef<number>(0);
  const logCounterRef = useRef<number>(0);

  const addLog = useCallback((message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${logCounterRef.current++}`,
      message: `> ${message}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 5));
  }, []);

  useEffect(() => {
    addLog("BOOTING_SYSTEM...");
    addLog("BYPASSING_FIREWALL...");
    
    const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setStatus('LIVE');
        addLog("ROOT_ACCESS_GRANTED: BTC_FEED");
      };

      ws.onmessage = (event) => {
        const data: BinanceTickerData = JSON.parse(event.data);
        const currentPrice = parseFloat(data.c);
        const percentChange = parseFloat(data.P);

        if (currentPrice > lastPriceRef.current) {
          setPriceColor('text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]');
        } else if (currentPrice < lastPriceRef.current) {
          setPriceColor('text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]');
        }

        setTimeout(() => setPriceColor('text-[#00ff41]'), 300);

        setPrice(`$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
        setChange(`${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`);
        lastPriceRef.current = currentPrice;
        
        if (Math.random() > 0.99) {
          addLog(`PACKET_RECV: ${data.q.slice(0, 6)} USDT_FLOW`);
        }
      };

      ws.onclose = () => {
        setStatus('OFFLINE');
        addLog("CRITICAL_ERROR: RETRYING_IN_3S...");
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => ws?.close();
  }, [addLog]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 bg-black overflow-hidden font-mono">
      <MatrixRain />

      {/* Main Terminal */}
      <div className="relative z-10 w-full max-w-5xl bg-black/90 border-2 border-[#008f11] p-4 md:p-8 landscape-compact shadow-[0_0_50px_rgba(0,143,17,0.2)]">
        
        {/* Corner Brackets */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#00ff41]"></div>
        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#00ff41]"></div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#00ff41]"></div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#00ff41]"></div>

        <div className="flex flex-col h-full">
          <header className="flex justify-between items-start mb-6 landscape-compact">
            <div>
              <h1 className="text-lg md:text-xl text-[#00ff41] tracking-[0.2em] font-bold">
                BTC_KERNEL_WATCH <span className="inline-block w-2 h-4 bg-[#00ff41] animate-pulse"></span>
              </h1>
              <div className="text-[10px] md:text-xs opacity-60">AUTH_MODE: ROOT // SESSION: {Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
            </div>
            <div className={`px-2 py-1 text-[10px] md:text-xs border ${status === 'LIVE' ? 'border-[#00ff41] text-[#00ff41]' : 'border-red-500 text-red-500'} animate-pulse`}>
              {status}
            </div>
          </header>

          <main className="flex-grow flex flex-col items-center justify-center py-4 md:py-10 landscape-compact">
            <div className={`text-[12vw] md:text-[8rem] font-bold tracking-tighter transition-all duration-200 ${priceColor} landscape-price`}>
              {price}
            </div>
            
            <div className="w-full flex justify-around mt-4 landscape-compact">
              <div className="text-center">
                <div className="text-[10px] md:text-sm opacity-50 uppercase tracking-widest">Volatility_24h</div>
                <div className={`text-2xl md:text-4xl font-bold ${change.startsWith('+') ? 'text-[#00ff41]' : 'text-red-500'}`}>
                  {change}
                </div>
              </div>
              <div className="text-center landscape-hidden">
                <div className="text-[10px] md:text-sm opacity-50 uppercase tracking-widest">Network_Node</div>
                <div className="text-2xl md:text-4xl text-[#00ff41]">BINANCE_01</div>
              </div>
            </div>
          </main>

          <footer className="mt-6 pt-4 border-t border-[#008f11]/30 landscape-compact">
            <div className="h-16 md:h-24 overflow-hidden text-[10px] md:text-sm space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="opacity-80">
                  <span className="text-[#008f11]/50">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
              <div className="text-[#00ff41] cursor-blink inline-block">&gt; _</div>
            </div>
          </footer>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button 
          onClick={toggleFullscreen}
          className="p-2 border border-[#00ff41]/40 text-[#00ff41]/60 hover:border-[#00ff41] hover:text-[#00ff41] transition-all text-[10px] uppercase tracking-tighter"
        >
          [Full_Screen]
        </button>
      </div>
      
      <div className="fixed bottom-4 left-4 z-50 text-[10px] text-[#008f11]/40 uppercase landscape-hidden">
        Matrix v4.2.0-stable // Proxy: Hidden
      </div>
    </div>
  );
};

export default App;
