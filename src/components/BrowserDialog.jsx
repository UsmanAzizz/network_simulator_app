import React, { useState } from 'react';
import { X, Search, AlertTriangle, Globe, WifiOff, Home, CheckCircle2 } from 'lucide-react';
import useNetworkStore from '@/store/useNetworkStore';

export default function BrowserDialog({ nodeId }) {
  const { nodes, setActiveBrowserNode } = useNetworkStore();
  const pcNode = nodes.find(n => n.id === nodeId);
  const [url, setUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(() => {
    if (!pcNode) return 'home';
    if (!pcNode.data.ip) return 'no_ip';
    if (!pcNode.data.accessibleServers || pcNode.data.accessibleServers.length === 0) return 'not_found';
    return 'home';
  });

  if (!pcNode) return null;

  const accessibleServers = pcNode.data.accessibleServers || [];
  
  // App mapping to Server labels
  const apps = [
    { name: 'YouTube', url: 'www.youtube.com', server: 'Server YouTube', color: 'bg-white', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
    { name: 'TikTok', url: 'www.tiktok.com', server: 'Server TikTok', color: 'bg-black', icon: 'https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg' },
    { name: 'Instagram', url: 'www.instagram.com', server: 'Server Instagram', color: 'bg-white', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg' },
    { name: 'Roblox', url: 'www.roblox.com', server: 'Server Roblox', color: 'bg-white', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg' },
    { name: 'WhatsApp', url: 'web.whatsapp.com', server: 'Server WhatsApp', color: 'bg-green-500', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' },
  ];

  const handleNavigate = (app) => {
    setUrl(app.url);
    if (!pcNode.data.ip) {
      setCurrentPage('no_ip');
      return;
    }
    
    if (accessibleServers.includes(app.server)) {
      setCurrentPage(app.name);
    } else {
      setCurrentPage('not_found');
    }
  };

  const goHome = () => {
    setUrl('');
    setCurrentPage('home');
  };

  const renderContent = () => {
    if (currentPage === 'home') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="space-y-2">
            <Globe size={48} className="mx-auto text-blue-400 mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-slate-700">Pilih Situs Web</h2>
            <p className="text-slate-500">Silakan pilih situs yang ingin diakses dari PC {pcNode.data.index}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
            {apps.map(app => (
              <button 
                key={app.name}
                onClick={() => handleNavigate(app)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1 transition-all bg-white group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${app.color} group-hover:scale-110 transition-transform overflow-hidden p-2`}>
                  <img src={app.icon} alt={app.name} className="w-full h-full object-contain drop-shadow-sm" />
                </div>
                <span className="font-semibold text-slate-700 text-sm">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (currentPage === 'no_ip') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-in fade-in duration-300">
          <WifiOff size={64} className="text-slate-400 mb-2" />
          <h2 className="text-2xl font-bold text-slate-700">Tidak Ada Koneksi Internet</h2>
          <p className="text-slate-500 max-w-md">PC Anda belum mendapatkan IP Address. Pastikan kabel terhubung dengan benar ke Switch atau Router yang memiliki DHCP Server.</p>
        </div>
      );
    }

    if (currentPage === 'not_found') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 animate-in fade-in duration-300">
          <AlertTriangle size={64} className="text-amber-500 mb-2" />
          <h2 className="text-2xl font-bold text-slate-700">Situs Tidak Dapat Dijangkau</h2>
          <p className="text-slate-500 max-w-md">
            DNS_PROBE_FINISHED_NXDOMAIN<br/>
            Tidak ada jalur (routing) yang menghubungkan PC ini dengan {url ? apps.find(a => a.url === url)?.server : 'internet'}. Periksa kembali topologi Anda.
          </p>
        </div>
      );
    }

    // Success Pages
    const appInfo = apps.find(a => a.name === currentPage);
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 animate-in fade-in duration-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        <div className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${appInfo?.color} mb-6 transform hover:rotate-6 transition-transform cursor-pointer p-4`}>
          <img src={appInfo?.icon} alt={appInfo?.name} className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 mb-2">Selamat Datang di {currentPage}!</h1>
        <p className="text-slate-500 text-lg">Koneksi berhasil! Server merespons.</p>
        <div className="mt-8 px-6 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm border border-green-200">
          <CheckCircle2 size={16} /> HTTP 200 OK
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200" onClick={() => setActiveBrowserNode(null)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-slate-200" onClick={e => e.stopPropagation()}>
        
        {/* Browser Chrome (Top Bar) */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 flex items-center gap-3">
          <div className="flex items-center gap-2 px-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          
          <button onClick={goHome} className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors ml-2" title="Kembali ke Beranda">
            <Home size={18} />
          </button>
          
          <div className="flex-1 max-w-2xl mx-auto flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
            <Search size={16} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              value={url} 
              readOnly 
              className="w-full text-sm outline-none text-slate-700 bg-transparent cursor-default"
              placeholder="Ketik alamat web atau pilih dari beranda..."
            />
          </div>
          
          <button 
            onClick={() => setActiveBrowserNode(null)}
            className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-md text-slate-500 transition-colors ml-auto"
          >
            <X size={20} />
          </button>
        </div>

        {/* Browser Content */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
