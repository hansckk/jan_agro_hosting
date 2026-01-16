import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  User,
  Mail,
  Calendar,
  Edit,
  AtSign,
  Phone,
  MapPin,
} from "lucide-react";
import EditProfileModal from "../components/EditProfileModal";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "production"
    ? "/api"
    : "http://localhost:3000/api");

const formatPhoneNumber = (phone) => {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  let formatted = "+62 ";
  if (digits.length > 4) {
    formatted += digits.substring(0, 4) + "-";
    if (digits.length > 8) {
      formatted += digits.substring(4, 8) + "-";
      formatted += digits.substring(8);
    } else {
      formatted += digits.substring(4);
    }
  } else {
    formatted += digits;
  }
  return formatted;
};

const Profile = ({ user, onProfileSave, onAvatarUpdateSuccess }) => {
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user && user.avatar) {
      setPreview(user.avatar);
    } else {
      setPreview(null);
    }
  }, [user]);

  const handleFileChange = async (event) => {
    console.log(user._id);

    const file = event.target.files[0];
    if (!file) return;

    if (file && file.type.startsWith("image/")) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUploadError("Autentikasi gagal. Silakan login kembali.");
          return;
        }

        console.log("[Frontend] Starting avatar upload");
        console.log("[Frontend] File:", {
          name: file.name,
          type: file.type,
          size: file.size,
        });

        const response = await axios.put(
          `${API_URL}/users/update-avatar/${user._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("[Frontend] Upload response:", response.data);

        if (response.data.success) {
          console.log("[Frontend] Avatar URL from server:", response.data.user.avatar);
          onAvatarUpdateSuccess(response.data.user);
          setPreview(response.data.user.avatar);
          setUploadError("");
        }
      } catch (error) {
        console.error("Upload error:", error);
        console.error("Upload error response:", error.response?.data);
        const message =
          error.response?.data?.message || "Gagal mengupload gambar.";
        setUploadError(message);
        setPreview(user?.avatar || null);
      }
    } else {
      setUploadError("Hanya file gambar yang diizinkan (jpg, png).");
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current.click();
  };

  if (!user) {
    return (
      <div className="pt-24 text-center">
        Silakan masuk untuk melihat profil Anda.
      </div>
    );
  }

  const handleSaveFromModal = async (userId, payload) => {
    const result = await onProfileSave(userId, payload);
    return result;
  };

  return (
    <>
      {isModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveFromModal}
        />
      )}

      <div className="bg-white min-h-screen pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 sm:p-8 md:p-12 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-black">
                Pengaturan Akun
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Kelola detail profil dan akun Anda.
              </p>
            </div>

            {uploadError && (
              <p className="text-center text-red-500 mb-4">{uploadError}</p>
            )}

            <div className="flex flex-col items-center space-y-4 mb-8 sm:mb-12">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={64} className="text-gray-400" />
                  )}
                </div>
                <button
                  onClick={handleCameraClick}
                  className="absolute bottom-1 right-1 w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors border-2 border-white"
                  aria-label="Change avatar"
                >
                  <Camera size={18} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg"
                />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-black">
                {user.name}
              </h2>
            </div>

            <div className="border-t border-gray-200 pt-6 sm:pt-8">
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-6">
                Informasi Profil
              </h3>
              <div className="space-y-4">
                {[
                  { Icon: User, label: "Nama Lengkap", val: user.name },
                  { Icon: AtSign, label: "Username", val: user.username },
                  { Icon: Mail, label: "Email", val: user.email },
                  {
                    Icon: Phone,
                    label: "Phone Number",
                    val: formatPhoneNumber(user.phone),
                  },
                  {
                    Icon: MapPin,
                    label: "Address",
                    val: user.address || "Alamat belum diatur",
                    multiline: true,
                  },
                  {
                    Icon: Calendar,
                    label: "Joined Since",
                    val:
                      user.joinDate ||
                      new Date(user.createdAt).toLocaleDateString("id-ID"),
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-start p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center mb-2 sm:mb-0">
                      <item.Icon
                        className="text-gray-400 mr-4 flex-shrink-0"
                        size={20}
                      />
                      <p className="text-sm text-gray-500 sm:w-32 sm:hidden">
                        {item.label}
                      </p>
                    </div>
                    <div className="flex-grow sm:ml-4">
                      <p className="hidden sm:block text-sm text-gray-500">
                        {item.label}
                      </p>
                      <p
                        className={`text-black font-medium text-sm sm:text-base ${
                          item.multiline
                            ? "whitespace-pre-line break-words"
                            : "break-all"
                        }`}
                      >
                        {item.val}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 bg-black text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
              >
                <Edit size={16} /> <span>Edit Profile and Security</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
