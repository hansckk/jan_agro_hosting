import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  Send,
  MessageSquare,
  AlertTriangle,
  Check,
  CheckCheck,
  Clock,
} from "lucide-react";

// --- CONFIG URL ---
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const cleanBaseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
const SOCKET_URL = cleanBaseUrl.replace(/\/api$/, "");
const API_BASE = cleanBaseUrl.endsWith("/api")
  ? cleanBaseUrl
  : `${cleanBaseUrl}/api`;

const socket = io(SOCKET_URL);

// --- KOMPONEN IKON STATUS ---
const StatusIcon = ({ status }) => {
  if (status === "pending")
    return <Clock size={14} className="text-gray-400" />;
  if (status === "sent") return <Check size={14} className="text-gray-400" />;
  if (status === "delivered")
    return <CheckCheck size={14} className="text-gray-400" />;
  if (status === "read")
    return <CheckCheck size={14} className="text-blue-500" />;
  return <Check size={14} className="text-gray-400" />;
};

const ChatAdmin = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const selectedChatRef = useRef(null);

  // Sync Ref untuk menghindari stale closure di socket
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    if (selectedChat) {
      updateMessageStatus(selectedChat._id, "read");
    }
  }, [selectedChat]);

  const updateMessageStatus = async (chatId, status) => {
    try {
      await axios.post(
        `${API_BASE}/chat/update-status`,
        { chatId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    if (token) fetchChats();
    else setErrorMsg("Token missing.");

    socket.emit("join_admin"); // Admin masuk ke room yang sama dengan CEO

    // --- 1. PESAN MASUK ---
    const handleReceiveMessage = (data) => {
      // Abaikan pesan yang dikirim oleh admin/ceo (sender='admin')
      if (data.message.sender === "admin") return;

      const currentSelected = selectedChatRef.current;
      
      const isCurrentChat = 
         (currentSelected && currentSelected._id === data.chatId) || 
         (currentSelected && currentSelected.userId?._id === data.userId);

      if (isCurrentChat) {
        updateMessageStatus(data.chatId, "read");
      } else {
        updateMessageStatus(data.chatId, "delivered");
      }

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.userId?._id === data.userId);
        let newChats = [...prev];

        if (idx !== -1) {
          const updatedChat = { ...newChats[idx] };
          updatedChat.messages = [...updatedChat.messages, data.message];
          updatedChat.lastMessageAt = new Date();
          newChats.splice(idx, 1);
          newChats.unshift(updatedChat);
        } else {
          fetchChats();
        }
        return newChats;
      });

      setSelectedChat((prev) => {
        if (prev && prev.userId && prev.userId._id === data.userId) {
          return { ...prev, messages: [...prev.messages, data.message] };
        }
        return prev;
      });
    };

    // --- 2. STATUS UPDATE ---
    const handleStatusUpdate = (data) => {
      setChats((prev) =>
        prev.map((c) => {
          const isTargetChat = 
             c._id === data.chatId || 
             c.userId?._id === data.userId;

          if (isTargetChat) {
            const updatedMsgs = c.messages.map((m) => {
              if (m.sender === "admin") {
                if (data.status === "read") return { ...m, status: "read" };
                if (data.status === "delivered" && m.status === "sent") return { ...m, status: "delivered" };
              }
              return m;
            });
            return { ...c, messages: updatedMsgs };
          }
          return c;
        })
      );

      setSelectedChat((prev) => {
        if (!prev) return null;
        const isTargetChat = 
             prev._id === data.chatId || 
             prev.userId?._id === data.userId;

        if (isTargetChat) {
          const updatedMsgs = prev.messages.map((m) => {
            if (m.sender === "admin") {
                if (data.status === "read") return { ...m, status: "read" };
                if (data.status === "delivered" && m.status === "sent") return { ...m, status: "delivered" };
            }
            return m;
          });
          return { ...prev, messages: updatedMsgs };
        }
        return prev;
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_status_update", handleStatusUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_status_update", handleStatusUpdate);
    };
  }, [token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedChat?.messages]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/chat/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const validChats = res.data.data.filter((c) => c.userId !== null);
        setChats(validChats);
      }
    } catch (e) {
      if (e.response?.status === 403)
        setErrorMsg("Akses Ditolak. Pastikan role Anda memiliki izin akses chat.");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const optimisticMsg = {
      sender: "admin",
      text: replyText,
      timestamp: new Date(),
      status: "pending",
    };

    const msgToSend = replyText;
    setReplyText("");

    setSelectedChat((prev) => ({
      ...prev,
      messages: [...prev.messages, optimisticMsg],
    }));

    setChats((prev) => {
      const idx = prev.findIndex((c) => c._id === selectedChat._id);
      if (idx === -1) return prev;

      const updated = [...prev];
      const chatToUpdate = { ...updated[idx] };
      chatToUpdate.messages = [...chatToUpdate.messages, optimisticMsg];
      chatToUpdate.lastMessageAt = new Date();

      updated.splice(idx, 1);
      updated.unshift(chatToUpdate);

      return updated;
    });

    try {
      const res = await axios.post(
        `${API_BASE}/chat/admin/reply`,
        { targetUserId: selectedChat.userId._id, text: msgToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const serverMsg = res.data.data.messages[res.data.data.messages.length - 1];
        
        setSelectedChat((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            m === optimisticMsg ? serverMsg : m
          ),
        }));

        setChats((prev) => {
          const idx = prev.findIndex((c) => c._id === selectedChat._id);
          if (idx === -1) return prev;
          const updated = [...prev];
          const chatClone = { ...updated[idx] };
          chatClone.messages = chatClone.messages.map((m) =>
            m.text === optimisticMsg.text && m.status === "pending"
              ? serverMsg
              : m
          );
          updated[idx] = chatClone;
          return updated;
        });
      }
    } catch (error) {
      console.error("Gagal reply:", error);
    }
  };

  const handleChatClick = (chat) => {
    if (selectedChat && selectedChat._id === chat._id) {
        setSelectedChat(null);
    } else {
        setSelectedChat(chat);
        // Langsung tandai read di local state agar badge hilang
        setChats(prevChats => prevChats.map(c => {
            if (c._id === chat._id) {
                const updatedMessages = c.messages.map(m => {
                    if (m.sender !== 'admin' && m.status !== 'read') {
                        return { ...m, status: 'read' };
                    }
                    return m;
                });
                return { ...c, messages: updatedMessages };
            }
            return c;
        }));
    }
  };

  if (errorMsg) return <div className="p-10 text-center">{errorMsg}</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl border border-gray-200 mt-4 font-sans">
      {/* SIDEBAR */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-5 border-b border-gray-100 flex justify-between">
          <h2 className="font-bold text-xl text-gray-900">Pesan Masuk</h2>
          <span className="bg-gray-100 text-xs font-bold px-2 py-1 rounded-full">
            {chats.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {chats.map((chat) => {
            const unreadCount = chat.messages.filter(
                m => m.sender !== 'admin' && m.status !== 'read'
            ).length;

            return (
                <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 border relative ${
                    selectedChat?._id === chat._id
                    ? "bg-black text-white"
                    : "bg-white hover:bg-gray-50"
                }`}
                >
                <div className="w-10 h-10 flex-shrink-0">
                    {chat.userId?.avatar ? (
                    <img 
                        src={chat.userId.avatar} 
                        alt={chat.userId.name} 
                        className="w-full h-full rounded-full object-cover bg-white border border-gray-200"
                    />
                    ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700 uppercase">
                        {chat.userId?.name?.charAt(0) || "?"}
                    </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm truncate pr-2">
                            {chat.userId?.name || "Unknown"}
                        </h4>
                        
                        <div className="flex flex-col items-end gap-1">
                            <span
                                className={`text-[10px] ${
                                selectedChat?._id === chat._id
                                    ? "text-gray-300"
                                    : "text-gray-400"
                                }`}
                            >
                                {new Date(chat.lastMessageAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                })}
                            </span>
                            
                            {/* BADGE UNREAD PER USER */}
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-0.5">
                    {chat.messages.length > 0 &&
                        chat.messages[chat.messages.length - 1]?.sender ===
                        "admin" && (
                        <StatusIcon
                            status={chat.messages[chat.messages.length - 1]?.status}
                        />
                        )}
                    <p
                        className={`text-xs truncate ${
                        selectedChat?._id === chat._id
                            ? "text-gray-300"
                            : "text-gray-500"
                        }`}
                    >
                        {chat.messages[chat.messages.length - 1]?.text}
                    </p>
                    </div>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="w-2/3 flex flex-col bg-gray-50 relative">
        {selectedChat ? (
          <>
            <div className="px-6 py-4 bg-white border-b border-gray-100 shadow-sm z-10 flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0">
                {selectedChat.userId?.avatar ? (
                  <img 
                    src={selectedChat.userId.avatar} 
                    alt={selectedChat.userId.name} 
                    className="w-full h-full rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center font-bold text-lg uppercase">
                    {selectedChat.userId?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  {selectedChat.userId?.name}
                </h2>
                <p className="text-xs text-green-600">Online Customer</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
              {selectedChat.messages.map((msg, idx) => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={idx}
                    className={`max-w-[75%] flex flex-col ${
                      isAdmin ? "items-end self-end" : "items-start self-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 text-sm shadow-sm ${
                        isAdmin
                          ? "bg-black text-white rounded-2xl rounded-tr-none"
                          : "bg-white text-gray-800 border rounded-2xl rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isAdmin && <StatusIcon status={msg.status} />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={handleReply}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-sm"
                  placeholder="Balas pesan..."
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-black text-white p-2.5 rounded-full disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <MessageSquare size={40} className="mb-2 opacity-30" />
            <p>Pilih percakapan untuk memulai</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAdmin;