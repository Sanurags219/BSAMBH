
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Clock, 
  Sparkles, 
  Zap, 
  Share2, 
  Loader2, 
  CheckCircle2, 
  Upload, 
  ExternalLink, 
  Copy, 
  Layout, 
  Coins, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Info,
  ChevronDown,
  X,
  Send,
  MessageSquare,
  Wallet,
  ArrowUpRight,
  Rocket
} from 'lucide-react';

type LaunchType = 'token' | 'nft';

interface LaunchItem {
  id: string;
  type: LaunchType;
  name: string;
  symbol: string;
  creator: string;
  price?: string;
  image: string;
  isMinting?: boolean;
  timeLeft?: string;
  liquidity?: string;
}

interface NFTLauncherProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', icon?: React.ReactNode) => void;
}

const TokenBadge = ({ type }: { type: LaunchType }) => (
  <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
    type === 'token' 
      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  }`}>
    {type}
  </div>
);

const BsambhBanner = () => (
  <div className="w-full bg-[#0052FF] py-3 px-4 flex items-center justify-between border-b border-white/10 relative overflow-hidden group/banner">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 opacity-90" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-40" />
    <div className="absolute -inset-[100%] bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] translate-x-[-100%] group-hover/banner:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
    
    <div className="flex items-center gap-2.5 z-10">
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#0052FF] font-black text-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] transform transition-transform group-hover/banner:scale-110">
        B
      </div>
      <div className="flex flex-col">
        <span className="font-black italic uppercase tracking-tighter text-white text-xs leading-none">Bsambh</span>
        <span className="text-[6px] font-black text-white/50 uppercase tracking-[0.3em] leading-none mt-1">Base Ecosystem</span>
      </div>
    </div>

    <div className="hidden sm:flex items-center gap-4 z-10">
      <div className="flex gap-2.5">
        {['Swap', 'Earn', 'Mint', 'AI'].map(f => (
          <span key={f} className="text-[7px] font-black text-white/80 uppercase tracking-widest px-2 py-0.5 bg-black/10 rounded-md">
            {f}
          </span>
        ))}
      </div>
      <div className="w-px h-4 bg-white/20" />
      <div className="flex items-center gap-1 text-[8px] font-black text-white uppercase tracking-tighter bg-white/10 px-2 py-1 rounded-full border border-white/10">
        Open App <ArrowUpRight size={8} />
      </div>
    </div>
  </div>
);

const LaunchCard: React.FC<LaunchItem & { onAction: () => void; onFramePreview: () => void; onShare: () => void }> = ({ 
  type, name, symbol, creator, price, image, isMinting, timeLeft, liquidity, onAction, onFramePreview, onShare 
}) => (
  <div className="group glass-card rounded-[32px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 cursor-pointer flex flex-col h-full">
    <div className="aspect-square relative overflow-hidden bg-zinc-900">
      <img src={image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={name} />
      
      <div className="absolute top-4 left-4 flex gap-2">
        <TokenBadge type={type} />
        {isMinting && (
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 shadow-lg shadow-blue-600/20 animate-pulse">
            <Zap size={10} fill="currentColor" /> Live
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onShare(); }}
          className="p-2.5 bg-[#8a63d2]/90 backdrop-blur-md rounded-xl text-white hover:bg-[#8a63d2] transition-all border border-white/10 shadow-xl"
          title="Share on Farcaster"
        >
          <Share2 size={16} />
        </button>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
        <button 
          onClick={(e) => { e.stopPropagation(); onAction(); }}
          className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-500 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
        >
          {type === 'token' ? 'Buy Token' : 'Mint NFT'}
        </button>
      </div>
    </div>
    
    <div className="p-5 flex-1 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-lg leading-tight truncate group-hover:text-blue-400 transition-colors uppercase italic">{name}</h3>
          <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded">${symbol}</span>
        </div>
        <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">By {creator}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
        <div>
          <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1">
            {type === 'token' ? 'Liquidity' : 'Mint Price'}
          </p>
          <p className="font-black text-sm text-white">{type === 'token' ? liquidity : price}</p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onFramePreview(); }}
          className="text-zinc-500 hover:text-blue-400 transition-colors"
        >
          <Layout size={14} />
        </button>
      </div>
    </div>
  </div>
);

const NFTLauncher: React.FC<NFTLauncherProps> = ({ isWalletConnected, onConnect, notify }) => {
  const [activeView, setActiveView] = useState<'explore' | 'launch'>('explore');
  const [launchType, setLaunchType] = useState<LaunchType>('token');
  const [selectedFrameNFT, setSelectedFrameNFT] = useState<any>(null);
  const [shareItem, setShareItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    price: '0.001',
    supply: '1000000000',
    feeTier: '0.3% (Standard)',
    clankerLiquidity: '1.0'
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchStep, setLaunchStep] = useState<string>('');
  const [launchStatus, setLaunchStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');

  const launches: LaunchItem[] = [
    { id: 't1', type: 'token', name: 'Base God', symbol: 'GOD', creator: 'based.eth', liquidity: '$1.2M', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800', isMinting: true },
    { id: 'n1', type: 'nft', name: 'Zora Edition #1', symbol: 'ZE', creator: 'zora.eth', price: '0.0007 ETH', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', isMinting: true },
    { id: 't2', type: 'token', name: 'Clanker Coin', symbol: 'CLANK', creator: 'clanker.eth', liquidity: '$450K', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800' },
    { id: 'n2', type: 'nft', name: 'Based Punks', symbol: 'BP', creator: 'punk.base', price: '0.01 ETH', image: 'https://images.unsplash.com/photo-1643101809754-43a91784611a?auto=format&fit=crop&q=80&w=800' },
  ];

  const handleShareToFarcaster = (item: any) => {
    setShareItem(item);
  };

  const executeShare = (item: any) => {
    const text = item.type === 'token' 
      ? `Just launched $${item.symbol} on Base via Bsambh! 🚀\n\nTrade now at:` 
      : `Just minted "${item.name}" on Base! 🎨\n\nDiscover more on Bsambh:`;
    const shareUrl = `https://bsambh.app/${item.type}/${item.id}`;
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(shareUrl)}`;
    window.open(warpcastUrl, '_blank');
    setShareItem(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) {
      onConnect();
      return;
    }
    
    setIsLaunching(true);
    setLaunchStatus('idle');
    setTxHash('');

    try {
      setLaunchStep('Awaiting signature...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      setLaunchStep(`Broadcasting ${launchType === 'token' ? 'Clanker' : 'Zora'} contract...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxHash(mockHash);

      setLaunchStep('Confirming on Base Mainnet...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      setLaunchStatus('success');
      if (notify) {
        notify(
          "Deployment Complete", 
          `Successfully launched ${formData.name} (${formData.symbol}) on Base.`, 
          "success",
          <Rocket size={20} />
        );
      }
    } catch (err) {
      setLaunchStatus('error');
      if (notify) notify("Deployment Failed", "Contract interaction failed.", "error");
    } finally {
      setIsLaunching(false);
      setLaunchStep('');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Bsambh <span className="text-blue-500">Launch</span></h2>
          <p className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase">The ultimate Base deployment suite</p>
        </div>

        <div className="flex p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <button 
            onClick={() => setActiveView('explore')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'explore' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Search size={14} /> Explore
          </button>
          <button 
            onClick={() => setActiveView('launch')}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === 'launch' ? 'bg-white text-black shadow-lg scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Plus size={14} /> Deploy
          </button>
        </div>
      </div>

      {activeView === 'explore' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {launches.map((item) => (
            <LaunchCard 
              key={item.id} 
              {...item} 
              onAction={() => {
                if (notify) notify(`${item.type === 'token' ? 'Buy' : 'Mint'} Pending`, `Processing your interaction with ${item.name}...`, "info", <Rocket size={20} />);
                setTimeout(() => {
                  if (notify) notify(`${item.type === 'token' ? 'Purchase' : 'Mint'} Confirmed`, `Transaction finalized on Base.`, "success", <Rocket size={20} />);
                }, 2000);
              }}
              onFramePreview={() => setSelectedFrameNFT(item)}
              onShare={() => handleShareToFarcaster(item)}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {launchStatus === 'success' ? (
            <div className="glass-card rounded-[48px] p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_50px_rgba(0,82,255,0.4)]">
                  <CheckCircle2 size={48} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-zinc-900 p-2 rounded-full border border-blue-500">
                  <ShieldCheck size={20} className="text-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">Deployed to Base</h3>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Contract verified & liquidity locked</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Status</p>
                  <p className="text-xs font-bold text-green-400 uppercase">Live on Mainnet</p>
                </div>
                <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
                  <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">TX Hash</p>
                  <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-[10px] font-mono font-bold text-blue-400 truncate block hover:underline">
                    {txHash.slice(0, 10)}...{txHash.slice(-8)}
                  </a>
                </div>
                <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Fees</p>
                  <p className="text-xs font-bold text-white uppercase">Sponsorship Active</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleShareToFarcaster({ type: launchType, symbol: formData.symbol, name: formData.name, id: 'new', image: selectedImage || launches[0].image })}
                  className="flex-1 py-4 bg-[#8a63d2] hover:bg-[#9b7ae0] text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#8a63d2]/20 transition-all"
                >
                  <Share2 size={18} /> Share Cast
                </button>
                <a 
                  href={`https://basescan.org/address/0x${txHash.slice(0, 40)}`} 
                  target="_blank"
                  className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
                >
                  <ExternalLink size={18} /> View Contract
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex-1 glass-card rounded-[40px] border border-white/10 overflow-hidden">
                <div className="bg-white/5 p-6 border-b border-white/5 flex gap-4">
                  <button 
                    onClick={() => setLaunchType('token')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${launchType === 'token' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Coins size={14} /> Token (Clanker)
                  </button>
                  <button 
                    onClick={() => setLaunchType('nft')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${launchType === 'nft' ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Layers size={14} /> NFT (Zora)
                  </button>
                </div>
                <form onSubmit={handleLaunch} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{launchType === 'token' ? 'Token Name' : 'Collection Name'}</label>
                      <input 
                        required
                        placeholder={launchType === 'token' ? "e.g. Base Dog" : "e.g. Base Masterpieces"}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Ticker / Symbol</label>
                      <input 
                        required
                        placeholder={launchType === 'token' ? "DOG" : "BASE"}
                        className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm"
                        value={formData.symbol}
                        onChange={e => setFormData({...formData, symbol: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Description</label>
                    <textarea 
                      placeholder="Tell the community about your project..."
                      className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm h-24 resize-none text-white"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  {launchType === 'token' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Total Supply</label>
                        <input 
                          required
                          type="number"
                          placeholder="1,000,000,000"
                          className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm text-white"
                          value={formData.supply}
                          onChange={e => setFormData({...formData, supply: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Initial Liquidity (ETH)</label>
                          <input 
                            type="number"
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm text-white"
                            value={formData.clankerLiquidity}
                            onChange={e => setFormData({...formData, clankerLiquidity: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Pool Fee Tier</label>
                          <div className="relative">
                            <select 
                              className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm appearance-none text-white"
                              value={formData.feeTier}
                              onChange={e => setFormData({...formData, feeTier: e.target.value})}
                            >
                              <option>0.3% (Standard)</option>
                              <option>1.0% (Exotic)</option>
                              <option>0.05% (Stable)</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Mint Price (ETH)</label>
                          <input 
                            type="number"
                            className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm text-white"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <button 
                    disabled={isLaunching}
                    className={`w-full py-6 text-black font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2 mt-4 ${isWalletConnected ? 'bg-white' : 'bg-blue-600 text-white'}`}
                  >
                    {!isWalletConnected ? (
                      <><Wallet size={20} /> Connect to Launch</>
                    ) : isLaunching ? (
                      <><Loader2 className="animate-spin" size={20} /> {launchStep}</>
                    ) : (
                      <><Rocket size={20} /> Launch to Mainnet</>
                    )}
                  </button>
                </form>
              </div>
              <div className="w-full lg:w-80 space-y-6">
                <div className="glass-card rounded-[32px] border border-white/10 p-6 space-y-6 sticky top-24">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Preview</h4>
                    <Sparkles size={14} className="text-blue-500" />
                  </div>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 flex flex-col items-center justify-center gap-4 text-zinc-600 group cursor-pointer hover:border-blue-500/30 transition-all relative"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    {selectedImage ? (
                      <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <><Upload size={32} /><p className="text-[8px] font-black uppercase tracking-widest">Upload Media</p></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {shareItem && (
        <ShareStudioModal 
          item={shareItem}
          isOpen={!!shareItem}
          onClose={() => setShareItem(null)}
          onConfirm={executeShare}
        />
      )}
      <FramePreviewModal 
        nft={selectedFrameNFT} 
        isOpen={!!selectedFrameNFT} 
        onClose={() => setSelectedFrameNFT(null)} 
      />
    </div>
  );
};

interface ShareStudioModalProps {
  item: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: any) => void;
}

const ShareStudioModal: React.FC<ShareStudioModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
  if (!isOpen || !item) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-2xl glass-card rounded-[48px] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8a63d2] rounded-2xl flex items-center justify-center text-white"><Share2 size={24} /></div>
            <div><h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Share Studio</h3></div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-8 flex-1 overflow-y-auto">
          <div className="rounded-[36px] bg-zinc-900 border border-white/5 overflow-hidden">
            <BsambhBanner />
            <div className="aspect-video w-full"><img src={item.image} className="w-full h-full object-cover" alt="Preview" /></div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Post Text</label>
            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-sm font-medium text-zinc-300">
              {item.type === 'token' 
                ? `Just launched $${item.symbol} on Base via Bsambh! 🚀` 
                : `Just minted "${item.name}" on Base! 🎨`}
            </div>
          </div>
        </div>
        <div className="p-8 bg-white/5 border-t border-white/10 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 bg-zinc-900 text-white font-black uppercase rounded-2xl">Cancel</button>
          <button onClick={() => onConfirm(item)} className="flex-[2] py-4 bg-[#8a63d2] text-white font-black uppercase rounded-2xl shadow-xl shadow-[#8a63d2]/20">Launch Cast</button>
        </div>
      </div>
    </div>
  );
};

interface FramePreviewModalProps {
  nft: any;
  isOpen: boolean;
  onClose: () => void;
}

const FramePreviewModal: React.FC<FramePreviewModalProps> = ({ nft, isOpen, onClose }) => {
  if (!isOpen || !nft) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
      <div className="w-full max-w-xl glass-card rounded-[40px] border border-white/10 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-black uppercase italic tracking-widest text-sm">Frame Preview</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="rounded-2xl border border-white/5 overflow-hidden bg-zinc-900">
            <BsambhBanner />
            <img src={nft.image} className="w-full aspect-[1.91/1] object-cover" alt="Frame" />
            <div className="p-4 grid grid-cols-2 gap-2 bg-black/40">
              <div className="h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">
                {nft.type === 'token' ? 'Buy ' + nft.symbol : 'Mint'}
              </div>
              <div className="h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-black uppercase text-zinc-400">Details</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTLauncher;
