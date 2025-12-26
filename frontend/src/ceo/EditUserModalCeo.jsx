import React, { useState } from "react";
import { X, User, Mail, AtSign, Lock, Phone, MapPin } from "lucide-react";

const EditUserModalCeo = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    name: user.name,
    email: user.email,
    noTelp: user.no_telp || "",
    alamat: user.alamat || "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "noTelp") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    const dataToSave = { ...formData };
    if (!dataToSave.password) {
      delete dataToSave.password;
    }

    dataToSave.no_telp = dataToSave.noTelp;
    delete dataToSave.noTelp;

    await onSave(user._id, dataToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-8 transform transition-all max-h-[90vh] overflow-y-auto border-2 border-black">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">
            Edit User: {user.username}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="tel" name="noTelp" value={formData.noTelp} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-4 text-gray-400" size={16} />
              <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" rows="3"></textarea>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 border rounded-md focus:ring-2 focus:ring-black" placeholder="Biarkan kosong untuk tidak mengubah" />
            </div>
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="w-full border-2 border-black text-black font-bold py-3 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModalCeo;