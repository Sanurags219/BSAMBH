import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowDown, Settings, ChevronDown, History, Zap, Loader2, CheckCircle2, AlertTriangle, ShieldCheck, X, ArrowRight, Shield, Search, TrendingUp, Plus, Info, Gauge } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Token {
  symbol: string;
  name: string;
  logo: string;
  balance: string;
  priceInUsd: number;
  isCustom?: boolean;
}

const INITIAL_TOKENS: Token[] = [
  { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '1.42', priceInUsd: 2450.12 },
  { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: '542.10', priceInUsd: 1.00 },
  { symbol: 'cbBTC', name: 'Coinbase BTC', logo: 'https://assets.coingecko.com/coins/images/39906/standard/cbbtc.png', balance: '0.005', priceInUsd: 92450.00 },
  { symbol: 'DEGEN', name: 'Degen', logo: 'https://assets.coingecko.com/coins/images/34515/standard/degen.png', balance: '12400', priceInUsd: 0.018 },
  { symbol: 'AERO', name: 'Aerodrome', logo: 'https://assets.coingecko.com/coins/images/31583/standard/AERO.png', balance: '45.0', priceInUsd: 0.82 },
  { symbol: 'BRETT', name: 'Brett', logo: 'https://assets.coingecko.com/coins/images/35368/standard/brett.png', balance: '25000', priceInUsd: 0.12 },
  { symbol: 'TOSHI', name: 'Toshi', logo: 'https://assets.coingecko.com/coins/images/31331/standard/toshi.png', balance: '150000', priceInUsd: 0.0004 },
  { symbol: 'VIRTUAL', name: 'Virtual Protocol', logo: 'https://assets.coingecko.com/coins/images/33580/standard/virtual.png', balance: '1200', priceInUsd: 0.45 },
  { symbol: 'HIGHER', name: 'Higher', logo: 'https://assets.coingecko.com/coins/images/36294/standard/higher.png', balance: '8000', priceInUsd: 0.05 },
  { symbol: 'BUILD', name: 'Build', logo: 'https://assets.coingecko.com/coins/images/36423/standard/build.png', balance: '500', priceInUsd: 1.20 },
  { symbol: 'WETH', name: 'Wrapped Ether', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: '0.0', priceInUsd: 2450.12 },
];

interface SwapProps {
  isSmartWallet?: boolean;
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', icon?: React.ReactNode) => void;
}

const SWAP_FEE_PERCENT = 0.003;
const SIMULATED_POOL_LIQUIDITY_USD = 1000000;

type Timeframe = '24H' | '7D' | '30D';

