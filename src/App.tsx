import { useState, useRef, useEffect } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, Delete, Calculator, Percent, Plus, Minus, Equal, X, Plane, Timer, Save, ScrollText, CheckCircle2, Divide, Trash2 } from 'lucide-react';

interface CalculatorState {
  accumulator: number; // Total minutes
  inputBuffer: number; // Raw digits typed e.g. 120 -> 01:20
  operator: '+' | '-' | 'x' | '/' | null;
}

export default function App() {
  const [havaCalc, setHavaCalc] = useState<CalculatorState>({ accumulator: 0, inputBuffer: 0, operator: null });
  const [yerCalc, setYerCalc] = useState<CalculatorState>({ accumulator: 0, inputBuffer: 0, operator: null });
  const [activeBox, setActiveBox] = useState<'hava' | 'yer'>('hava');
  
  const [totalResult, setTotalResult] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showKeypad, setShowKeypad] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);

  const currentCalc = activeBox === 'hava' ? havaCalc : yerCalc;
  const setCalc = (newState: CalculatorState | ((prev: CalculatorState) => CalculatorState)) => {
    if (activeBox === 'hava') {
      setHavaCalc(newState);
    } else {
      setYerCalc(newState);
    }
  };

  const formatMins = (m: number) => {
    const hours = Math.floor(Math.abs(m) / 60);
    const mins = Math.abs(m) % 60;
    const sign = m < 0 ? '-' : '';
    return `${sign}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const bufferToMins = (buffer: number) => {
    const hours = Math.floor(buffer / 100);
    const mins = buffer % 100;
    return hours * 60 + mins;
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setCalc(prev => ({ ...prev, inputBuffer: Math.floor(prev.inputBuffer / 10) }));
      return;
    }
    if (val === 'reset') {
      setCalc({ accumulator: 0, inputBuffer: 0, operator: null });
      return;
    }

    if (['+', '-', 'x', '/'].includes(val)) {
      const op = val as '+' | '-' | 'x' | '/';
      const currentVal = currentCalc.inputBuffer > 0 ? bufferToMins(currentCalc.inputBuffer) : null;
      
      setCalc(prev => {
        let newAcc = prev.accumulator;
        
        // If we have an input buffer, apply the pending operator
        if (currentVal !== null) {
          if (prev.operator === '+') newAcc += currentVal;
          else if (prev.operator === '-') newAcc -= currentVal;
          else if (prev.operator === 'x') newAcc = Math.round(newAcc * (currentVal / 60));
          else if (prev.operator === '/') newAcc = currentVal !== 0 ? Math.round(newAcc / (currentVal / 60)) : newAcc;
          else newAcc = currentVal;
        } 
        // If no input buffer but we have an accumulator, we just want to set/change operator
        
        return { accumulator: newAcc, inputBuffer: 0, operator: op };
      });
      return;
    }

    if (val === '%') {
      setCalc(prev => {
        if (prev.operator === 'x') {
          const rate = prev.inputBuffer || 0;
          const resultMins = Math.round(prev.accumulator * (rate / 100));
          return { accumulator: resultMins, inputBuffer: 0, operator: null };
        }
        return prev;
      });
      return;
    }

    if (val === '=') {
      const currentValue = bufferToMins(currentCalc.inputBuffer);
      setCalc(prev => {
        let finalAcc = prev.accumulator;
        if (prev.operator === '+') finalAcc += currentValue;
        else if (prev.operator === '-') finalAcc -= currentValue;
        else if (prev.operator === 'x') finalAcc = Math.round(finalAcc * (currentValue / 60));
        else if (prev.operator === '/') finalAcc = currentValue !== 0 ? Math.round(finalAcc / (currentValue / 60)) : finalAcc;
        else finalAcc = currentValue;

        return { accumulator: finalAcc, inputBuffer: 0, operator: null };
      });
      return;
    }

    const num = parseInt(val);
    if (!isNaN(num)) {
      setCalc(prev => {
        if (prev.inputBuffer > 9999) return prev;
        return { ...prev, inputBuffer: prev.inputBuffer * 10 + num };
      });
    }
  };

  const handleCalculateTotal = () => {
    const totalHava = havaCalc.inputBuffer > 0 && !havaCalc.operator ? bufferToMins(havaCalc.inputBuffer) : havaCalc.accumulator;
    const totalYer = yerCalc.inputBuffer > 0 && !yerCalc.operator ? bufferToMins(yerCalc.inputBuffer) : yerCalc.accumulator;
    setTotalResult(totalHava + totalYer);
  };

  const handleSaveToLog = () => {
    if (totalResult === null) return;
    const currentHava = havaCalc.inputBuffer > 0 && !havaCalc.operator ? bufferToMins(havaCalc.inputBuffer) : havaCalc.accumulator;
    const currentYer = yerCalc.inputBuffer > 0 && !yerCalc.operator ? bufferToMins(yerCalc.inputBuffer) : yerCalc.accumulator;
    const logEntry = `Hava: ${formatMins(currentHava)} | Yer: ${formatMins(currentYer)} | Yekun: ${formatMins(totalResult)}`;
    setHistory(h => [logEntry, ...h].slice(0, 20));
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const handleDeleteLogEntry = (index: number) => {
    setHistory(h => h.filter((_, i) => i !== index));
  };

  const currentBoxVal = currentCalc.inputBuffer > 0 ? bufferToMins(currentCalc.inputBuffer) : currentCalc.accumulator;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 font-sans bg-slate-950 transition-colors duration-300 dark">
      <div className="w-full max-w-[420px] h-auto bg-sleek-card rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] border border-sleek-border flex flex-col overflow-hidden relative">
        
        <div className="pt-4 text-center px-6">
            <div className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40">
              Flight assistant v3.5
            </div>
        </div>

        {/* Content Section - More Compact */}
        <div className="p-5 flex flex-col gap-4">
          
          {/* 1 & 2: Hava & Yer Boxes */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveBox('hava')}
              className={`p-4 rounded-[22px] border-2 transition-all flex flex-col gap-0.5 text-left relative overflow-hidden group ${activeBox === 'hava' ? 'border-sleek-primary bg-sleek-primary/20 shadow-md' : 'border-sleek-border bg-slate-900/50'}`}
            >
              <div className="flex items-center justify-between">
                 <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeBox === 'hava' ? 'text-sleek-primary' : 'text-slate-400 opacity-60'}`}>Hava</span>
                 <Plane className={`w-3 h-3 ${activeBox === 'hava' ? 'text-sleek-primary' : 'text-slate-400 opacity-30'}`} />
              </div>
              <span className={`text-xl font-[900] tabular-nums tracking-tighter ${activeBox === 'hava' ? 'text-white' : 'text-slate-400'}`}>
                {formatMins(havaCalc.inputBuffer > 0 && !havaCalc.operator ? bufferToMins(havaCalc.inputBuffer) : havaCalc.accumulator)}
              </span>
              <div className={`h-1 w-full absolute bottom-0 left-0 bg-sleek-primary transition-all duration-300 ${activeBox === 'hava' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>

            <button 
              onClick={() => setActiveBox('yer')}
              className={`p-4 rounded-[22px] border-2 transition-all flex flex-col gap-0.5 text-left relative overflow-hidden group ${activeBox === 'yer' ? 'border-sleek-primary bg-sleek-primary/20 shadow-md' : 'border-sleek-border bg-slate-900/50'}`}
            >
              <div className="flex items-center justify-between">
                 <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${activeBox === 'yer' ? 'text-sleek-primary' : 'text-slate-400 opacity-60'}`}>Yer</span>
                 <Timer className={`w-3 h-3 ${activeBox === 'yer' ? 'text-sleek-primary' : 'text-slate-400 opacity-30'}`} />
              </div>
              <span className={`text-xl font-[900] tabular-nums tracking-tighter ${activeBox === 'yer' ? 'text-white' : 'text-slate-400'}`}>
                {formatMins(yerCalc.inputBuffer > 0 && !yerCalc.operator ? bufferToMins(yerCalc.inputBuffer) : yerCalc.accumulator)}
              </span>
              <div className={`h-1 w-full absolute bottom-0 left-0 bg-sleek-primary transition-all duration-300 ${activeBox === 'yer' ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>
          </div>

          {/* Strategic "Cəm" Button */}
          <div className="flex justify-center -my-3 relative z-10">
             <button 
               onClick={handleCalculateTotal}
               className="px-10 py-2.5 bg-sleek-primary text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-full shadow-[0_8px_16px_rgba(37,99,235,0.3)] transform transition-all hover:scale-105 active:scale-95 border-4 border-white"
             >
               Cəm
             </button>
          </div>

          {/* Master Display Area - Slimmer */}
          <div className="bg-sleek-side rounded-[28px] border border-sleek-border pt-7 pb-5 px-6 text-right shadow-inner relative overflow-hidden">
             <div className="absolute top-3 left-6 flex items-center gap-1.5 opacity-40">
                <div className={`w-1.5 h-1.5 rounded-full ${activeBox === 'hava' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                <span className="text-[7px] font-black text-sleek-text-muted uppercase tracking-widest">
                   {activeBox === 'hava' ? 'Hava' : 'Yer'}
                </span>
             </div>
             
             <div className="text-[9px] font-black text-sleek-text-muted h-3 mb-0.5 tracking-widest uppercase opacity-40">
                {currentCalc.operator ? `${formatMins(currentCalc.accumulator)} ${currentCalc.operator === 'x' ? '×' : currentCalc.operator}` : 'Giriş'}
             </div>
             <div className="text-5xl font-[900] text-sleek-primary tracking-tighter tabular-nums leading-none">
                {formatMins(currentBoxVal)}
             </div>
             
             {/* Total Result Popup inside Display */}
             {totalResult !== null && (
               <div className="mt-3 pt-3 border-t border-sleek-border/40 flex items-center justify-between animate-in fade-in slide-in-from-bottom-1 duration-300">
                 <div className="flex flex-col items-start leading-tight">
                    <span className="text-[7px] font-black text-sleek-text-muted uppercase tracking-[0.2em] opacity-60">Yekun</span>
                    <span className="text-2xl font-black text-sleek-text tracking-tighter">{formatMins(totalResult)}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowHistory(true)}
                      className="p-2.5 rounded-xl bg-sleek-card text-sleek-text-muted border border-sleek-border shadow-sm hover:border-sleek-primary/40 transition-all relative"
                    >
                      <ScrollText className="w-4 h-4" />
                      {history.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-calc-red text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-white">
                            {history.length}
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={handleSaveToLog}
                      disabled={saveIndicator}
                      className={`p-2.5 rounded-xl shadow-md transition-all flex items-center justify-center ${saveIndicator ? 'bg-green-500 text-white' : 'bg-calc-green text-white hover:brightness-110 active:scale-95'}`}
                    >
                       {saveIndicator ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    </button>
                 </div>
               </div>
             )}
          </div>

          {/* Keypad Controls */}
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
               <div className="w-3 h-0.5 bg-sleek-primary rounded-full"></div>
               <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] opacity-60">Rəqəmsal</span>
            </div>
            <button 
              onClick={() => {
                const nextState = !showKeypad;
                setShowKeypad(nextState);
                if (!nextState) setShowHistory(true);
              }}
              className="p-1 px-2.5 rounded-lg hover:bg-slate-900 text-sleek-primary transition-all bg-sleek-card shadow-sm border border-sleek-border flex items-center gap-1"
            >
              <span className="text-[7px] font-black uppercase tracking-widest">{showKeypad ? 'Logbook' : 'Göstər'}</span>
              {showKeypad ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Compact Keypad */}
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showKeypad ? 'h-[280px] opacity-100' : 'h-0 opacity-0 pointer-events-none'}`}>
            <div className="grid grid-cols-4 gap-2 h-full bg-sleek-side p-2 rounded-[28px] border border-sleek-border">
              <div className="col-span-3 grid grid-cols-3 gap-1.5">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(n => (
                  <button key={n} onClick={() => handleKeypadPress(n.toString())} className="bg-calc-gray text-white text-lg font-black rounded-2xl hover:brightness-125 transition-all active:scale-95">
                    {n}
                  </button>
                ))}
                <button onClick={() => setCalc({ accumulator: 0, inputBuffer: 0, operator: null })} className="bg-calc-red text-white rounded-2xl transition-all flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={() => handleKeypadPress('0')} className="bg-calc-gray text-white text-lg font-black rounded-2xl hover:brightness-125 transition-all active:scale-95">0</button>
                <button onClick={() => handleKeypadPress('backspace')} className="bg-calc-red text-white rounded-2xl transition-all flex items-center justify-center">
                    <Delete className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <button onClick={() => handleKeypadPress('%')} className="flex-1 bg-calc-orange text-white rounded-2xl transition-all flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </button>
                <button onClick={() => handleKeypadPress('/')} className="flex-1 bg-calc-orange text-white rounded-2xl transition-all flex items-center justify-center">
                    <Divide className="w-4 h-4" />
                </button>
                <button onClick={() => handleKeypadPress('x')} className="flex-1 bg-calc-orange text-white rounded-2xl transition-all flex items-center justify-center">
                    <X className="w-4 h-4" />
                </button>
                <button onClick={() => handleKeypadPress('-')} className="flex-1 bg-calc-orange text-white rounded-2xl transition-all flex items-center justify-center">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={() => handleKeypadPress('+')} className="flex-1 bg-calc-orange text-white rounded-2xl transition-all flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="col-span-4 mt-0.5">
                 <button onClick={() => handleKeypadPress('=')} className="w-full h-11 bg-calc-green text-white text-xl font-black rounded-2xl transition-all flex items-center justify-center">
                    <Equal className="w-8 h-8" />
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Improved Operations Log Drawer */}
        {showHistory && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl z-30 p-8 flex flex-col animate-in fade-in slide-in-from-top-4 duration-400">
            <div className="flex items-center justify-between mb-6">
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-sleek-primary" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Logbook</h2>
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-0.5 ml-7">Arxivlənmiş Hesablamalar</span>
               </div>
               <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white hover:bg-slate-800 transition-all">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <div className="flex-grow space-y-3 overflow-y-auto pr-1 custom-scrollbar pb-6">
               {history.length > 0 ? (
                 <>
                   <div className="flex justify-end mb-2">
                      <button 
                        onClick={() => setHistory([])}
                        className="text-[8px] font-black text-calc-red uppercase tracking-widest border border-calc-red/20 px-3 py-1 rounded-full hover:bg-calc-red/10 transition-all"
                      >
                         Hamısını Sil
                      </button>
                   </div>
                   {history.map((log, i) => (
                     <div key={i} className="bg-slate-900/50 p-4 rounded-[24px] border border-slate-800 shadow-sm border-l-4 border-l-sleek-primary relative group" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between mb-1">
                           <div className="text-[7px] text-sleek-primary font-black uppercase tracking-widest opacity-70">Log #{history.length - i}</div>
                           <button 
                             onClick={() => handleDeleteLogEntry(i)} 
                             className="p-1.5 text-calc-red opacity-40 hover:opacity-100 hover:bg-calc-red/20 rounded-lg transition-all"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <div className="text-[11px] text-slate-200 font-bold tracking-tight pr-6">{log}</div>
                     </div>
                   ))}
                 </>
               ) : (
                 <div className="flex-grow flex flex-col items-center justify-center opacity-10 text-center gap-4 mt-10">
                    <Calculator className="w-20 h-20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Boşdur</span>
                 </div>
               )}
            </div>
            
            {history.length > 0 && (
              <button 
                onClick={() => setHistory([])}
                className="mt-2 w-full py-4 bg-calc-red/5 text-calc-red font-black text-[9px] uppercase tracking-[0.4em] rounded-[24px] border border-calc-red/10 hover:bg-calc-red hover:text-white transition-all shadow-sm"
              >
                 Təmizlə
              </button>
            )}
          </div>
        )}

        <div className="pb-4 text-center mt-auto">
            <div className="text-[7px] font-black text-slate-500 uppercase tracking-[0.5em] opacity-40">
              by Rza Rzayev
            </div>
        </div>
      </div>
    </div>
  );
}
