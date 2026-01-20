
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MatrixRain from './components/MatrixRain';
import { BinanceTickerData, LogEntry } from './types';

const App: React.FC = () => {
  const [price, setPrice] = useState<string>('-------');
  const [change, setChange] = useState<string>('--.--%');
  const [priceColor, setPriceColor] = useState<string>('text-[#00ff41]');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const lastPriceRef = useRef<number>(0);
  const logCounterRef = useRef<number>(0);

  const addLog = useCallback((message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${logCounterRef.current++}`,
      message: `> ${message}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 6));
  }, []);

  useEffect(() => {
    addLog("Initializing websocket connection...");
    const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
    let ws: WebSocket;

    const connect = () => {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        addLog("ACCESS GRANTED. Stream encrypted.");
        addLog("Receiving data packets...");
      };

      ws.onmessage = (event) => {
        const data: BinanceTickerData = JSON.parse(event.data);
        const currentPrice = parseFloat(data.c);
        const percentChange = parseFloat(data.P);

        // UI Logic
        if (currentPrice > lastPriceRef.current) {
          setPriceColor('text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]');
        } else if (currentPrice < lastPriceRef.current) {
          setPriceColor('text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]');
        }

        setTimeout(() => setPriceColor('text-[#00ff41]'), 500);

        // Glitch effect emulation
        if (Math.random() > 0.9) {
          const formatted = currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 });
          setPrice(`$${formatted}`);
        } else {
          setPrice(`$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        }

        setChange(`${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%`);
        lastPriceRef.current = currentPrice;
        document.title = `BTC: $${parseInt(data.c)} // MATRIX`;

        if (Math.random() > 0.98) {
          addLog(`Node trace: ${data.v.slice(0, 8)} base units`);
        }
      };

      ws.onclose = () => {
        addLog("CONNECTION LOST. Re-routing through proxy...");
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      if (ws) ws.close();
    };
  }, [addLog]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        addLog(`Fullscreen error: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden">
      <MatrixRain />

      {/* Main Terminal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-black/85 border-2 border-[#008f11] backdrop-blur-sm p-6 md:p-10 landscape-compact flex flex-col shadow-[0_0_30px_rgba(0,143,17,0.3)]">
        
        {/* Aesthetic Corner Brackets */}
        <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-[#00ff41]"></div>
        <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-[#00ff41]"></div>
        <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-[#00ff41]"></div>
        <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-[#00ff41]"></div>

        <div className="text-center">
          <header className="mb-4 landscape-compact">
            <h1 className="text-lg md:text-2xl tracking-[4px] text-[#00ff41] opacity-80 matrix-glow">
              SYSTEM_OVERRIDE: MONITORING_STREAM <span className="inline-block w-3 h-5 bg-[#00ff41] align-middle cursor-blink ml-1"></span>
            </h1>
            <p className="text-sm md:text-base text-[#008f11] mt-2">DETECTING_ASSET: BITCOIN_BTC_USDT</p>
          </header>

          <main className="my-6 landscape-compact">
            <div className={`text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter transition-all duration-300 ${priceColor} landscape-price`}>
              {price}
            </div>

            <div className="flex flex-wrap justify-center gap-8 mt-6 landscape-compact">
              <div className="flex flex-col items-center">
                <span className="text-xs md:text-sm text-[#008f11] uppercase tracking-widest">24h_volatility</span>
                <span className={`text-2xl md:text-4xl font-bold ${change.startsWith('+') ? 'text-[#00ff41]' : 'text-red-500'}`}>
                  {change}
                </span>
              </div>
              <div className="hidden sm:flex flex-col items-center">
                <span className="text-xs md:text-sm text-[#008f11] uppercase tracking-widest">protocol_status</span>
                <span className="text-2xl md:text-4xl text-[#00ff41]">SECURED</span>
              </div>
            </div>
          </main>

          <footer className="mt-8 pt-4 border-t border-dashed border-[#008f11] text-left h-24 md:h-32 overflow-hidden landscape-compact">
            <div className="space-y-1 font-mono text-[10px] md:text-sm text-[#008f11]">
              {logs.map((log) => (
                <div key={log.id} className="opacity-90 animate-in fade-in slide-in-from-left duration-300">
                  {log.message}
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>

      {/* Fullscreen Trigger */}
      <button 
        onClick={toggleFullscreen}
        className="fixed bottom-6 right-6 z-[60] px-4 py-2 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors text-xs md:text-sm tracking-widest opacity-40 hover:opacity-100"
      >
        [ {isFullscreen ? 'EXIT_FULLSCREEN' : 'TOGGLE_FULLSCREEN'} ]
      </button>

      {/* Mobile Landscape Overlay Guidance (Optional hint) */}
      <div className="fixed bottom-6 left-6 z-[60] text-[10px] text-[#008f11] uppercase hidden md:block">
        Kernel: 5.4.0-matrix-rt-amd64 // User: root@mainframe
      </div>
    </div>
  );
};

export default App;
