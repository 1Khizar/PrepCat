"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    BookOpen,
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle,
    HelpCircle,
    Search,
    Bell,
    User,
    Star,
    Dna,
    Zap,
    Beaker,
    BookOpenText,
    Flame,
    X,
    Maximize2,
    Minimize2,
    Bot,
    Send,
    RefreshCw,
    Copy,
    Check,
    Library
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Removed static exams array - will fetch from backend

export default function Dashboard() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [userName, setUserName] = useState("Aspirant");
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Home");
    const [savedPapers, setSavedPapers] = useState<any[]>([]);
    const [streakData, setStreakData] = useState<{current_streak: number, active_dates: string[]}>({current_streak: 0, active_dates: []});
    const [selectedSubjectInfo, setSelectedSubjectInfo] = useState<{ exam: string, subject: string } | null>(null);
    const [selectedPaperForViewing, setSelectedPaperForViewing] = useState<any | null>(null);
    const [isViewerMaximized, setIsViewerMaximized] = useState(false);
    const [userInfo, setUserInfo] = useState<{email: string, username: string} | null>(null);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    // ── AI Tutor state ──────────────────────────────────────────────────────
    type ChatMsg = { role: 'user' | 'assistant'; content: string; id: string };
    const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchUserInfo();
        fetchPapers();
        
        // Log activity & fetch real streak data on load
        api.post('/auth/record-daily-activity').then(res => {
            setStreakData(res.data);
        }).catch(err => console.error(err));

        // Real-time security check: Poll every 1 second to see if admin blocked/deleted this user
        const securityInterval = setInterval(async () => {
            try {
                // Ensure we only poll if we have a token
                const token = localStorage.getItem("token");
                if (token) {
                    await api.get("/auth/me");
                }
            } catch (err: any) {
                // The API interceptor will handle the actual logout and redirect
                clearInterval(securityInterval);
            }
        }, 1000);

        return () => clearInterval(securityInterval);
    }, []);

    const fetchUserInfo = async () => {
        try {
            const savedName = localStorage.getItem("prepcat_user");
            if (savedName) {
                // Formatting email to a clean name if possible
                const cleanName = savedName.split("@")[0].replace(/[^a-zA-Z]/g, " ");
                setUserName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
            }

            const res = await api.get("/auth/me");
            if (res.data.full_name || res.data.username) {
                setUserName(res.data.full_name || res.data.username);
            }
            setUserInfo({ email: res.data.email, username: res.data.username });
        } catch (err: any) {
            console.error("Auth check failed.", err);
            // API interceptor will handle the logout and redirect
        }
    };

    const fetchPapers = async () => {
        try {
            const res = await api.get("/papers/");
            setPapers(res.data);
        } catch (err) {
            console.error("Failed to fetch papers", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedPapers = async () => {
        try {
            const res = await api.get("/papers/user/saved");
            setSavedPapers(res.data);
        } catch (err) {
            console.error("Failed to fetch saved papers", err);
        }
    };

    const logActivity = async () => {
        try {
            const res = await api.post("/auth/record-daily-activity");
            setStreakData(res.data);
        } catch (err) {
            console.error("Failed to log activity", err);
        }
    };

    const logPaperOpened = async () => {
        try {
            console.log("Attempting to log paper opened...");
            const res = await api.post("/auth/record-paper-view");
            console.log("Successfully logged paper opened! Current count:", res.data.count);
        } catch (err) {
            console.error("Failed to log paper opened", err);
        }
    };

    const handleSavePaper = async (paperId: number) => {
        // Optimistic UI Update: Instantly change the button state
        const paperToSave = papers.find(p => p.id === paperId);
        if (paperToSave) {
            setSavedPapers(prev => [...prev, paperToSave]);
        }
        
        try {
            await api.post(`/papers/${paperId}/save`);
            // We do not need to fetchSavedPapers() here anymore since we updated it optimistically.
        } catch (err: any) {
            // If it fails on the server, revert the UI back
            setSavedPapers(prev => prev.filter(p => p.id !== paperId));
            console.error(err.response?.data?.detail || "Could not save paper.");
        }
    };

    const handleUnsavePaper = async (paperId: number) => {
        // Optimistic UI Update: Instantly change the button state
        const paperToRemove = savedPapers.find(p => p.id === paperId);
        setSavedPapers(prev => prev.filter(p => p.id !== paperId));
        
        try {
            await api.delete(`/papers/${paperId}/save`);
        } catch (err: any) {
            // If it fails on the server, revert the UI back
            if (paperToRemove) {
                setSavedPapers(prev => [...prev, paperToRemove]);
            }
            console.error(err.response?.data?.detail || "Could not remove paper.");
        }
    };

    useEffect(() => {
        // Removed tab-specific restriction so it's always preloaded
        fetchSavedPapers();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    // Filter papers to count them per exam & subject
    const getPaperCount = (examType: string, subject: string) => {
        return papers.filter(p => p.exam_type === examType && p.subject === subject).length;
    };

    const calculateSubjectMastery = (subjectName: string) => {
        const totalSubjectPapers = papers.filter(p => p.subject === subjectName).length;
        if (totalSubjectPapers === 0) return 0;
        
        const savedSubjectPapers = savedPapers.filter(sp => sp.subject === subjectName || sp.title?.includes(subjectName)).length;
        return Math.round((savedSubjectPapers / totalSubjectPapers) * 100);
    };

    const subjectsList = [
        { name: "Biology", icon: Dna },
        { name: "Physics", icon: Zap },
        { name: "Chemistry", icon: Beaker },
        { name: "English", icon: BookOpenText },
        { name: "Full Papers", icon: Library }
    ];

    // Generate data for Monthly Activity Tracker
    const getDaysInMonth = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(year, month, i);
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(i).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;
            
            const isCompleted = streakData.active_dates.includes(dateStr);
            days.push({
                day: i,
                date: dateStr,
                isCompleted,
                isToday: i === now.getDate()
            });
        }
        return days;
    };
    const monthDays = getDaysInMonth();

    // Generate data for Subject Mastery Graph
    const getSubjectDistribution = () => {
        const counts: Record<string, number> = {};
        savedPapers.forEach(paper => {
            const subject = paper.subject || 'Other';
            counts[subject] = (counts[subject] || 0) + 1;
        });
        
        return Object.entries(counts).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => b.count - a.count);
    };
    const subjectData = getSubjectDistribution();
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

    // ── AI Tutor Handlers ───────────────────────────────────────────────────
    const scrollToBottom = useCallback(() => {
        if (chatBottomRef.current) {
            chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        if (activeTab === "AI Tutor") {
            scrollToBottom();
        }
    }, [chatMessages, activeTab, scrollToBottom]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;
        
        const userMsg = chatInput.trim();
        setChatInput('');
        const newMsgId = Date.now().toString();
        
        const historyToSend = chatMessages.map(m => ({ role: m.role, content: m.content }));
        
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg, id: newMsgId }]);
        setIsChatLoading(true);

        try {
            const token = localStorage.getItem("token");
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://prepbuddy-backend-8fxn.onrender.com' : 'http://localhost:8000');
            const response = await fetch(`${apiUrl}/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMsg,
                    session_history: historyToSend
                })
            });

            if (!response.ok || !response.body) throw new Error("Chat request failed");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            const aiMsgId = (Date.now() + 1).toString();
            setChatMessages(prev => [...prev, { role: 'assistant', content: '', id: aiMsgId }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunkStr = decoder.decode(value, { stream: true });
                const lines = chunkStr.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.type === 'content' || data.type === 'status') {
                                setChatMessages(prev => prev.map(msg => 
                                    msg.id === aiMsgId 
                                        ? { ...msg, content: msg.content + data.data } 
                                        : msg
                                ));
                            } else if (data.type === 'error') {
                                setChatMessages(prev => prev.map(msg => 
                                    msg.id === aiMsgId 
                                        ? { ...msg, content: msg.content + '\n\n**Error:** ' + data.data } 
                                        : msg
                                ));
                            }
                        } catch (e) {
                            console.error("Failed to parse SSE data", line);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', id: Date.now().toString() }]);
        } finally {
            setIsChatLoading(false);
            chatInputRef.current?.focus();
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatMarkdown = (text: string) => {
        // Basic markdown parser for bold and code blocks
        let formatted = text
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg my-2 overflow-x-auto text-sm font-mono border border-slate-700"><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-200">$1</code>')
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
            // Newlines
            .replace(/\n/g, '<br />');
        return formatted;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Sidebar - Clean White Style */}
            <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen shrink-0 relative z-50 shadow-sm">
                <div className="p-8 flex flex-col h-full">
                    <Link href="/" className="flex items-center gap-3 mb-12 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">P</div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-900 leading-none tracking-tight">PrepCat</span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Student Dashboard</span>
                        </div>
                    </Link>

                    <nav className="space-y-2 flex-1">
                        {[
                            { icon: LayoutDashboard, label: "Home" },
                            { icon: TrendingUp, label: "My Progress" },
                            { icon: Star, label: "Saved Papers" },
                            { icon: Bot, label: "AI Tutor" }
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(item.label)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 ${activeTab === item.label
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                                    : "text-slate-800 hover:text-blue-600 hover:bg-blue-50"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-600">
                                <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-slate-900 truncate">{userName.replace(/^Admin\s+/i, "")}</div>
                                <div className="text-xs font-medium text-slate-400">Student Account</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-700 font-semibold text-[15px] hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area Structured Like Admin Panel */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Bar / Header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0">
                    {/* Mobile Brand (hidden on large screens) */}
                    <div className="flex lg:hidden items-center gap-2.5">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-primary/20">P</div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">PrepCat</span>
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block">
                            <Bell size={18} className="text-slate-400 hover:text-brand-primary transition-colors" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
                        </div>
                        <div className="h-6 w-[1px] bg-slate-100 hidden sm:block" />
                        <div className="flex items-center gap-3 cursor-pointer group relative" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-bold text-slate-900 leading-none mb-0.5 group-hover:text-brand-primary transition-colors">
                                    {userName.replace(/^Admin\s+/i, "")}
                                </div>
                                <div className="text-[9px] font-bold text-brand-primary uppercase tracking-widest leading-none">Student</div>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-105">
                                {userName.replace(/^Admin\s+/i, "").charAt(0)}
                            </div>
                            
                            {/* Profile Dropdown */}
                            <AnimatePresence>
                                {showProfileDropdown && userInfo && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-12 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 cursor-default"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xl">
                                                {userName.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-slate-900 truncate">{userName}</h4>
                                                <p className="text-xs text-slate-500 font-medium truncate">{userInfo.email}</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 mb-2">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Username</div>
                                            <div className="font-semibold text-slate-700 text-sm">{userInfo.username}</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="px-4 md:px-6 pb-4 md:pb-6 pt-0 space-y-4 flex-1 overflow-y-auto overflow-x-hidden w-full lg:pb-6">
                    <div className="max-w-6xl mx-auto flex flex-col w-full relative">

                    {/* Dynamic Tab Content */}
                    {activeTab === "Home" && !selectedSubjectInfo && (
                        <>
                            {/* Simple Greeting Area */}
                            <div className="mb-4 md:mb-6 w-full">
                                <h1 className="text-2xl md:text-3xl font-bold mb-1.5 text-slate-900 flex items-center gap-2">
                                    Welcome back, <span className="text-blue-600">{userName.replace(/^Admin\s+/i, "")}</span> <span className="text-2xl">👋</span>
                                </h1>
                                <p className="text-slate-500 font-medium">
                                    Your personalized curriculum awaits. Let's crush your goals today!
                                </p>
                            </div>

                            {/* Exam Row 1: MDCAT */}
                            <div className="space-y-2 relative mt-1 w-full">
                                <div className="absolute -top-10 right-0 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] -z-10" />

                                <div className="mb-2 w-full">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">M</div>
                                        MDCAT Papers
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Category-wise past papers for MDCAT exams.</p>
                                </div>

                                <div className="flex lg:grid lg:grid-cols-5 gap-4 lg:gap-5 w-full overflow-x-auto pb-6 lg:pb-0 snap-x lg:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => <div key={i} className="min-w-[220px] lg:min-w-0 amazing-card min-h-[160px] rounded-2xl animate-pulse bg-slate-100 snap-start lg:snap-none" />)
                                    ) : (
                                        subjectsList.map(subject => {
                                            const count = getPaperCount("MDCAT", subject.name);
                                            return (
                                                <button
                                                    key={`mdcat-${subject.name}`}
                                                    onClick={() => setSelectedSubjectInfo({ exam: "MDCAT", subject: subject.name })}
                                                    className="min-w-[220px] lg:min-w-0 snap-start lg:snap-none bg-white border border-slate-200 rounded-2xl p-6 lg:p-6 aspect-square text-left hover:shadow-xl hover:scale-[1.03] hover:border-blue-300 transition-all duration-300 group flex-1 flex flex-col justify-between"
                                                >
                                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 lg:mb-5 shadow-sm border border-blue-100/50">
                                                        <FileText size={24} />
                                                    </div>
                                                    <h3 className="font-bold text-lg lg:text-xl text-slate-900">{subject.name}</h3>
                                                    <p className="text-xs lg:text-sm font-medium text-slate-400 mt-1 lg:mt-1.5">{count === 0 ? "0 papers uploaded" : `${count} paper${count > 1 ? 's' : ''} uploaded`}</p>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Exam Row 2: NUMS */}
                            <div className="space-y-2 relative pt-2 w-full">
                                <div className="mb-2 w-full">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                                        <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">N</div>
                                        NUMS Papers
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Category-wise past papers for NUMS medical college entrance.</p>
                                </div>

                                <div className="flex lg:grid lg:grid-cols-5 gap-4 lg:gap-5 w-full overflow-x-auto pb-6 lg:pb-0 snap-x lg:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {loading ? (
                                        [1, 2, 3, 4, 5].map(i => <div key={i} className="min-w-[220px] lg:min-w-0 amazing-card min-h-[160px] rounded-2xl animate-pulse bg-slate-100 snap-start lg:snap-none" />)
                                    ) : (
                                        subjectsList.map(subject => {
                                            const count = getPaperCount("NUMS", subject.name);
                                            return (
                                                <button
                                                    key={`nums-${subject.name}`}
                                                    onClick={() => setSelectedSubjectInfo({ exam: "NUMS", subject: subject.name })}
                                                    className="min-w-[220px] lg:min-w-0 snap-start lg:snap-none bg-white border border-slate-200 rounded-2xl p-6 lg:p-6 aspect-square text-left hover:shadow-xl hover:scale-[1.03] hover:border-blue-300 transition-all duration-300 group flex-1 flex flex-col justify-between"
                                                >
                                                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 lg:mb-5 shadow-sm border border-blue-100/50">
                                                        <FileText size={24} />
                                                    </div>
                                                    <h3 className="font-bold text-lg lg:text-xl text-slate-900">{subject.name}</h3>
                                                    <p className="text-xs lg:text-sm font-medium text-slate-400 mt-1 lg:mt-1.5">{count === 0 ? "0 papers uploaded" : `${count} paper${count > 1 ? 's' : ''} uploaded`}</p>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "Home" && selectedSubjectInfo && (
                        <div className="space-y-8 mt-6">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setSelectedSubjectInfo(null)}
                                    className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm">
                                        <ChevronRight className="rotate-180" size={16} />
                                    </div>
                                    Back to Overview
                                </button>
                                <div className="px-6 py-2 bg-brand-primary/10 rounded-full text-brand-primary font-bold text-[10px] uppercase tracking-widest shadow-inner">
                                    {selectedSubjectInfo.exam} • {selectedSubjectInfo.subject} Vault
                                </div>
                            </div>

                            <div className="mb-6">
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1.5">
                                    {selectedSubjectInfo.subject} <span className="text-brand-primary">Papers</span>
                                </h1>
                                <p className="text-slate-500 font-medium">Select a verified paper to start your practice session.</p>
                            </div>

                            {/* Papers List — Responsive Flat Design instead of Table */}
                            <div className="flex flex-col gap-3">
                                {papers
                                    .filter(p => p.exam_type === selectedSubjectInfo.exam && p.subject === selectedSubjectInfo.subject)
                                    .length === 0 ? (
                                        <div className="px-8 py-16 text-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <FileText size={28} />
                                            </div>
                                            <p className="text-slate-500 font-bold">No papers available yet.</p>
                                            <p className="text-slate-400 font-bold text-xs mt-1">Check back soon — we update the vault daily.</p>
                                        </div>
                                    ) : (
                                        papers
                                            .filter(p => p.exam_type === selectedSubjectInfo.exam && p.subject === selectedSubjectInfo.subject)
                                            .map((paper, i) => {
                                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://prepbuddy-backend-8fxn.onrender.com' : 'http://localhost:8000');
                                                const fileUrl = paper.file_url ? (paper.file_url.startsWith('http') ? paper.file_url : `${apiUrl}${paper.file_url}`) : '#';
                                                const isSaved = savedPapers.some((sp: any) => sp.id === paper.id);

                                                return (
                                                    <motion.div
                                                key={paper.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white border border-slate-100 flex flex-row items-center justify-between p-4 md:p-5 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group gap-3 rounded-2xl"
                                                onClick={() => {
                                                    setSelectedPaperForViewing(paper);
                                                    logActivity();
                                                    logPaperOpened();
                                                }}
                                            >
                                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-all shadow-sm">
                                                                <FileText size={18} className="md:w-[22px] md:h-[22px]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-semibold text-sm md:text-base text-slate-900 truncate block leading-tight">{paper.title}</span>
                                                                <span className="text-xs md:text-sm font-medium text-slate-400 block mt-0.5">Year: {paper.year}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (isSaved) {
                                                                        handleUnsavePaper(paper.id);
                                                                    } else {
                                                                        handleSavePaper(paper.id);
                                                                    }
                                                                }}
                                                                className={`text-xs md:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors px-3 md:px-4 py-2 md:py-2.5 rounded-lg border ${
                                                                    isSaved 
                                                                        ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600" 
                                                                        : "text-slate-500 bg-slate-50 border-slate-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100"
                                                                }`}
                                                            >
                                                                <Star size={14} className={isSaved ? "fill-blue-600" : ""} /> 
                                                                <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedPaperForViewing(paper);
                                                                    logActivity();
                                                                    logPaperOpened();
                                                                }}
                                                                className="text-xs md:text-sm font-semibold text-blue-600 hover:text-white flex items-center justify-center gap-1.5 transition-colors bg-blue-50 hover:bg-blue-600 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent"
                                                            >
                                                                <BookOpen size={14} /> <span className="hidden sm:inline">View Paper</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })
                                    )}
                            </div>
                        </div>
                    )}

                    {activeTab === "My Progress" && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setActiveTab('Home')}
                                className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors md:hidden mb-4"
                            >
                                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                    <ChevronRight className="rotate-180" size={16} />
                                </div>
                                Back to Home
                            </button>
                            <div className="mb-4">
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1.5">Your Progress</h1>
                                <p className="text-slate-500 font-medium text-sm md:text-base">Track your preparation journey, streaks, and subject mastery.</p>
                            </div>

                            {/* Quick Stats Overview */}
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl">
                                <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                            <Flame size={16} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Streak</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">{streakData.current_streak} <span className="text-sm font-bold text-slate-400">Days</span></div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Keep it up!</div>
                                </div>
                                
                                <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                                            <Star size={16} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Bookmarks</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">{savedPapers.length}</div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Saved for later</div>
                                </div>
                            </div>

                            {/* 7-Day Activity/Streak Tracker (REAL Data) */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 hover:shadow-md transition-all">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Flame size={18} className="text-orange-500" />
                                    Weekly Activity Tracker
                                </h3>
                                <div className="flex justify-between items-center w-full max-w-sm mx-auto md:max-w-none md:mx-0">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                        const now = new Date();
                                        // Create a date object going backward for the last 7 days matched to this day of week
                                        // This is a simplified reliable display: just check if the actual current date strings match
                                        // For simplicity in mobile layout, we will just map back 7 days ending mostly today
                                        
                                        const dateIter = new Date();
                                        dateIter.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) + i);
                                        const dateStr = dateIter.toISOString().split('T')[0];
                                        
                                        // Check the Real Database
                                        const isCompleted = streakData.active_dates.includes(dateStr);
                                        
                                        const isToday = dateIter.toDateString() === now.toDateString();
                                        
                                        return (
                                            <div key={day} className="flex flex-col items-center gap-2.5">
                                                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                                                    isCompleted ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-100 text-slate-400'
                                                } ${isToday ? 'ring-4 ring-blue-600/20 ring-offset-2' : ''}`}>
                                                    {isCompleted ? <CheckCircle size={16} className="md:w-[22px] md:h-[22px]" /> : <span className="text-xs font-bold md:text-sm">{day[0]}</span>}
                                                </div>
                                                <span className={`text-[10px] md:text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{day}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Monthly Activity Tracker */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 hover:shadow-md transition-all mt-6">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-500" />
                                    Monthly Activity Tracker
                                </h3>
                                <div className="flex justify-center w-full">
                                    <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                            <div key={`head-${i}`} className="text-center text-[10px] md:text-xs font-bold text-slate-400 mb-2">{d}</div>
                                        ))}
                                        
                                        {/* Offset for the first day of the month */}
                                        {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() }).map((_, i) => (
                                            <div key={`empty-${i}`} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-transparent" />
                                        ))}
                                        
                                        {monthDays.map((dayData, i) => (
                                            <div key={`day-${i}`} className="group relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                                                <div className={`w-full h-full rounded-lg transition-all duration-300 flex items-center justify-center text-[10px] md:text-xs font-bold ${
                                                    dayData.isCompleted 
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600/20 ring-offset-1 scale-105' 
                                                    : dayData.isToday 
                                                        ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-200 ring-offset-1' 
                                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:scale-110'
                                                }`}>
                                                    {dayData.day}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Saved Papers" && (
                        <div className="space-y-6">
                            <button
                                onClick={() => setActiveTab('Home')}
                                className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition-colors md:hidden"
                            >
                                <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
                                    <ChevronRight className="rotate-180" size={16} />
                                </div>
                                Back to Home
                            </button>
                            <div className="mb-6">
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1.5">Saved Papers</h1>
                                <p className="text-slate-500 font-medium">Review the papers you have bookmarked for later preparation.</p>
                            </div>
                            
                            {savedPapers.length === 0 ? (
                                <div className="amazing-card p-12 text-center h-[50vh] flex flex-col items-center justify-center">
                                    <Star size={48} className="text-blue-600 mb-6" />
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">No Saved Papers</h2>
                                    <p className="text-slate-500 font-bold max-w-md">You haven't bookmarked any papers yet. When you save a paper for later review, it will appear here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {savedPapers.map((paper: any, i) => {
                                        
                                        return (
                                            <motion.div
                                                key={paper.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="bg-white border border-slate-100 flex flex-row items-center justify-between p-4 md:p-5 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group gap-3 rounded-2xl"
                                                onClick={() => {
                                                    setSelectedPaperForViewing(paper);
                                                    logActivity();
                                                    logPaperOpened();
                                                }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-all shadow-sm">
                                                        <FileText size={18} className="md:w-[22px] md:h-[22px]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-semibold text-sm md:text-base text-slate-900 truncate block leading-tight">{paper.title}</span>
                                                        <span className="text-xs md:text-sm font-medium text-slate-400 truncate block mt-0.5">{paper.exam_type} - {paper.subject} • Year {paper.year}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedPaperForViewing(paper);
                                                            logActivity();
                                                            logPaperOpened();
                                                        }}
                                                        className="text-xs md:text-sm font-semibold text-blue-600 hover:text-white flex items-center justify-center gap-1.5 transition-colors bg-blue-50 hover:bg-blue-600 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-transparent"
                                                    >
                                                        <BookOpen size={14} /> <span className="hidden sm:inline">View Paper</span>
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnsavePaper(paper.id);
                                                        }}
                                                        className="text-xs md:text-sm font-semibold text-blue-600 hover:text-white flex items-center justify-center transition-colors bg-blue-50 hover:bg-blue-600 px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-blue-100"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Tutor Tab */}
                    {activeTab === "AI Tutor" && (
                        <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-4xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden relative">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900">AI Tutor</h2>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setChatMessages([])}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <RefreshCw size={14} /> <span className="hidden sm:inline">New Chat</span>
                                </button>
                            </div>

                            {/* Chat Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner mb-2">
                                            <Bot size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">How can I help you study?</h3>
                                        <p className="text-slate-500 text-sm font-medium">I'm your personal AI tutor. Ask me to explain a concept, solve a problem, or test your knowledge.</p>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, i) => {
                                        if (msg.role === 'assistant' && msg.content === '' && isChatLoading) return null;
                                        return (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={msg.id} 
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                                </div>
                                                <div className={`group relative p-4 rounded-2xl ${
                                                    msg.role === 'user' 
                                                    ? 'bg-slate-900 text-white rounded-tr-sm' 
                                                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                                                }`}>
                                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:my-0" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                                                    
                                                    {msg.role === 'assistant' && (
                                                        <button 
                                                            onClick={() => handleCopy(msg.content, msg.id)}
                                                            className="absolute -right-10 top-2 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                                                            title="Copy text"
                                                        >
                                                            {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )})
                                )}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-3 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                                <Bot size={14} />
                                            </div>
                                            <div className="p-4 bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-[52px]">
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                                                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatBottomRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                                <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all p-1.5 pr-2">
                                    <textarea
                                        ref={chatInputRef}
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Message your AI tutor..."
                                        className="w-full max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-slate-700 text-sm py-2.5 px-3 placeholder:text-slate-400"
                                        rows={1}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="mb-1 w-9 h-9 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={16} className="ml-0.5" />
                                    </button>
                                </div>
                                <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">AI can make mistakes. Verify important information.</p>
                            </div>
                        </div>
                    )}



                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-4 py-1.5 md:px-8 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {[
                    { icon: LayoutDashboard, label: "Home" },
                    { icon: TrendingUp, label: "My Progress" },
                    { icon: Star, label: "Saved Papers" },
                    { icon: Bot, label: "AI Tutor" }
                ].map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(item.label)}
                        className={`flex flex-col items-center gap-0.5 p-1 min-w-[50px] rounded-xl transition-all ${
                            activeTab === item.label 
                            ? "text-blue-600" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${activeTab === item.label ? 'bg-blue-50' : ''}`}>
                            <item.icon size={18} className={activeTab === item.label ? "fill-blue-600/20" : ""} />
                        </div>
                        <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">{item.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {selectedPaperForViewing && (
                    <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center transition-all duration-300 ${isViewerMaximized ? 'p-0' : 'p-2 md:p-4'}`}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                                isViewerMaximized
                                    ? 'w-screen h-screen rounded-none border-0'
                                    : 'w-full max-w-5xl h-[80vh] rounded-2xl border border-slate-100'
                            }`}
                        >
                            {/* Header with title, save button, maximize, close */}
                            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-sm md:text-base text-slate-900 leading-tight truncate">{selectedPaperForViewing.title}</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-semibold mt-0.5">
                                            {selectedPaperForViewing.exam_type} • {selectedPaperForViewing.subject} • Year {selectedPaperForViewing.year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {/* Save button */}
                                    <button onClick={() => { const isSaved = savedPapers.some((sp: any) => sp.id === selectedPaperForViewing.id); isSaved ? handleUnsavePaper(selectedPaperForViewing.id) : handleSavePaper(selectedPaperForViewing.id); }}
                                        className={`text-[10px] md:text-xs font-bold flex items-center gap-1 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl border transition-all ${savedPapers.some((sp: any) => sp.id === selectedPaperForViewing.id) ? "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600" : "text-slate-600 bg-white border-slate-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100"}`}>
                                        <Star size={12} className={savedPapers.some((sp: any) => sp.id === selectedPaperForViewing.id) ? "fill-blue-600" : ""} />
                                        <span>{savedPapers.some((sp: any) => sp.id === selectedPaperForViewing.id) ? "Saved" : "Save"}</span>
                                    </button>
                                    {/* Maximize/Minimize */}
                                    <button onClick={() => setIsViewerMaximized(!isViewerMaximized)}
                                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all"
                                        title={isViewerMaximized ? "Standard Size" : "Full Screen"}>
                                        {isViewerMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    {/* Close */}
                                    <button onClick={() => { setSelectedPaperForViewing(null); setIsViewerMaximized(false); }}
                                        className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 flex items-center justify-center transition-all" title="Close Viewer">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            {/* iFrame viewer */}
                            <div className="flex-1 bg-slate-800 relative w-full h-full">
                                <iframe
                                    src={`${selectedPaperForViewing.file_url ? (selectedPaperForViewing.file_url.startsWith('http') ? selectedPaperForViewing.file_url : `${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://prepbuddy-backend-8fxn.onrender.com' : 'http://localhost:8000')}${selectedPaperForViewing.file_url}`) : ''}#toolbar=0&navpanes=0&scrollbar=1`}
                                    className="w-full h-full border-0 bg-slate-800"
                                    title={selectedPaperForViewing.title}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}

