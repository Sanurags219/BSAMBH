
import React from 'react';
import { Shield, Zap, Lock, Info, ExternalLink, Activity, ArrowUpRight } from 'lucide-react';

const Earn: React.FC = () => {
  const opportunities = [
    { 
      name: 'vAMM-WETH/USDC', 
      apy: '24.2%', 
      risk: 'Medium', 
      protocol: 'Aerodrome', 
      tvl: '$420.5M',
      tags: ['DEX', 'Emissions'],
      icon: 'A'
    },
    { 
      name: 'ETH Supply', 
      apy: '3.8%', 
      risk: 'Low', 
      protocol: 'Moonwell', 
      tvl: '$89.2M',
      tags: ['Lending', 'Stable'],
      icon: 'M'
    },
    { 
      name: 'cbETH Liquid Staking', 
      apy: '4.1%', 
      risk: 'Low', 
      protocol: 'Coinbase', 
      tvl: '$1.4B',
      tags: ['LST', 'Base Native'],
      icon: 'C'
    },
    { 
      name: 'Beefy USDC Vault', 
      apy: '12.4%', 
      risk: 'Medium', 
      protocol: 'Beefy', 
      tvl: '$12.1M',
      tags: ['Autocompounder'],
      icon: 'B'
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Earn</h2>
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Verified protocols on Base</p>
        </div>
        <div className="flex gap-4 p-1 bg-zinc-900 rounded-2xl border border-white/5">
          <div className="px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
            <Shield size={12} /> Audited
          </div>
          <div className="px-4 py-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2">
            <Activity size={12} /> High Yield
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="glass-card p-6 rounded-[36px] hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <ArrowUpRight className="text-blue-500" size={24} />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center font-black text-xl text-blue-500 group-hover:scale-110 transition-transform">
                {opp.icon}
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tight">{opp.name}</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{opp.protocol}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">APY</p>
                <p className="text-2xl font-black text-blue-400 group-hover:scale-105 transition-transform origin-left">{opp.apy}</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-1">TVL</p>
                <p className="text-xl font-black text-white">{opp.tvl}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-auto">
              {opp.tags.map(tag => (
                <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full text-zinc-400 border border-white/5">
                  {tag}
                </span>
              ))}
            </div>

            <button className="w-full py-4 mt-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl group-hover:bg-[#0052FF] group-hover:text-white transition-all active:scale-95">
              Enter Pool
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[32px] p-8 border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 shrink-0">
          <Lock size={40} />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Security Focused</h3>
          <p className="text-sm text-zinc-400 leading-relaxed font-medium">
            Bsambh only lists protocols that have undergone professional security audits and have a proven track record on the Base network. Always DYOR before depositing.
          </p>
          <div className="flex gap-4">
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-1 hover:underline">
              Base Docs <ExternalLink size={12} />
            </button>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-1 hover:underline">
              Risk Score <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earn;
