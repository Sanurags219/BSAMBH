
import React, { useState, useEffect } from 'react';
import { AppIconName } from '../types';
import { Wand2, Download, AlertCircle, Loader2, Key, Trash2, History, LayoutGrid, Sparkles, Cpu, Palette } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { ImageSize } from '../types';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size: ImageSize;
  timestamp: number;
}

const LOADING_MESSAGES = [
  "Drafting initial concepts...",
  "Mixing neural palettes...",
  "Synthesizing digital light...",
  "Polishing artistic details...",
  "Rendering final masterpiece...",
  "Upscaling textures...",
  "Finalizing color balance..."
];

interface AIImageGenProps {
  notify?: (title: string, message: string, type: 'success' | 'info' | 'error', iconName?: AppIconName) => void;
}

const AIImageGen: React.FC<AIImageGenProps> = ({ notify }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [view, setView] = useState<'create' | 'gallery'>('create');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    checkApiKeyStatus();
    loadHistory();
  }, []);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadHistory = () => {
    const saved = localStorage.getItem('bsambh_image_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  };

  const saveToHistory = (newItem: GeneratedImage) => {
    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem('bsambh_image_history', JSON.stringify(updated));
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('bsambh_image_history', JSON.stringify(updated));
  };

  const checkApiKeyStatus = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("AI Studio environment check failed:", e);
      setHasApiKey(true);
    }
  };

  const handleOpenSelectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setHasApiKey(true); 
      }
    } catch (e) {
      console.error("Failed to open key selector:", e);
    }
  };

  const handleGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt || isLoading) return;
    
    setIsLoading(true);
    setGeneratedUrl('');
    
    try {
      const url = await generateImage(activePrompt, size);
      if (url) {
        setGeneratedUrl(url);
        saveToHistory({
          id: Date.now().toString(),
          url,
          prompt: activePrompt,
          size,
          timestamp: Date.now()
        });
        if (notify) notify("Image Ready", "Your AI masterpiece is complete.", "success", "image");
      }
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        handleOpenSelectKey();
      }
      console.error(error);
      if (notify) notify("Generation Failed", "Could not create image at this time.", "error", "alert");
    } finally {
      setIsLoading(false);
    }
  };

  const generateBrandVariant = () => {
    const brandPrompt = "A futuristic 3D high-tech app logo for 'Bsambh', featuring a stylized letter B with Base Blue and Farcaster Purple gradients, glassmorphism style, dark background, ultra-modern Web3 aesthetic, 8k resolution.";
    setPrompt(brandPrompt);
    handleGenerate(brandPrompt);
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 glass-card rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
          <Key size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">API Key Required</h3>
          <p className="text-zinc-400 max-w-xs mx-auto">
            Image generation requires a selected API key in this environment.
          </p>
        </div>
        <button 
          onClick={handleOpenSelectKey}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-full transition-all active:scale-95"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-top duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">AI Studio</h2>
          <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Powered by Gemini 3 Pro</p>
        </div>

        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-white/5">
          <button onClick={() => setView('create')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'create' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}><Wand2 size={16} /> Create</button>
          <button onClick={() => setView('gallery')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${view === 'gallery' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutGrid size={16} /> Gallery {history.length > 0 && <span className="text-[10px] bg-blue-500 text-white px-1.5 rounded-full ml-1">{history.length}</span>}</button>
        </div>
      </div>

      {view === 'create' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-6 bg-zinc-900/80 border border-white/5 rounded-[32px] hover:border-white/10 transition-all focus-within:border-blue-500/30">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-transparent resize-none h-24 outline-none text-xl font-bold text-zinc-100 placeholder:text-zinc-800 leading-tight" placeholder="A cosmic portal above Base City, vibrant blues and purples..." />
              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mr-2">Resolution:</span>
                  {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                    <button key={s} onClick={() => setSize(s)} className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all border ${size === s ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' : 'bg-zinc-800 text-zinc-500 border-white/5 hover:border-white/10'}`}>{s}</button>
                  ))}
                </div>
                <button onClick={() => handleGenerate()} disabled={isLoading || !prompt} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 disabled:opacity-50 hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />} Generate
                </button>
              </div>
            </div>

            <div className="w-full sm:w-64 flex flex-col gap-4">
              <button onClick={generateBrandVariant} disabled={isLoading} className="flex-1 p-6 bg-blue-600/10 border border-blue-500/20 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-blue-600/20 transition-all group">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><Palette size={24} /></div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Brand Studio</p>
                  <p className="text-xs font-bold text-white">Generate Logo Variant</p>
                </div>
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[40px] border border-white/10 min-h-[400px] flex items-center justify-center overflow-hidden relative shadow-2xl bg-black/20">
            {isLoading ? (
              <div className="text-center space-y-8 p-12 max-w-sm animate-in fade-in zoom-in duration-500">
                <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 border-2 border-blue-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-4 border border-white/5 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <Cpu size={48} className="text-blue-500 animate-pulse" />
                      <div className="absolute inset-0 bg-blue-500/40 blur-xl animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent animate-pulse">Forging Vision</h3>
                  <div className="h-4 flex items-center justify-center">
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] animate-in slide-in-from-bottom-2 duration-700">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                  </div>
                </div>
              </div>
            ) : generatedUrl ? (
              <div className="group relative w-full h-full flex items-center justify-center bg-black/40">
                <img src={generatedUrl} className="max-w-full max-h-[70vh] object-contain shadow-2xl animate-in zoom-in-95 duration-700" alt="Generated" />
                <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <a href={generatedUrl} download={`bsambh-${Date.now()}.png`} className="p-4 bg-white text-black rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl flex items-center gap-2 font-bold text-xs"><Download size={20} /> Download</a>
                </div>
              </div>
            ) : (
              <div className="text-zinc-800 text-center px-12 space-y-6 opacity-40">
                <Sparkles size={80} className="mx-auto" strokeWidth={1} />
                <p className="text-xl font-black uppercase tracking-[0.2em]">The canvas is yours</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[40px] border border-white/5 text-center space-y-6">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-700"><History size={40} /></div>
              <div className="space-y-2"><h3 className="text-2xl font-black italic uppercase tracking-tighter">Gallery is empty</h3></div>
              <button onClick={() => setView('create')} className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-blue-500 hover:text-white transition-all">Go to Creator</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item.id} className="group relative glass-card rounded-[32px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 aspect-square">
                  <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.prompt} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-white text-xs font-bold line-clamp-2 mb-4 drop-shadow-lg">{item.prompt}</p>
                    <div className="flex gap-2">
                      <a href={item.url} download={`bsambh-${item.id}.png`} className="flex-1 bg-white text-black py-2.5 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"><Download size={14} /> Save</a>
                      <button onClick={(e) => deleteFromHistory(item.id, e)} className="p-2.5 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
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

export default AIImageGen;
