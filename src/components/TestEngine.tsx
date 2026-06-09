import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronRight, BrainCircuit } from 'lucide-react';
import { Task } from '../data/studyPlan';

export interface TestPaper {
  mcqs: { question: string; options: string[]; correctAnswerIndex: number; explanation: string; }[];
  fillInBlanks: { questionTextWithBlank: string; options: string[]; correctAnswer: string; explanation: string; }[];
  essays: { question: string; }[];
}

interface TestEngineProps {
  task: Task;
  onClose: () => void;
  onComplete: (score: number) => void;
  triggerRevision: (subject: string, title: string) => void;
}

export const TestEngine: React.FC<TestEngineProps> = ({ task, onClose, onComplete, triggerRevision }) => {
  const [paper, setPaper] = useState<TestPaper | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<number, string>>({});
  
  const [essayInputs, setEssayInputs] = useState<Record<number, { text: string; imageBase64: string }>>({});
  const [essayResults, setEssayResults] = useState<Record<number, { score: number, feedback: string }>>({});
  const [evaluatingEssays, setEvaluatingEssays] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const res = await fetch('/api/generate-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: task.subject, topic: task.title })
        });
        const data = await res.json();
        setPaper(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [task]);

  const handleImageUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setEssayInputs(prev => ({
          ...prev,
          [index]: { ...prev[index], imageBase64: e.target!.result as string }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!paper) return;
    setEvaluatingEssays(true);

    try {
      // Evaluate essays via AI
      const eResults: Record<number, { score: number, feedback: string }> = {};
      let essayTotalScore = 0;

      for (let i = 0; i < paper.essays.length; i++) {
        const input = essayInputs[i];
        if (input?.text || input?.imageBase64) {
          const res = await fetch('/api/evaluate-essay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subject: task.subject,
              question: paper.essays[i].question,
              answerText: input.text,
              imageBase64: input.imageBase64
            })
          });
          const evalData = await res.json();
          eResults[i] = evalData;
          essayTotalScore += evalData.score || 0;
        } else {
          eResults[i] = { score: 0, feedback: "පිළිතුරක් සපයා නැත." };
        }
      }
      setEssayResults(eResults);

      // Evaluate MCQs and Fill in blanks
      let correctObj = 0;
      let totalObj = paper.mcqs.length + (paper.fillInBlanks?.length || 0);

      paper.mcqs.forEach((q, i) => {
        if (mcqAnswers[i] === q.correctAnswerIndex) correctObj++;
      });
      paper.fillInBlanks?.forEach((q, i) => {
        if (fillAnswers[i] === q.correctAnswer) correctObj++;
      });

      const objScore = totalObj > 0 ? (correctObj / totalObj) * 100 : 0;
      const essScore = paper.essays.length > 0 ? essayTotalScore / paper.essays.length : 100;
      
      const overall = Math.round((objScore * 0.6) + (essScore * 0.4));
      setFinalScore(overall);
      setSubmitted(true);
      
      if (overall < 75) {
        triggerRevision(task.subject, `${task.title} - Revision (Score: ${overall}%)`);
      }
      onComplete(overall);

    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingEssays(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <BrainCircuit size={64} className="text-indigo-600 animate-pulse mb-6" />
        <h2 className="text-2xl font-black text-gray-800 text-center uppercase tracking-wider mb-2">Generating A/L Standard Paper</h2>
        <p className="text-gray-500 font-medium">අධි තාක්ෂණික AI මගින් ප්‍රශ්න පත්‍රය සැකසෙමින් පවතී...</p>
      </div>
    );
  }

  if (!paper) return <div>Error loading test</div>;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white min-h-screen shadow-xl border-x border-gray-200 pb-20">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-6 z-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Evaluation Paper</h1>
            <p className="text-indigo-600 font-bold">{task.title}</p>
          </div>
          {submitted && finalScore !== null ? (
            <div className={`px-6 py-2 rounded-2xl border-4 font-black text-2xl ${finalScore >= 75 ? 'border-green-400 text-green-600 bg-green-50' : 'border-red-400 text-red-600 bg-red-50'}`}>
              {finalScore}% {finalScore >= 75 ? ' - A Grade' : ' - Needs Revision'}
            </div>
          ) : (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
          )}
        </div>

        <div className="p-8 space-y-12">
          {/* MCQs */}
          <section>
            <h2 className="text-xl font-bold bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100 mb-6 flex items-center">
              <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-lg mr-3">1</span>
              බහුවරණ ප්‍රශ්න (MCQ) - {paper.mcqs.length} Questions
            </h2>
            <div className="space-y-8">
              {paper.mcqs.map((q, i) => {
                const isCorrect = submitted && mcqAnswers[i] === q.correctAnswerIndex;
                const isWrong = submitted && mcqAnswers[i] !== q.correctAnswerIndex && mcqAnswers[i] !== undefined;

                return (
                  <div key={i} className={`p-6 rounded-2xl border-2 ${submitted ? (isCorrect ? 'border-emerald-200 bg-emerald-50/30' : isWrong ? 'border-red-200 bg-red-50/30' : 'border-gray-200') : 'border-gray-100 hover:border-indigo-100'}`}>
                    <p className="font-bold text-gray-800 mb-4 whitespace-pre-wrap">{i + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label key={optIdx} className="flex items-center p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors">
                          <input 
                            type="radio" 
                            name={`mcq-${i}`} 
                            checked={mcqAnswers[i] === optIdx}
                            onChange={() => !submitted && setMcqAnswers(prev => ({ ...prev, [i]: optIdx }))}
                            disabled={submitted}
                            className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-gray-700">{opt}</span>
                          {submitted && q.correctAnswerIndex === optIdx && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
                          {submitted && isWrong && mcqAnswers[i] === optIdx && <XCircle className="ml-auto text-red-500" size={20} />}
                        </label>
                      ))}
                    </div>
                    {submitted && (
                      <div className={`mt-4 p-4 rounded-xl text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        <strong>විවරණය (Explanation):</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Fill in the blanks (Business Studies) */}
          {paper.fillInBlanks && paper.fillInBlanks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 mb-6 flex items-center">
                <span className="bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-lg mr-3">2</span>
                හිස්තැන් පිරවීම (Fill-in-the-blanks)
              </h2>
              <div className="space-y-6">
                {paper.fillInBlanks.map((q, i) => (
                  <div key={i} className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
                    <p className="font-bold text-gray-800 mb-4">{q.questionTextWithBlank}</p>
                    <div className="flex flex-wrap gap-3">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => setFillAnswers(prev => ({ ...prev, [i]: opt }))}
                          className={`px-4 py-2 rounded-xl font-bold border-2 transition-colors ${fillAnswers[i] === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {submitted && (
                      <div className="mt-4 p-4 rounded-xl bg-blue-50 text-blue-800 text-sm">
                        <span className="font-bold block mb-1">නිවැරදි පිළිතුර: {q.correctAnswer}</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Essays */}
          <section>
            <h2 className="text-xl font-bold bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-100 mb-6 flex items-center">
              <span className="bg-orange-600 text-white w-8 h-8 flex items-center justify-center rounded-lg mr-3">3</span>
              රචනා ප්‍රශ්න (Essay Questions)
            </h2>
            <div className="space-y-8">
              {paper.essays.map((q, i) => (
                <div key={i} className="p-6 rounded-2xl border-2 border-gray-100 bg-white">
                  <p className="font-bold text-gray-800 mb-4 whitespace-pre-wrap">{i + 1}. {q.question}</p>
                  
                  {!submitted ? (
                    <div className="space-y-4">
                      {/* Image Upload for handwritten essays */}
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                        <Upload className="text-gray-500" />
                        <div>
                          <p className="font-bold text-gray-700">උත්තරය Upload කරන්න (Upload Image)</p>
                          <p className="text-xs text-gray-500">ලියා ඇති පිළිතුරේ ඡායාරූපයක් එක් කරන්න</p>
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) handleImageUpload(i, e.target.files[0]);
                        }} />
                      </label>
                      {essayInputs[i]?.imageBase64 && (
                        <div className="relative inline-block border-2 border-indigo-200 rounded-xl overflow-hidden">
                          <img src={essayInputs[i].imageBase64} alt="Answer" className="max-h-32 object-contain" />
                        </div>
                      )}
                      
                      <div className="text-center text-sm font-bold text-gray-400">OR</div>
                      
                      {/* Typing fallback */}
                      <textarea 
                        className="w-full min-h-[150px] p-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 custom-scrollbar"
                        placeholder="මෙහි පිළිතුර ටයිප් කරන්න..."
                        value={essayInputs[i]?.text || ''}
                        onChange={(e) => setEssayInputs(prev => ({ ...prev, [i]: { ...prev[i], text: e.target.value } }))}
                      />
                    </div>
                  ) : (
                    <div className="bg-orange-50/50 p-5 rounded-xl border border-orange-200">
                      <div className="flex items-center justify-between mb-3 border-b border-orange-200 pb-3">
                        <h4 className="font-black text-orange-900">AI Examiner Evaluation</h4>
                        <span className="font-black text-2xl text-orange-600">{essayResults[i]?.score}%</span>
                      </div>
                      <p className="text-orange-900 whitespace-pre-wrap text-sm leading-relaxed">
                        {essayResults[i]?.feedback}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Controls */}
          {!submitted ? (
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button 
                onClick={handleSubmit} 
                disabled={evaluatingEssays}
                className="bg-indigo-600 text-white font-black text-lg px-8 py-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center"
              >
                {evaluatingEssays ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                {evaluatingEssays ? 'AI Evaluating...' : 'Submit Answers'}
              </button>
            </div>
          ) : (
            <div className="pt-6 border-t border-gray-200">
              <div className="bg-gray-900 text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-black mb-2">ප්‍රතිඵලය (Result)</h3>
                  <p className="text-gray-400 font-medium">අඩුපාඩු හඳුනා ගෙන ඊළඟ පාඩමට යන්න.</p>
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-black ${finalScore! >= 75 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {finalScore}%
                  </div>
                  {finalScore! < 75 && (
                    <span className="inline-block mt-2 text-sm font-bold px-3 py-1 bg-white/20 rounded-full text-orange-100 border border-white/10">
                      Revision Added Automatically
                    </span>
                  )}
                </div>
                <button onClick={onClose} className="bg-white text-gray-900 font-black px-8 py-4 rounded-full hover:bg-gray-100 transition-colors w-full sm:w-auto">
                  Back to Plan
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
