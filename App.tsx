
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
  AlertCircle
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
  const [notifPreferences, setNotifPreferences] = useState({
    onChain: true,
    market: false,
    aiUpdates: true
  });

  // Mock Market State
  const ethPriceRef = useRef(2450);
  const marketCheckIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const detectEnvironment = async () => {
      // Safe SDK Ready call
      try {
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          await sdk.actions.ready();
        }
      } catch (e) {
        console.warn("Farcaster SDK ready call skipped or failed", e);
      }

      const isFarcaster = !!(window as any).frame || !!(window as any).farcaster;
      
      if (isFarcaster) {
        setEnvironment('farcaster');
        setConnectionType('Farcaster Wallet');
        setIsWalletConnected(true);
        setIsSmartWallet(true);
        return;
      }

      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const chainId = await ethereum.request({ method: 'eth_chainId' });
          const isBase = chainId === '0x2105' || chainId === '8453';
          
          if (isBase) {
            setEnvironment('base');
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              setConnectionType('Base Smart Wallet');
              setIsWalletConnected(true);
              setIsSmartWallet(ethereum.isSmartWallet || ethereum.isCoinbaseWallet);
            }
          }
        } catch (e) {
          console.error("Environment detection failed", e);
        }
      }
    };

    detectEnvironment();
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission);
    }
    
    // Safety check for localStorage parsing
    try {
      const savedDetails = localStorage.getItem('bsambh_farcaster_notif');
      if (savedDetails) {
        setFarcasterNotifDetails(JSON.parse(savedDetails));
      }
      
      const savedPrefs = localStorage.getItem('bsambh_notif_prefs');
      if (savedPrefs) {
        setNotifPreferences(JSON.parse(savedPrefs));
      }
    } catch (err) {
      console.warn("Failed to restore app state from storage", err);
    }

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

    if (farcasterNotifDetails) {
      sendFarcasterNotification(farcasterNotifDetails, remoteTitle, message).catch(console.error);
    }
    sendSystemNotification(remoteTitle, message);
  }, [farcasterNotifDetails]);

  // Market Monitoring Effect
  useEffect(() => {
    if (marketCheckIntervalRef.current) clearInterval(marketCheckIntervalRef.current);

    if (notifPreferences.market) {
      marketCheckIntervalRef.current = window.setInterval(() => {
        const chance = Math.random();
        if (chance > 0.8) {
          const isJump = Math.random() > 0.5;
          const changePercent = isJump ? 5.2 : -5.1;
          const oldPrice = ethPriceRef.current;
          ethPriceRef.current = oldPrice * (1 + (changePercent / 100));
          
          const alert = formatMarketAlert("ETH", changePercent, ethPriceRef.current);
          notify(
            alert.title, 
            alert.body, 
            changePercent > 0 ? 'success' : 'error', 
            changePercent > 0 ? 'trending-up' : 'trending-down'
          );
        }
      }, 45000);
    }

    localStorage.setItem('bsambh_notif_prefs', JSON.stringify(notifPreferences));
  }, [notifPreferences.market, notify]);

  const handleToggleNotifications = () => {
    setShowSettingsModal(true);
  };

  const enableNotifications = async () => {
    if (notifPermission === 'denied') {
      alert("Notification access is blocked. Please reset permissions in browser settings.");
      return;
    }

    setIsOptingIn(true);
    try {
      let details: any = null;
      if (environment === 'farcaster' || environment === 'base') {
        try {
          const response = await sdk.actions.addMiniApp();
          if (response && response.notificationDetails) {
            details = { notificationDetails: response.notificationDetails };
          } else {
            details = await simulateFarcasterNotificationOptIn();
          }
        } catch (sdkError) {
          console.warn("Farcaster SDK addMiniApp failed, falling back to simulation", sdkError);
          details = await simulateFarcasterNotificationOptIn();
        }
      } else {
        details = await simulateFarcasterNotificationOptIn();
      }
      
      const granted = await requestNotificationPermission();
      setNotifPermission(granted ? 'granted' : 'denied');
      
      if (details?.notificationDetails) {
        const notifInfo: FarcasterNotificationDetails = details.notificationDetails;
        setFarcasterNotifDetails(notifInfo);
        localStorage.setItem('bsambh_farcaster_notif', JSON.stringify(notifInfo));
        
        await sendFarcasterNotification(notifInfo, "🔔 Welcome to Bsambh!", "Real-time alerts for Base are now active.");
        
        notify("Push Alerts Active", "Bsambh is now linked to your Farcaster client.", "success", 'check');
        setShowSettingsModal(false);
      }
    } catch (e) {
      console.error("Notification opt-in failed", e);
      notify("Opt-in Failed", "Could not sync notification settings.", "error", 'alert');
    } finally {
      setIsOptingIn(false);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const connectWallet = (isSmart: boolean = false) => {
    setIsWalletConnected(true);
    setIsSmartWallet(isSmart);
    setConnectionType(isSmart ? 'Smart Wallet' : 'Standard Wallet');
    notify("Identity Linked", "Connected via " + (isSmart ? 'Smart Account' : 'Standard Wallet'), "success", 'zap');
  };

  const renderContent = () => {
    const commonProps = { isSmartWallet, notify };
    switch (activeTab) {
      case AppTab.SWAP: return <Swap {...commonProps} />;
      case AppTab.EARN: return <Earn />;
      case AppTab.NFT: return <NFTLauncher isWalletConnected={isWalletConnected} onConnect={() => connectWallet(true)} notify={notify} />;
      case AppTab.AI_CHAT: return <AIChat />;
      case AppTab.AI_IMAGE: return <AIImageGen notify={notify} />;
      case AppTab.BRIDGE: return <Bridge notify={notify} />;
      default: return <NFTLauncher isWalletConnected={isWalletConnected} onConnect={() => connectWallet(true)} notify={notify} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white selection:bg-blue-500/30">
      {showSettingsModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-md glass-card rounded-[40px] border border-white/10 overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.8)] animate-in zoom-in-95">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Alert Center</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Real-time Push Settings</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:bg-white/10 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2">Channel Subscriptions</label>
                <div className="space-y-3">
                  <NotifChannel 
                    icon={<Zap size={18} />} 
                    title="On-Chain Events" 
                    desc="Swaps, Mints, and Bridges"
                    isActive={notifPreferences.onChain}
                    onToggle={() => setNotifPreferences({...notifPreferences, onChain: !notifPreferences.onChain})}
                  />
                  <NotifChannel 
                    icon={<TrendingUp size={18} />} 
                    title="Market Alerts" 
                    desc="5% ETH/USDC Price Jumps"
                    isActive={notifPreferences.market}
                    onToggle={() => setNotifPreferences({...notifPreferences, market: !notifPreferences.market})}
                  />
                  <NotifChannel 
                    icon={<ImageIcon size={18} />} 
                    title="AI Generations" 
                    desc="Notifications when heavy renders finish"
                    isActive={notifPreferences.aiUpdates}
                    onToggle={() => setNotifPreferences({...notifPreferences, aiUpdates: !notifPreferences.aiUpdates})}
                  />
                </div>
              </div>

              <div className="p-5 bg-blue-600/5 border border-blue-500/20 rounded-3xl flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 shrink-0">
                  <ShieldAlert size={16} />
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
                  Market alerts trigger instantly when volatility exceeds 5%. Ensure notifications are allowed in your device settings.
                </p>
              </div>
            </div>

            <div className="p-8 bg-white/5 border-t border-white/10">
              <button 
                onClick={enableNotifications}
                disabled={isOptingIn}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  farcasterNotifDetails 
                  ? 'bg-zinc-800 text-zinc-500 cursor-default' 
                  : 'bg-white text-black hover:bg-blue-600 hover:text-white'
                }`}
              >
                {isOptingIn ? <Loader2 className="animate-spin" size={18} /> : farcasterNotifDetails ? <><CheckCircle2 size={18} /> Notifications Active</> : <><Bell size={18} /> Enable Push Notifications</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {environment === 'farcaster' && !farcasterNotifDetails && activeTab === AppTab.NFT && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
          <div className="p-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-5 text-left">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20 shrink-0">
                <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Stay Synchronized</h3>
                <p className="text-xs text-zinc-400 font-medium">Get notified when your mints complete or market prices jump 5%.</p>
              </div>
            </div>
            <button 
              onClick={enableNotifications}
              disabled={isOptingIn}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3"
            >
              {isOptingIn ? <Loader2 className="animate-spin" size={14} /> : <><Bell size={14} /> Enable Notifications</>}
            </button>
          </div>
        </div>
      )}

      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationToast notification={n} onClose={removeNotification} />
          </div>
        ))}
      </div>

      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 z-50 bg-black/60 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <Logo size={42} className="transition-transform hover:scale-110 cursor-pointer" />
          <div className="hidden md:block">
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">Bsambh</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest ${environment === 'farcaster' ? 'bg-[#8a63d2]/20 text-[#8a63d2]' : 'bg-blue-500/10 text-blue-500'}`}>
                {environment === 'farcaster' ? 'Farcaster' : 'Mainnet'}
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Base</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleToggleNotifications}
            className={`p-2.5 rounded-xl border transition-all ${
              farcasterNotifDetails && notifPreferences.market
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-[0_0_15px_rgba(0,82,255,0.2)]' 
              : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:bg-white/10'
            }`}
          >
            {farcasterNotifDetails ? <Bell size={18} className={notifPreferences.market ? "animate-pulse" : ""} /> : <BellOff size={18} />}
          </button>

          {isWalletConnected && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full animate-in fade-in slide-in-from-right-2">
              <ShieldCheck size={12} className="text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Auto-Linked</span>
            </div>
          )}
          
          {!isWalletConnected ? (
            <button 
              onClick={() => connectWallet(true)}
              className="px-5 py-2.5 bg-white text-black font-black uppercase tracking-wider text-[10px] rounded-full transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-xl"
            >
              Connect
            </button>
          ) : (
            <div className={`flex items-center gap-3 border px-4 py-2 rounded-full transition-all duration-500 ${environment === 'farcaster' ? 'bg-[#8a63d2]/10 border-[#8a63d2]/30' : 'bg-zinc-900 border-white/10'}`}>
              <div className="flex flex-col items-end">
                <span className="text-xs font-black tracking-tight text-white">
                  {environment === 'farcaster' ? 'anon.fc' : 'bsambh.base.eth'}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                    {connectionType || 'Connected'}
                  </span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full border border-white/20 shadow-lg ${environment === 'farcaster' ? 'bg-gradient-to-br from-[#8a63d2] to-[#6a42b1]' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`} />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
        <div className="bg-zinc-900/90 backdrop-blur-3xl border border-white/10 px-3 py-3 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-1 flex-1 justify-around">
            <NavItem icon={<Rocket size={20} />} label="Launch" isActive={activeTab === AppTab.NFT} onClick={() => setActiveTab(AppTab.NFT)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
            <NavItem icon={<ArrowLeftRight size={20} />} label="Swap" isActive={activeTab === AppTab.SWAP} onClick={() => setActiveTab(AppTab.SWAP)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
            <NavItem icon={<TrendingUp size={20} />} label="Earn" isActive={activeTab === AppTab.EARN} onClick={() => setActiveTab(AppTab.EARN)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
            <NavItem icon={<Waves size={20} />} label="Bridge" isActive={activeTab === AppTab.BRIDGE} onClick={() => setActiveTab(AppTab.BRIDGE)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="flex items-center gap-1 flex-1 justify-around">
            <NavItem icon={<MessageSquareText size={20} />} label="Chat" isActive={activeTab === AppTab.AI_CHAT} onClick={() => setActiveTab(AppTab.AI_CHAT)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
            <NavItem icon={<ImageIcon size={20} />} label="Studio" isActive={activeTab === AppTab.AI_IMAGE} onClick={() => setActiveTab(AppTab.AI_IMAGE)} accentColor={environment === 'farcaster' ? '#8a63d2' : '#0052FF'} />
          </div>
        </div>
      </nav>
    </div>
  );
};

const NotifChannel: React.FC<{ icon: React.ReactNode; title: string; desc: string; isActive: boolean; onToggle: () => void }> = ({ icon, title, desc, isActive, onToggle }) => (
  <button 
    onClick={onToggle}
    className={`w-full p-5 rounded-[28px] border transition-all flex items-center justify-between text-left group ${isActive ? 'bg-blue-600/10 border-blue-600/30' : 'bg-zinc-900 border-white/5 hover:border-white/10'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-400'}`}>{title}</p>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{desc}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full relative transition-all ${isActive ? 'bg-blue-600' : 'bg-zinc-800'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'left-7' : 'left-1'}`} />
    </div>
  </button>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  accentColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, accentColor = '#0052FF' }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 transition-all duration-300 px-4 py-2 rounded-2xl relative group"
    style={{ color: isActive ? accentColor : undefined }}
  >
    {!isActive && <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{icon}</span>}
    {isActive && (
      <>
        <div className="absolute inset-0 rounded-2xl animate-in fade-in duration-300" style={{ backgroundColor: `${accentColor}10` }} />
        <div className="transition-all duration-300 scale-110 translate-y-[-2px]">{icon}</div>
      </>
    )}
    <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'opacity-100' : 'opacity-60 text-zinc-500'}`}>{label}</span>
  </button>
);

export default App;
