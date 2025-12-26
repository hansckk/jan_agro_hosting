import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Edit,
  Trash2,
  UserX,
  UserCheck,
  PlusCircle,
  FileText,
  User,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModalCeo";
import EditUserModalCeo from "./EditUserModalCeo";
import CreateAdminModal from "./CreateAdminModal";

import { Card, Button, Avatar, Badge, Spinner } from "flowbite-react";

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

function UserCeo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isCreateAdminModalOpen, setCreateAdminModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    action: null,
    user: null,
  });
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/get-all-users`);
        if (res.data.success) {
          setUsers(res.data.data);
        } else {
          setError("Gagal mengambil data pengguna");
        }
      } catch (err) {
        console.error(err);
        setError("Kesalahan server saat mengambil pengguna");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API_URL]);

  const handleAdminAdded = (newAdmin) => {
    setUsers((prevUsers) => [newAdmin, ...prevUsers]);
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const res = await axios.put(
        `${API_URL}/admin/update-user/${id}`,
        updatedData
      );
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
      }
    } catch (err) {
      console.error("Error memperbarui pengguna:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/delete-user/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Error menghapus pengguna:", err);
    }
  };

  const handleToggleBan = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/admin/toggle-ban/${id}`);
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));
      }
    } catch (err) {
      console.error("Error toggling ban:", err);
    }
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

  const whiteBtnStyle =
    "border border-gray-300 !bg-white text-gray-900 enabled:hover:!bg-gray-100 focus:ring-0 focus:!bg-white";

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 w-full bg-white">
        <Spinner size="xl" aria-label="Loading users..." color="gray" />
      </div>
    );

  if (error)
    return <div className="text-red-600 font-bold p-6 bg-white">{error}</div>;

  const activeUsers = users.filter((u) => !u.isBanned);
  const bannedUsers = users.filter((u) => u.isBanned);

  const UserTable = ({ title, userList, isBannedList = false }) => (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 border-b pb-2 border-gray-200 text-gray-900">
        {title}{" "}
        <span className="text-sm font-normal ml-2 text-gray-500">
          ({userList.length})
        </span>
      </h3>

      {userList.length === 0 ? (
        <p className="text-gray-500 italic py-4 bg-gray-50 rounded-lg text-center border border-gray-200">
          Tidak ada pengguna di kategori ini.
        </p>
      ) : (
        <div className="relative overflow-x-auto shadow-none border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3">
                  User
                </th>
                <th scope="col" className="px-6 py-3">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
                <th scope="col" className="px-6 py-3">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr
                  key={user._id}
                  className="bg-white border-b border-gray-200 hover:bg-gray-50 text-gray-900"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        {user.avatar ? (
                          <Avatar img={user.avatar} rounded size="md" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                            <User className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="font-medium">
                        <div className="text-gray-900 font-bold">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{user.email}</div>
                    <div className="text-gray-500 text-xs">
                      {formatPhoneNumber(user.phone)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate" title={user.address}>
                      {user.address || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "pemilik" || user.role === "owner" ? (
                      <Badge color="purple" className="inline-flex">
                        Owner
                      </Badge>
                    ) : user.role === "admin" ? (
                      <Badge color="blue" className="inline-flex">
                        Admin
                      </Badge>
                    ) : (
                      <Badge color="success" className="inline-flex">
                        Pengguna
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* BUTTON ACTION: SEMUA PUTIH DENGAN ICON BERWARNA */}
                      <Button
                        color="light"
                        size="xs"
                        pill
                        onClick={() => setEditingUser(user)}
                        title="Edit"
                        className={whiteBtnStyle}
                      >
                        <Edit size={16} className="text-blue-600" />
                      </Button>

                      {isBannedList ? (
                        <Button
                          color="light"
                          size="xs"
                          pill
                          onClick={() => openConfirmation("unban", user)}
                          title="Unban"
                          className={whiteBtnStyle}
                        >
                          <UserCheck size={16} className="text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          color="light"
                          size="xs"
                          pill
                          onClick={() => openConfirmation("ban", user)}
                          title="Ban"
                          className={whiteBtnStyle}
                        >
                          <UserX size={16} className="text-yellow-500" />
                        </Button>
                      )}

                      <Button
                        color="light"
                        size="xs"
                        pill
                        onClick={() => openConfirmation("delete", user)}
                        title="Delete"
                        className={whiteBtnStyle}
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    </div>
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
      btnColor: "bg-red-600 hover:bg-red-700 text-white",
    },
    ban: {
      title: "Blokir Pengguna",
      message: `Apakah Anda yakin ingin memblokir @${confirmation.user?.username}?`,
      btnText: "Blokir",
      btnColor: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    unban: {
      title: "Buka Blokir Pengguna",
      message: `Apakah Anda yakin ingin memulihkan @${confirmation.user?.username}?`,
      btnText: "Buka Blokir",
      btnColor: "bg-green-500 hover:bg-green-600 text-white",
    },
  };

  const details = confirmationDetails[confirmation.action] || {};

  return (
    <div className="w-full min-h-screen bg-white text-gray-900 p-6 space-y-8 font-sans">
      {/* MODALS */}
      {editingUser && (
        <EditUserModalCeo
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdate}
        />
      )}
      {isCreateAdminModalOpen && (
        <CreateAdminModal
          onClose={() => setCreateAdminModalOpen(false)}
          onAdminAdded={handleAdminAdded}
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

      {/* --- MAIN CARD --- */}
      <Card className="bg-white border-2 border-gray-200 shadow-lg [&>div]:bg-white">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              User Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage all registered users and admins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* TOMBOL PUTIH SEMUA */}
            <Button
              color="light"
              onClick={() => navigate("/laporan-user-ceo")}
              className={`w-full sm:w-auto ${whiteBtnStyle}`}
            >
              <FileText size={18} className="mr-2 text-gray-900" />
              <span className="text-gray-900 font-medium">Laporan User</span>
            </Button>

            <Button
              color="light"
              onClick={() => setCreateAdminModalOpen(true)}
              className={`w-full sm:w-auto ${whiteBtnStyle}`}
            >
              <PlusCircle size={18} className="mr-2 text-gray-900" />
              <span className="text-gray-900 font-medium">Create Admin</span>
            </Button>
          </div>
        </div>

        {/* TABLES */}
        <UserTable title="Pengguna Aktif" userList={activeUsers} />
        <UserTable
          title="Pengguna Diblokir"
          userList={bannedUsers}
          isBannedList={true}
        />
      </Card>
    </div>
  );
}

export default UserCeo;
