
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppTab, AppNotification, AppIconName } from './types';
import Swap from './components/Swap';
import Earn from './components/Earn';
import NFTLauncher from './components/NFTLauncher';
import AIChat from './components/AIChat';
import AIImageGen from './components/AIImageGen';
import Bridge from './components/Bridge';
import Logo from './components/Logo';
import NotificationToast from './components/NotificationToast';
import { 
  requestNotificationPermission, 
  sendSystemNotification, 
  simulateFarcasterNotificationOptIn,
  sendFarcasterNotification,
  FarcasterNotificationDetails,
  formatMarketAlert
} from './services/notificationService';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  Rocket, 
  MessageSquareText, 
  Image as ImageIcon,
  Wallet,
  Bell,
  Globe,
  Waves,
  Zap,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  BellOff,
  X,
  Settings,
  ArrowRight,
  ShieldAlert,
  TrendingDown,
  Info,
  Sparkles,
  Loader2,
  AlertCircle,
  Activity
} from 'lucide-react';

const iconNameMap: Record<AppIconName, React.ReactNode> = {
  'zap': <Zap size={20} />,
  'rocket': <Rocket size={20} />,
  'waves': <Waves size={20} />,
  'trending-up': <TrendingUp size={20} />,
  'trending-down': <TrendingDown size={20} />,
  'image': <ImageIcon size={20} />,
  'check': <CheckCircle2 size={20} />,
  'alert': <AlertCircle size={20} />,
  'info': <Info size={20} />
};

