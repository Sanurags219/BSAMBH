
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Lock, Info, ExternalLink, Activity, ArrowUpRight, TrendingUp, BarChart3 } from 'lucide-react';

const Earn: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<'stable' | 'volatile'>('stable');
  const [liveData, setLiveData] = useState([
    { 
      name: 'vAMM-WETH/USDC', 
      apy: 24.2, 
      risk: 'Medium', 
      protocol: 'Aerodrome', 
      tvl: 420500000,
      tags: ['DEX', 'Emissions'],
      icon: 'A'
    },
    { 
      name: 'ETH Supply', 
      apy: 3.85, 
      risk: 'Low', 
      protocol: 'Moonwell', 
      tvl: 89200000,
      tags: ['Lending', 'Stable'],
      icon: 'M'
    },
    { 
      name: 'cbETH Staking', 
      apy: 4.12, 
      risk: 'Low', 
      protocol: 'Coinbase', 
      tvl: 1400000000,
      tags: ['LST', 'Base Native'],
      icon: 'C'
    },
    { 
      name: 'Beefy USDC Vault', 
      apy: 12.4, 
      risk: 'Medium', 
      protocol: 'Beefy', 
      tvl: 12100000,
      tags: ['Autocompounder'],
      icon: 'B'
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => prev.map(item => ({
        ...item,
        apy: item.apy + (Math.random() - 0.5) * 0.05,
        tvl: item.tvl + (Math.random() - 0.5) * 1000
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">Earn</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase">Base Mainnet Verified</p>
          </div>
        </div>
        <div className="flex gap-4 p-1.5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-white/5">
          <div className="px-5 py-2.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg">
            <Shield size={14} /> Audited Only
          </div>
          <div className="px-5 py-2.5 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <Activity size={14} /> My Yield
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveData.map((opp, idx) => (
          <div key={idx} className="glass-card p-8 rounded-[48px] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden flex flex-col shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              <ArrowUpRight className="text-blue-500" size={28} />
            </div>

            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-[22px] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-black text-2xl text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl">
                {opp.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black italic tracking-tight text-white">{opp.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{opp.protocol}</p>
                   <div className="w-1 h-1 rounded-full bg-zinc-700" />
                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-zinc-900/80 rounded-3xl border border-white/5 shadow-inner">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <TrendingUp size={10} className="text-blue-500" /> APY
                </p>
                <p className="text-3xl font-black text-blue-400 group-hover:scale-105 transition-transform origin-left tabular-nums">{opp.apy.toFixed(2)}%</p>
              </div>
              <div className="p-6 bg-zinc-900/80 rounded-3xl border border-white/5 shadow-inner">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                  <BarChart3 size={10} className="text-zinc-400" /> TVL
                </p>
                <p className="text-2xl font-black text-white tabular-nums">${(opp.tvl / 1000000).toFixed(1)}M</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              {opp.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full text-zinc-400 border border-white/5 transition-colors group-hover:border-blue-500/20 group-hover:text-blue-300">
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full py-5 mt-8 bg-white text-black font-black uppercase tracking-widest text-xs rounded-[24px] group-hover:bg-[#0052FF] group-hover:text-white transition-all active:scale-[0.98] shadow-2xl">
              Launch Deposit
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[48px] p-10 border border-white/5 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent flex flex-col md:flex-row items-center gap-10">
        <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_30px_rgba(0,82,255,0.2)]">
          <Lock size={44} />
        </div>
        <div className="space-y-4">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Security-First Yield</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium">
            Bsambh synchronizes directly with the Base sequencer to provide verified yield opportunities. Our listing protocol requires audited contracts and over $10M in verifiable TVL.
          </p>
          <div className="flex flex-wrap gap-6 pt-2">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2 hover:text-white transition-colors">
              Base Ecosystem Docs <ExternalLink size={14} />
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2 hover:text-white transition-colors">
              Risk Framework V1 <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earn;
