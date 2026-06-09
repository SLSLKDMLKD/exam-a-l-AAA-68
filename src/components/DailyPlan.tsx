import React, { useState, useMemo } from 'react';
import { generate85DayPlan, DayPlan, Task } from '../data/studyPlan';
import { Check, ChevronRight, PlayCircle, CalendarCheck, Lock, PenTool, Headphones } from 'lucide-react';
import { TestEngine } from './TestEngine';
import { AudioLessonEngine } from './AudioLessonEngine';

interface DailyPlanProps {
  completedTasks: string[];
  toggleTask: (taskId: string) => void;
  plan: DayPlan[];
  taskMarks: Record<string, number>;
  updateMark: (taskId: string, marks: number) => void;
  triggerRevision: (subject: string, title: string) => void;
}

export const DailyPlan: React.FC<DailyPlanProps> = ({ completedTasks, toggleTask, plan, taskMarks, updateMark, triggerRevision }) => {
  const [activeTest, setActiveTest] = useState<Task | null>(null);
  const [activeAudioLesson, setActiveAudioLesson] = useState<Task | null>(null);

  // Find current active day (first day that is not 100% complete)
  const calculateCurrentDay = () => {
    for (const day of plan) {
      if (day.tasks.length === 0) continue; // if a day has 0 tasks, ignore it for active calculation
      const allDone = day.tasks.every(t => completedTasks.includes(t.id));
      if (!allDone) return day.day;
    }
    return 85;
  };

  const [selectedDay, setSelectedDay] = useState<number>(calculateCurrentDay());


  const activeDayData = plan.find(d => d.day === selectedDay)!;

  const phases = [
    { num: 1, name: 'Routine A (01-22)', days: plan.filter(d => d.phasePhaseNumber === 1) },
    { num: 2, name: 'Routine B (23-62)', days: plan.filter(d => d.phasePhaseNumber === 2) },
    { num: 3, name: 'Phase 3 (63-65)', days: plan.filter(d => d.phasePhaseNumber === 3) },
    { num: 4, name: 'Phase 4: BS (66-70)', days: plan.filter(d => d.phasePhaseNumber === 4) },
    { num: 5, name: 'Phase 5: Acct (71-77)', days: plan.filter(d => d.phasePhaseNumber === 5) },
    { num: 6, name: 'Phase 6: ICT (78-85)', days: plan.filter(d => d.phasePhaseNumber === 6) },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Day Selector Sidebar */}
      <div className="w-full lg:w-1/3 flex-shrink-0 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CalendarCheck className="mr-2 text-indigo-600" />
            දින දර්ශනය (Plan Calendar)
          </h3>
          
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {phases.map(phase => (
              <div key={phase.num}>
                <h4 className="text-sm font-bold tracking-tight text-gray-400 uppercase mb-3">
                  {phase.name}
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {phase.days.map(d => {
                    const isAllDone = d.tasks.every(t => completedTasks.includes(t.id));
                    const isSelected = selectedDay === d.day;
                    return (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDay(d.day)}
                        className={`
                          aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200
                          ${isSelected 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-110 z-10' 
                            : isAllDone
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-200'}
                        `}
                      >
                        {d.day}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task List Content */}
      <div className="w-full lg:w-2/3">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-indigo-50 border-b border-indigo-100 p-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
                {activeDayData.phase.split(':')[0]}
              </div>
              <h2 className="text-3xl font-black text-gray-900">
                Day {activeDayData.day}
                <span className="text-xl font-medium text-indigo-600 bg-white/60 px-3 py-1 rounded-lg ml-3 shadow-sm">
                  {new Date(activeDayData.dateStr).toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </h2>
              <p className="text-indigo-800 font-medium mt-2">{activeDayData.phase.split(':')[1]?.trim() || activeDayData.phase}</p>
            </div>
            
            <div className="flex -space-x-2">
               {activeDayData.tasks.map((task, idx) => (
                  <div key={idx} className={`w-3 h-3 rounded-full border-2 border-white ${completedTasks.includes(task.id) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
               ))}
            </div>
          </div>

          <div className="p-8 space-y-4">
            {activeDayData.tasks.map((task) => {
              const isDone = completedTasks.includes(task.id);
              
              const subjectColors = {
                'Accounting': 'bg-blue-50 text-blue-700 border-blue-200',
                'Business Studies': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                'ICT': 'bg-orange-50 text-orange-700 border-orange-200',
                'General': 'bg-purple-50 text-purple-700 border-purple-200'
              };
              
              const badgeColor = subjectColors[task.subject as keyof typeof subjectColors] || subjectColors.General;

              return (
                <div 
                  key={task.id} 
                  className={`
                    group p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4
                    ${isDone ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-100 hover:border-indigo-300'}
                  `}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`
                    shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 mt-0.5 cursor-pointer
                    ${isDone ? 'bg-emerald-500 text-white' : 'bg-gray-100 group-hover:bg-indigo-100 text-gray-400 group-hover:text-indigo-600'}
                  `}>
                    <Check size={18} strokeWidth={3} className={isDone ? 'opacity-100' : 'opacity-0'} />
                  </button>

                  <div className="flex-1 cursor-pointer" onClick={() => !task.isPaper && toggleTask(task.id)}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${badgeColor}`}>
                        {task.subject}
                      </span>
                      <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                        <PlayCircle size={12} className="mr-1" />
                        {task.duration}
                      </span>
                    </div>
                    <h4 className={`text-lg font-bold ${isDone ? 'text-gray-500 line-through decoration-emerald-500 decoration-2' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                  </div>
                  
                  {task.isPaper && (
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Marks %</label>
                      <input 
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={taskMarks[task.id] || ''}
                        onChange={(e) => updateMark(task.id, Number(e.target.value))}
                        className={`w-16 h-10 text-center font-black text-lg rounded-xl border-2 focus:outline-none focus:ring-0 ${isDone && taskMarks[task.id] ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-gray-200 text-gray-700 bg-white focus:border-indigo-500'}`}
                      />
                    </div>
                  )}

                  {isDone && !task.isPaper && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveTest(task); }}
                      className="shrink-0 ml-4 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <PenTool size={16} />
                      Take Test
                    </button>
                  )}
                  {!isDone && !task.isPaper && task.subject === 'Business Studies' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveAudioLesson(task); }}
                      className="shrink-0 ml-4 flex items-center justify-center gap-2 bg-cyan-500 text-white border border-cyan-600 hover:bg-cyan-600 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm animate-pulse"
                    >
                      <Headphones size={16} />
                      Audio Lesson
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {activeTest && (
        <TestEngine 
          task={activeTest} 
          onClose={() => setActiveTest(null)} 
          onComplete={(score) => {
            updateMark(activeTest.id, score);
          }}
          triggerRevision={triggerRevision}
        />
      )}

      {activeAudioLesson && (
        <AudioLessonEngine 
          task={activeAudioLesson} 
          onClose={() => setActiveAudioLesson(null)} 
          onComplete={() => {
            toggleTask(activeAudioLesson.id);
            setActiveAudioLesson(null);
          }}
        />
      )}
    </div>
  );
};
