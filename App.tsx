
import React, { useState, useCallback, useRef } from 'react';
import { generateBlogDraft } from './geminiService';
import Editor from './components/Editor';
import { GenerationStatus, HistoryItem } from './types';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', date: '2024-05-10', topic: '겨울철 당뇨 환자 식단 관리', status: 'Published', platform: 'Naver' },
    { id: '2', date: '2024-05-08', topic: '비타민 D의 역설', status: 'Draft' },
  ]);

  const editorRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setStatus(GenerationStatus.WRITING);
    setContent('');
    
    try {
      await generateBlogDraft(topic, (chunk) => {
        setContent(prev => prev + chunk);
      });
      setStatus(GenerationStatus.COMPLETED);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        topic,
        status: 'Draft'
      };
      setHistory(prev => [newItem, ...prev]);
    } catch (err) {
      console.error(err);
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handlePublish = (platform: 'Naver' | 'Tistory') => {
    alert(`${platform} 블로그로 포스팅 전송을 준비합니다. HTML 코드가 클립보드에 복사됩니다.`);
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex h-screen w-full bg-surface-dark text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex-none border-r border-surface-border flex flex-col bg-surface-dark hidden lg:flex">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
             <span className="material-icons-round text-white">healing</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight leading-none">Nodak Nodak</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Medical Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
          <div>
            <h2 className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Content History</h2>
            <div className="space-y-1">
              {history.map(item => (
                <button key={item.id} className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface-card transition-all group border border-transparent hover:border-surface-border">
                  <p className="text-xs font-bold text-gray-300 group-hover:text-primary transition-colors truncate">{item.topic}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-600 font-mono">{item.date}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${item.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      {item.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-surface-border">
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-border flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-50/10 border border-white/10 flex items-center justify-center overflow-hidden">
               <img src="https://picsum.photos/seed/doctor/100" alt="Dr. Nodak" />
             </div>
             <div>
               <p className="text-sm font-bold">Dr. Nodak</p>
               <p className="text-[10px] text-primary font-bold">GEMINI PRO ACTIVE</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0c111b]">
        {/* Header Overlay */}
        <div className="h-16 flex-none border-b border-surface-border flex items-center justify-between px-8 bg-surface-dark/40 backdrop-blur-md z-10">
           <div className="flex items-center gap-2">
             <span className="material-icons-round text-primary text-sm">auto_awesome</span>
             <span className="text-xs font-bold uppercase tracking-widest text-gray-400">AI Assistant Session</span>
           </div>
           <div className="flex gap-4">
             <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">Settings</button>
             <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">Documentation</button>
           </div>
        </div>

        <div className="flex-1 flex gap-8 p-8 overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <Editor content={content} isWriting={status === GenerationStatus.WRITING} />
          </div>

          {/* Config Area */}
          <aside className="w-96 flex-none flex flex-col gap-6">
            <section className="bg-surface-card rounded-2xl border border-surface-border p-6 shadow-xl">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="material-icons-round text-sm text-primary">edit</span>
                 Topic Configuration
               </h3>
               <div className="space-y-5">
                 <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">What are we writing about?</label>
                   <textarea 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     className="w-full h-32 bg-black/30 border border-surface-border rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none placeholder-gray-600"
                     placeholder="예: 과민성 대장 증후군 환자를 위한 점심 메뉴 가이드..."
                   />
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase mb-2">Persona Mode</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button className="bg-primary text-white py-2 rounded-lg text-xs font-bold shadow-lg shadow-primary/20">Witty Nodak</button>
                      <button className="bg-surface-dark border border-surface-border text-gray-500 py-2 rounded-lg text-xs font-bold hover:text-white transition-colors">Professional</button>
                   </div>
                 </div>
                 <button 
                   onClick={handleGenerate}
                   disabled={status === GenerationStatus.WRITING || !topic}
                   className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                 >
                   {status === GenerationStatus.WRITING ? (
                     <span className="animate-spin material-icons-round">sync</span>
                   ) : (
                     <span className="material-icons-round">auto_awesome</span>
                   )}
                   Generate Blog Draft
                 </button>
               </div>
            </section>

            <section className="bg-surface-card rounded-2xl border border-surface-border p-6 shadow-xl">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <span className="material-icons-round text-sm text-green-500">publish</span>
                 Publishing Toolkit
               </h3>
               <div className="space-y-3">
                 <button 
                   onClick={() => handlePublish('Naver')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border hover:border-green-500/50 hover:bg-green-500/5 transition-all group"
                 >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center font-bold text-white shadow-md">N</div>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-green-500 transition-colors">Post to Naver</span>
                    </div>
                    <span className="material-icons-round text-sm text-gray-600">chevron_right</span>
                 </button>
                 <button 
                   onClick={() => handlePublish('Tistory')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-surface-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                 >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white shadow-md">T</div>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-orange-500 transition-colors">Post to Tistory</span>
                    </div>
                    <span className="material-icons-round text-sm text-gray-600">chevron_right</span>
                 </button>
               </div>
            </section>

            <div className="mt-auto bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-xs font-bold text-primary mb-2">Pro Tip</h4>
                 <p className="text-[11px] leading-relaxed text-gray-400">
                   "글 하단에 본인만의 시그니처 문구를 추가하면 퍼스널 브랜딩에 도움이 됩니다. 노닥노닥은 여러분의 위장을 항상 응원합니다!"
                 </p>
               </div>
               <span className="material-icons absolute -bottom-4 -right-4 text-8xl text-primary/5 select-none pointer-events-none">tips_and_updates</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default App;
