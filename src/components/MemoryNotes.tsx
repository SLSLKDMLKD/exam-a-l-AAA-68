import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from 'firebase/firestore';
import { Plus, ChevronRight, ChevronLeft, Trash2, BrainCircuit } from 'lucide-react';

interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  level: number; // 1 to 5
}

export function MemoryNotes() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState('Accounting');
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const subjects = ['Accounting', 'Business Studies', 'ICT', 'General'];
  const levels = [1, 2, 3, 4, 5];

  useEffect(() => {
    const q = query(collection(db, 'memory-notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData: Flashcard[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flashcard));
      setCards(cardsData);
    });
    return unsubscribe;
  }, []);

  const handleAddCard = async () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const newCard = {
      subject: newSubject,
      front: newFront,
      back: newBack,
      level: 1, // Start at Level 1
    };
    await addDoc(collection(db, 'memory-notes'), newCard);
    setNewFront('');
    setNewBack('');
    setIsAdding(false);
  };

  const moveCard = async (id: string, dir: 1 | -1) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    
    let newLevel = card.level + dir;
    if (newLevel < 1) newLevel = 1;
    if (newLevel > 5) newLevel = 5;
    
    await updateDoc(doc(db, 'memory-notes', id), { level: newLevel });
  };

  const deleteCard = async (id: string) => {
    await deleteDoc(doc(db, 'memory-notes', id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 pointer-events-none"></div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
              <BrainCircuit className="text-indigo-600 h-8 w-8" />
              මතක ස්ථර (Memory Layers)
            </h2>
            <p className="text-gray-500 font-medium">Spaced repetition system. Stored locally. Move notes to higher levels as you remember them.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center hover:bg-indigo-700 transition"
          >
            <Plus size={18} className="mr-2" /> නව සටහනක් (New Note)
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm mb-6 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">නව මතක සටහන</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-800 mb-1">විෂය (Subject)</label>
              <select 
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                className="w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-indigo-800 mb-1">ප්‍රශ්නය / මාතෘකාව (Front)</label>
              <textarea 
                value={newFront}
                onChange={e => setNewFront(e.target.value)}
                className="w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white"
                rows={2}
                placeholder="e.g. Break-even point equation"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-indigo-800 mb-1">පිළිතුර / විස්තරය (Back)</label>
              <textarea 
                value={newBack}
                onChange={e => setNewBack(e.target.value)}
                className="w-full rounded-lg border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border bg-white"
                rows={3}
                placeholder="e.g. Fixed Costs / Contribution per unit"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 font-semibold"
            >
              අවලංගු කරන්න (Cancel)
            </button>
            <button 
              onClick={handleAddCard}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              ගබඩා කරන්න (Save)
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {levels.map(level => (
          <div key={level} className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden max-h-[70vh]">
            <div className={`p-3 font-bold text-center border-b ${
              level === 1 ? 'bg-red-50 text-red-700 border-red-100' :
              level === 2 ? 'bg-orange-50 text-orange-700 border-orange-100' :
              level === 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
              level === 4 ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-green-50 text-green-700 border-green-100'
            }`}>
              ස්ථරය {level}
              <div className="text-xs font-normal opacity-80 mt-1">
                {level === 1 ? 'Every day' : level === 2 ? 'Every 3 days' : level === 3 ? 'Weekly' : level === 4 ? 'Bi-weekly' : 'Monthly'}
              </div>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3 bg-gray-50/50">
              {cards.filter(c => c.level === level).length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-8 italic">හිස් (Empty)</div>
              ) : (
                cards.filter(c => c.level === level).map(card => (
                  <div key={card.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 group relative">
                    <div className="text-xs font-bold text-indigo-600 mb-1">{card.subject}</div>
                    <div className="font-bold text-gray-900 text-sm mb-2">{card.front}</div>
                    <div className="text-gray-600 text-sm whitespace-pre-wrap pt-2 border-t border-gray-100 mb-6">{card.back}</div>
                    
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                      <button 
                        onClick={() => moveCard(card.id, -1)}
                        disabled={level === 1}
                        className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-400 transition bg-gray-50 hover:bg-red-50 rounded"
                        title="Move to lower level (Forgot)"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        onClick={() => moveCard(card.id, 1)}
                        disabled={level === 5}
                        className="p-1 text-gray-400 hover:text-green-500 disabled:opacity-30 disabled:hover:text-gray-400 transition bg-gray-50 hover:bg-green-50 rounded"
                        title="Move to higher level (Remembered)"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