const iconEmojiMap: Record<AppIconName, string> = {
  'zap': '⚡',
  'rocket': '🚀',
  'waves': '🌊',
  'trending-up': '📈',
  'trending-down': '📉',
  'image': '🖼️',
  'check': '✅',
  'alert': '⚠️',
  'info': 'ℹ️'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.NFT);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSmartWallet, setIsSmartWallet] = useState(false);
  const [environment, setEnvironment] = useState<'base' | 'farcaster' | 'web'>('web');
  const [connectionType, setConnectionType] = useState<string>('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [farcasterNotifDetails, setFarcasterNotifDetails] = useState<FarcasterNotificationDetails | null>(null);
  const [isOptingIn, setIsOptingIn] = useState(false);
  const [chainStatus, setChainStatus] = useState<'synced' | 'connecting' | 'error'>('connecting');
  const [notifPreferences, setNotifPreferences] = useState({
    onChain: true,
    market: false,
    aiUpdates: true
  });

  const ethPriceRef = useRef(2450);
  const marketCheckIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (sdk && sdk.actions) {
          await sdk.actions.ready();
        }
      } catch (e) {
        console.warn("SDK hydration warning", e);
      }

      const isFarcaster = !!(window as any).frame || !!(window as any).farcaster;
      
      if (isFarcaster) {
        setEnvironment('farcaster');
        setConnectionType('Farcaster Link');
        setIsWalletConnected(true);
        setIsSmartWallet(true);
        setChainStatus('synced');
        return;
      }

      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const isBase = chainId === '0x2105' || chainId === '8453';
          
          if (isBase) {
            setEnvironment('base');
            setChainStatus('synced');
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setConnectionType('Base Wallet');
              setIsWalletConnected(true);
              setIsSmartWallet(ethereum.isSmartWallet || ethereum.isCoinbaseWallet);
            }
          } else {
            setChainStatus('error');
          }
        } catch (e) {
          setChainStatus('error');
        }
      } else {
        setChainStatus('synced'); // Default web view
      }
    };

    initApp();
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
    
    try {
      const savedDetails = localStorage.getItem('bsambh_farcaster_notif');
      if (savedDetails) setFarcasterNotifDetails(JSON.parse(savedDetails));
      const savedPrefs = localStorage.getItem('bsambh_notif_prefs');
      if (savedPrefs) setNotifPreferences(JSON.parse(savedPrefs));
    } catch (err) { }

    return () => {
      if (marketCheckIntervalRef.current) clearInterval(marketCheckIntervalRef.current);
    };
  }, []);

  const notify = useCallback((title: string, message: string, type: AppNotification['type'] = 'info', iconName?: AppIconName) => {
    const id = Date.now().toString();
    const icon = iconName ? iconNameMap[iconName] : undefined;
    const newNotif: AppNotification = { id, title, message, type, iconName, icon };
    setNotifications(prev => [newNotif, ...prev]);
    const remoteTitle = iconName ? `${iconEmojiMap[iconName]} ${title}` : title;
    if (farcasterNotifDetails) sendFarcasterNotification(farcasterNotifDetails, remoteTitle, message).catch(() => {});
    sendSystemNotification(remoteTitle, message);
  }, [farcasterNotifDetails]);

  useEffect(() => {
    if (marketCheckIntervalRef.current) clearInterval(marketCheckIntervalRef.current);
    if (notifPreferences.market) {
      marketCheckIntervalRef.current = window.setInterval(() => {
        if (Math.random() > 0.8) {
          const changePercent = Math.random() > 0.5 ? 5.2 : -5.1;
          ethPriceRef.current = ethPriceRef.current * (1 + (changePercent / 100));
          const alert = formatMarketAlert("ETH", changePercent, ethPriceRef.current);
          notify(alert.title, alert.body, changePercent > 0 ? 'success' : 'error', changePercent > 0 ? 'trending-up' : 'trending-down');
        }
      }, 45000);
    }
    localStorage.setItem('bsambh_notif_prefs', JSON.stringify(notifPreferences));
  }, [notifPreferences.market, notify]);

  const connectWallet = (isSmart: boolean = false) => {
    setIsWalletConnected(true);
    setIsSmartWallet(isSmart);
    setConnectionType(isSmart ? 'Smart Account' : 'Standard Wallet');
    notify("Connected", "Identity linked to Base Mainnet.", "success", 'zap');
  };

  const renderContent = () => {
    const props = { isSmartWallet, notify };
    switch (activeTab) {
      case AppTab.SWAP: return <Swap {...props} />;
      case AppTab.EARN: return <Earn />;
      case AppTab.NFT: return <NFTLauncher isWalletConnected={isWalletConnected} onConnect={() => connectWallet(true)} notify={notify} />;
      case AppTab.AI_CHAT: return <AIChat />;
      case AppTab.AI_IMAGE: return <AIImageGen notify={notify} />;
      case AppTab.BRIDGE: return <Bridge notify={notify} />;
      default: return <NFTLauncher isWalletConnected={isWalletConnected} onConnect={() => connectWallet(true)} notify={notify} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-[48px] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Bell size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Alerts</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Mainnet Preferences</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-10 space-y-8">
              <NotifChannel icon={<Zap size={18} />} title="Transactions" desc="Swaps and Mints" isActive={notifPreferences.onChain} onToggle={() => setNotifPreferences({...notifPreferences, onChain: !notifPreferences.onChain})} />
              <NotifChannel icon={<TrendingUp size={18} />} title="Volatility" desc="5% Price Moves" isActive={notifPreferences.market} onToggle={() => setNotifPreferences({...notifPreferences, market: !notifPreferences.market})} />
              <button onClick={async () => {
                setIsOptingIn(true);
                const details = await simulateFarcasterNotificationOptIn();
                setFarcasterNotifDetails(details.notificationDetails);
                localStorage.setItem('bsambh_farcaster_notif', JSON.stringify(details.notificationDetails));
                setIsOptingIn(false);
                notify("Active", "Notifications synced with Base.", "success", 'check');
                setShowSettingsModal(false);
              }} className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95">
                {isOptingIn ? <Loader2 className="animate-spin" size={18} /> : farcasterNotifDetails ? 'Refresh Sync' : 'Enable Push Alerts'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 sticky top-0 z-50 bg-black/80 backdrop-blur-3xl">
        <div className="flex items-center gap-5">
          <Logo size={46} className="hover:scale-105 transition-transform" />
          <div className="hidden sm:block">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Bsambh</h1>
            <div className="flex items-center gap-2 mt-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${chainStatus === 'synced' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
               <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">{chainStatus === 'synced' ? 'Mainnet Synced' : 'Sync Error'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => setShowSettingsModal(true)} className={`p-3 rounded-2xl border transition-all ${farcasterNotifDetails ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>
            <Bell size={20} className={notifPreferences.market ? "animate-pulse" : ""} />
          </button>

          {!isWalletConnected ? (
            <button onClick={() => connectWallet(true)} className="px-7 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full transition-all hover:bg-blue-600 hover:text-white active:scale-95 shadow-2xl">Connect</button>
          ) : (
            <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/10 px-5 py-2.5 rounded-full shadow-lg">
              <div className="flex flex-col items-end">
                <span className="text-xs font-black italic uppercase tracking-tighter text-white">{environment === 'farcaster' ? 'anon.fc' : 'bsambh.eth'}</span>
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Base Mainnet</span>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/20" />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-48 pt-6">
        <div className="max-w-7xl mx-auto px-6">
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl">
        <div className="bg-zinc-900/95 backdrop-blur-3xl border border-white/10 px-4 py-4 rounded-[42px] shadow-[0_32px_80px_rgba(0,0,0,0.7)] flex justify-between items-center relative">
          <div className="flex items-center gap-1 flex-1 justify-around">
            <NavItem icon={<Rocket size={22} />} label="Launch" isActive={activeTab === AppTab.NFT} onClick={() => setActiveTab(AppTab.NFT)} />
            <NavItem icon={<ArrowLeftRight size={22} />} label="Swap" isActive={activeTab === AppTab.SWAP} onClick={() => setActiveTab(AppTab.SWAP)} />
            <NavItem icon={<TrendingUp size={22} />} label="Earn" isActive={activeTab === AppTab.EARN} onClick={() => setActiveTab(AppTab.EARN)} />
          </div>
          <div className="w-px h-10 bg-white/5 mx-2" />
          <div className="flex items-center gap-1 flex-1 justify-around">
            <NavItem icon={<Waves size={22} />} label="Bridge" isActive={activeTab === AppTab.BRIDGE} onClick={() => setActiveTab(AppTab.BRIDGE)} />
            <NavItem icon={<MessageSquareText size={22} />} label="Chat" isActive={activeTab === AppTab.AI_CHAT} onClick={() => setActiveTab(AppTab.AI_CHAT)} />
            <NavItem icon={<ImageIcon size={22} />} label="Studio" isActive={activeTab === AppTab.AI_IMAGE} onClick={() => setActiveTab(AppTab.AI_IMAGE)} />
          </div>
        </div>
      </nav>

      <div className="fixed top-28 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationToast notification={n} onClose={(id) => setNotifications(p => p.filter(x => x.id !== id))} />
          </div>
        ))}
      </div>
    </div>
  );
};

const NotifChannel: React.FC<{ icon: React.ReactNode; title: string; desc: string; isActive: boolean; onToggle: () => void }> = ({ icon, title, desc, isActive, onToggle }) => (
  <button onClick={onToggle} className={`w-full p-6 rounded-[32px] border transition-all flex items-center justify-between text-left group ${isActive ? 'bg-blue-600/10 border-blue-600/40 shadow-inner' : 'bg-zinc-900/50 border-white/5 hover:border-white/10'}`}>
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>{icon}</div>
      <div>
        <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-400'}`}>{title}</p>
        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{desc}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-blue-600' : 'bg-zinc-800'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${isActive ? 'left-7' : 'left-1'}`} />
    </div>
  </button>
);

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 px-5 py-3 rounded-2xl relative transition-all duration-300 group">
    <div className={`transition-all duration-300 ${isActive ? 'text-blue-500 scale-110 -translate-y-1' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{icon}</div>
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-blue-500 opacity-100' : 'text-zinc-500 opacity-60'}`}>{label}</span>
    {isActive && <div className="absolute inset-x-4 -bottom-1 h-1 bg-blue-600 rounded-full blur-[2px] animate-pulse" />}
  </button>
);

export default App;
