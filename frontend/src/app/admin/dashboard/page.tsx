"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  BarChart3, Plus,
  Settings, Users,
  FileText, Search,
  ArrowUpRight, Clock,
  MoreVertical, CheckCircle,
  AlertCircle,
  X,
  Upload,
  Calendar,
  Layers,
  Loader2,
  Trash2,
  Download,
  ShieldBan,
  ShieldCheck,
  Filter,
  ChevronLeft
} from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Past Papers");
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{ exam: string; subject: string } | null>(null);

  const [selectedUserStats, setSelectedUserStats] = useState<any>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filterDate, setFilterDate] = useState("");

  const subjects = ["Biology", "Physics", "Chemistry", "English"];

  const categoryPapers = selectedCategory
    ? papers.filter(p => p.exam_type === selectedCategory.exam && p.subject === selectedCategory.subject)
    : [];

  const [uploadData, setUploadData] = useState({
    title: "",
    year: new Date().getFullYear().toString(),
    exam_type: "MDCAT",
    subject: "Biology",
    file: null as File | null
  });

  const [driveFile, setDriveFile] = useState<{ id: string; name: string; token: string } | null>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  useEffect(() => {
    // Check locally saved token
    const token = localStorage.getItem('gdrive_token');
    const expiry = localStorage.getItem('gdrive_expiry');
    if (token && expiry && parseInt(expiry) > Date.now()) {
      setIsDriveConnected(true);
      setDriveToken(token);
    }

    // Admin Guard
    const checkAdmin = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.role !== "admin") {
          alert("Access Denied: You are not an admin.");
          window.location.href = "/admin";
        }
      } catch (err) {
        window.location.href = "/login";
      }
    };
    checkAdmin();

    if (activeTab === "Past Papers") fetchPapers();
    if (activeTab === "User Management") fetchUsers();

    // Load Google Scripts
    const script1 = document.createElement("script");
    script1.src = "https://apis.google.com/js/api.js";
    script1.async = true; script1.defer = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.src = "https://accounts.google.com/gsi/client";
    script2.async = true; script2.defer = true;
    document.head.appendChild(script2);
  }, [activeTab]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/papers/");
      setPapers(response.data);
    } catch (err) {
      console.error("Failed to fetch papers", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/admin/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const openUserStats = async (user: any) => {
    setSelectedUserStats({ ...user, stats: null });
    setShowStatsModal(true);
    setStatsLoading(true);
    try {
      const response = await api.get(`/auth/admin/users/${user.id}/stats`);
      setSelectedUserStats({ ...user, stats: response.data });
    } catch (err) {
      console.error("Failed to load user stats", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDrivePicker = () => {
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const api_key = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const app_id = process.env.NEXT_PUBLIC_GOOGLE_APP_ID;

    if (!client_id || !api_key || !app_id) {
      return alert("Google Drive credentials not found in environment variables.");
    }

    const loadPicker = (token: string) => {
      // @ts-ignore
      gapi.load('picker', () => {
        // @ts-ignore
        const docsView = new google.picker.DocsView().setIncludeFolders(true);
        // @ts-ignore
        const sharedView = new google.picker.DocsView().setIncludeFolders(true).setOwnedByMe(false);
        
        // @ts-ignore
        const picker = new google.picker.PickerBuilder()
          .addView(docsView)
          .addView(sharedView)
          .setOAuthToken(token)
          .setDeveloperKey(api_key)
          .setAppId(app_id)
          .setCallback((data: any) => {
            if (data.action === 'picked') {
              const file = data.docs[0];
              setDriveFile({
                id: file.id,
                name: file.name,
                token: token
              });
              // Pre-fill title if empty
              setUploadData(prev => ({
                ...prev,
                title: prev.title || file.name.split('.')[0]
              }));
            }
          })
          .build();
        picker.setVisible(true);
      });
    };

    if (driveToken) {
      // Check if expired
      const expiry = localStorage.getItem('gdrive_expiry');
      if (expiry && parseInt(expiry) > Date.now()) {
        loadPicker(driveToken);
        return;
      }
    }

    alert("Your Google Drive connection has expired or is not connected. Please go to the Integrations tab to connect.");
  };

  const connectGoogleDrive = () => {
    const client_id = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!client_id) return alert("Missing Google Client ID");

    // @ts-ignore
    const client = google.accounts.oauth2.initTokenClient({
      client_id: client_id,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response: any) => {
        if (response.access_token) {
          const expiryTime = Date.now() + (response.expires_in * 1000);
          localStorage.setItem('gdrive_token', response.access_token);
          localStorage.setItem('gdrive_expiry', expiryTime.toString());
          setDriveToken(response.access_token);
          setIsDriveConnected(true);
          alert("Successfully connected to Google Drive!");
        }
      },
    });
    client.requestAccessToken();
  };

  const disconnectGoogleDrive = () => {
    localStorage.removeItem('gdrive_token');
    localStorage.removeItem('gdrive_expiry');
    setDriveToken(null);
    setIsDriveConnected(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.file && !driveFile) return alert("Please select a file or choose from Google Drive");

    setLoading(true);
    try {
      if (driveFile) {
        // Handle Google Drive Upload
        const driveData = new FormData();
        driveData.append("title", uploadData.title);
        driveData.append("year", uploadData.year);
        driveData.append("exam_type", uploadData.exam_type);
        driveData.append("subject", uploadData.subject);
        driveData.append("drive_file_id", driveFile.id);
        driveData.append("filename", driveFile.name);
        driveData.append("access_token", driveFile.token);

        await api.post("/papers/upload-drive", driveData);
      } else if (uploadData.file) {
        // Handle Local Upload
        const formData = new FormData();
        formData.append("title", uploadData.title);
        formData.append("year", uploadData.year);
        formData.append("exam_type", uploadData.exam_type);
        formData.append("subject", uploadData.subject);
        formData.append("file", uploadData.file);
        await api.post("/papers/upload", formData);
      }

      setShowAddModal(false);
      fetchPapers();
      setUploadData({
        title: "",
        year: new Date().getFullYear().toString(),
        exam_type: "MDCAT",
        subject: "Biology",
        file: null
      });
      setDriveFile(null);
      alert("Paper uploaded successfully!");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(", ")
        : (typeof detail === 'string' ? detail : "Upload failed");
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const deletePaper = async (id: number) => {
    if (!confirm("Are you sure you want to delete this paper?")) return;
    try {
      await api.delete(`/papers/${id}`);
      fetchPapers();
    } catch (err) {
      alert("Failed to delete paper");
    }
  };

  const toggleUserBlock = async (user: any) => {
    const action = user.is_blocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return;
    try {
      await api.patch(`/auth/admin/users/${user.id}/${action}`);
      fetchUsers();
    } catch (err) {
      alert(`Failed to ${action} user`);
    }
  };

  const exportUsersToCSV = () => {
    if (users.length === 0) return;

    const headers = ["Full Name", "Email", "Username", "Phone Number", "Joined Date", "Status"];
    const rows = users.map(u => [
      u.full_name,
      u.email,
      u.username,
      u.phone_number || "N/A",
      new Date(u.created_at).toLocaleDateString(),
      u.is_blocked ? "Blocked" : "Active"
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `prepcat_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPapers = papers.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDate = filterDate ? new Date(u.created_at).toISOString().split('T')[0] === filterDate : true;

    return matchesSearch && matchesDate;
  });

  return (
    <main className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden lg:flex flex-col sticky top-0 h-screen shrink-0 relative z-50 shadow-sm">
        <div className="p-8 flex flex-col h-full">
          <Link href="/admin/dashboard" className="flex items-center gap-3 mb-12 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">P</div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-none tracking-tight">PrepCat</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Admin Panel</span>
            </div>
          </Link>

          <nav className="space-y-2 flex-1">
            {[
              { name: "Past Papers", icon: Layers },
              { name: "User Management", icon: Users },
              { name: "Integrations", icon: Settings },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => { setActiveTab(item.name); setSearchQuery(""); setSelectedCategory(null); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-semibold text-[15px] transition-all duration-300 ${activeTab === item.name
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                  : "text-slate-800 hover:text-blue-600 hover:bg-blue-50"
                  }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-600">
                <ShieldCheck size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Super Admin</div>
                <div className="text-xs font-medium text-slate-400">Full Access</div>
              </div>
            </div>

            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-700 font-semibold text-[15px] hover:text-blue-600 hover:bg-blue-50 transition-all">
              <ArrowUpRight size={16} />
              Student View
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-end px-10 shrink-0">
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900 leading-none mb-0.5">Super Admin</div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Manage Mode</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {activeTab === "Past Papers" ? (
            <>
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold mb-1 text-slate-950">Paper Management</h1>
                  <p className="text-slate-500 font-medium text-sm">Select a category to upload and manage past papers.</p>
                </div>
              </div>

              {/* If no category is selected, show the grid */}
              {!selectedCategory ? (
                <>
                  {/* MDCAT Row */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px] font-bold">M</div>
                      MDCAT Papers
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                      {subjects.map(sub => {
                        const count = papers.filter(p => p.exam_type === "MDCAT" && p.subject === sub).length;
                        return (
                          <button key={`mdcat-${sub}`} onClick={() => { setSelectedCategory({ exam: "MDCAT", subject: sub }); setUploadData(d => ({ ...d, exam_type: "MDCAT", subject: sub })); }} className="bg-white border border-slate-200 rounded-2xl p-8 min-h-[160px] text-left hover:shadow-xl hover:scale-[1.03] hover:border-blue-300 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 shadow-sm border border-blue-100/50">
                              <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-slate-900">{sub}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1.5">{count === 0 ? "No papers uploaded" : `${count} paper${count > 1 ? 's' : ''} uploaded`}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* NUMS Row */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-[10px] font-bold">N</div>
                      NUMS Papers
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                      {subjects.map(sub => {
                        const count = papers.filter(p => p.exam_type === "NUMS" && p.subject === sub).length;
                        return (
                          <button key={`nums-${sub}`} onClick={() => { setSelectedCategory({ exam: "NUMS", subject: sub }); setUploadData(d => ({ ...d, exam_type: "NUMS", subject: sub })); }} className="bg-white border border-slate-100 rounded-2xl p-8 min-h-[160px] text-left hover:shadow-xl hover:scale-[1.03] hover:border-blue-300 transition-all duration-300 group">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 shadow-sm border border-blue-100/50">
                              <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-xl text-slate-900">{sub}</h3>
                            <p className="text-sm font-medium text-slate-400 mt-1.5">{count === 0 ? "No papers uploaded" : `${count} paper${count > 1 ? 's' : ''} uploaded`}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* Category Detail View */
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setSelectedCategory(null)} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-all">
                        <ChevronLeft size={20} />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedCategory.exam} — {selectedCategory.subject}</h2>
                        <p className="text-sm font-medium text-slate-500">{categoryPapers.length} paper{categoryPapers.length !== 1 ? 's' : ''} in this category</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white py-3 px-8 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                      <Plus size={18} />
                      Upload to {selectedCategory.subject}
                    </button>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500 w-1/3">Paper Title</th>
                          <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Year</th>
                          <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">File</th>
                          <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categoryPapers.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 hover:scale-[1.01] transition-all duration-200">
                            <td className="px-8 py-5 text-[15px] font-semibold text-slate-900">{p.title}</td>
                            <td className="px-8 py-5 text-[15px] font-medium text-slate-600">{p.year}</td>
                            <td className="px-8 py-5">
                              {p.file_url ? (
                                <a href={`${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://prepbuddy-backend-8fxn.onrender.com' : 'http://localhost:8000')}${p.file_url}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5">
                                  <Download size={16} /> Download
                                </a>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="px-8 py-5">
                              <button onClick={() => deletePaper(p.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {categoryPapers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold">No papers uploaded in this category yet. Click "Upload" to add one.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === "User Management" ? (
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">User Management</h1>
                  <p className="text-slate-500 font-medium text-sm">Monitor and manage user accounts and export data.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filter by Date</label>
                    <input 
                      type="date" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-white border-2 border-slate-200 text-slate-900 rounded-xl px-4 py-2 text-sm font-bold outline-none h-[42px]"
                    />
                  </div>
                  <button
                    onClick={exportUsersToCSV}
                    disabled={users.length === 0}
                    className="bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 px-6 rounded-xl flex items-center gap-2 font-bold text-sm transition-all disabled:opacity-50 h-[42px] self-end"
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Registered Students</h3>
                  <div className="text-xs font-bold text-slate-400">Total Users: {filteredUsers.length}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Student Info</th>
                        <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Username</th>
                        <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Phone</th>
                        <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Status</th>
                        <th className="px-8 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-semibold text-[15px] text-slate-900">{u.full_name}</div>
                            <div className="text-sm text-slate-400 font-normal">{u.email}</div>
                          </td>
                          <td className="px-8 py-6 text-sm font-semibold text-slate-600">@{u.username}</td>
                          <td className="px-8 py-6 text-sm text-slate-600 font-normal">{u.phone_number || "—"}</td>
                          <td className="px-8 py-6">
                            {u.is_blocked ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-rose-500 bg-rose-50 px-2 py-1 rounded-md w-max">
                                <ShieldBan size={12} /> Blocked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-max">
                                <ShieldCheck size={12} /> Active
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-6 flex gap-2">
                            <button
                              onClick={() => openUserStats(u)}
                              className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                            >
                              Insights
                            </button>
                            <button
                              onClick={() => toggleUserBlock(u)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${u.is_blocked ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                            >
                              {u.is_blocked ? "Unblock" : "Block User"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "Integrations" ? (
            <div className="max-w-4xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1 text-slate-950">Integrations</h1>
                <p className="text-slate-500 font-bold text-xs">Manage your platform connections and third-party services.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3">
                      <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800" fill="currentColor">
                        <path d="M7.74 3.522l-.004-.007a1.5 1.5 0 01.378-2.008 1.517 1.517 0 012.012.384l.006.009 5.8 9.539a1.5 1.5 0 01-.36 1.996 1.517 1.517 0 01-2.028-.372l-.006-.01zm4.72 13.918l.004.007a1.5 1.5 0 01-.378 2.008 1.517 1.517 0 01-2.012-.384l-.006-.009-5.8-9.539a1.5 1.5 0 01.36-1.996 1.517 1.517 0 012.028.372l-.006.01zm4.04-12.87l-.01.002a1.5 1.5 0 00-1.127 1.782l.002.01 4.544 14.1a1.5 1.5 0 001.764 1.138 1.517 1.517 0 001.15-1.748l-.004-.012-4.544-14.1a1.5 1.5 0 00-1.775-1.172zm-8.814 1.34L7.697 5.9l8.606 14.072-.001.001a1.5 1.5 0 002.138.441 1.517 1.517 0 00.413-2.146l-.001-.001z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        Google Drive
                        {isDriveConnected ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] uppercase font-bold tracking-widest rounded-full">Connected</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-widest rounded-full">Disconnected</span>
                        )}
                      </h3>
                      <p className="text-slate-500 text-sm font-bold mt-1 max-w-md">Connect your Google account to seamlessly upload past papers directly from your Drive or Shared Folders.</p>
                    </div>
                  </div>

                  <div>
                    {isDriveConnected ? (
                      <button onClick={disconnectGoogleDrive} className="px-6 py-3 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-red-600 hover:border-red-200 transition-all">
                        Disconnect
                      </button>
                    ) : (
                      <button onClick={connectGoogleDrive} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">
                        Connect Account
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Paper Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pb-20 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setDriveFile(null); }}
              className="fixed inset-0 bg-slate-900/40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center text-slate-950">
                <div>
                  <h2 className="text-2xl font-bold">Upload Official Paper</h2>
                  <p className="text-slate-600 font-bold text-sm">
                    {selectedCategory ? `Uploading to ${selectedCategory.exam} → ${selectedCategory.subject}` : "Add past papers for MDCAT/NUMS preparation."}
                  </p>
                </div>
                <button onClick={() => { setShowAddModal(false); setDriveFile(null); }} className="p-3 bg-slate-100 rounded-xl text-slate-900 hover:bg-slate-200 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Exam Type</label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-950 font-bold outline-none appearance-none cursor-pointer focus:border-slate-900 transition-all"
                      value={uploadData.exam_type}
                      onChange={(e) => setUploadData({ ...uploadData, exam_type: e.target.value })}
                    >
                      <option value="MDCAT">MDCAT</option>
                      <option value="NUMS">NUMS</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Subject</label>
                    <select
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-950 font-bold outline-none appearance-none cursor-pointer focus:border-slate-900 transition-all"
                      value={uploadData.subject}
                      onChange={(e) => setUploadData({ ...uploadData, subject: e.target.value })}
                    >
                      <option value="Biology">Biology</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Paper Name</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024 MDCAT Full"
                      required
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-950 font-bold focus:border-slate-900 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Year</label>
                    <input
                      type="number"
                      placeholder="2024"
                      required
                      value={uploadData.year}
                      onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-950 font-bold focus:border-slate-900 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Select File Source</label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`relative p-6 border-2 border-dashed ${!driveFile ? 'border-slate-900 bg-slate-50' : 'border-slate-300 bg-white'} rounded-2xl flex flex-col items-center justify-center text-center group hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer`}>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          setUploadData({ ...uploadData, file: e.target.files?.[0] || null });
                          setDriveFile(null);
                        }}
                      />
                      <Upload size={20} className={!driveFile ? 'text-slate-950' : 'text-slate-400'} />
                      <div className="text-[11px] font-bold text-slate-950 mt-2">
                        {uploadData.file ? uploadData.file.name : "Local File"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDrivePicker}
                      className={`relative p-6 border-2 border-dashed ${driveFile ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 bg-white'} rounded-2xl flex flex-col items-center justify-center text-center group hover:border-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className={driveFile ? 'text-blue-600' : 'text-slate-400'} fill="currentColor">
                          <path d="M7.74 3.522l-.004-.007a1.5 1.5 0 01.378-2.008 1.517 1.517 0 012.012.384l.006.009 5.8 9.539a1.5 1.5 0 01-.36 1.996 1.517 1.517 0 01-2.028-.372l-.006-.01zm4.72 13.918l.004.007a1.5 1.5 0 01-.378 2.008 1.517 1.517 0 01-2.012-.384l-.006-.009-5.8-9.539a1.5 1.5 0 01.36-1.996 1.517 1.517 0 012.028.372l.006.01zm4.04-12.87l-.01.002a1.5 1.5 0 00-1.127 1.782l.002.01 4.544 14.1a1.5 1.5 0 001.764 1.138 1.517 1.517 0 001.15-1.748l-.004-.012-4.544-14.1a1.5 1.5 0 00-1.775-1.172zm-8.814 1.34L7.697 5.9l8.606 14.072-.001.001a1.5 1.5 0 002.138.441 1.517 1.517 0 00.413-2.146l-.001-.001z" />
                        </svg>
                      </div>
                      <div className="text-[11px] font-bold text-slate-950 mt-2">
                        {driveFile ? driveFile.name : "Google Drive"}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Publish Paper"}
                  </button>
                  <button type="button" onClick={() => { setShowAddModal(false); setDriveFile(null); }} className="px-8 py-4 font-bold text-slate-500 hover:text-slate-950 transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Stats Modal */}
      <AnimatePresence>
        {showStatsModal && selectedUserStats && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pb-20 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStatsModal(false)}
              className="fixed inset-0 bg-slate-900/40"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center text-slate-950 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                    {selectedUserStats.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedUserStats.full_name}</h2>
                    <p className="text-slate-500 font-bold text-xs">@{selectedUserStats.username}</p>
                  </div>
                </div>
                <button onClick={() => setShowStatsModal(false)} className="p-2 bg-slate-200/50 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                {statsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                    <p className="text-slate-500 font-bold text-sm">Loading insights...</p>
                  </div>
                ) : selectedUserStats.stats ? (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Created</div>
                        <div className="font-bold text-slate-900 mt-0.5">{new Date(selectedUserStats.stats.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                        <div className="text-xs font-bold text-blue-500/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Current Streak
                        </div>
                        <div className="text-3xl font-black text-blue-600">
                          {selectedUserStats.stats.current_streak} <span className="text-sm">Days</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                        <div className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Papers Opened
                        </div>
                        <div className="text-3xl font-black text-emerald-600">
                          {selectedUserStats.stats.papers_opened} <span className="text-sm">Total</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 hover:scale-[1.02] transition-transform">
                        <div className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Saved Papers
                        </div>
                        <div className="text-3xl font-black text-amber-600">
                          {selectedUserStats.stats.saved_papers || 0} <span className="text-sm">Total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-red-500 font-bold py-10">Failed to load statistics.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
