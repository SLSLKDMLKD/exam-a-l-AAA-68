import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2, CheckCircle2, XCircle, BrainCircuit, Headphones, FileText, Share2, List, Mic, Volume2 } from 'lucide-react';
import { Task } from '../data/studyPlan';

interface AudioLessonEngineProps {
  task: Task;
  onClose: () => void;
  onComplete: () => void;
}

export const AudioLessonEngine: React.FC<AudioLessonEngineProps> = ({ task, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState("");
  
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizEvaluated, setQuizEvaluated] = useState(false);
  
  const [lessonFinished, setLessonFinished] = useState(false);
  const [finalNotes, setFinalNotes] = useState<any>(null);
  
  const [previousContext, setPreviousContext] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const fallbackToBrowserTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'si-LK';
      utterance.onend = () => {
        setIsPlaying(false);
        if (lessonFinished && !quizEvaluated) {
          onComplete();
        }
      };
      utterance.onstart = () => setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setIsPlaying(false);
        if (lessonFinished && !quizEvaluated) onComplete();
      }, 4000);
    }
  };

  const fetchSegment = async (currentStep: number, context: string) => {
    setIsGenerating(true);
    setAudioUrl(null);
    setCaptions("");
    setActiveQuiz(null);
    setSelectedAnswer(null);
    setQuizEvaluated(false);

    try {
      // 1. Get Text & Quiz from AI
      const res = await fetch('/api/generate-lesson-segment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: task.subject, topic: task.title, stepNum: currentStep, previousStepsContext: context })
      });
      const segmentData = await res.json();
      
      if (!res.ok || segmentData.error) {
        setCaptions("Sorry, the AI is overwhelmed. Please try again later. (Error: " + (segmentData.message || segmentData.error) + ")");
        setIsGenerating(false);
        return;
      }
      
      if (segmentData.isEnd) {
        setLessonFinished(true);
        setFinalNotes({
          notes: segmentData.notes,
          shortNote: segmentData.shortNote,
          mindMapKeywords: segmentData.mindMapKeywords
        });
      }

      setCaptions(segmentData.teacherText);
      setActiveQuiz(segmentData.quiz);
      setPreviousContext(prev => prev + " " + segmentData.notes);

      // 2. Convert to Audio (TTS)
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: segmentData.teacherText })
      });
      const ttsData = await ttsRes.json();
      
      if (ttsRes.ok && ttsData.audioBase64) {
        const mimeType = ttsData.mimeType || 'audio/wav';
        const url = `data:${mimeType};base64,${ttsData.audioBase64}`;
        setAudioUrl(url);
      } else {
        fallbackToBrowserTTS(segmentData.teacherText);
      }
      
      setIsGenerating(false);
      
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.log('Auto-play blocked', e));
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    // Start first segment
    fetchSegment(1, "");
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (lessonFinished && !quizEvaluated) { // Completed
      onComplete();
    }
  };

  const handleQuizAnswer = async (index: number) => {
    if (quizEvaluated) return;
    setSelectedAnswer(index);
    setQuizEvaluated(true);
    
    setIsGenerating(true);
    const isCorrect = index === activeQuiz.correctAnswerIndex;
    
    try {
      const res = await fetch('/api/evaluate-lesson-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect, explanation: activeQuiz.explanation })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setCaptions("Feedback unavailable right now due to server load. Moving to next part.");
        setIsGenerating(false);
        return;
      }
      
      setCaptions(data.teacherReaction);
      
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.teacherReaction })
      });
      const ttsData = await ttsRes.json();
      
      if (ttsRes.ok && ttsData.audioBase64) {
        const mimeType = ttsData.mimeType || 'audio/wav';
        setAudioUrl(`data:${mimeType};base64,${ttsData.audioBase64}`);
        // Audio auto-plays due to effect. Once it ends, we want to go to next step.
        // We can hook to onEnded, but we need to know we are in evaluation phase.
        // Let's use a simpler approach: Just manually move to next step when user clicks "Continue to Next Part"
      } else {
        fallbackToBrowserTTS(data.teacherReaction);
      }
      setIsGenerating(false);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  const handleNextStep = () => {
    setStep(s => s + 1);
    fetchSegment(step + 1, previousContext);
  };

  const togglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 overflow-y-auto flex flex-col font-sans">
      <div className="sticky top-0 bg-[#1e293b]/80 backdrop-blur-md border-b border-white/10 p-4 z-10 flex justify-between items-center px-8">
        <div className="flex items-center gap-4 text-white">
          <Headphones size={28} className="text-cyan-400" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Interactive Audio Lesson</h1>
            <p className="text-cyan-400/80 text-sm">{task.title}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition">Leave Lesson</button>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* Audio Player Core Area */}
        <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <Loader2 size={48} className="animate-spin text-cyan-400" />
                <p className="text-cyan-200/80 tracking-widest uppercase text-sm font-bold">Teacher is preparing...</p>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 rounded-full bg-cyan-900/50 border-4 border-cyan-400/50 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,211,238,0.2)]">
                  {isPlaying ? (
                    <Volume2 size={48} className="text-cyan-400 animate-pulse" />
                  ) : (
                    <Headphones size={48} className="text-cyan-500/50" />
                  )}
                </div>

                <div className="w-full bg-black/40 rounded-2xl p-6 min-h-[100px] border border-white/5 mb-8 flex items-center justify-center">
                  <p className="text-lg text-white/90 text-center leading-relaxed font-medium">
                    {captions || "Listening..."}
                  </p>
                </div>

                <button 
                  onClick={togglePlay}
                  disabled={!audioUrl && !('speechSynthesis' in window)}
                  className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#0f172a] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Quiz Area: Visible only if audio has ended (not playing) and there's a quiz, or we've answered it */}
        {activeQuiz && !isPlaying && !isGenerating && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <BrainCircuit className="text-purple-400" />
              Teacher's Question (Quiz Time!)
            </h3>
            
            <p className="text-lg text-white/90 mb-6">{activeQuiz.question}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuiz.options.map((opt: string, idx: number) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectMatch = activeQuiz.correctAnswerIndex === idx;
                
                let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white";
                if (quizEvaluated) {
                  if (isCorrectMatch) btnClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200";
                  else if (isSelected) btnClass = "bg-red-500/20 border-red-500/50 text-red-200";
                  else btnClass = "bg-white/5 border-white/10 opacity-50 text-white/50";
                }

                return (
                  <button
                    key={idx}
                    disabled={quizEvaluated}
                    onClick={() => handleQuizAnswer(idx)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {quizEvaluated && isCorrectMatch && <CheckCircle2 className="text-emerald-400" />}
                    {quizEvaluated && isSelected && !isCorrectMatch && <XCircle className="text-red-400" />}
                  </button>
                );
              })}
            </div>

            {quizEvaluated && (
              <div className="mt-8 flex justify-end animate-in fade-in">
                <button onClick={handleNextStep} className="bg-white text-[#0f172a] font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition">
                  Continue Lesson
                </button>
              </div>
            )}
          </div>
        )}

        {/* Final Notes Area */}
        {lessonFinished && finalNotes && !isGenerating && !isPlaying && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 animate-in fade-in duration-700 space-y-8">
            <h2 className="text-2xl font-black text-white text-center border-b border-white/10 pb-6 mb-8">Lesson Complete</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/20 rounded-2xl p-6">
                <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <List size={20} /> Short Note
                </h3>
                <p className="text-white/80 whitespace-pre-wrap">{finalNotes.shortNote}</p>
              </div>
              
              <div className="bg-black/20 rounded-2xl p-6">
                <h3 className="text-purple-400 font-bold mb-4 flex items-center gap-2">
                  <Share2 size={20} /> Mind Map Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {finalNotes.mindMapKeywords.map((k: string, i: number) => (
                    <span key={i} className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-full text-sm">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-2xl p-6">
              <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
                <FileText size={20} /> Full Note
              </h3>
              <div className="text-white/80 whitespace-pre-wrap prose prose-invert max-w-none">
                {finalNotes.notes}
              </div>
            </div>
            
            <div className="flex justify-center pt-8">
              <button onClick={() => { onComplete(); onClose(); }} className="bg-emerald-500 text-white font-black px-12 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition">
                Mark as Mastered
              </button>
            </div>
          </div>
        )}

      </div>

      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnded}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
};
