import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, ScanQrCode, Fingerprint, Loader2, CheckCircle2, 
  AlertCircle, FileText, ExternalLink, Lock, Globe, Database, 
  Activity, ChevronRight, Menu, X, Sun, Moon, Printer, Share2, ShieldAlert
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

// --- COMPOSANTS UI RÉUTILISABLES ---

const ActionButton = ({ onClick, icon: Icon, children, variant = 'primary', disabled = false }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
      ${variant === 'primary' 
        ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg dark:shadow-none dark:border-t dark:border-indigo-400/30 hover:bg-slate-800 dark:hover:bg-indigo-500' 
        : 'bg-white dark:bg-slate-800/40 dark:backdrop-blur-xl text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
      ${disabled ? 'opacity-30 cursor-not-allowed grayscale pointer-events-none' : 'hover:-translate-y-1'}
    `}
  >
    {Icon && <Icon className={`w-5 h-5 ${variant === 'primary' ? 'text-indigo-200' : 'text-indigo-500'}`} />}
    {children}
  </button>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-10">
    <h2 className="text-3xl font-black dark:text-white mb-3 tracking-tight">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-snug">{subtitle}</p>
  </div>
);

// --- COMPOSANT DE RÉSULTAT DÉTAILLÉ ---

const ResultDisplay = React.memo(({ result, onReset }) => {
  const handlePrint = () => window.print();
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] overflow-hidden print:shadow-none print:border-none">
        {/* Banner de Statut */}
        <div className="bg-emerald-500 dark:bg-emerald-600 px-8 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl leading-none">Authenticité Certifiée</h3>
              <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mt-1">Protocole Blockchain Guinea v1.0</p>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={handlePrint} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" title="Imprimer"><Printer className="w-4 h-4" /></button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" title="Partager"><Share2 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid md:grid-cols-[1fr,260px] gap-12">
            {/* Colonne Informations */}
            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-200 dark:shadow-none">
                  {result.childFirstName[0]}
                </div>
                <div>
                  <h4 className="text-4xl font-black dark:text-white leading-tight">{result.childFirstName} {result.childLastName}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-mono text-xs font-bold">{result.nationalId}</span>
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">Actif</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date de Naissance</label>
                  <p className="text-xl font-bold dark:text-slate-200">{new Date(result.dateOfBirth).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lieu de Naissance</label>
                  <p className="text-xl font-bold dark:text-slate-200">{result.placeOfBirth}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-5 group">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm"><Globe className="w-6 h-6 text-indigo-500" /></div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Autorité Émettrice</label>
                  <p className="font-black text-slate-900 dark:text-white">{result.establishment}</p>
                </div>
              </div>
            </div>

            {/* Colonne Preuves Techniques */}
            <div className="flex flex-col gap-6">
              <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center group relative overflow-hidden">
                <FileText className="w-16 h-16 text-slate-200 dark:text-slate-700 mb-4 transition-transform group-hover:scale-110" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Visualisation du document certifié</p>
                {result.ipfsUrl && (
                  <a href={result.ipfsUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all font-black text-sm gap-2">
                    <ExternalLink className="w-5 h-5 text-indigo-400" />
                    VOIR LE PDF
                  </a>
                )}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-3 h-3 text-indigo-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Empreinte Blockchain</span>
                </div>
                <code className="text-[9px] font-mono text-slate-500 dark:text-slate-400 break-all leading-tight block">
                  {result.blockchainHash}
                </code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-12 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
          <p className="text-xs font-medium text-slate-400 italic">Vérifié le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
          <button onClick={onReset} className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline">Nouvelle vérification</button>
        </div>
      </div>
    </motion.div>
  );
});

// --- COMPOSANT PRINCIPAL ---

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [nationalId, setNationalId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({ total: 1248392 });
  const qrInstanceRef = useRef(null);

  // Thème Logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(p => p === 'light' ? 'dark' : 'light'), []);

  // Stats Logic
  useEffect(() => {
    axios.get(`${API_BASE_URL}/dashboard/kpis`)
      .then(res => setStats({ total: res.data.data.totalBirths }))
      .catch(() => {});
  }, []);

  // Verification Logic
  const handleVerify = useCallback(async (type, payload) => {
    if (!payload) return;
    setLoading(true);
    setError(null);
    setResult(null);
    window.scrollTo({ top: 500, behavior: 'smooth' });

    try {
      const endpoint = type === 'qr' ? '/verify/qr' : '/verify/id';
      const body = type === 'qr' 
        ? { qrPayload: payload, verifierType: 'PUBLIC' }
        : { nationalId: payload, verifierType: 'PUBLIC' };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, body);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Scanner Logic (Refactorisé pour plus de robustesse avec l'API bas niveau)
  useEffect(() => {
    if (showScanner) {
      // Délai augmenté à 500ms pour éviter les "Forced Reflow" pendant l'animation du modal
      const timer = setTimeout(async () => {
        try {
          const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
          if (!window.isSecureContext && !isLocal) {
            setError("L'accès à la caméra requiert HTTPS ou localhost.");
            setShowScanner(false);
            return;
          }

          // On s'assure que l'élément est bien présent dans le DOM
          const readerElement = document.getElementById("reader");
          if (!readerElement) return;

          if (!qrInstanceRef.current) {
            qrInstanceRef.current = new Html5Qrcode("reader");
          }

          const qrboxSize = (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.floor(minEdge * 0.7);
            // On met à jour la variable CSS pour l'overlay
            document.documentElement.style.setProperty('--scan-size', `${size}px`);
            return { width: size, height: size };
          };

          const config = { 
            fps: 6, 
            qrbox: qrboxSize,
            aspectRatio: 1.0
          };

          await qrInstanceRef.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              qrInstanceRef.current.stop().then(() => {
                setShowScanner(false);
                handleVerify('qr', decodedText);
              }).catch(err => console.error("Erreur stop scanner:", err));
            },
            () => {}
          );
        } catch (err) {
          console.error("Erreur scanner:", err);
          setError("Impossible d'accéder à la caméra. Vérifiez vos permissions.");
          setShowScanner(false);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        if (qrInstanceRef.current && qrInstanceRef.current.isScanning) {
          qrInstanceRef.current.stop().catch(() => {});
        }
      };
    }
  }, [showScanner, handleVerify]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header Premium */}
      <header className="fixed top-0 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg md:rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"><ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" /></div>
            <span className="font-black text-lg md:text-2xl tracking-tighter dark:text-white">NaissanceChain</span>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={toggleTheme} className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 transition-transform">
              {theme === 'light' ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            <button className="bg-slate-900 dark:bg-indigo-600 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-sm font-bold shadow-lg dark:shadow-none dark:border-t dark:border-indigo-400/20 hover:-translate-y-0.5 transition-transform">Espace Officier</button>
          </div>
        </div>
      </header>

      <main className="pt-24 md:pt-36 pb-12 md:pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-12 md:mb-20">
                <Badge icon={Activity}>Système Blockchain Guinea Actif</Badge>
                <h1 className="text-4xl md:text-8xl font-black dark:text-white tracking-tighter mb-4 md:mb-8 leading-[0.9] md:leading-[0.85]">NaissanceChain</h1>
                <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed px-4">Vérifiez instantanément l'authenticité d'un acte de naissance via l'infrastructure nationale sécurisée.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 md:gap-10 mb-12 md:mb-20">
                {/* Carte QR */}
                <div className="bg-white dark:bg-slate-900 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl md:shadow-2xl relative overflow-hidden group">
                  <SectionHeader title="Scanner le QR" subtitle="Utilisez la caméra pour une authentification cryptographique immédiate." />
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-10 group-hover:rotate-12 transition-transform duration-500">
                    <ScanQrCode className="text-indigo-600 w-8 h-8 md:w-12 md:h-12" />
                  </div>
                  <ActionButton onClick={() => setShowScanner(true)} icon={ScanQrCode}>Activer le Scanner</ActionButton>

                  <AnimatePresence>
                    {showScanner && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }} 
                        className="absolute inset-0 bg-white/95 dark:bg-slate-900/98 backdrop-blur-2xl z-20 p-4 md:p-8 flex flex-col border-4 md:border-[6px] border-white dark:border-slate-800 rounded-[2rem] md:rounded-[3rem]"
                      >
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                              <ScanQrCode className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-sm md:text-xl dark:text-white leading-tight">Lecteur Optique</h3>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Système Live</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors dark:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="relative aspect-square w-full max-w-[400px] mx-auto group">
                          {/* Masque et Overlay de Scan Centré */}
                          <div className="absolute inset-0 z-10 pointer-events-none">
                            <div className="scan-mask"></div>
                            
                            {/* Zone de Scan Focus Dynamique */}
                            <div 
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              style={{ width: 'var(--scan-size)', height: 'var(--scan-size)' }}
                            >
                              <div className="scanner-corner scanner-corner-tl"></div>
                              <div className="scanner-corner scanner-corner-tr"></div>
                              <div className="scanner-corner scanner-corner-bl"></div>
                              <div className="scanner-corner scanner-corner-br"></div>
                              <div className="scanner-line"></div>
                            </div>
                          </div>

                          <div id="reader" className="w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 md:gap-4 text-slate-400">
                              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin" />
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Initialisation...</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                          <div className="p-3 md:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl md:rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3 md:gap-4">
                            <div className="bg-emerald-500 p-1.5 md:p-2 rounded-lg text-white shrink-0"><ShieldCheck className="w-3 h-3 md:w-4 md:h-4" /></div>
                            <p className="text-[8px] md:text-[10px] text-emerald-800 dark:text-emerald-300 font-bold leading-relaxed">
                              Placez le QR Code dans le cadre.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">OU</span>
                            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                          </div>

                          <label className="cursor-pointer group block">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                  if (!qrInstanceRef.current) {
                                    qrInstanceRef.current = new Html5Qrcode("reader");
                                  }
                                  const decodedText = await qrInstanceRef.current.scanFile(file, true);
                                  setShowScanner(false);
                                  handleVerify('qr', decodedText);
                                } catch (err) {
                                  setError("Impossible de lire un QR code dans cette image.");
                                }
                              }}
                            />
                            <div className="py-3 md:py-4 rounded-xl md:rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 md:gap-3 group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-all">
                              <FileText className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-indigo-500" />
                              <span className="text-xs md:text-sm font-black text-slate-600 dark:text-slate-400 group-hover:text-indigo-500 uppercase tracking-tight">Importer une image</span>
                            </div>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Carte ID */}
                <div className="bg-white dark:bg-slate-900 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl md:shadow-2xl group">
                  <SectionHeader title="Saisie Manuelle" subtitle="Entrez le numéro national d'identification." />
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-10 group-hover:scale-110 transition-transform duration-500">
                    <Fingerprint className="text-slate-900 dark:text-white w-8 h-8 md:w-12 md:h-12" />
                  </div>
                  <div className="space-y-4 mb-6 md:mb-8">
                    <input 
                      type="text" 
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value.toUpperCase())}
                      placeholder="GN-XXXX-XXXX-XXXX"
                      className="w-full p-4 md:p-5 bg-slate-50 dark:bg-slate-800 dark:text-white border-2 border-transparent focus:border-indigo-600 rounded-xl md:rounded-2xl outline-none font-mono font-black text-lg md:text-xl transition-all"
                    />
                  </div>
                  <ActionButton onClick={() => handleVerify('id', nationalId)} icon={ShieldCheck} disabled={!nationalId || loading}>
                    {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : "Vérification"}
                  </ActionButton>
                </div>
              </div>
            </motion.div>
          ) : (
            <ResultDisplay result={result} onReset={() => setResult(null)} />
          )}
        </AnimatePresence>

        {/* Feedback Erreur */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-xl mx-auto mt-6 md:mt-8 bg-red-50 dark:bg-red-900/20 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border-2 border-red-100 dark:border-red-900/50 flex items-center gap-4 md:gap-6">
              <div className="bg-red-500 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shadow-red-200 dark:shadow-none"><ShieldAlert className="text-white w-6 h-6 md:w-8 md:h-8" /></div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-red-700 dark:text-red-400 leading-tight">Échec</h3>
                <p className="text-xs md:text-sm font-bold text-red-600 dark:text-red-300 opacity-80">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Stats - Print Hidden */}
        <div className="mt-20 md:mt-32 p-8 md:p-24 bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] text-white flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-16 print:hidden">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30"><Database className="w-4 h-4 md:w-6 md:h-6" /></div>
              <h4 className="text-xl md:text-2xl font-black tracking-tight">Registre Immuable</h4>
            </div>
            <p className="text-slate-400 text-sm md:text-base font-medium max-w-sm">Chaque acte est ancré sur la blockchain Polygon, garantissant une intégrité absolue.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-10 md:gap-20">
            <div className="text-center"><p className="text-5xl md:text-7xl font-black tracking-tighter mb-2 md:mb-4">{stats.total.toLocaleString()}</p><p className="text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Actes Certifiés</p></div>
            <div className="text-center"><p className="text-5xl md:text-7xl font-black tracking-tighter mb-2 md:mb-4 text-white/20">99.9%</p><p className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.3em]">Disponibilité</p></div>
          </div>
        </div>
      </main>

      {/* Footer Minimaliste */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 md:py-16 text-center print:hidden px-4">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400">© 2026 RÉPUBLIQUE DE GUINÉE · DTC · ÉTAT CIVIL NUMÉRIQUE</p>
      </footer>
    </div>
  );
}

// Composant Badge réutilisable
const Badge = ({ children, icon: Icon }) => (
  <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-10 shadow-sm">
    {Icon && <Icon className="w-3 h-3 animate-pulse" />}
    {children}
  </div>
);

export default App;
