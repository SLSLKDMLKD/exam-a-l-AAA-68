import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Mic, Square } from 'lucide-react';
import { DayPlan } from '../data/studyPlan';

interface AiAssistantProps {
  onReschedule: (taskId: string, targetDay: number) => void;
  onRescheduleMultiple: (taskIds: string[], targetDay: number) => void;
  onAssignRevision: (targetDay: number, subject: string, title: string, duration: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  completedTasks: string[];
  plan: DayPlan[];
  taskMarks: Record<string, number>;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onReschedule, onRescheduleMultiple, onAssignRevision, isOpen, setIsOpen, completedTasks, plan, taskMarks }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "ආයුබෝවන්! මම තමයි ඔයාගේ A/L 3A's Study Assistant. දවසෙ කරන්න බැරි වුන පාඩම් තවත් දවසකට ස්වයංක්‍රීයව (automatically) මාරු කරගන්න මට කියන්න." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const pureBase64 = base64data.split(',')[1];
          setIsLoading(true);
          try {
            const res = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: pureBase64 })
            });
            const data = await res.json();
            if (data.text) {
              setInput(prev => (prev + " " + data.text).trim());
            }
          } catch (e) {
            console.error("Transcribe failed:", e);
            alert("Microphone processing failed");
          } finally {
            setIsLoading(false);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use Voice Typing.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build context
      const today = new Date();
      const taskList = plan.flatMap(d => 
        d.tasks.map(t => ({ 
          day: d.day, 
          date: d.dateStr, 
          id: t.id, 
          title: t.title, 
          subject: t.subject,
          completed: completedTasks.includes(t.id),
          isPaper: t.isPaper,
          marks: taskMarks[t.id]
        }))
      );
      
      const missingTasksOverview = taskList.filter(t => !t.completed && new Date(t.date) < today);
      const paperMarksOverview = taskList.filter(t => t.isPaper && t.marks !== undefined).map(t => ({ title: t.title, marks: t.marks, subject: t.subject, day: t.day }));

      const context = {
        currentDate: today.toISOString().split('T')[0],
        allTasksInfo: "There are " + taskList.length + " tasks total. The target mark for an 'A' grade is 75%. Keep this in mind when analyzing performance.",
        missingTasks: missingTasksOverview.map(t => ({ id: t.id, title: t.title, scheduledDay: t.day })),
        paperPerformance: paperMarksOverview,
        instructions: "You can see the missing tasks and paper performance above. If the user asks why their marks are low (especially if below 75%), ask them diagnostic questions (e.g. time management, silly mistakes, lack of theory) and then suggest adding a revision task on an upcoming day to fix it. Use the 'assign_revision_task' tool to create custom remedial study tasks for them on upcoming days based on their weak areas."
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'model', content: data.content }]);
      
      if (data.action && data.action.type === 'reschedule_task') {
        onReschedule(data.action.taskId, data.action.targetDay);
      } else if (data.action && data.action.type === 'reschedule_multiple_tasks') {
        onRescheduleMultiple(data.action.taskIds, data.action.targetDay);
      } else if (data.action && data.action.type === 'assign_revision_task') {
        onAssignRevision(data.action.targetDay, data.action.subject, data.action.title, data.action.duration);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', content: 'සමාවෙන්න, තාක්ෂණික දෝෂයක්. පසුව උත්සාහ කරන්න.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all hover:scale-105 z-50 flex items-center justify-center animate-bounce-slow"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden flex-shrink-0 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Bot size={24} className="text-indigo-200" />
          <h3 className="font-bold">AI Study Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex gap-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
              <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none p-3 shadow-sm">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-100 pb-4">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading || isRecording}
            placeholder={isRecording ? "Listening..." : "Type your message..."}
            className={`flex-1 border border-gray-300 rounded-full py-2.5 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm ${isRecording ? 'bg-indigo-50 placeholder-indigo-500' : ''}`}
          />
          
          <button 
            type="button" 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading && !isRecording}
            className={`absolute right-12 top-2 p-1.5 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            title="Voice input via Groq Whisper"
          >
            {isRecording ? <Square size={14} /> : <Mic size={14} />}
          </button>

          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || isRecording}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
          >
            <Send size={14} className="m-[2px] -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
