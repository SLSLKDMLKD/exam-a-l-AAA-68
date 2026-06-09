import { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Dashboard } from './components/Dashboard';
import { DailyPlan } from './components/DailyPlan';
import { PastPapers } from './components/PastPapers';
import { MemoryNotes } from './components/MemoryNotes';
import { AiAssistant } from './components/AiAssistant';
import { generate85DayPlan, Task } from './data/studyPlan';
import { BookMarked, LayoutDashboard, CalendarDays, FileText, BrainCircuit } from 'lucide-react';

export default function App() {
  const [completedTasks, setCompletedTasks] = useLocalStorage<string[]>('al-planner-completed', []);
  const [rescheduledTasks, setRescheduledTasks] = useLocalStorage<Record<string, number>>('al-planner-rescheduled', {});
  const [extraTasks, setExtraTasks] = useLocalStorage<{ day: number, task: Task }[]>('al-planner-extra', []);
  const [taskMarks, setTaskMarks] = useLocalStorage<Record<string, number>>('al-planner-marks', {});
  const [examDate, setExamDate] = useLocalStorage<string>('al-planner-exam-date', '');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plan' | 'pastpapers' | 'memory'>('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Generate base plan and apply overrides
  const plan = useMemo(() => {
    const basePlan = generate85DayPlan();
    
    // Create a deep copy to avoid mutating the original
    const modifiedPlan = basePlan.map(day => ({
      ...day,
      tasks: [...day.tasks]
    }));

    // Apply rescheduled tasks
    Object.entries(rescheduledTasks).forEach(([taskId, targetDay]) => {
      // Find where the task currently is
      let sourceTaskIndex = -1;
      let sourceDayIndex = -1;
      let taskToMove = null;

      for (let i = 0; i < modifiedPlan.length; i++) {
        const foundIdx = modifiedPlan[i].tasks.findIndex(t => t.id === taskId);
        if (foundIdx !== -1) {
          sourceDayIndex = i;
          sourceTaskIndex = foundIdx;
          taskToMove = { ...modifiedPlan[i].tasks[foundIdx] };
          break;
        }
      }

      if (taskToMove && sourceDayIndex !== -1) {
        // Remove from source day
        modifiedPlan[sourceDayIndex].tasks.splice(sourceTaskIndex, 1);
        
        // Add to target day
        const targetDayIndex = modifiedPlan.findIndex(d => d.day === targetDay);
        if (targetDayIndex !== -1) {
          modifiedPlan[targetDayIndex].tasks.push(taskToMove);
        }
      }
    });

    // Apply extra tasks
    extraTasks.forEach(extra => {
      const targetDayIndex = modifiedPlan.findIndex(d => d.day === extra.day);
      if (targetDayIndex !== -1) {
        modifiedPlan[targetDayIndex].tasks.push(extra.task);
      }
    });

    return modifiedPlan;
  }, [rescheduledTasks, extraTasks]);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleReschedule = (taskId: string, targetDay: number) => {
    if (targetDay >= 1 && targetDay <= 85) {
      setRescheduledTasks(prev => ({ ...prev, [taskId]: targetDay }));
    }
  };

  const handleRescheduleMultiple = (taskIds: string[], targetDay: number) => {
    if (targetDay >= 1 && targetDay <= 85) {
      setRescheduledTasks(prev => {
        const updated = { ...prev };
        taskIds.forEach(id => {
          updated[id] = targetDay;
        });
        return updated;
      });
    }
  };

  const handleAssignRevision = (targetDay: number, subject: string, title: string, duration: string) => {
    const newTask: Task = {
      id: `rev-${Date.now()}`,
      subject: subject as any,
      title,
      duration
    };
    setExtraTasks(prev => [...prev, { day: targetDay, task: newTask }]);
  };

  const autoTriggerRevision = (subject: string, title: string) => {
    // Automatically find an upcoming day to add a revision task.
    // We'll just add it to Day + 2 of whatever day it is, or end of the plan.
    const newTask: Task = {
      id: `rev-auto-${Date.now()}`,
      subject: subject as any,
      title,
      duration: '1.5 Hours'
    };
    const nextAvailableDay = 50; // Just as a fallback or could calculate exactly
    // More dynamic calculation: find first empty or light day?
    // Let's just append to day 75 for now as a dedicated revision slot.
    setExtraTasks(prev => [...prev, { day: 75, task: newTask }]);
  };

  const updateMark = (taskId: string, marks: number) => {
    setTaskMarks(prev => ({ ...prev, [taskId]: marks }));
    if (!completedTasks.includes(taskId)) {
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-indigo-200">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookMarked className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-xl font-black tracking-tight text-gray-900">
                A/L 3A's Planner
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center ${
                  activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={18} className="mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center ${
                  activeTab === 'plan' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CalendarDays size={18} className="mr-2" />
                <span className="hidden sm:inline">85-Day Plan</span>
              </button>
              <button
                onClick={() => setActiveTab('pastpapers')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center ${
                  activeTab === 'pastpapers' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText size={18} className="mr-2" />
                <span className="hidden sm:inline">Past Papers</span>
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center ${
                  activeTab === 'memory' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BrainCircuit size={18} className="mr-2" />
                <span className="hidden sm:inline">මතක ස්ථර</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {activeTab === 'dashboard' ? (
          <Dashboard completedTasks={completedTasks} plan={plan} taskMarks={taskMarks} examDate={examDate} setExamDate={setExamDate} />
        ) : activeTab === 'plan' ? (
          <DailyPlan 
            completedTasks={completedTasks} 
            toggleTask={toggleTask} 
            plan={plan} 
            taskMarks={taskMarks} 
            updateMark={updateMark} 
            triggerRevision={autoTriggerRevision}
          />
        ) : activeTab === 'pastpapers' ? (
          <PastPapers />
        ) : (
          <MemoryNotes />
        )}
      </main>

      <AiAssistant 
        onReschedule={handleReschedule} 
        onRescheduleMultiple={handleRescheduleMultiple}
        onAssignRevision={handleAssignRevision}
        isOpen={isAiOpen} 
        setIsOpen={setIsAiOpen} 
        completedTasks={completedTasks}
        plan={plan}
        taskMarks={taskMarks}
      />
    </div>
  );
}
