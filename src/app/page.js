"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Download, X, Plus, Trash2, LogIn, 
  MonitorPlay, Smartphone, HardDrive, LayoutGrid 
} from "lucide-react";
import { 
  collection, addDoc, getDocs, deleteDoc, doc, 
  query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "@/lib/firebase";

export default function Home() {
  // --- STATE ---
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null); // For Modal
  const [loading, setLoading] = useState(true);
  
  // Admin State
  const [user, setUser] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // New Video Form State
  const [newVideo, setNewVideo] = useState({
    title: "", description: "", thumbnail: "", links: []
  });
  // Temp state for adding a link to the list
  const [tempLink, setTempLink] = useState({ quality: "1080p", size: "", url: "" });

  // --- EFFECTS ---
  useEffect(() => {
    fetchVideos();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const vidArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(vidArray);
    } catch (e) {
      console.error("Error fetching", e);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Welcome Jachu! Add Latest Movies To Update List");
    } catch (err) {
      alert("Login Failed: " + err.message);
    }
  };

  const addLinkToStack = () => {
    if(!tempLink.size || !tempLink.url) return;
    setNewVideo({ ...newVideo, links: [...newVideo.links, tempLink] });
    setTempLink({ quality: "1080p", size: "", url: "" }); // Reset temp
  };

  const handleUpload = async () => {
    if (!newVideo.title || !newVideo.thumbnail) return alert("Title and Thumbnail required");
    try {
      await addDoc(collection(db, "videos"), {
        ...newVideo,
        createdAt: serverTimestamp()
      });
      setNewVideo({ title: "", description: "", thumbnail: "", links: [] });
      fetchVideos();
      alert("Video Added!");
    } catch (e) {
      alert("Error adding video");
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete this video?")) return;
    await deleteDoc(doc(db, "videos", id));
    fetchVideos();
  };

  // --- FILTERING ---
  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-4 pb-20">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md py-4 border-b border-white/10 mb-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-xl">
              <MonitorPlay className="text-white w-6 h-6" />
            </div>
            <h1 className="font-bold text-xl hidden sm:block">FilmsHub</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className="p-2 bg-surface rounded-full hover:bg-white/10 transition"
          >
            {user ? <LayoutGrid className="text-primary w-5 h-5"/> : <LogIn className="text-gray-400 w-5 h-5"/>}
          </button>
        </div>
      </header>

      {/* --- ADMIN PANEL --- */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: "auto", opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8 bg-surface rounded-2xl border border-white/10"
          >
            <div className="p-6">
              {!user ? (
                // Login Form
                <form onSubmit={handleLogin} className="flex flex-col gap-4 max-w-sm mx-auto">
                  <h3 className="text-lg font-bold text-center">Admin Login</h3>
                  <input type="email" placeholder="Email" className="p-3 bg-black/50 rounded-lg border border-white/10" onChange={e => setEmail(e.target.value)} />
                  <input type="password" placeholder="Password" className="p-3 bg-black/50 rounded-lg border border-white/10" onChange={e => setPassword(e.target.value)} />
                  <button className="bg-primary py-2 rounded-lg font-bold hover:bg-blue-600">Login</button>
                </form>
              ) : (
                // Dashboard
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Add New Video</h2>
                    <button onClick={() => auth.signOut()} className="text-red-400 text-sm">Logout</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="p-3 bg-black/50 rounded-lg border border-white/10" placeholder="Title" value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
                    <input className="p-3 bg-black/50 rounded-lg border border-white/10" placeholder="Thumbnail URL" value={newVideo.thumbnail} onChange={e => setNewVideo({...newVideo, thumbnail: e.target.value})} />
                    <textarea className="p-3 bg-black/50 rounded-lg border border-white/10 md:col-span-2" placeholder="Description" value={newVideo.description} onChange={e => setNewVideo({...newVideo, description: e.target.value})} />
                  </div>

                  {/* Add Download Links Section */}
                  <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                    <p className="text-sm text-gray-400 mb-2">Download Links Stack</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <select className="bg-black border border-white/10 p-2 rounded" value={tempLink.quality} onChange={e => setTempLink({...tempLink, quality: e.target.value})}>
                        <option>4K</option><option>1080p</option><option>720p</option><option>480p</option><option>360p</option>
                      </select>
                      <input className="bg-black border border-white/10 p-2 rounded w-24" placeholder="Size (e.g 50MB)" value={tempLink.size} onChange={e => setTempLink({...tempLink, size: e.target.value})} />
                      <input className="bg-black border border-white/10 p-2 rounded flex-1" placeholder="Download URL" value={tempLink.url} onChange={e => setTempLink({...tempLink, url: e.target.value})} />
                      <button onClick={addLinkToStack} className="bg-green-600 p-2 rounded hover:bg-green-500"><Plus size={20}/></button>
                    </div>
                    {/* Preview Added Links */}
                    <div className="flex gap-2 flex-wrap">
                      {newVideo.links.map((l, i) => (
                        <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30">
                          {l.quality} - {l.size}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleUpload} className="w-full bg-primary py-3 rounded-lg font-bold hover:bg-blue-600 transition">Publish Video</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- VIDEO GRID --- */}
      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Loading library...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <motion.div 
              layoutId={video.id}
              key={video.id} 
              onClick={() => setSelectedVideo(video)}
              className="group bg-surface rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition border border-white/5"
              whileHover={{ y: -5 }}
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                {/* Use Standard Img for easy external loading */}
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate pr-2">{video.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-8">{video.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">
                    {video.links?.length || 0} Qualities
                  </span>
                  {user && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(video.id); }}
                      className="text-red-500 p-1 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- DOWNLOAD MODAL --- */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121214] w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="relative h-48 sm:h-56">
                <img src={selectedVideo.thumbnail} className="w-full h-full object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121214] to-transparent" />
                <button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full hover:bg-white/20 transition">
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <h2 className="text-2xl font-bold leading-tight">{selectedVideo.title}</h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-6">{selectedVideo.description}</p>
                
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Available Downloads</h4>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedVideo.links && selectedVideo.links.map((link, idx) => (
                    <a 
                      key={idx}
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-primary hover:text-white transition group border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-black/30 p-2 rounded-lg group-hover:bg-white/20">
                          {link.quality.includes("1080") || link.quality.includes("4K") ? (
                            <MonitorPlay className="w-5 h-5" />
                          ) : (
                            <Smartphone className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold">{link.quality}</div>
                          <div className="text-xs opacity-70">MP4 format</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded group-hover:bg-white/20">
                           <HardDrive className="inline w-3 h-3 mr-1" />
                           {link.size}
                         </span>
                         <Download className="w-5 h-5" />
                      </div>
                    </a>
                  ))}
                  {(!selectedVideo.links || selectedVideo.links.length === 0) && (
                    <div className="text-center text-gray-500 py-4">No download links available.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}