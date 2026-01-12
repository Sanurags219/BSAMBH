
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppIconName } from '../types';
// Add ArrowRight to the imports from lucide-react
import { 
  ArrowDown, Settings, ChevronDown, Zap, Loader2, CheckCircle2, 
  AlertTriangle, ShieldCheck, X, Shield, Search, TrendingUp, 
  Plus, Gauge, Percent, Layers, Info, History, Fuel, Activity,
  ZapOff, Terminal, Globe, ExternalLink, ArrowRight
} from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  priceInUsd: number;
}

const INITIAL_TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '1.42', priceInUsd: 2450.12 },
  { symbol: 'WETH', name: 'Wrapped Ether', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '0.85', priceInUsd: 2450.12 },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '542.10', priceInUsd: 1.00 },
  { symbol: 'cbBTC', name: 'Coinbase BTC', logo: 'https://assets.coingecko.com/coins/images/39906/standard/cbbtc.png', balance: '0.005', priceInUsd: 92450.00 },
  { symbol: 'DEGEN', name: 'Degen', logo: 'https://assets.coingecko.com/coins/images/34515/standard/degen.png', balance: '12400', priceInUsd: 0.018 },
  { symbol: 'AERO', name: 'Aerodrome', logo: 'https://assets.coingecko.com/coins/images/31583/standard/AERO.png', balance: '45.0', priceInUsd: 0.82 },
];

interface SwapProps {
  isSmartWallet?: boolean;
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', iconName?: AppIconName) => void;
}

const SWAP_FEE_PERCENT = 0.003;

