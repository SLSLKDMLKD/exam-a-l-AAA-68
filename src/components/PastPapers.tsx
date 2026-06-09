import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export function PastPapers() {
  const [pastPaperState, setPastPaperState] = useLocalStorage<Record<string, number>>('al-planner-pastpapers', {});

  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const subjects = ['Accounting', 'Business Studies', 'ICT'];
  const rounds = [1, 2, 3, 4];
  const targetScore = 80; // Example target

  const updateMark = (subject: string, year: number, round: number, value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) numValue = 0;
    if (numValue < 0) numValue = 0;
    if (numValue > 100) numValue = 100;

    const key = `${subject}-${year}-${round}`;
    setPastPaperState(prev => ({
      ...prev,
      [key]: numValue
    }));
  };

  const getMark = (subject: string, year: number, round: number) => {
    const key = `${subject}-${year}-${round}`;
    return pastPaperState[key] ?? '';
  };

  const chartData = rounds.map(round => {
    const roundData: any = { round: `Round ${round}` };
    subjects.forEach(subject => {
       let sum = 0;
       let count = 0;
       years.forEach(year => {
          const val = pastPaperState[`${subject}-${year}-${round}`];
          if (typeof val === 'number' && !isNaN(val)) {
              sum += val;
              count++;
          }
       });
       roundData[subject] = count > 0 ? Math.round(sum / count) : null;
    });
    return roundData;
  });

  const subjectColors: Record<string, string> = {
    'Accounting': '#4f46e5', // Indigo 600
    'Business Studies': '#16a34a',   // Green 600
    'ICT': '#ea580c'    // Orange 600
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Past Paper Tracker & Progress</h2>
        <p className="text-gray-500 font-medium">Record marks for 2019-2025 past papers across 4 rounds as percentages and measure your progress towards the target.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Towards Target (Average Score per Round)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis dataKey="round" />
              <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip formatter={(value: any) => [`${value}%`, undefined]} />
              <Legend />
              <ReferenceLine y={targetScore} label={{ position: 'top', value: `Target (${targetScore}%)`, fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
              {subjects.map(subject => (
                <Line 
                  key={subject}
                  type="monotone" 
                  dataKey={subject} 
                  stroke={subjectColors[subject]} 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <div key={subject} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{subject}</h3>
            <div className="flex-1 space-y-4">
              {years.map(year => (
                <div key={year} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3">{year} Paper</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {rounds.map(round => (
                      <div key={round} className="flex flex-col">
                        <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Round {round}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={getMark(subject, year, round)}
                            onChange={(e) => updateMark(subject, year, round, e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-1.5 pl-3 pr-6 text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="-"
                          />
                          <span className="absolute right-2 top-1.5 text-gray-400 text-sm font-bold pointer-events-none">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
