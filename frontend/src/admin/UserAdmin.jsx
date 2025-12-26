import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Edit, Trash2, UserX, UserCheck, User } from "lucide-react";
import {
  fetchUsers,
  deleteUser,
  toggleBanUser,
} from "../features/admin/adminSlice";
import ConfirmationModal from "./ConfirmationModal";
import EditUserModal from "./EditUserModal";

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

function UserAdmin() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);

  const [editingUser, setEditingUser] = useState(null);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    action: null,
    user: null,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  };

  const handleToggleBan = (id) => {
    dispatch(toggleBanUser(id));
  };

  const openConfirmation = (action, user) => {
    setConfirmation({ isOpen: true, action, user });
  };
  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, action: null, user: null });
  };
  const handleConfirm = () => {
    const { action, user } = confirmation;
    if (action === "delete") handleDelete(user._id);
    else if (action === "ban" || action === "unban") handleToggleBan(user._id);
    closeConfirmation();
  };

  if (loading)
    return <div className="text-gray-500 italic">Memuat data pengguna...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const activeUsers = users.filter((u) => !u.isBanned);
  const bannedUsers = users.filter((u) => u.isBanned);

  const UserTable = ({ title, userList, isBannedList = false }) => (
    <div>
      <h3 className="text-lg font-bold mb-3">
        {title} ({userList.length})
      </h3>
      {userList.length === 0 ? (
        <p className="text-gray-500 italic">
          Tidak ada pengguna di kategori ini.
        </p>
      ) : (
        <div className="overflow-x-auto max-h-[450px] overflow-y-auto border-2 border-black rounded-lg">
          <table className="min-w-full divide-y-2 divide-gray-300">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y-2 divide-gray-300">
              {userList.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {/* --- PERUBAHAN DI SINI --- */}
                        {user.avatar ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={user.avatar} // Langsung pakai URL Cloudinary
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-black">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      {formatPhoneNumber(user.phone)}
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate"
                    title={user.address}
                  >
                    {user.address || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === "pemilik"
                          ? "bg-purple-200 text-purple-800"
                          : user.role === "admin"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 text-gray-500 hover:text-black"
                      title="Edit Pengguna"
                    >
                      <Edit size={16} />
                    </button>
                    {isBannedList ? (
                      <button
                        onClick={() => openConfirmation("unban", user)}
                        className="p-2 text-green-500 hover:text-green-700"
                        title="Buka Blokir"
                      >
                        <UserCheck size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => openConfirmation("ban", user)}
                        className="p-2 text-yellow-500 hover:text-yellow-700"
                        title="Blokir Pengguna"
                      >
                        <UserX size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openConfirmation("delete", user)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const confirmationDetails = {
    delete: {
      title: "Hapus Pengguna",
      message: `Apakah Anda yakin ingin menghapus @${confirmation.user?.username} secara permanen?`,
      btnText: "Hapus",
      btnColor: "bg-red-600 hover:bg-red-700",
    },
    ban: {
      title: "Blokir Pengguna",
      message: `Apakah Anda yakin ingin memblokir @${confirmation.user?.username}?`,
      btnText: "Blokir",
      btnColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    unban: {
      title: "Buka Blokir Pengguna",
      message: `Apakah Anda yakin ingin memulihkan @${confirmation.user?.username}?`,
      btnText: "Buka Blokir",
      btnColor: "bg-green-500 hover:bg-green-600",
    },
  };

  const details = confirmationDetails[confirmation.action] || {};

  return (
    <>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        title={details.title}
        message={details.message}
        confirmButtonText={details.btnText}
        confirmButtonColor={details.btnColor}
      />

      <div className="bg-white border-2 border-black rounded-lg p-6 space-y-8 shadow-xl">
        <h2 className="text-2xl font-black pb-4 border-b-2 border-black">
          User Management (Admin)
        </h2>
        <UserTable title="Pengguna Aktif" userList={activeUsers} />
        <UserTable
          title="Pengguna Diblokir"
          userList={bannedUsers}
          isBannedList={true}
        />
      </div>
    </>
  );
}

export default UserAdmin;