const Swap: React.FC<SwapProps> = ({ isSmartWallet = false, notify }) => {
  const [availableTokens] = useState<Token[]>(INITIAL_TOKENS);
  const [fromToken, setFromToken] = useState<Token>(INITIAL_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(INITIAL_TOKENS[1]);
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('0');
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectingType, setSelectingType] = useState<'from' | 'to' | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [customSlippage, setCustomSlippage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'gasless' | 'standard'>(isSmartWallet ? 'gasless' : 'standard');
  const [isExpertMode, setIsExpertMode] = useState<boolean>(() => {
    return localStorage.getItem('bsambh_expert_mode') === 'true';
  });

  const isWrap = useMemo(() => 
    (fromToken.symbol === 'ETH' && toToken.symbol === 'WETH') || 
    (fromToken.symbol === 'WETH' && toToken.symbol === 'ETH'), 
  [fromToken, toToken]);

  const calculateReceive = useCallback((amount: string) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { 
      setReceiveAmount('0'); 
      setPriceImpact(0);
      return; 
    }
    
    setIsLoadingRate(true);
    setTimeout(() => {
      if (isWrap) {
        setReceiveAmount(val.toString());
        setPriceImpact(0);
      } else {
        const marketRate = fromToken.priceInUsd / toToken.priceInUsd;
        const grossReceive = val * marketRate;
        const mockPoolSizeUsd = 500000;
        const tradeUsdValue = val * fromToken.priceInUsd;
        const impact = (tradeUsdValue / mockPoolSizeUsd) * 100;
        const finalImpact = Math.min(impact, 99);
        const netAfterImpact = grossReceive * (1 - (finalImpact / 100));
        const finalReceive = netAfterImpact * (1 - SWAP_FEE_PERCENT);
        
        setReceiveAmount(finalReceive.toLocaleString(undefined, { maximumFractionDigits: 6 }));
        setPriceImpact(finalImpact);
      }
      setIsLoadingRate(false);
    }, 400);
  }, [fromToken, toToken, isWrap]);

  useEffect(() => {
    const timer = setTimeout(() => calculateReceive(payAmount), 300);
    return () => clearTimeout(timer);
  }, [payAmount, calculateReceive]);

  const handleSwap = async () => {
    setShowConfirmModal(false);
    setIsSwapping(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const mockHash = '0x' + Math.random().toString(16).slice(2, 66);
      setTxHash(mockHash);
      setSwapStatus('success');
      if (notify) notify("Swap Complete", `${isWrap ? 'Conversion' : 'Exchange'} finalized on Base.`, "success", 'zap');
      setPayAmount('');
    } catch (e) { setSwapStatus('error'); }
    finally { setIsSwapping(false); }
  };

  if (swapStatus === 'success') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-8 py-12 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 shadow-2xl relative">
          <CheckCircle2 size={48} />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
        </div>
        <div className="text-center space-y-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic uppercase text-white">Settled</h2>
            <p className="text-zinc-500 text-sm">Transaction verified on Base Mainnet.</p>
          </div>
          <a 
            href={`https://basescan.org/tx/${txHash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            View on Explorer <ExternalLink size={12} />
          </a>
        </div>
        <button onClick={() => setSwapStatus('idle')} className="w-full py-5 bg-[#0052FF] text-white font-black uppercase rounded-[28px] shadow-xl hover:bg-blue-600 transition-all active:scale-95">Back to App</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase text-white">{isWrap ? (fromToken.symbol === 'ETH' ? 'Wrap' : 'Unwrap') : 'Swap'}</h2>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Base Mainnet Live</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isSmartWallet && (
            <div className="flex p-1 bg-zinc-900 border border-white/5 rounded-2xl">
              <button 
                onClick={() => setPaymentMethod('gasless')}
                className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 transition-all ${paymentMethod === 'gasless' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                <Zap size={12} fill={paymentMethod === 'gasless' ? "currentColor" : "none"} /> Gasless
              </button>
              <button 
                onClick={() => setPaymentMethod('standard')}
                className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 transition-all ${paymentMethod === 'standard' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'}`}
              >
                <Fuel size={12} /> Std
              </button>
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-white'}`}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Rest of the Swap component remains consistent but with production-ready styles */}
      <div className="space-y-1 relative">
        <div className="bg-zinc-900/90 border border-white/5 p-7 rounded-[36px] hover:border-white/10 transition-all focus-within:border-blue-500/50">
          <div className="flex justify-between mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Pay</span>
            <span>Balance: <span className="text-white">{fromToken.balance}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-transparent text-5xl font-black tracking-tighter outline-none w-full text-white placeholder:text-zinc-800" placeholder="0.0" />
            <button onClick={() => setSelectingType('from')} className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-2xl border border-white/5 shadow-xl hover:border-white/20 transition-all">
              <img src={fromToken.logo} className="w-7 h-7 rounded-full" alt="" />
              <span className="font-black text-sm uppercase italic">{fromToken.symbol}</span>
              <ChevronDown size={16} className="text-zinc-500" />
            </button>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => setPayAmount((parseFloat(fromToken.balance) / 2).toString())} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-blue-400 transition-all">Half</button>
            <button onClick={() => setPayAmount(fromToken.balance)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-blue-400 transition-all">Max</button>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={() => { setFromToken(toToken); setToToken(fromToken); }} 
            className="bg-black border-4 border-black ring-1 ring-white/10 p-3.5 rounded-[22px] text-white hover:text-blue-500 hover:rotate-180 transition-all duration-500 shadow-2xl active:scale-90"
          >
            <ArrowDown size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="bg-zinc-900/90 border border-white/5 p-7 rounded-[36px] pt-10">
          <div className="flex justify-between mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Receive</span>
            {isLoadingRate && <Loader2 size={12} className="animate-spin text-blue-500" />}
          </div>
          <div className="flex items-center gap-4">
            <input type="text" value={receiveAmount} className="bg-transparent text-5xl font-black tracking-tighter outline-none w-full text-white" readOnly placeholder="0.0" />
            <button onClick={() => setSelectingType('to')} className="flex items-center gap-2 bg-[#0052FF] px-4 py-2 rounded-2xl shadow-xl hover:bg-blue-600 transition-all">
              <img src={toToken.logo} className="w-7 h-7 rounded-full border border-white/20" alt="" />
              <span className="font-black text-sm uppercase italic text-white">{toToken.symbol}</span>
              <ChevronDown size={16} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>

      <button 
        disabled={isSwapping || !payAmount || parseFloat(payAmount) <= 0}
        onClick={() => setShowConfirmModal(true)}
        className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[32px] shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3 group"
      >
        {isSwapping ? <Loader2 className="animate-spin" size={20} /> : (
          <>
            {isWrap ? (fromToken.symbol === 'ETH' ? 'Wrap ETH' : 'Unwrap WETH') : 'Review Swap'}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Logic for modals and selections remain integrated for a seamless UX */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-[48px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic uppercase text-white">Review Order</h3>
                <button onClick={() => setShowConfirmModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all"><X size={20} /></button>
              </div>
              
              <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-zinc-500">You Pay</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white">{payAmount} {fromToken.symbol}</span>
                    <img src={fromToken.logo} className="w-4 h-4 rounded-full" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-zinc-500">You Receive</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-400">{receiveAmount} {toToken.symbol}</span>
                    <img src={toToken.logo} className="w-4 h-4 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Network</span>
                  <span className="text-blue-500 font-black">Base Mainnet</span>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Protocol Fee</span>
                  <span className="text-white">0.3%</span>
                </div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Routing</span>
                  <span className="text-zinc-400">Bsambh Router V1</span>
                </div>
              </div>

              <button onClick={handleSwap} className="w-full py-5 bg-[#0052FF] text-white font-black uppercase rounded-3xl shadow-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-95">
                {paymentMethod === 'gasless' && <Zap size={16} fill="white" />}
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selecting Modal */}
      {selectingType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
               <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Select Asset</h3>
               <button onClick={() => setSelectingType(null)} className="text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
            </div>
            <div className="p-4 bg-black/20">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="Search name or symbol" className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-blue-500/30 transition-all" />
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableTokens.map(token => (
                <button 
                  key={token.symbol} 
                  onClick={() => {
                    if (selectingType === 'from') setFromToken(token);
                    else setToToken(token);
                    setSelectingType(null);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <img src={token.logo} className="w-10 h-10 rounded-full bg-zinc-800" alt="" />
                    <div className="text-left">
                      <p className="font-black text-white italic uppercase">{token.symbol}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">{token.balance}</p>
                    <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">~${(parseFloat(token.balance) * token.priceInUsd).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Swap;
