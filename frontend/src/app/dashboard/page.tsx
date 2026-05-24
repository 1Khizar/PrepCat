"use client";

import { motion } from "framer-motion";
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
    Download,
    Flame
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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

    useEffect(() => {
        fetchUserInfo();
        fetchPapers();
        
        // Log activity & fetch real streak data on load
        api.get('/auth/activity').then(res => {
            setStreakData(res.data);
        }).catch(err => console.error(err));

        // Real-time security check: Poll every 2 seconds to see if admin blocked this user
        const securityInterval = setInterval(async () => {
            try {
                // Ensure we only poll if we have a token
                const token = localStorage.getItem("token");
                if (token) {
                    await api.get("/auth/me");
                }
            } catch (err: any) {
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    clearInterval(securityInterval);
                    alert("Your account has been blocked by the administrator.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("prepBuddy_user");
                    router.push("/login");
                }
            }
        }, 2000);

        return () => clearInterval(securityInterval);
    }, []);

    const fetchUserInfo = async () => {
        try {
            const savedName = localStorage.getItem("prepBuddy_user");
            if (savedName) {
                // Formatting email to a clean name if possible
                const cleanName = savedName.split("@")[0].replace(/[^a-zA-Z]/g, " ");
                setUserName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
            }

            const res = await api.get("/auth/me");
            if (res.data.full_name || res.data.username) {
                setUserName(res.data.full_name || res.data.username);
            }
        } catch (err: any) {
            console.error("Auth check failed.", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert(err.response.data.detail || "Session expired or account blocked.");
                localStorage.removeItem("token");
                localStorage.removeItem("prepBuddy_user");
                router.push("/login");
            }
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
        { name: "English", icon: BookOpenText }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
            {/* Sidebar - Clean White Style */}
            <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen shrink-0 relative z-50 shadow-sm">
                <div className="p-10 flex flex-col h-full">
                    <Link href="/" className="flex items-center gap-4 mb-6 group">
                        <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">P</div>
                        <span className="text-2xl font-bold tracking-tighter text-slate-900 leading-none">PrepBuddy</span>
                    </Link>

                    <nav className="space-y-2 flex-1">
                        {[
                            { icon: LayoutDashboard, label: "Home" },
                            { icon: TrendingUp, label: "My Progress" },
                            { icon: Star, label: "Saved Papers" }
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(item.label)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === item.label ? "bg-slate-900 text-white shadow-xl shadow-black/10 scale-[1.02]" : "text-slate-700 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-6 py-4 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-all"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area Structured Like Admin Panel */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Bar / Header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0">
                    {/* Mobile Brand (hidden on large screens) */}
                    <div className="flex lg:hidden items-center gap-2.5">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-brand-primary/20">P</div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">PrepBuddy</span>
                    </div>

                    <div className="flex items-center gap-6 ml-auto">
                        <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-full transition-colors hidden sm:block">
                            <Bell size={18} className="text-slate-400 hover:text-brand-primary transition-colors" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                        </div>
                        <div className="h-6 w-[1px] bg-slate-100 hidden sm:block" />
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <div className="text-xs font-bold text-slate-900 leading-none mb-0.5 group-hover:text-brand-primary transition-colors">
                                    {userName.replace(/^Admin\s+/i, "")}
                                </div>
                                <div className="text-[9px] font-bold text-brand-primary uppercase tracking-widest leading-none">Student</div>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-primary/20 transition-transform group-hover:scale-105">
                                {userName.replace(/^Admin\s+/i, "").charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto overflow-x-hidden w-full pb-24 lg:pb-6">
                    <div className="max-w-6xl mx-auto flex flex-col w-full relative">

                    {/* Dynamic Tab Content */}
                    {activeTab === "Home" && !selectedSubjectInfo && (
                        <>
                            {/* Simple Greeting Area */}
                            <div className="mb-2 md:mb-4 w-full">
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1.5 md:mb-2">PrepBuddy Academy</h1>
                                <p className="text-sm md:text-base text-slate-500 font-medium">
                                    Welcome, <span className="text-brand-primary font-bold">{userName.replace(/^Admin\s+/i, "")}</span>. Your personalized curriculum awaits.
                                </p>
                            </div>

                            {/* Exam Row 1: MDCAT */}
                            <div className="space-y-2 relative mt-1 w-full">
                                <div className="absolute -top-10 right-0 w-72 h-72 bg-brand-primary/5 rounded-full blur-[100px] -z-10" />

                                <div className="mb-2 w-full">
                                    <h2 className="text-lg md:text-2xl font-bold flex items-center gap-3 text-slate-900 mb-1">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shadow-inner">
                                            <FileText size={16} />
                                        </div>
                                        MDCAT Preparation
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Category-wise past papers for MDCAT exams.</p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 mb-3 w-full">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <div key={i} className="amazing-card h-[80px] animate-pulse bg-slate-100" />)
                                    ) : (
                                        subjectsList.map(subject => {
                                            const count = getPaperCount("MDCAT", subject.name);
                                            return (
                                                <button
                                                    key={`mdcat-${subject.name}`}
                                                    onClick={() => setSelectedSubjectInfo({ exam: "MDCAT", subject: subject.name })}
                                                    className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 text-left hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-500 group flex flex-col justify-between h-full"
                                                >
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 text-slate-600 flex shrink-0 items-center justify-center mb-1.5 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                        <subject.icon size={14} className="md:w-[16px] md:h-[16px]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs md:text-base text-slate-900 line-clamp-1">{subject.name}</h3>
                                                        <p className="text-[9px] md:text-xs font-bold text-slate-400 mt-0.5">{count === 0 ? "No Papers" : `${count} Papers`}</p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Exam Row 2: NUMS */}
                            <div className="space-y-2 relative pt-2 w-full">
                                <div className="mb-2 w-full">
                                    <h2 className="text-lg md:text-2xl font-bold flex items-center gap-3 text-slate-900 mb-1">
                                        <div className="w-7 h-7 md:w-8 md:h-8 bg-brand-secondary/10 rounded-lg flex items-center justify-center text-brand-secondary shadow-inner">
                                            <BookOpen size={16} />
                                        </div>
                                        NUMS Preparation
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Category-wise past papers for NUMS medical college entrance.</p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4 mb-3 w-full">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <div key={i} className="amazing-card h-[80px] animate-pulse bg-slate-100" />)
                                    ) : (
                                        subjectsList.map(subject => {
                                            const count = getPaperCount("NUMS", subject.name);
                                            return (
                                                <button
                                                    key={`nums-${subject.name}`}
                                                    onClick={() => setSelectedSubjectInfo({ exam: "NUMS", subject: subject.name })}
                                                    className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 text-left hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-500 group flex flex-col justify-between h-full"
                                                >
                                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-slate-100 text-slate-600 flex shrink-0 items-center justify-center mb-1.5 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                                        <subject.icon size={14} className="md:w-[16px] md:h-[16px]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-xs md:text-base text-slate-900 line-clamp-1">{subject.name}</h3>
                                                        <p className="text-[9px] md:text-xs font-bold text-slate-400 mt-0.5">{count === 0 ? "No Papers" : `${count} Papers`}</p>
                                                    </div>
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
                            <div className="bg-white border border-slate-100 rounded-2xl flex flex-col divide-y divide-slate-100">
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
                                                const fileUrl = paper.file_url ? (paper.file_url.startsWith('http') ? paper.file_url : `http://localhost:8000${paper.file_url}`) : '#';
                                                const downloadUrl = paper.file_url ? (paper.file_url.startsWith('http') ? `${paper.file_url}?download=` : `http://localhost:8000${paper.file_url}`) : '#';
                                                const isSaved = savedPapers.some((sp: any) => sp.id === paper.id);

                                                return (
                                                    <motion.div
                                                        key={paper.id}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="flex flex-row items-center justify-between p-3 md:p-4 hover:bg-slate-50/60 transition-colors cursor-pointer group gap-2"
                                                        onClick={() => {
                                                            if(fileUrl !== '#') window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                                <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-xs md:text-sm text-slate-900 truncate block leading-tight">{paper.title}</span>
                                                                <span className="text-[10px] md:text-xs font-bold text-slate-400 block mt-0.5">Year: {paper.year}</span>
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
                                                                className={`text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-colors px-2 md:px-3 py-1.5 md:py-2 rounded-lg border ${
                                                                    isSaved 
                                                                        ? "text-brand-primary bg-brand-primary/10 border-brand-primary/20 hover:bg-red-50 hover:text-red-500 hover:border-red-100" 
                                                                        : "text-slate-500 bg-slate-50 border-slate-200 hover:text-amber-500 hover:bg-amber-50 hover:border-amber-100"
                                                                }`}
                                                            >
                                                                <Star size={12} className={isSaved ? "fill-brand-primary" : ""} /> 
                                                                <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                                                            </button>
                                                            <a
                                                                href={downloadUrl}
                                                                className="text-[10px] md:text-xs font-bold text-brand-primary hover:text-emerald-500 flex items-center justify-center gap-1 transition-colors bg-brand-primary/10 hover:bg-emerald-50 px-2 md:px-3 py-1.5 md:py-2 rounded-lg"
                                                                download
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Download size={12} /> <span className="hidden sm:inline">Download</span>
                                                            </a>
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
                                        <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                                            <Flame size={16} className="md:w-[18px] md:h-[18px]" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Streak</span>
                                    </div>
                                    <div className="text-2xl md:text-3xl font-black text-slate-900">{streakData.current_streak} <span className="text-sm font-bold text-slate-400">Days</span></div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-1">Keep it up!</div>
                                </div>
                                
                                <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
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
                                                    isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'
                                                } ${isToday ? 'ring-4 ring-emerald-500/20 ring-offset-2' : ''}`}>
                                                    {isCompleted ? <CheckCircle size={16} className="md:w-[22px] md:h-[22px]" /> : <span className="text-xs font-bold md:text-sm">{day[0]}</span>}
                                                </div>
                                                <span className={`text-[10px] md:text-xs font-bold ${isToday ? 'text-emerald-500' : 'text-slate-400'}`}>{day}</span>
                                            </div>
                                        )
                                    })}
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
                                    <Star size={48} className="text-brand-primary mb-6" />
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">No Saved Papers</h2>
                                    <p className="text-slate-500 font-bold max-w-md">You haven't bookmarked any papers yet. When you save a paper for later review, it will appear here.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-100 rounded-2xl flex flex-col divide-y divide-slate-100">
                                    {savedPapers.map((paper: any, i) => {
                                        const fileUrl = paper.file_url ? (paper.file_url.startsWith('http') ? paper.file_url : `http://localhost:8000${paper.file_url}`) : '#';
                                        
                                        return (
                                            <motion.div
                                                key={paper.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex flex-row items-center justify-between p-3 md:p-4 hover:bg-slate-50/60 transition-colors cursor-pointer group gap-2"
                                                onClick={() => {
                                                    if(fileUrl !== '#') window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                                }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0 pr-2">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                        <FileText size={16} className="md:w-[18px] md:h-[18px]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-xs md:text-sm text-slate-900 truncate block leading-tight">{paper.title}</span>
                                                        <span className="text-[10px] md:text-xs font-bold text-slate-400 truncate block mt-0.5">{paper.exam_type} - {paper.subject} • Year {paper.year}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center shrink-0">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleUnsavePaper(paper.id);
                                                        }}
                                                        className="text-[10px] md:text-xs font-bold text-red-500 hover:text-white flex items-center justify-center transition-colors bg-red-50/80 hover:bg-red-500 px-3 py-1.5 md:py-2 rounded-lg border border-red-100"
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



                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-4 py-1.5 md:px-8 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {[
                    { icon: LayoutDashboard, label: "Home" },
                    { icon: TrendingUp, label: "My Progress" },
                    { icon: Star, label: "Saved Papers" }
                ].map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(item.label)}
                        className={`flex flex-col items-center gap-0.5 p-1 min-w-[50px] rounded-xl transition-all ${
                            activeTab === item.label 
                            ? "text-brand-primary" 
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <div className={`p-1 rounded-lg transition-colors ${activeTab === item.label ? 'bg-brand-primary/10' : ''}`}>
                            <item.icon size={18} className={activeTab === item.label ? "fill-brand-primary/20" : ""} />
                        </div>
                        <span className="text-[9px] font-bold tracking-tight whitespace-nowrap">{item.label}</span>
                    </button>
                ))}
            </div>
        </div >
    );
}

