
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppIconName } from '../types';
import { 
  Plus, Search, Sparkles, Zap, Share2, Loader2, CheckCircle2, 
  Upload, ExternalLink, Layout, Coins, Layers, ShieldCheck, 
  ArrowUpRight, Rocket, Timer, ShoppingBag, Tag, History,
  Filter, Eye, Wallet, ChevronRight, Gavel, BarChart3, X
} from 'lucide-react';

type LaunchType = 'token' | 'nft';
type NFTCategory = 'Art' | 'Music' | 'Collectibles' | 'Membership';

interface NFTAsset {
  id: string;
  name: string;
  symbol: string;
  creator: string;
  price: string;
  image: string;
  type: 'edition' | 'open';
  mintedCount: number;
  totalPool: string;
  category: NFTCategory;
  isLive: boolean;
  endsAt?: number;
}

const NFT_DATABASE: NFTAsset[] = [
  { id: '1', name: 'Base Summer', symbol: 'SUMMER', creator: 'based.eth', price: '0.000777', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800', type: 'open', mintedCount: 1240, totalPool: 'Unlimited', category: 'Art', isLive: true, endsAt: Date.now() + 86400000 },
  { id: '2', name: 'Zora x Bsambh', symbol: 'ZBS', creator: 'bsambh.base', price: '0.001', image: 'https://images.unsplash.com/photo-1643101809754-43a91784611a?auto=format&fit=crop&q=80&w=800', type: 'edition', mintedCount: 45, totalPool: '100', category: 'Membership', isLive: true },
  { id: '3', name: 'Clanker Vibe', symbol: 'VIBE', creator: 'clanker.eth', price: '0.005', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800', type: 'edition', mintedCount: 98, totalPool: '100', category: 'Music', isLive: false },
  { id: '4', name: 'Genesis Block', symbol: 'GEN', creator: 'vitalik.eth', price: 'Free', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800', type: 'open', mintedCount: 4500, totalPool: 'Unlimited', category: 'Collectibles', isLive: true }
];

interface NFTLauncherProps {
  isWalletConnected: boolean;
  onConnect: () => void;
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', iconName?: AppIconName) => void;
}

const NFTLauncher: React.FC<NFTLauncherProps> = ({ isWalletConnected, onConnect, notify }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'launch' | 'collection'>('explore');
  const [filter, setFilter] = useState<NFTCategory | 'All'>('All');
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [launchStep, setLaunchStep] = useState(0);
  const [myCollection, setMyCollection] = useState<NFTAsset[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredNFTs = useMemo(() => {
    return filter === 'All' ? NFT_DATABASE : NFT_DATABASE.filter(n => n.category === filter);
  }, [filter]);

  const handleMint = (nft: NFTAsset) => {
    if (!isWalletConnected) {
      onConnect();
      return;
    }
    if (notify) notify("Minting Started", `Confirming mint for ${nft.name}...`, "info", 'rocket');
    
    setTimeout(() => {
      setMyCollection(prev => [...prev, { ...nft, id: `my-${Date.now()}` }]);
      if (notify) notify("Mint Success", `Successfully minted 1 ${nft.name}!`, "success", 'rocket');
    }, 2000);
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWalletConnected) { onConnect(); return; }
    
    setIsDeploying(true);
    const steps = ["Uploading assets to IPFS...", "Deploying Base contract...", "Verifying contract...", "Setting up mint page..."];
    
    let currentStep = 0;
    const interval = setInterval(() => {
      setLaunchStep(currentStep);
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setIsDeploying(false);
        setActiveTab('explore');
        if (notify) notify("Collection Live!", "Your NFT collection has been deployed to Base.", "success", 'rocket');
      }
    }, 1500);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,82,255,0.4)]">
              <Sparkles size={20} />
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">Marketplace</h2>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-2">Base Minting Protocol</p>
        </div>

        <div className="flex p-1.5 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-x-auto">
          <button onClick={() => setActiveTab('explore')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'explore' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <ShoppingBag size={14} /> Explore
          </button>
          <button onClick={() => setActiveTab('launch')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'launch' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Plus size={14} /> Launch
          </button>
          <button onClick={() => setActiveTab('collection')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'collection' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Wallet size={14} /> My Collection {myCollection.length > 0 && <span className="ml-1 bg-blue-600 text-white px-1.5 rounded-full text-[8px]">{myCollection.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'explore' && (
        <div className="space-y-8">
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {['All', 'Art', 'Music', 'Collectibles', 'Membership'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat as any)}
                className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${filter === cat ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-zinc-500 hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} onMint={() => handleMint(nft)} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'launch' && (
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-10 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex-1 glass-card rounded-[40px] border border-white/10 p-8 space-y-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Create Collection</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Supports Zora & OpenSea Metadata</p>
            </div>

            <form onSubmit={handleLaunch} className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video bg-zinc-900 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden relative"
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedImage(URL.createObjectURL(file));
                }} />
                {selectedImage ? (
                  <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <>
                    <div className="p-4 bg-zinc-800 rounded-2xl group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all"><Upload size={32} /></div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Upload Media (JPG, PNG, GIF, MP4)</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Name</label>
                  <input required placeholder="e.g. Base Genesis" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Symbol</label>
                  <input required placeholder="BGN" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Mint Price (ETH)</label>
                  <input required type="number" step="0.0001" placeholder="0.000777" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Royalties (%)</label>
                  <input required type="number" placeholder="5%" className="w-full bg-zinc-900 border border-white/5 rounded-2xl px-5 py-4 font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all" />
                </div>
              </div>

              <button 
                disabled={isDeploying}
                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-1"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-[8px] mt-1">Deploying Step {launchStep + 1}/4</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2"><Rocket size={20} /> Launch Collection</div>
                    <span className="text-[8px] opacity-60">Sponsored by Bsambh</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="w-full lg:w-80 space-y-6">
            <div className="glass-card rounded-[32px] border border-white/10 p-6 space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Collection Type</h4>
              <div className="space-y-3">
                <TypeOption icon={<Layers />} title="Edition" desc="Fixed supply (e.g. 1/100)" active />
                <TypeOption icon={<Timer />} title="Open Edition" desc="Unlimited for limited time" />
                <TypeOption icon={<Gavel />} title="Auction" desc="Highest bidder wins" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collection' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {myCollection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 border border-dashed border-white/10 rounded-[48px]">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700">
                <ShoppingBag size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Vault is empty</h3>
                <p className="text-zinc-500 text-sm font-medium">Collect your first NFT on Base to get started.</p>
              </div>
              <button onClick={() => setActiveTab('explore')} className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Start Exploring</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {myCollection.map((nft) => (
                <div key={nft.id} className="group glass-card rounded-[32px] overflow-hidden border border-white/5 hover:border-blue-500/40 transition-all duration-500">
                  <div className="aspect-square relative">
                    <img src={nft.image} className="w-full h-full object-cover" alt={nft.name} />
                    <div className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all">
                      <Share2 size={16} />
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-lg italic uppercase">{nft.name}</h4>
                      <span className="text-[10px] font-bold text-zinc-500">#{(Math.random() * 1000).toFixed(0)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-3 bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-blue-600 hover:text-white transition-all">List for Sale</button>
                      <button className="p-3 bg-zinc-900 text-zinc-400 rounded-xl hover:text-white"><Eye size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NFTCard: React.FC<{ nft: NFTAsset; onMint: () => void }> = ({ nft, onMint }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group glass-card rounded-[36px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col relative"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900">
        <img 
          src={nft.image} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={nft.name} 
        />
        
        <div className={`absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`absolute top-0 left-0 right-0 p-6 transform transition-transform duration-500 delay-75 ${isHovered ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex justify-between items-start">
               <div>
                 <h4 className="text-xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">{nft.name}</h4>
                 <div className="flex items-center gap-2 mt-1">
                   <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{nft.symbol}</span>
                   <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{nft.category}</span>
                 </div>
               </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 delay-100 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Created By</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                  <p className="text-xs font-black italic text-white uppercase">{nft.creator}</p>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onMint(); }}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-[1.02] active:scale-95"
              >
                Mint Now • {nft.price}
              </button>
            </div>
          </div>
        </div>
        
        <div className={`absolute top-4 left-4 flex gap-2 z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
          {nft.isLive && (
            <div className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1 shadow-lg animate-pulse">
              <Zap size={10} fill="currentColor" /> Live
            </div>
          )}
          <div className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/10">
            {nft.type === 'open' ? 'Open' : `${nft.mintedCount}/${nft.totalPool}`}
          </div>
        </div>

        {nft.endsAt && (
          <div className={`absolute bottom-4 left-4 right-4 p-3 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-between text-white z-20 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-widest">Ending In</span>
            </div>
            <span className="text-[10px] font-bold">18h 42m</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black italic uppercase tracking-tighter truncate leading-tight group-hover:text-blue-500 transition-colors">{nft.name}</h3>
            <span className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded uppercase font-black text-zinc-500">${nft.symbol}</span>
          </div>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">By {nft.creator}</p>
        </div>

        <div className="pt-4 border-t border-white/5 flex justify-between items-end mt-auto">
          <div>
            <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1">Price</p>
            <p className="font-black text-sm">{nft.price} {nft.price !== 'Free' && 'ETH'}</p>
          </div>
          <div className="text-right">
             <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-black mb-1">Floor</p>
             <p className="font-black text-sm text-blue-500">{(Math.random() * 0.1).toFixed(3)} ETH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TypeOption: React.FC<{ icon: React.ReactNode; title: string; desc: string; active?: boolean }> = ({ icon, title, desc, active = false }) => (
  <button className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${active ? 'bg-blue-600/10 border-blue-500/40' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}>
    <div className={`p-2.5 rounded-xl ${active ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{icon}</div>
    <div>
      <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-zinc-300'}`}>{title}</p>
      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">{desc}</p>
    </div>
  </button>
);

export default NFTLauncher;
