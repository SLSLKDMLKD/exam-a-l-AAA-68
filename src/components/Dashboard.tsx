import React, { useState, useEffect } from 'react';
import { DayPlan } from '../data/studyPlan';
import { CheckCircle, Clock, BookOpen, Target, Trophy, Calendar } from 'lucide-react';

interface DashboardProps {
  completedTasks: string[];
  plan: DayPlan[];
  taskMarks?: Record<string, number>;
  examDate?: string;
  setExamDate?: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ completedTasks, plan, taskMarks = {}, examDate = '', setExamDate }) => {
  const allTasks = plan.flatMap(day => day.tasks);
  const totalTasks = allTasks.length;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    if (!examDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(examDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // update every minute

    return () => clearInterval(timer);
  }, [examDate]);
  
  const subjects = {
    Accounting: allTasks.filter(t => t.subject === 'Accounting'),
    BusinessStudies: allTasks.filter(t => t.subject === 'Business Studies'),
    ICT: allTasks.filter(t => t.subject === 'ICT'),
  };

  const getProgress = (tasks: typeof allTasks) => {
    const completed = tasks.filter(t => completedTasks.includes(t.id)).length;
    return {
      completed,
      total: tasks.length,
      percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  };

  const overall = getProgress(allTasks);
  const accProgress = getProgress(subjects.Accounting);
  const bsProgress = getProgress(subjects.BusinessStudies);
  const ictProgress = getProgress(subjects.ICT);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentDayPlan = plan.find(p => p.dateStr === todayStr) || plan[0];
  const currentPhase = currentDayPlan.phasePhaseNumber;

  const getAverageMarks = (tasks: typeof allTasks) => {
    const papers = tasks.filter(t => t.isPaper && taskMarks[t.id] !== undefined);
    if (papers.length === 0) return 0;
    const sum = papers.reduce((acc, t) => acc + taskMarks[t.id], 0);
    return Math.round(sum / papers.length);
  };

  const overallAverage = getAverageMarks(allTasks);

  return (
    <div className="space-y-6">
      {/* Hero Widget */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -tr-16 -mt-16 mr-[-50px] opacity-10 pointer-events-none">
          <Trophy size={300} />
        </div>
        <div className="relative z-10 w-full md:w-2/3">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-sans leading-tight">උසස් පෙළ AAA මෙහෙයුම<br/>(Operation 3As)</h2>
          <p className="text-indigo-200 text-lg mb-6 leading-relaxed">
            "දින 85ක් තුළ ගිණුම්කරණය, ව්‍යාපාර අධ්‍යයනය හා ICT සඳහා 100% විශ්වාසවන්ත A සාමාර්ථ 3ක් කරා ගමන් කිරීමේ ක්‍රමානුකූල වැඩපිළිවෙල."
          </p>
          <div className="flex items-center space-x-4 bg-white/10 w-fit px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 flex-wrap gap-y-4">
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Target Score</p>
              <p className="text-3xl font-black text-white">AAA</p>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/20"></div>
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Task Progress</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-green-400">{overall.percentage}%</span>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/20"></div>
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Avg Paper Marks</p>
              <div className="flex items-baseline space-x-1">
                <span className={`text-3xl font-black ${overallAverage >= 75 ? 'text-green-400' : 'text-orange-400'}`}>
                  {overallAverage > 0 ? `${overallAverage}%` : '-'}
                </span>
              </div>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/20"></div>
            <div>
              <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">විභාගයට තව</p>
              {examDate ? (
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-yellow-400">{timeLeft.days} <span className="text-lg">දින</span></span>
                  <span className="text-xl font-bold text-yellow-200">{timeLeft.hours} <span className="text-sm">පැය</span></span>
                  <button onClick={() => setExamDate?.('')} className="text-xs ml-2 underline text-indigo-300 hover:text-white">වෙනස් කරන්න</button>
                </div>
              ) : (
                <div className="flex items-center mt-1">
                   <input 
                     type="datetime-local" 
                     className="bg-white/10 text-white border border-white/20 rounded px-2 py-1 text-sm outline-none focus:border-white max-w-[180px]"
                     onChange={(e) => setExamDate?.(e.target.value)}
                   />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Accounting" icon={<Target className="text-blue-500" />} progress={accProgress} color="blue" avgMark={getAverageMarks(subjects.Accounting)} />
        <StatCard title="Business Studies" icon={<BookOpen className="text-emerald-500" />} progress={bsProgress} color="emerald" avgMark={getAverageMarks(subjects.BusinessStudies)} />
        <StatCard title="ICT" icon={<Clock className="text-orange-500" />} progress={ictProgress} color="orange" avgMark={getAverageMarks(subjects.ICT)} />
      </div>

      {/* Golden Rules */}
      <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="text-yellow-400" size={28} />
          <h3 className="text-2xl font-bold">The Golden Rules for {currentPhase === 1 ? "Routine A" : currentPhase === 2 ? "Routine B" : "Phase 3: Speed & Simulation"}</h3>
        </div>
        {currentPhase === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span> Essay Structuring</h4>
              <p className="text-gray-300 text-sm leading-relaxed">රචනා ප්‍රශ්නයක හැඳින්වීම සහ ප්‍රධාන ලකුණු ලැබෙන Keywords පමණක් මාතෘකා ලෙස ව්‍යුහගත කිරීම.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span> Daily MCQ Sprint</h4>
              <p className="text-gray-300 text-sm leading-relaxed">විනාඩි 30න් පරණ පේපර් එකකින් Random MCQ 15ක් ටයිම් කර වැරදි අඩුවෙන් හා වේගයෙන් හැදීම.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span> Live Execution</h4>
              <p className="text-gray-300 text-sm leading-relaxed">Python, SQL, ER Diagrams අතින් ලියා පුහුණුවීම සහ කෝඩ් එක PC/Phone එකක දමා Run කර Errors (Debugging) බැලීම.</p>
            </div>
          </div>
        ) : currentPhase === 2 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span> The Error Log Drill</h4>
              <p className="text-gray-300 text-sm leading-relaxed">පේපර් එක ලියන්න කලින්, වැරදුණු පොත (Error Log) සහ විෂයට අදාළ කෙටි සටහන් කියවා මනස සූදානම් කිරීම.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span> Body-Clock Simulation</h4>
              <p className="text-gray-300 text-sm leading-relaxed">සැබෑ විභාග වෙලාවටම (උදේ 08:30 සිට) පේපර් එක ලිවීම. කිසිම හේතුවක් නිසා පේපර් එක කරන අතරතුර පොත් පෙරළන්න හෝ නැගිටලා යන්න එපා.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span> Ruthless Review</h4>
              <p className="text-gray-300 text-sm leading-relaxed">නිල Marking Scheme සහ Examiners' Report බලාගෙන තදින්ම ලකුණු දීම සහ වැරදි Error Log එකට දැමීම.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span> Dynamic Timing Challenge</h4>
              <p className="text-gray-300 text-sm leading-relaxed">සමහර පේපර්ස් විනාඩි 90න් වේගය බැලීමටත්, සමහර පේපර්ස් විනාඩි 120ම තබා Double-Checking පුරුද්ද හැදීමටත් යොදාගැනීම.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span> Speed Run Strictness</h4>
              <p className="text-gray-300 text-sm leading-relaxed">සැබෑ විභාග වෙලාවටම අඛණ්ඩව පැය 3ක් ලිවීම (ලකුණකට විනාඩි 1.5ක දැඩි සීමාව යටතේ).</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <h4 className="font-bold text-yellow-400 mb-2 flex items-center"><span className="bg-yellow-400/20 text-yellow-400 rounded w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span> Deep Review & Elimination</h4>
              <p className="text-gray-300 text-sm leading-relaxed">නිල මාකින් ස්කීම් බලා වැරදුණු තාක්ෂණික වචන, Accounting adjustments සහ ICT syntax වැරදි Error Log එකට දැමීම.</p>
            </div>
          </div>
        )}
        <div className="mt-6 text-center border-t border-white/10 pt-6 font-mono text-gray-400 text-sm">
          "Ruthless execution beats any talent. Follow the plan, get the AAA."
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, icon, progress, color, avgMark }: any) => {
  // We use inline styles for dynamic width based on progress
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-black text-gray-900">{progress.percentage}%</span>
          <span className="text-sm font-medium text-gray-500 mb-1">{progress.completed} / {progress.total} Tasks</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${bgColors[color]}`}
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
          <span className="text-sm font-bold text-gray-600">Avg Paper Marks</span>
          <span className={`text-sm font-black px-2 py-1 rounded-md ${avgMark >= 75 ? 'bg-green-100 text-green-700' : avgMark > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-500'}`}>
            {avgMark > 0 ? `${avgMark}%` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
