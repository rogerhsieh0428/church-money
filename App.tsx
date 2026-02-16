
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  BarChart3, 
  Users, 
  Download,
  Trash2,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DonationRecord, DonationCategory, ChurchInfo } from './types';
import { DEFAULT_CHURCH_INFO, CATEGORIES, MOCK_DONATIONS } from './constants';
import { generateDonorReceipt } from './services/docGenerator';
import { analyzeDonations } from './services/geminiService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const App: React.FC = () => {
  const [donations, setDonations] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem('church_donations');
    return saved ? JSON.parse(saved) : MOCK_DONATIONS;
  });
  
  const [activeTab, setActiveTab] = useState<'input' | 'list' | 'stats'>('input');
  const [formData, setFormData] = useState({
    donorName: '',
    donorCode: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: DonationCategory.TITHE,
    note: ''
  });

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    localStorage.setItem('church_donations', JSON.stringify(donations));
  }, [donations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.donorName || !formData.amount) return;

    const newRecord: DonationRecord = {
      id: Date.now().toString(),
      donorName: formData.donorName,
      donorCode: formData.donorCode,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      note: formData.note
    };

    setDonations([newRecord, ...donations]);
    setFormData({ ...formData, amount: '', note: '' });
  };

  const deleteRecord = (id: string) => {
    setDonations(donations.filter(d => d.id !== id));
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeDonations(donations);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // Stats computation
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    donations.forEach(d => {
      stats[d.category] = (stats[d.category] || 0) + d.amount;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [donations]);

  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {};
    donations.forEach(d => {
      const month = d.date.substring(0, 7); // YYYY-MM
      stats[month] = (stats[month] || 0) + d.amount;
    });
    return Object.entries(stats).sort().map(([name, value]) => ({ name, value }));
  }, [donations]);

  // Fix: Explicitly type donorSummary as a Record to help TypeScript inference
  const donorSummary = useMemo<Record<string, DonationRecord[]>>(() => {
    const summary: Record<string, DonationRecord[]> = {};
    donations.forEach(d => {
      if (!summary[d.donorName]) summary[d.donorName] = [];
      summary[d.donorName].push(d);
    });
    return summary;
  }, [donations]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-900 text-white p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-white p-2 rounded-lg text-indigo-900">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-xl font-bold">富足財務管理</h1>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('input')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'input' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
          >
            <PlusCircle size={20} />
            奉獻輸入
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'list' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
          >
            <Users size={20} />
            會友名錄
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'stats' ? 'bg-indigo-700 shadow-inner' : 'hover:bg-indigo-800'}`}
          >
            <BarChart3 size={20} />
            統計報告
          </button>
        </nav>

        <div className="mt-auto pt-10 text-xs text-indigo-300">
          <p>{DEFAULT_CHURCH_INFO.name}</p>
          <p>Version 1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-50">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {activeTab === 'input' && '新奉獻紀錄'}
              {activeTab === 'list' && '個人奉獻清單與收據生成'}
              {activeTab === 'stats' && '奉獻統計分析'}
            </h2>
            <p className="text-gray-500">主恩常在，感謝每一份奉獻。</p>
          </div>
        </header>

        {activeTab === 'input' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4 border border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                  <input 
                    type="text" required
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    value={formData.donorName}
                    onChange={e => setFormData({...formData, donorName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">編號 (選填)</label>
                  <input 
                    type="text"
                    placeholder="例如: FZ0001"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    value={formData.donorCode}
                    onChange={e => setFormData({...formData, donorCode: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
                    <input 
                      type="date" required
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">奉獻類別</label>
                    <select 
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as DonationCategory})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">金額 (TWD)</label>
                  <input 
                    type="number" required min="1"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <textarea 
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    rows={2}
                    value={formData.note}
                    onChange={e => setFormData({...formData, note: e.target.value})}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-medium py-3 rounded-md hover:bg-indigo-700 transition shadow-sm"
                >
                  確認輸入
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">最近奉獻紀錄</h3>
                  <span className="text-xs text-gray-500">顯示最新 10 筆</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                        <th className="px-6 py-3">日期</th>
                        <th className="px-6 py-3">姓名</th>
                        <th className="px-6 py-3">類別</th>
                        <th className="px-6 py-3 text-right">金額</th>
                        <th className="px-6 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {donations.slice(0, 10).map(record => (
                        <tr key={record.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">{record.date}</td>
                          <td className="px-6 py-4 font-medium">{record.donorName}</td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs">
                              {record.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold">${record.amount.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => deleteRecord(record.id)} className="text-gray-400 hover:text-red-500 transition">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {donations.length === 0 && (
                    <div className="p-10 text-center text-gray-400">目前尚無奉獻紀錄</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-lg font-semibold">年度個人收據生成</h3>
              <div className="text-sm text-gray-500">共 {Object.keys(donorSummary).length} 位會友</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Fix: Explicitly cast Object.entries(donorSummary) to resolve 'unknown' type errors for 'records' */}
              {(Object.entries(donorSummary) as [string, DonationRecord[]][]).map(([name, records]) => {
                const total = records.reduce((s, r) => s + r.amount, 0);
                return (
                  <div key={name} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{name}</h4>
                        <p className="text-xs text-gray-500">編號: {records[0].donorCode || '無'}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                        總額: ${total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">年度累計奉獻次數: {records.length} 次</p>
                    <button 
                      onClick={() => generateDonorReceipt(name, records, DEFAULT_CHURCH_INFO)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium"
                    >
                      <Download size={18} />
                      下載報稅收據 (.docx)
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-indigo-600" />
                  每月奉獻趨勢
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <PieChart size={20} className="text-indigo-600" />
                  奉獻類別佔比
                </h3>
                <div className="h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-indigo-900">Gemini 財務智慧分析</h3>
                    <p className="text-indigo-700 text-sm">透過 AI 為您的教會提供更深層的事工事實洞察。</p>
                  </div>
                </div>

                {!aiAnalysis ? (
                  <button 
                    onClick={handleAiAnalysis}
                    disabled={isAnalyzing}
                    className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
                    {isAnalyzing ? '正在分析數據...' : '開始生成年度財務分析報告'}
                  </button>
                ) : (
                  <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white shadow-inner">
                    <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {aiAnalysis}
                    </div>
                    <button 
                      onClick={() => setAiAnalysis(null)}
                      className="mt-6 text-sm text-indigo-600 hover:underline font-medium"
                    >
                      清除並重新分析
                    </button>
                  </div>
                )}
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] text-indigo-100/50 transform -rotate-12 select-none pointer-events-none">
                <BarChart3 size={200} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
