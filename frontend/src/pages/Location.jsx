import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { MessageCircle, X, Send, Check, CheckCheck, Clock } from "lucide-react";
import axios from "axios";
import io from "socket.io-client";

// --- CONFIG URL ---
const rawUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:3000/api");
const cleanBaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
const SOCKET_URL = cleanBaseUrl.replace(/\/api$/, "");
const API_BASE = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

// --- KOMPONEN IKON STATUS ---
const StatusIcon = ({ status }) => {
  if (status === "pending")
    return <Clock size={12} className="text-gray-400" />;
  if (status === "sent") return <Check size={12} className="text-gray-400" />;
  if (status === "delivered")
    return <CheckCheck size={12} className="text-gray-400" />;
  if (status === "read")
    return <CheckCheck size={12} className="text-blue-500" />;
  return <Check size={12} className="text-gray-400" />;
};

const Location = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  // 1. STATE BARU UNTUK NOTIFIKASI
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, token } = useSelector((state) => state.users);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fungsi update status pesan lawan
  const updateStatus = async (status) => {
    if (
      user?.role === "admin" ||
      user?.role === "owner" ||
      user?.role === "ceo" ||
      user?.role === "pemilik"
    )
      return;
    try {
      await axios.post(
        `${API_BASE}/chat/update-status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.warn("Backend route belum ready, skip update status.");
        return;
      }
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchMessages();

      // Setup Socket
      socketRef.current = io(SOCKET_URL);
      const userId = user._id || user.id;

      console.log("🔌 User Socket Connecting...");
      socketRef.current.emit("join_chat", userId);

      // 1. TERIMA PESAN
      socketRef.current.on("receive_message", (message) => {
        // Jika chat sedang terbuka, kirim status READ.
        // Jika tertutup, kirim DELIVERED dan tambah counter notifikasi.
        if (isChatOpen) {
          updateStatus("read");
        } else {
          updateStatus("delivered");
          // Cek apakah pesan dari admin, jika ya tambah notif
          if (message.sender === "admin") {
            setUnreadCount((prev) => prev + 1);
          }
        }
        setMessages((prev) => [...prev, message]);
      });

      // 2. STATUS UPDATE
      socketRef.current.on("message_status_update", (data) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.sender === "user" && m.status !== "read") {
              return { ...m, status: data.status };
            }
            return m;
          })
        );
      });
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, token, isChatOpen]);

  // Saat jendela chat dibuka, tandai pesan admin sebagai READ dan Reset Notif
  useEffect(() => {
    if (isChatOpen) {
      // Reset notifikasi saat buka chat
      setUnreadCount(0);

      if (messages.length > 0) {
        updateStatus("read");
      }
    }

    // Auto scroll
    if (isChatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isChatOpen, messages.length]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/my-chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const msgs = res.data.data;
        setMessages(msgs);

        // Hitung pesan yang belum dibaca saat awal load
        if (!isChatOpen) {
          const unread = msgs.filter(
            (m) => m.sender === "admin" && m.status !== "read"
          ).length;
          setUnreadCount(unread);
        }
      }
    } catch (error) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const tempMsg = {
      sender: "user",
      text: inputMsg,
      timestamp: new Date(),
      status: "pending",
    };
    setMessages((prev) => [...prev, tempMsg]);
    setInputMsg("");

    try {
      const res = await axios.post(
        `${API_BASE}/chat/send`,
        { text: tempMsg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        const serverMsg =
          res.data.data.messages[res.data.data.messages.length - 1];
        setMessages((prev) => prev.map((m) => (m === tempMsg ? serverMsg : m)));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Handler saat tombol chat dibuka
  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0); // Reset notifikasi
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 pt-20 pb-6 px-4 relative">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 text-center">
        Our Location
      </h1>
      <p className="text-base sm:text-lg text-gray-600 mb-6 text-center">
        Pondok Chandra Indah, Surabaya, Indonesia
      </p>

      <div className="w-full max-w-3xl h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden shadow-lg bg-white mb-10">
        <iframe
          title="Map"
          src="https://maps.google.com/maps?q=-6.2,106.8&z=13&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>

      {user && (
        <>
          {/* FLOATING BUTTON DENGAN NOTIFIKASI */}
          {!isChatOpen && (
            <button
              onClick={handleOpenChat}
              className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-xl z-50 flex items-center gap-2 border-2 border-white hover:scale-105 transition relative"
            >
              {/* BADGE NOTIFIKASI */}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}

              <MessageCircle size={24} />
              <span className="font-bold hidden sm:inline">Chat Admin</span>
            </button>
          )}

          {isChatOpen && (
            <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[450px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-5">
              <div className="bg-black text-white p-4 flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold">Live Chat</h3>
                  <p className="text-xs text-gray-300">Admin Online</p>
                </div>
                <button onClick={() => setIsChatOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-20">
                    Mulai percakapan...
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div
                        key={idx}
                        className={`max-w-[80%] flex flex-col ${
                          isUser
                            ? "self-end items-end"
                            : "self-start items-start"
                        }`}
                      >
                        <div
                          className={`p-3 text-sm shadow-sm ${
                            isUser
                              ? "bg-black text-white rounded-2xl rounded-br-none"
                              : "bg-white text-gray-800 border rounded-2xl rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <div className="flex items-center gap-1 px-1 mt-1">
                          <span className="text-[10px] text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {/* TAMPILKAN ICON HANYA JIKA PESAN DARI USER */}
                          {isUser && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-gray-100 flex gap-2"
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-black"
                  placeholder="Tulis pesan..."
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim()}
                  className="bg-black text-white p-2 rounded-full disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Location;
