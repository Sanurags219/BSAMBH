
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppIconName } from '../types';
// Fixed: Added Globe to the imported icons from lucide-react
import { 
  ArrowDown, Settings, ChevronDown, Zap, Loader2, CheckCircle2, 
  AlertTriangle, ShieldCheck, X, Shield, Search, TrendingUp, 
  Plus, Gauge, Percent, Layers, Info, History, Fuel, Activity,
  ZapOff, Terminal, Globe
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

  const estimatedL2GasFee = useMemo(() => {
    if (paymentMethod === 'gasless') return "0.00";
    return "0.000042";
  }, [paymentMethod]);

  const estimatedL1DataFee = useMemo(() => {
    if (paymentMethod === 'gasless') return "0.00";
    return "0.000098";
  }, [paymentMethod]);

  const totalNetworkFee = useMemo(() => {
    return (parseFloat(estimatedL2GasFee) + parseFloat(estimatedL1DataFee)).toFixed(6);
  }, [estimatedL2GasFee, estimatedL1DataFee]);

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

  useEffect(() => {
    localStorage.setItem('bsambh_expert_mode', isExpertMode.toString());
  }, [isExpertMode]);

  const priceImpactColor = useMemo(() => {
    if (priceImpact < 1) return 'text-green-500';
    if (priceImpact < 5) return 'text-orange-500';
    return 'text-red-500';
  }, [priceImpact]);

  const minReceived = useMemo(() => {
    const val = parseFloat(receiveAmount.replace(/,/g, ''));
    if (isNaN(val)) return '0';
    return (val * (1 - (slippage / 100))).toLocaleString(undefined, { maximumFractionDigits: 6 });
  }, [receiveAmount, slippage]);

  const handleSwap = async () => {
    setShowConfirmModal(false);
    setIsSwapping(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setSwapStatus('success');
      if (notify) notify("Swap Complete", `${isWrap ? 'Conversion' : 'Exchange'} finalized on Base.`, "success", 'zap');
      setPayAmount('');
    } catch (e) { setSwapStatus('error'); }
    finally { setIsSwapping(false); }
  };

  if (swapStatus === 'success') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-8 py-12 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 shadow-2xl">
          <CheckCircle2 size={48} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase text-white">Settled</h2>
          <p className="text-zinc-500 text-sm">Transaction verified on Base Mainnet.</p>
        </div>
        <button onClick={() => setSwapStatus('idle')} className="w-full py-5 bg-[#0052FF] text-white font-black uppercase rounded-[28px] shadow-xl">Back to App</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-700">
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase text-white">{isWrap ? (fromToken.symbol === 'ETH' ? 'Wrap' : 'Unwrap') : 'Swap'}</h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{isWrap ? 'Instant 1:1 conversion' : 'Competitive rates on Base'}</p>
        </div>
        <div className="flex gap-2">
          {isSmartWallet && (
            <div className="flex p-1 bg-zinc-900 border border-white/5 rounded-2xl">
              <button 
                onClick={() => setPaymentMethod('gasless')}
                className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 transition-all ${paymentMethod === 'gasless' ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
              >
                <Zap size={12} fill={paymentMethod === 'gasless' ? "currentColor" : "none"} /> Gasless
              </button>
              <button 
                onClick={() => setPaymentMethod('standard')}
                className={`p-2 rounded-xl text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 transition-all ${paymentMethod === 'standard' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                <Fuel size={12} /> Std
              </button>
            </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl border transition-all ${showSettings ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-900 border-white/10 text-zinc-500'}`}>
            <Settings size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="glass-card rounded-[32px] p-8 border-blue-500/30 bg-blue-500/5 space-y-8 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                <Percent size={14} className="text-blue-500" /> Slippage Tolerance
              </h4>
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${slippage > 2 ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-600/10 text-blue-400'}`}>
                {slippage > 2 ? 'High Slippage' : 'Standard'}
              </div>
            </div>
            <div className="flex gap-2">
              {[0.1, 0.5, 1.0].map(p => (
                <button key={p} onClick={() => { setSlippage(p); setCustomSlippage(''); }} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all border ${slippage === p && !customSlippage ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}>
                  {p}%
                </button>
              ))}
              <div className="flex-1 relative">
                <input 
                  type="number" placeholder="Custom" 
                  value={customSlippage} 
                  onChange={(e) => { setCustomSlippage(e.target.value); setSlippage(parseFloat(e.target.value) || 0.5); }}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl py-2.5 px-4 text-xs font-black focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600">%</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Terminal size={14} className="text-blue-500" /> Expert Mode
                </h4>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Show advanced L1/L2 gas & data fees</p>
              </div>
              <button 
                onClick={() => setIsExpertMode(!isExpertMode)}
                className={`w-14 h-7 rounded-full p-1 transition-all ${isExpertMode ? 'bg-blue-600' : 'bg-zinc-800'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${isExpertMode ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1 relative">
        <div className="bg-zinc-900/90 border border-white/5 p-7 rounded-[36px] hover:border-white/10 transition-all focus-within:border-blue-500/50">
          <div className="flex justify-between mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Pay</span>
            <span>Balance: <span className="text-white">{fromToken.balance}</span></span>
          </div>
          <div className="flex items-center gap-4">
            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-transparent text-5xl font-black tracking-tighter outline-none w-full text-white placeholder:text-zinc-800" placeholder="0.0" />
            <button onClick={() => setSelectingType('from')} className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-2xl border border-white/5 shadow-xl">
              <img src={fromToken.logo} className="w-7 h-7 rounded-full" alt="" />
              <span className="font-black text-sm uppercase italic">{fromToken.symbol}</span>
              <ChevronDown size={16} className="text-zinc-500" />
            </button>
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => setPayAmount((parseFloat(fromToken.balance) / 2).toString())} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-blue-400">Half</button>
            <button onClick={() => setPayAmount(fromToken.balance)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase text-zinc-500 hover:text-blue-400">Max</button>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button 
            onClick={() => { setFromToken(toToken); setToToken(fromToken); }} 
            className="bg-black border-4 border-black ring-1 ring-white/10 p-3.5 rounded-[22px] text-white hover:text-blue-500 hover:rotate-180 transition-all duration-500 shadow-2xl"
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
            <button onClick={() => setSelectingType('to')} className="flex items-center gap-2 bg-[#0052FF] px-4 py-2 rounded-2xl shadow-xl">
              <img src={toToken.logo} className="w-7 h-7 rounded-full border border-white/20" alt="" />
              <span className="font-black text-sm uppercase italic text-white">{toToken.symbol}</span>
              <ChevronDown size={16} className="text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-[28px] border border-white/5">
          <div className="flex items-center gap-2">
            <Fuel size={14} className="text-zinc-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Network Fee</span>
          </div>
          <div className="text-right">
            {paymentMethod === 'gasless' ? (
              <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Gasless</span>
            ) : (
              <span className="text-[10px] font-black text-white">{totalNetworkFee} ETH</span>
            )}
          </div>
        </div>

        {!isWrap && (
          <div className="flex items-center justify-between px-6 py-4 bg-white/5 rounded-[28px] border border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-zinc-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Price Impact</span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-black ${priceImpactColor}`}>
                {priceImpact < 0.01 ? '<0.01%' : `${priceImpact.toFixed(2)}%`}
              </span>
            </div>
          </div>
        )}

        {/* Expert Mode Extended Info */}
        {isExpertMode && !isWrap && (
          <>
            <div className="flex items-center justify-between px-6 py-4 bg-blue-500/5 rounded-[28px] border border-blue-500/10 animate-in fade-in slide-in-from-left-2">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-500/60" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">L1 Data Fee</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-white">{estimatedL1DataFee} ETH</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-blue-500/5 rounded-[28px] border border-blue-500/10 animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-blue-500/60" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">L2 Execution</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-white">{estimatedL2GasFee} ETH</span>
              </div>
            </div>
            <div className="md:col-span-2 flex items-center justify-between px-6 py-4 bg-white/5 rounded-[28px] border border-white/5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-zinc-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Minimum Received</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-blue-500">{minReceived} {toToken.symbol}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <button 
        disabled={isSwapping || !payAmount || parseFloat(payAmount) <= 0}
        onClick={() => setShowConfirmModal(true)}
        className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[32px] shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
      >
        {isSwapping ? <Loader2 className="animate-spin" size={20} /> : isWrap ? (fromToken.symbol === 'ETH' ? 'Wrap ETH' : 'Unwrap WETH') : 'Review Swap'}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-[48px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black italic uppercase text-white">Review Order</h3>
                  {isExpertMode && <span className="bg-blue-600 text-[8px] px-2 py-0.5 rounded font-black uppercase text-white tracking-widest">Expert</span>}
                </div>
                <button onClick={() => setShowConfirmModal(false)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
              </div>
              <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-500">You Pay</span>
                  <span className="font-black text-white">{payAmount} {fromToken.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase text-zinc-500">You Receive</span>
                  <span className="font-black text-blue-400">{receiveAmount} {toToken.symbol}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  <span>Slippage</span>
                  <span className="text-white">{slippage}%</span>
                </div>
                {!isWrap && (
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Price Impact</span>
                    <span className={`font-black ${priceImpactColor}`}>{priceImpact.toFixed(2)}%</span>
                  </div>
                )}
                
                {isExpertMode ? (
                  <>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      <span>L1 Security Fee</span>
                      <span className="text-white font-black">{estimatedL1DataFee} ETH</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      <span>L2 execution Fee</span>
                      <span className="text-white font-black">{estimatedL2GasFee} ETH</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Network Fee</span>
                    <span className={`text-white font-black ${paymentMethod === 'gasless' ? 'text-blue-500' : ''}`}>
                      {paymentMethod === 'gasless' ? 'FREE' : `${totalNetworkFee} ETH`}
                    </span>
                  </div>
                )}
                
                {!isWrap && (
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <span>Protocol Fee</span>
                    <span className="text-white">0.3%</span>
                  </div>
                )}
              </div>
              
              {priceImpact > 5 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="text-red-500 shrink-0" size={18} />
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">High Price Impact. You may lose value during this trade.</p>
                </div>
              )}

              <button onClick={handleSwap} className="w-full py-5 bg-[#0052FF] text-white font-black uppercase rounded-3xl shadow-xl flex items-center justify-center gap-2">
                {paymentMethod === 'gasless' && <Zap size={16} fill="white" />}
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token Selector Modal */}
      {selectingType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
               <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Select Asset</h3>
               <button onClick={() => setSelectingType(null)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 bg-black/20">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                  <input placeholder="Search name or symbol" className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold outline-none" />
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
                  <p className="text-sm font-bold text-zinc-400">{token.balance}</p>
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