const generateMockPriceData = (timeframe: Timeframe) => {
  const points = timeframe === '24H' ? 24 : timeframe === '7D' ? 7 : 30;
  const basePrice = 2450.12;
  const data = [];
  let currentPrice = basePrice * (0.95 + Math.random() * 0.1);

  for (let i = points; i >= 0; i--) {
    const change = (Math.random() - 0.45) * (basePrice * 0.02);
    currentPrice += change;
    const date = new Date();
    if (timeframe === '24H') date.setHours(date.getHours() - i);
    else if (timeframe === '7D') date.setDate(date.getDate() - i);
    else date.setDate(date.getDate() - i);

    data.push({
      time: timeframe === '24H' 
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }
  return data;
};

const PriceChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [data, setData] = useState(generateMockPriceData('24H'));
  const [isChartLoading, setIsChartLoading] = useState(false);

  useEffect(() => {
    setIsChartLoading(true);
    const timer = setTimeout(() => {
      setData(generateMockPriceData(timeframe));
      setIsChartLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [timeframe]);

  const latestPrice = data[data.length - 1].price;
  const firstPrice = data[0].price;
  const priceChange = latestPrice - firstPrice;
  const percentChange = (priceChange / firstPrice) * 100;

  return (
    <div className="glass-card rounded-[40px] border border-white/10 p-6 space-y-6 overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-5 h-5" alt="ETH" />
            <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" className="w-5 h-5 -ml-3" alt="USDC" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">ETH/USDC</h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black tracking-tighter text-white">${latestPrice.toLocaleString()}</span>
            <span className={`text-xs font-bold ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          {(['24H', '7D', '30D'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                timeframe === tf ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 w-full relative">
        {isChartLoading && (
          <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-500" size={24} />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" hide />
            <YAxis domain={['dataMin - 50', 'dataMax + 50']} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: '#0052FF', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
              labelStyle={{ color: '#71717a', fontSize: '9px', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '800' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
            />
            <Area type="monotone" dataKey="price" stroke="#0052FF" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={12} className="text-green-500" />
          Market Bullish
        </div>
        <div>Volume: $4.2M</div>
      </div>
    </div>
  );
};

const TokenSelectorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: Token) => void;
  onImport: (token: Token) => void;
  tokens: Token[];
  selectedToken: Token;
}> = ({ isOpen, onClose, onSelect, onImport, tokens, selectedToken }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'tokens' | 'custom'>('tokens');
  const [customAddress, setCustomAddress] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [customTokenPreview, setCustomTokenPreview] = useState<Token | null>(null);
  const [error, setError] = useState('');

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => 
      t.symbol.toLowerCase().includes(search.toLowerCase()) || 
      t.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tokens]);

  const validateAndFetchToken = async (address: string) => {
    if (!address.startsWith('0x') || address.length !== 42) {
      setError('Invalid contract address');
      setCustomTokenPreview(null);
      return;
    }
    setError('');
    setIsFetching(true);
    setTimeout(() => {
      const mockToken: Token = {
        symbol: 'MOCK',
        name: 'Simulated Asset',
        logo: 'https://cryptologos.cc/logos/base-base-logo.png',
        balance: '0.00',
        priceInUsd: 1.25,
        isCustom: true
      };
      setCustomTokenPreview(mockToken);
      setIsFetching(false);
    }, 1200);
  };

  useEffect(() => {
    if (customAddress.length === 42) validateAndFetchToken(customAddress);
    else {
      setCustomTokenPreview(null);
      if (customAddress.length > 0 && !customAddress.startsWith('0x')) setError('Address must start with 0x');
      else setError('');
    }
  }, [customAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex flex-col">
            <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Token Hub</h3>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Base Network Assets</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-black/20 p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex p-2 gap-2 bg-black/20 border-b border-white/5">
          <button onClick={() => setActiveTab('tokens')} className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'tokens' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>Tokens</button>
          <button onClick={() => setActiveTab('custom')} className={`flex-1 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}>Import Custom</button>
        </div>

        {activeTab === 'tokens' ? (
          <>
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input autoFocus type="text" placeholder="Search name or symbol" className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-blue-500/50" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTokens.map((token) => (
                <button key={token.symbol} onClick={() => { onSelect(token); onClose(); }} disabled={selectedToken.symbol === token.symbol} className={`w-full flex items-center justify-between p-4 rounded-[24px] transition-all hover:bg-white/5 group ${selectedToken.symbol === token.symbol ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-4">
                    <img src={token.logo} className="w-10 h-10 rounded-full border border-white/10" alt={token.symbol} />
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-white">{token.symbol}</p>
                        {token.isCustom && <span className="text-[7px] bg-blue-500/10 text-blue-500 px-1 rounded uppercase font-black">Custom</span>}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-300">{token.balance}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">${token.priceInUsd.toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Contract Address</label>
              <input autoFocus type="text" placeholder="0x..." className={`w-full bg-zinc-900 border rounded-2xl px-5 py-4 font-bold text-xs focus:outline-none transition-all ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/5 focus:border-blue-500/50'}`} value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} />
              {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest ml-2">{error}</p>}
            </div>
            {isFetching && (
              <div className="py-12 flex flex-col items-center justify-center gap-4 glass-card rounded-3xl border-dashed">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Searching Base Chain...</p>
              </div>
            )}
            {customTokenPreview && (
              <div className="p-6 bg-blue-600/5 border border-blue-600/20 rounded-[32px]">
                <div className="flex items-center gap-4 mb-6">
                  <img src={customTokenPreview.logo} className="w-14 h-14 rounded-full border border-white/10" alt="New" />
                  <div>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">{customTokenPreview.name}</h4>
                    <p className="text-blue-500 font-black tracking-widest uppercase text-xs">{customTokenPreview.symbol}</p>
                  </div>
                </div>
                <button onClick={() => { onImport(customTokenPreview); onSelect(customTokenPreview); onClose(); }} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
                  <Plus size={16} /> Import Token
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SwapConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payAmount: string;
  receiveAmount: string;
  minReceived: number;
  slippage: number;
  priceImpact: number;
  isSmartWallet: boolean;
  useGasless: boolean;
  fromToken: Token;
  toToken: Token;
  estimatedGas: number;
}> = ({ isOpen, onClose, onConfirm, payAmount, receiveAmount, minReceived, slippage, priceImpact, isSmartWallet, useGasless, fromToken, toToken, estimatedGas }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Confirm Exchange</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-black/20 p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3">
                <img src={fromToken.logo} className="w-10 h-10 rounded-full border border-white/10" alt={fromToken.symbol} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sell Asset</span>
                  <span className="text-lg font-black italic uppercase text-white tracking-tighter">{fromToken.symbol}</span>
                </div>
              </div>
              <span className="text-xl font-black tracking-tighter text-white">{payAmount}</span>
            </div>

            <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-black border border-white/10 p-2 rounded-xl text-blue-500 shadow-xl">
                <ArrowDown size={16} strokeWidth={3} />
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-blue-600/5 rounded-3xl border border-blue-600/20">
              <div className="flex items-center gap-3">
                <img src={toToken.logo} className="w-10 h-10 rounded-full border border-white/10" alt={toToken.symbol} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Receive Asset</span>
                  <span className="text-lg font-black italic uppercase text-white tracking-tighter">{toToken.symbol}</span>
                </div>
              </div>
              <span className="text-xl font-black tracking-tighter text-blue-400">{receiveAmount}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Slippage</span>
              <span className="text-white font-black">{slippage}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Estimated Gas Fee</span>
              <span className={`font-black uppercase tracking-widest text-[9px] ${useGasless && isSmartWallet ? 'text-green-400' : 'text-blue-400'}`}>
                {useGasless && isSmartWallet ? 'Sponsored ($0.00)' : `$${estimatedGas.toFixed(3)}`}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
              <span className="text-zinc-500 font-bold uppercase tracking-widest text-[9px]">Routing Protocol</span>
              <span className="text-zinc-400 font-black flex items-center gap-1.5 uppercase text-[9px]">
                <Shield size={10} className="text-blue-500" /> Bsambh Engine (Base)
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/10 hover:bg-zinc-800 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-[2] py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-blue-500/10">Confirm Swap</button>
        </div>
      </div>
    </div>
  );
};

const Swap: React.FC<SwapProps> = ({ isSmartWallet = false, notify }) => {
  const [availableTokens, setAvailableTokens] = useState<Token[]>(INITIAL_TOKENS);
  const [fromToken, setFromToken] = useState<Token>(INITIAL_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(INITIAL_TOKENS[1]);
  const [payAmount, setPayAmount] = useState<string>('');
  const [receiveAmount, setReceiveAmount] = useState<string>('0');
  const [numericReceiveAmount, setNumericReceiveAmount] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [priceImpact, setPriceImpact] = useState<number>(0.01); 
  const [useGasless, setUseGasless] = useState<boolean>(true);
  const [estimatedGas, setEstimatedGas] = useState<number>(0.008);
  const [gasPolling, setGasPolling] = useState<boolean>(false);
  
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectingType, setSelectingType] = useState<'from' | 'to' | null>(null);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [customSlippage, setCustomSlippage] = useState<string>('');

  // Mock Gas Estimation polling
  useEffect(() => {
    const interval = setInterval(() => {
      setGasPolling(true);
      setTimeout(() => {
        const baseFee = 0.005 + (Math.random() * 0.01);
        setEstimatedGas(baseFee);
        setGasPolling(false);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleImportToken = (newToken: Token) => {
    setAvailableTokens(prev => {
      if (prev.some(t => t.symbol === newToken.symbol)) return prev;
      return [...prev, newToken];
    });
  };

  const calculateReceiveAmount = useCallback((amount: string) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setReceiveAmount('0');
      setNumericReceiveAmount(0);
      setPriceImpact(0.01);
      return;
    }
    setIsLoadingRate(true);
    setTimeout(() => {
      const totalUsdValue = val * fromToken.priceInUsd;
      const grossReceive = totalUsdValue / toToken.priceInUsd;
      const fee = grossReceive * SWAP_FEE_PERCENT;
      const netReceive = grossReceive - fee;
      setNumericReceiveAmount(netReceive);
      setReceiveAmount(netReceive.toLocaleString(undefined, { 
        minimumFractionDigits: toToken.priceInUsd < 1 ? 2 : 6, 
        maximumFractionDigits: toToken.priceInUsd < 1 ? 2 : 6 
      }));
      const impact = (totalUsdValue / SIMULATED_POOL_LIQUIDITY_USD) * 100;
      setPriceImpact(Math.max(0.01, impact)); 
      setIsLoadingRate(false);
    }, 400);
  }, [fromToken, toToken]);

  useEffect(() => {
    const timer = setTimeout(() => calculateReceiveAmount(payAmount), 300);
    return () => clearTimeout(timer);
  }, [payAmount, calculateReceiveAmount]);

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    calculateReceiveAmount(payAmount);
  };

  const initiateSwap = () => {
    if (!payAmount || parseFloat(payAmount) <= 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSwap = async () => {
    setShowConfirmModal(false);
    setIsSwapping(true);
    setSwapStatus('idle');
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      setSwapStatus('success');
      if (notify) {
        notify(
          "Swap Successful", 
          `Exchanged ${payAmount} ${fromToken.symbol} for ${receiveAmount} ${toToken.symbol} on Base.`, 
          "success",
          <Zap size={20} />
        );
      }
      setPayAmount('');
    } catch (e) {
      setSwapStatus('error');
      if (notify) notify("Swap Failed", "Transaction reverted on chain.", "error", <AlertTriangle size={20} />);
    } finally {
      setIsSwapping(false);
    }
  };

  const minReceived = numericReceiveAmount * (1 - slippage / 100);

  if (swapStatus === 'success') {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-8 py-12 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/20">
            <CheckCircle2 size={48} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-zinc-900 border border-white/10 rounded-full p-2">
            <ShieldCheck size={20} className="text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Settled on Base</h2>
          <p className="text-zinc-500 font-medium">Your assets have been swapped with near-zero latency.</p>
        </div>
        <button onClick={() => setSwapStatus('idle')} className="w-full py-5 bg-[#0052FF] text-white font-black uppercase tracking-widest rounded-[28px] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">Return to Swap</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom duration-700 relative">
      <div className="space-y-6">
        <PriceChart />
        <div className="glass-card rounded-[32px] p-6 border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Network Conditions</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-green-400">Low Congestion</span>
              {gasPolling ? <Loader2 size={10} className="animate-spin text-zinc-500" /> : <Gauge size={10} className="text-zinc-500" />}
            </div>
          </div>
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Gas (Base)</span>
            </div>
            <span className="text-xs font-black text-white">${estimatedGas.toFixed(3)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Swap</h2>
            <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase mt-1">Efficient liquidity on Base</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className={`p-3 rounded-2xl border border-white/10 transition-all ${showSettings ? 'bg-blue-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400'}`}>
            <Settings size={18} />
          </button>
        </div>

        <div className="space-y-1 relative">
          <div className="bg-zinc-900/90 border border-white/5 p-7 rounded-[36px] hover:border-white/10 transition-all focus-within:border-blue-500/50">
            <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span>Sell Asset</span>
              <span className="flex items-center gap-2 font-bold">Balance: <span className="text-white">{fromToken.balance}</span> {fromToken.symbol}</span>
            </div>
            <div className="flex items-center gap-4">
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-transparent text-5xl font-black tracking-tighter focus:outline-none w-full placeholder:text-zinc-800 text-white" placeholder="0.0" disabled={isSwapping} />
              <button onClick={() => setSelectingType('from')} className="flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-2xl border border-white/10 transition-colors shadow-2xl shrink-0">
                <img src={fromToken.logo} className="w-8 h-8 rounded-full border border-white/10" alt={fromToken.symbol} />
                <span className="font-black text-sm tracking-widest text-white">{fromToken.symbol}</span>
                <ChevronDown size={18} className="text-zinc-500" />
              </button>
            </div>
            
            <div className="flex gap-2 mt-5">
              <button 
                onClick={() => {
                  const val = parseFloat(fromToken.balance);
                  if (!isNaN(val)) setPayAmount((val / 2).toString());
                }}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                Half (50%)
              </button>
              <button 
                onClick={() => setPayAmount(fromToken.balance)}
                className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                Max (100%)
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <button onClick={switchTokens} className="bg-black border-4 border-black ring-1 ring-white/10 p-3.5 rounded-[20px] text-white hover:text-blue-500 hover:rotate-180 transition-all duration-500 shadow-2xl">
              <ArrowDown size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="bg-zinc-900/90 border border-white/5 p-7 rounded-[36px] hover:border-white/10 transition-all pt-10 focus-within:border-blue-500/50">
            <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span>Receive Asset</span>
              <div className="flex items-center gap-1">{isLoadingRate && <Loader2 size={10} className="animate-spin text-blue-500" />}</div>
            </div>
            <div className="flex items-center gap-4">
              <input type="text" value={receiveAmount} className="bg-transparent text-5xl font-black tracking-tighter focus:outline-none w-full placeholder:text-zinc-800 text-white" placeholder="0.0" readOnly />
              <button onClick={() => setSelectingType('to')} className="flex items-center gap-3 bg-[#0052FF] hover:bg-blue-600 px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,82,255,0.3)] transition-all shrink-0">
                <img src={toToken.logo} className="w-8 h-8 rounded-full border border-white/10" alt={toToken.symbol} />
                <span className="font-black text-sm tracking-widest text-white">{toToken.symbol}</span>
                <ChevronDown size={18} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {isSmartWallet && (
          <div className="bg-blue-600/5 border border-blue-500/20 p-5 rounded-3xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Zap size={24} className="fill-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Payment Strategy</p>
                <p className="text-sm font-black text-white">{useGasless ? 'Bsambh Sponsored' : 'Standard ETH Gas'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase text-zinc-500">{useGasless ? 'FREE' : 'PAID'}</span>
              <button onClick={() => setUseGasless(!useGasless)} className={`w-14 h-7 rounded-full transition-all relative ${useGasless ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${useGasless ? 'left-8' : 'left-1'}`} />
              </button>
            </div>
          </div>
        )}

        {parseFloat(payAmount) > 0 && (
          <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-[28px] space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Rate</span>
              <span className="text-xs font-bold text-zinc-300">1 {fromToken.symbol} = {(fromToken.priceInUsd / toToken.priceInUsd).toLocaleString(undefined, { maximumFractionDigits: 6 })} {toToken.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Estimated Gas</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${useGasless && isSmartWallet ? 'text-green-400' : 'text-zinc-300'}`}>
                  {useGasless && isSmartWallet ? '$0.00' : `$${estimatedGas.toFixed(3)}`}
                </span>
                {gasPolling && <Loader2 size={10} className="animate-spin text-blue-500" />}
              </div>
            </div>
          </div>
        )}

        <button onClick={initiateSwap} disabled={isSwapping || !payAmount || parseFloat(payAmount) <= 0} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[32px] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-30 flex items-center justify-center gap-4 text-sm">
          {isSwapping ? <><Loader2 className="animate-spin" size={20} /> Settling Transaction...</> : 'Initiate Exchange'}
        </button>
      </div>

      <TokenSelectorModal 
        isOpen={!!selectingType} 
        onClose={() => setSelectingType(null)} 
        onSelect={(token) => {
          if (selectingType === 'from') {
            if (token.symbol === toToken.symbol) setToToken(fromToken);
            setFromToken(token);
          } else {
            if (token.symbol === fromToken.symbol) setFromToken(toToken);
            setToToken(token);
          }
        }} 
        onImport={handleImportToken} 
        tokens={availableTokens} 
        selectedToken={selectingType === 'from' ? fromToken : toToken} 
      />

      <SwapConfirmModal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)} 
        onConfirm={handleConfirmSwap} 
        payAmount={payAmount} 
        receiveAmount={receiveAmount} 
        minReceived={minReceived} 
        slippage={slippage} 
        priceImpact={priceImpact} 
        isSmartWallet={isSmartWallet} 
        useGasless={useGasless} 
        fromToken={fromToken} 
        toToken={toToken} 
        estimatedGas={estimatedGas}
      />
    </div>
  );
};

export default Swap;