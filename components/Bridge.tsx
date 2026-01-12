
import React, { useState } from 'react';
import { AppIconName } from '../types';
import { sdk } from '@farcaster/frame-sdk';
import { 
  Waves, ArrowRight, Loader2, Info, CheckCircle2, AlertCircle, 
  ExternalLink, CircleHelp, Zap, Share2 
} from 'lucide-react';

interface BridgeProps {
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', iconName?: AppIconName) => void;
}

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-none">
          <p className="text-[10px] font-bold text-zinc-300 leading-relaxed uppercase tracking-wider">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900" />
        </div>
      )}
    </div>
  );
};

const Bridge: React.FC<BridgeProps> = ({ notify }) => {
  const [amount, setAmount] = useState<string>('');
  const [isBridging, setIsBridging] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'initiating' | 'success'>('idle');

  const handleBridge = async () => {
    if (!amount) return;
    setIsBridging(true);
    setStatus('initiating');
    
    if (notify) notify("Bridge Initiated", `Sending ${amount} ETH to Base Mainnet. Stay tuned.`, "info", 'waves');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsBridging(false);
    
    setTimeout(() => {
      setStatus('success');
      if (notify) notify("Funds Arrived", `Your ${amount} ETH has been successfully settled on Base.`, "success", 'waves');
    }, 8000); 
  };

  const handleShareToFarcaster = () => {
    const text = encodeURIComponent(`Just bridged ${amount} ETH to @base via @bsambh! The future is on-chain. 🚀`);
    const url = encodeURIComponent(window.location.origin);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`;
    
    if (sdk && sdk.actions && sdk.actions.openUrl) {
      sdk.actions.openUrl(warpcastUrl);
    } else {
      window.open(warpcastUrl, '_blank');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-8 animate-in zoom-in-95">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500 mx-auto shadow-2xl">
            <CheckCircle2 size={48} />
          </div>
          <div className="absolute -top-2 -right-2 bg-blue-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-xl">
            Settled
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Bridge Complete</h2>
          <p className="text-zinc-500 font-medium">Your ETH is now available on Base.</p>
        </div>
        <div className="p-6 bg-zinc-900 border border-white/10 rounded-[32px] text-left space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Amount</span>
            <span className="text-white">{amount} ETH</span>
          </div>
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
            <span>Network</span>
            <span className="text-blue-400">Base Mainnet</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleShareToFarcaster}
            className="w-full py-5 bg-[#8a63d2] text-white font-black uppercase tracking-widest rounded-3xl hover:bg-purple-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            <Share2 size={18} /> Share to Farcaster
          </button>
          
          <button 
            onClick={() => { setStatus('idle'); setAmount(''); }}
            className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"
          >
            Bridge More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom duration-700">
      <div className="space-y-1">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Bridge</h2>
        <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Move assets to Base Mainnet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 flex-1">
          <div className="glass-card rounded-[40px] p-8 border-white/10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-xl border border-white/5">
                  <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" className="w-8 h-8" alt="L1" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ethereum</span>
              </div>
              <ArrowRight className="text-zinc-700" size={32} />
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40 border border-white/10">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-blue-600 text-xl">B</div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Base</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-4">Amount to Bridge (ETH)</label>
                <input 
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-zinc-900 border border-white/5 rounded-3xl px-8 py-6 text-4xl font-black tracking-tighter focus:outline-none focus:border-blue-500/50 transition-all text-white"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Balance: 1.42 ETH</span>
                <button onClick={() => setAmount('1.42')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Max</button>
              </div>
            </div>

            <button 
              disabled={isBridging || !amount || status === 'initiating'}
              onClick={handleBridge}
              className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[32px] flex items-center justify-center gap-3 shadow-2xl disabled:opacity-30 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              {isBridging || status === 'initiating' ? (
                <><Loader2 className="animate-spin" size={20} /> Finalizing...</>
              ) : (
                'Confirm Bridge'
              )}
            </button>
          </div>

          {status === 'initiating' && !isBridging && (
            <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[32px] animate-in slide-in-from-top-4 duration-500 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Live Status</h4>
                <Loader2 className="animate-spin text-blue-500" size={14} />
              </div>
              <p className="text-[11px] font-medium text-zinc-400">
                L1 Transaction confirmed. We're now monitoring the Base sequencers for arrival. You can safely close this app; we'll notify you when funds hit your wallet.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/40 border border-white/5 rounded-[36px] p-8 space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Network Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Est. Time</span>
                  <Tooltip content="Calculated based on current Ethereum L1 and Base confirmation speeds.">
                    <CircleHelp size={12} className="text-zinc-600 cursor-help hover:text-blue-500 transition-colors" />
                  </Tooltip>
                </div>
                <span className="text-xs font-bold">~3 minutes</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">L1 Fee</span>
                  <Tooltip content="The gas cost required to finalize your transaction on Ethereum L1.">
                    <CircleHelp size={12} className="text-zinc-600 cursor-help hover:text-orange-400 transition-colors" />
                  </Tooltip>
                </div>
                <span className="text-xs font-bold text-orange-400">~0.002 ETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Protocol</span>
                <span className="text-xs font-bold flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-blue-600 text-[8px] font-black">B</div> Official Bridge
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/20 rounded-[32px] p-6 flex gap-4">
            <Info className="text-blue-500 shrink-0" size={24} />
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-loose">
                Funds bridged to Base are immediately usable. Push notifications ensure you never miss an arrival.
              </p>
              <button className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-500 flex items-center gap-1 hover:underline">
                View Policy <ExternalLink size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
