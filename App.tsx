
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MatrixRain from './components/MatrixRain';
import { BinanceTickerData, LogEntry } from './types';

const App: React.FC = () => {
  const [price, setPrice] = useState<string>('SYS_BOOT...');
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
    addLog("INIT_KERNEL_SEQUENCE...");
    addLog("ESTABLISHING_SOCKET_TUNNEL...");
    
    const wsUrl = 'wss://stream.binance.com:9443/ws/btcusdt@ticker';
    let ws: WebSocket;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setStatus('LIVE');
          addLog("CONNECTION_ESTABLISHED: BINANCE_NODE_01");
        };

        ws.onmessage = (event) => {
          const data: BinanceTickerData = JSON.parse(event.data);
          const currentPrice = parseFloat(data.c);

          if (currentPrice > lastPriceRef.current) {
            setPriceColor('text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]');
          } else if (currentPrice < lastPriceRef.current) {
            setPriceColor('text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]');
          }

          setTimeout(() => setPriceColor('text-[#00ff41]'), 300);

          setPrice(`$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
          lastPriceRef.current = currentPrice;
        };

        ws.onclose = () => {
          setStatus('OFFLINE');
          addLog("SIGNAL_LOST: RECONNECTING_DAEMON...");
          setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          addLog("SOCKET_ERROR: DATA_CORRUPTION");
        };
      } catch (e) {
        addLog("CRITICAL_BOOT_FAILURE");
      }
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
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center p-4 bg-black overflow-hidden select-none">
      <MatrixRain />

      {/* 终端主界面 - 修改为完全透明 (bg-transparent)，移除模糊和阴影 */}
      <div className="relative z-10 w-full max-w-5xl bg-transparent p-4 md:p-8 landscape-compact">
        
        <div className="flex flex-col h-full">
          <header className="flex justify-between items-start mb-4 landscape-compact">
            <div>
              <h1 className="text-xl md:text-2xl text-[#00ff41] tracking-[0.2em] font-bold">
                BTC_KERNEL_MONITOR <span className="inline-block w-2 h-4 bg-[#00ff41] cursor-blink align-middle"></span>
              </h1>
              <div className="text-xs opacity-50 uppercase">Session_Root // Mode: Secured</div>
            </div>
            <div className={`px-2 py-0.5 text-xs border ${status === 'LIVE' ? 'border-[#00ff41] text-[#00ff41]' : 'border-red-500 text-red-500'} animate-pulse`}>
              {status}
            </div>
          </header>

          <main className="flex-grow flex flex-col items-center justify-center py-12 md:py-24 landscape-compact">
            {/* 价格显示 - 核心视觉中心 */}
            <div className={`text-[20vw] md:text-[12rem] font-bold tracking-tighter transition-all duration-200 ${priceColor} landscape-price`}>
              {price}
            </div>
          </main>

          <footer className="mt-6 pt-4 landscape-compact">
            <div className="h-16 md:h-24 overflow-hidden text-sm md:text-lg space-y-1 text-[#008f11]">
              {logs.map((log) => (
                <div key={log.id} className="opacity-80 flex gap-3">
                  <span className="opacity-40">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              ))}
              <div className="text-[#00ff41] cursor-blink">&gt; _</div>
            </div>
          </footer>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button 
          onClick={toggleFullscreen}
          className="px-4 py-1 border border-[#00ff41]/30 text-[#00ff41]/50 hover:border-[#00ff41] hover:text-[#00ff41] transition-all text-xs uppercase bg-black/50 backdrop-blur-sm"
        >
          [FULL_SCREEN_MODE]
        </button>
      </div>
      
      <div className="fixed bottom-4 left-4 z-50 text-xs text-[#008f11]/30 uppercase landscape-hidden">
        Kernel: Matrix_OS // Access: Root
      </div>
    </div>
  );
};

export default App;
