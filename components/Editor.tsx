
import React, { useState, useMemo } from 'react';
import { generateImage } from '../geminiService';
import { ImagePrompt } from '../types';

interface EditorProps {
  content: string;
  isWriting: boolean;
}

const Editor: React.FC<EditorProps> = ({ content, isWriting }) => {
  const [imagePrompts, setImagePrompts] = useState<Record<number, ImagePrompt>>({});

  const handleGenerateImage = async (id: number, prompt: string, alt: string) => {
    setImagePrompts(prev => ({ ...prev, [id]: { prompt, alt, isGenerating: true } }));
    try {
      const url = await generateImage(prompt);
      setImagePrompts(prev => ({ ...prev, [id]: { ...prev[id], generatedUrl: url, isGenerating: false } }));
    } catch (err) {
      console.error(err);
      setImagePrompts(prev => ({ ...prev, [id]: { ...prev[id], isGenerating: false } }));
    }
  };

  const renderContent = () => {
    if (!content) return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
        <span className="material-icons-round text-6xl mb-4">edit_note</span>
        <p className="italic">주제를 입력하고 생성을 시작하면 '노닥노닥' 원장님의 원고가 이곳에 표시됩니다.</p>
      </div>
    );

    const sections = content.split(/###\s*\[(.*?)\]/g);
    // sections[0] is everything before first ###
    // sections[1] is section name, sections[2] is section content
    
    const elements: React.ReactNode[] = [];

    for (let i = 1; i < sections.length; i += 2) {
      const sectionName = sections[i];
      const sectionContent = sections[i + 1] || '';

      elements.push(
        <div key={sectionName} className="mb-10 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-6 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase">{sectionName}</h2>
          </div>
          
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 shadow-inner">
            {renderSectionBody(sectionName, sectionContent)}
          </div>
        </div>
      );
    }

    return elements;
  };

  const renderSectionBody = (name: string, body: string) => {
    const lines = body.trim().split('\n');

    if (name.includes('SEO 제목')) {
      return (
        <div className="space-y-3">
          {lines.map((line, idx) => line.trim() && (
            <div key={idx} className="flex gap-3 items-start bg-primary/5 border border-primary/10 p-3 rounded-xl">
              <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center flex-none mt-0.5">{idx + 1}</span>
              <p className="text-gray-200 font-medium text-sm">{line.replace(/^\d+\.\s*/, '')}</p>
            </div>
          ))}
        </div>
      );
    }

    if (name.includes('핵심 키워드')) {
      const keywords = body.split(/[,\n]/).filter(k => k.trim());
      return (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw, idx) => (
            <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400 font-medium hover:text-primary transition-colors cursor-default">
              #{kw.trim()}
            </span>
          ))}
        </div>
      );
    }

    if (name.includes('노닥노닥의 한 줄 평')) {
      return (
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-xl border-l-4 border-primary italic text-lg text-primary-light font-medium">
          <span className="material-icons-round absolute -top-2 -left-2 text-6xl text-white/5 select-none">format_quote</span>
          "{body.trim()}"
        </div>
      );
    }

    if (name.includes('3줄 요약')) {
      return (
        <ul className="space-y-3">
          {lines.map((line, idx) => line.trim() && (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="material-icons-round text-primary text-sm mt-0.5">check_circle</span>
              {line.replace(/^-\s*/, '')}
            </li>
          ))}
        </ul>
      );
    }

    // Default body rendering for Intro and Main Body
    return lines.map((line, idx) => {
      // Check for image prompts
      const promptMatch = line.match(/\[이미지 프롬프트\(한글\):\s*(.*?)\]/);
      const altMatch = lines[idx + 1]?.match(/\[Alt Tag:\s*(.*?)\]/);

      if (promptMatch) {
        const promptText = promptMatch[1];
        const altText = altMatch ? altMatch[1] : '의학 일러스트';
        return (
          <div key={idx} className="my-8 bg-surface-card border border-surface-border rounded-xl p-4 overflow-hidden animate-fade-in shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="flex items-center gap-2 text-xs font-bold text-primary-light/60 uppercase">
                <span className="material-icons-round text-sm">auto_awesome</span>
                AI Visual Suggestion
              </span>
              <button 
                onClick={() => handleGenerateImage(idx, promptText, altText)}
                disabled={imagePrompts[idx]?.isGenerating}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              >
                {imagePrompts[idx]?.isGenerating ? (
                  <span className="animate-spin material-icons-round text-sm">sync</span>
                ) : (
                  <span className="material-icons-round text-sm">palette</span>
                )}
                {imagePrompts[idx]?.generatedUrl ? 'Regenerate' : 'Generate Image'}
              </button>
            </div>
            {imagePrompts[idx]?.generatedUrl ? (
              <img src={imagePrompts[idx].generatedUrl} alt={altText} className="w-full h-auto rounded-lg mb-3" />
            ) : (
              <div className="h-24 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-600 mb-3 bg-black/20">
                <span className="material-icons-round">image</span>
                <p className="text-[10px] mt-1">이미지 생성이 준비되었습니다.</p>
              </div>
            )}
            <p className="text-[11px] text-gray-500 leading-tight"><span className="font-bold">Prompt:</span> {promptText}</p>
          </div>
        );
      }

      if (line.match(/\[Alt Tag:\s*.*?\]/)) return null;

      // Formatting markdown bold
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
      return <p key={idx} className="text-gray-300 mb-4 leading-relaxed text-[15px]" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  return (
    <div className="bg-surface-card rounded-2xl shadow-2xl border border-surface-border overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="border-b border-surface-border p-4 flex items-center justify-between bg-surface-dark/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-icons-round text-primary text-xl">history_edu</span>
          </div>
          <span className="font-bold text-sm tracking-tight">Draft Editor - <span className="text-gray-500">Dr. Nodak Edition</span></span>
        </div>
        <div className="flex gap-2">
          {isWriting && (
             <span className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse bg-primary/5 px-3 py-1 rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                Writing with AI...
             </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[#0e121d]">
        <div className="max-w-3xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Editor;
