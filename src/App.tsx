import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  MessageCircle, 
  BrainCircuit, 
  ChevronRight, 
  GraduationCap, 
  ArrowLeft, 
  Send, 
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MATH_DATA, type Topic } from './constants';
import { explainConcept, generatePracticeQuestion, chatWithTutor } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [grade, setGrade] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [view, setView] = useState<'home' | 'topics' | 'concept' | 'practice' | 'chat' | 'forum'>('home');
  const [currentConcept, setCurrentConcept] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Forum state
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', grade: '7' });
  const [newAnswer, setNewAnswer] = useState('');

  // Practice state
  const [question, setQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'tutor'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (view === 'forum') {
      fetchQuestions();
    }
  }, [view]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnswers = async (qId: number) => {
    try {
      const res = await fetch(`/api/questions/${qId}/answers`);
      const data = await res.json();
      setAnswers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostQuestion = async () => {
    if (!newQuestion.title || !newQuestion.content) return;
    try {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuestion, user_email: 'siswa@example.com' })
      });
      setNewQuestion({ title: '', content: '', grade: '7' });
      fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostAnswer = async () => {
    if (!newAnswer || !selectedQuestion) return;
    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question_id: selectedQuestion.id, 
          content: newAnswer, 
          user_email: 'siswa@example.com',
          is_tutor: false 
        })
      });
      setNewAnswer('');
      fetchAnswers(selectedQuestion.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSelect = (g: string) => {
    setGrade(g);
    setView('topics');
  };

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
  };

  const handleConceptClick = async (concept: string) => {
    setCurrentConcept(concept);
    setView('concept');
    setLoading(true);
    try {
      const result = await explainConcept(grade!, selectedTopic!.title, concept);
      setExplanation(result || 'Gagal memuat penjelasan.');
    } catch (error) {
      setExplanation('Terjadi kesalahan saat memuat penjelasan.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = async () => {
    setView('practice');
    setLoading(true);
    setSelectedAnswer(null);
    setShowExplanation(false);
    try {
      const result = await generatePracticeQuestion(grade!, selectedTopic!.title);
      setQuestion(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setLoading(true);
    try {
      const response = await chatWithTutor([], userMsg);
      setChatMessages(prev => [...prev, { role: 'tutor', text: response || 'Maaf, aku sedang bingung.' }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'tutor', text: 'Maaf, ada gangguan koneksi.' }]);
    } finally {
      setLoading(false);
    }
  };

  const currentGradeData = MATH_DATA.find(d => d.grade === grade);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { setView('home'); setGrade(null); setSelectedTopic(null); }}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">MathSahabat</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('forum')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Forum Tanya Jawab</span>
            </button>
            <button 
              onClick={() => setView('chat')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Tanya Tutor AI</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 tracking-tight">
                Matematika Jadi <span className="text-indigo-600">Mudah</span> & <span className="text-emerald-600">Seru</span>
              </h1>
              <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
                Gak paham materi di kelas? Jangan khawatir! MathSahabat siap bantu kamu kuasai matematika kelas 7 & 8 dengan penjelasan yang simpel.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button 
                  onClick={() => handleGradeSelect('7')}
                  className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-8xl font-black">7</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Kelas 7</h3>
                  <p className="text-gray-500">Bilangan, Aljabar, Perbandingan, dan lainnya.</p>
                  <div className="mt-6 flex items-center text-indigo-600 font-semibold">
                    Mulai Belajar <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>

                <button 
                  onClick={() => handleGradeSelect('8')}
                  className="group relative bg-white p-8 rounded-3xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-8xl font-black">8</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Kelas 8</h3>
                  <p className="text-gray-500">Pola Bilangan, Fungsi, Pythagoras, dan lainnya.</p>
                  <div className="mt-6 flex items-center text-emerald-600 font-semibold">
                    Mulai Belajar <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {view === 'topics' && (
            <motion.div 
              key="topics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button 
                onClick={() => setView('home')}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
              </button>

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Materi Kelas {grade}</h2>
                  <p className="text-gray-500">Pilih topik yang ingin kamu pelajari hari ini.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  {currentGradeData?.topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all",
                        selectedTopic?.id === topic.id 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                          : "bg-white border-gray-200 hover:border-indigo-300"
                      )}
                    >
                      <h4 className="font-bold">{topic.title}</h4>
                      <p className={cn("text-xs mt-1", selectedTopic?.id === topic.id ? "text-indigo-100" : "text-gray-500")}>
                        {topic.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="md:col-span-2">
                  {selectedTopic ? (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold">{selectedTopic.title}</h3>
                        <button 
                          onClick={handleStartPractice}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors"
                        >
                          <BrainCircuit className="w-4 h-4" /> Latihan Soal
                        </button>
                      </div>

                      <p className="text-gray-600 mb-8">{selectedTopic.description}</p>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {selectedTopic.concepts.map((concept) => (
                          <button
                            key={concept}
                            onClick={() => handleConceptClick(concept)}
                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                          >
                            <span className="font-medium">{concept}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                      <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-400 font-medium">Pilih topik di sebelah kiri untuk mulai belajar.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'concept' && (
            <motion.div 
              key="concept"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={() => setView('topics')}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Topik
              </button>

              <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-3xl font-bold">{currentConcept}</h2>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 animate-pulse">Menyiapkan penjelasan super simpel untukmu...</p>
                  </div>
                ) : (
                  <div className="prose prose-indigo max-w-none">
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{explanation}</Markdown>
                  </div>
                )}

                {!loading && (
                  <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-4">
                    <button 
                      onClick={handleStartPractice}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                    >
                      Coba Latihan Soal
                    </button>
                    <button 
                      onClick={() => setView('chat')}
                      className="px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                    >
                      Masih Belum Paham? Tanya Tutor
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'practice' && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <button 
                onClick={() => setView('topics')}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Topik
              </button>

              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Latihan: {selectedTopic?.title}</h2>
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                    Tingkat: Kelas {grade}
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-gray-500">Membuat soal tantangan untukmu...</p>
                  </div>
                ) : question ? (
                  <div className="space-y-8">
                    <div className="text-lg font-medium leading-relaxed">
                      {question.question}
                    </div>

                    <div className="grid gap-3">
                      {question.options.map((option: string) => {
                        const isCorrect = option.startsWith(question.correctAnswer);
                        const isSelected = selectedAnswer === option;
                        
                        return (
                          <button
                            key={option}
                            disabled={!!selectedAnswer}
                            onClick={() => setSelectedAnswer(option)}
                            className={cn(
                              "w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between",
                              !selectedAnswer && "hover:border-indigo-300 hover:bg-indigo-50",
                              selectedAnswer && isCorrect && "border-emerald-500 bg-emerald-50",
                              selectedAnswer && isSelected && !isCorrect && "border-red-500 bg-red-50",
                              selectedAnswer && !isSelected && !isCorrect && "opacity-50"
                            )}
                          >
                            <span>{option}</span>
                            {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                            {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                          </button>
                        );
                      })}
                    </div>

                    {selectedAnswer && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-5 h-5 text-indigo-600" />
                          <span className="font-bold">Penjelasan:</span>
                        </div>
                        <div className="prose prose-sm prose-indigo">
                          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{question.explanation}</Markdown>
                        </div>
                        <button 
                          onClick={handleStartPractice}
                          className="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Soal Berikutnya
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-red-500">Gagal memuat soal. Silakan coba lagi.</p>
                    <button onClick={handleStartPractice} className="mt-4 text-indigo-600 font-bold underline">Coba Lagi</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'forum' && (
            <motion.div 
              key="forum"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Forum Tanya Jawab</h2>
                <button 
                  onClick={() => setView('home')}
                  className="text-gray-500 hover:text-indigo-600"
                >
                  Tutup
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h4 className="font-bold mb-4">Ajukan Pertanyaan</h4>
                    <input 
                      type="text"
                      placeholder="Judul (misal: Bingung Aljabar)"
                      className="w-full mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm"
                      value={newQuestion.title}
                      onChange={e => setNewQuestion({...newQuestion, title: e.target.value})}
                    />
                    <textarea 
                      placeholder="Detail pertanyaanmu..."
                      className="w-full mb-3 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm h-32"
                      value={newQuestion.content}
                      onChange={e => setNewQuestion({...newQuestion, content: e.target.value})}
                    />
                    <select 
                      className="w-full mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm"
                      value={newQuestion.grade}
                      onChange={e => setNewQuestion({...newQuestion, grade: e.target.value})}
                    >
                      <option value="7">Kelas 7</option>
                      <option value="8">Kelas 8</option>
                    </select>
                    <button 
                      onClick={handlePostQuestion}
                      className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Kirim Pertanyaan
                    </button>
                  </div>

                  <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2">Moderasi Komunitas</h4>
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      Semua pertanyaan dan jawaban akan diperiksa oleh sistem. Gunakan bahasa yang sopan dan saling membantu ya!
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  {selectedQuestion ? (
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                      <button 
                        onClick={() => setSelectedQuestion(null)}
                        className="text-xs text-indigo-600 font-bold mb-4 flex items-center gap-1"
                      >
                        <ArrowLeft className="w-3 h-3" /> Kembali ke Daftar
                      </button>
                      <h3 className="text-xl font-bold mb-2">{selectedQuestion.title}</h3>
                      <p className="text-gray-600 mb-6">{selectedQuestion.content}</p>
                      
                      <div className="border-t border-gray-100 pt-6 space-y-4">
                        <h4 className="font-bold text-sm">Jawaban ({answers.length})</h4>
                        {answers.map(ans => (
                          <div key={ans.id} className={cn("p-4 rounded-2xl", ans.is_tutor ? "bg-indigo-50 border border-indigo-100" : "bg-gray-50")}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-xs">{ans.user_email}</span>
                              {ans.is_tutor === 1 && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">Tutor</span>}
                            </div>
                            <p className="text-sm text-gray-700">{ans.content}</p>
                          </div>
                        ))}
                        
                        <div className="pt-4">
                          <textarea 
                            placeholder="Tulis jawabanmu..."
                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm h-24 mb-2"
                            value={newAnswer}
                            onChange={e => setNewAnswer(e.target.value)}
                          />
                          <button 
                            onClick={handlePostAnswer}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm"
                          >
                            Kirim Jawaban
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    questions.map(q => (
                      <button 
                        key={q.id}
                        onClick={() => { setSelectedQuestion(q); fetchAnswers(q.id); }}
                        className="w-full text-left bg-white p-6 rounded-3xl border border-gray-200 hover:border-indigo-300 transition-all shadow-sm group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg group-hover:text-indigo-600">{q.title}</h3>
                          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full uppercase font-bold text-gray-500">Kelas {q.grade}</span>
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2">{q.content}</p>
                        <div className="mt-4 flex items-center text-xs text-indigo-600 font-bold">
                          Lihat Diskusi <ChevronRight className="w-3 h-3 ml-1" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto h-[70vh] flex flex-col"
            >
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold">Tutor MathSahabat</h3>
                      <p className="text-xs text-indigo-600 font-medium">Online • Siap membantu!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setView(grade ? 'topics' : 'home')}
                    className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h4 className="font-bold text-lg mb-2">Ada yang bingung?</h4>
                      <p className="text-gray-500 max-w-xs mx-auto">Tanyakan apa saja tentang matematika kelas 7 atau 8, aku akan bantu jelaskan!</p>
                    </div>
                  )}
                  
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      )}>
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.text}</Markdown>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Tulis pertanyaanmu di sini..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={loading || !inputValue.trim()}
                      className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-lg">MathSahabat</span>
          </div>
          <p className="text-gray-500 text-sm">
            Belajar matematika jadi lebih asik dengan bantuan AI. <br />
            Dibuat khusus untuk siswa SMP kelas 7 & 8.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-gray-400 text-xs font-medium uppercase tracking-widest">
            <span>Kurikulum Merdeka</span>
            <span>Tutor AI 24/7</span>
            <span>Latihan Interaktif</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
