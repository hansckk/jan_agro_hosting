import React, { useState } from "react";
import { Plus, X, Upload, Edit, Trash2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProdukAdmin({ produk = [], onAdd, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", category: "", price: "", stock: "", description: "", detail: "", image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setForm({ ...form, image: "" });
    } else {
      setImageFile(null);
      setImagePreview(null);
      e.target.value = null;
      alert("Silakan pilih file gambar yang valid (PNG atau JPG).");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Silakan pilih gambar produk dengan mengunggah file.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", Number(form.price));
    formData.append("stock", Number(form.stock));
    formData.append("description", form.description);
    formData.append("detail", form.detail);

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (form.image) {
      formData.append("image", form.image);
    }

    if (!editingId) {
      formData.append("rating", 0);
    }

    if (editingId) {
      onUpdate(editingId, formData);
    } else {
      onAdd(formData);
    }
    handleCancel();
  };

  const handleCancel = () => {
    setForm({ name: "", category: "", price: "", stock: "", description: "", detail: "", image: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (document.getElementById("admin-image-upload")) {
      document.getElementById("admin-image-upload").value = null;
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Anda yakin ingin menghapus produk "${name}"?`)) {
      onDelete(id);
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, 
      category: p.category, 
      price: p.price, 
      stock: p.stock,
      description: p.description || "", 
      detail: p.detail || "", 
      image: p.image || "",
    });
    setEditingId(p._id);
    setImageFile(null);

    if (p.image) {
      setImagePreview(p.image); 
    } else {
      setImagePreview(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFormInvalid = !form.name || !form.category || !imagePreview || !form.detail || form.price <= 0 || form.stock < 0;

  return (
    <>
      <div className="space-y-8">
        {/* Form Section */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                    <input type="text" placeholder="Example: Urea Fertilizer" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent outline-none" required />
                </div>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none bg-white" required>
                      <option value="" disabled>Select Category</option>
                      <option value="Fertilizer">Fertilizer</option>
                      <option value="Tools">Tools</option>
                      <option value="Seeds">Seeds</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Product Image</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                        {imagePreview ? (<img src={imagePreview} alt="Pratinjau" className="w-full h-full object-cover"/>) : (<span className="text-gray-400 text-xs text-center px-1">No Image</span>)}
                        </div>
                        <div className="flex-1">
                            <input type="file" id="admin-image-upload" accept="image/png, image/jpeg" onChange={handleImageChange} className="hidden"/>
                            <label htmlFor="admin-image-upload" className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 text-sm font-medium cursor-pointer flex items-center justify-center transition-colors">
                              <Upload size={18} className="mr-2"/> Choose Image
                            </label>
                            <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG. Max: 2MB</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
                    <textarea placeholder="Short summary of the product..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none" rows="2"/>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
                    <textarea placeholder="Full product specifications..." value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none" rows="4" required/>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rp)</label>
                    <input type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: Math.max(0, Number(e.target.value)) })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none" required/>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                    <input type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black outline-none" required/>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" disabled={isFormInvalid} className={`flex-1 justify-center bg-black text-white px-6 py-3 rounded-md font-bold flex items-center transition-all ${isFormInvalid ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}>
                <Plus className="mr-2 h-5 w-5" /> {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="flex-1 justify-center bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-md font-bold hover:bg-gray-50 flex items-center transition-all">
                  <X className="w-5 h-5 mr-2" /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Product Section */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-4 border-b border-gray-100 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Product List</h2>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                onClick={() => navigate("/laporan-stok-admin")}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow-sm font-medium text-sm"
              >
                <FileText size={16} />
                <span>Stock Report</span>
              </button>
              <button
                onClick={() => navigate("/laporan-movement-admin")}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium text-sm"
              >
                <FileText size={16} />
                <span>Stock Movement Report</span>
              </button>
            </div>
          </div>

          {produk.length === 0 ? (<p className="text-gray-500 text-center py-8">No products available.</p>) : (
            // PERUBAHAN DISINI:
            // 1. max-h-[450px]: Memberi batas tinggi kira-kira untuk 5 baris produk.
            // 2. overflow-y-auto: Memunculkan scrollbar jika lebih dari tinggi tsb.
            <div className="overflow-x-auto overflow-y-auto max-h-[450px] rounded-lg border border-gray-200">
              <table className="w-full border-collapse min-w-[700px]">
                {/* 
                   PERUBAHAN HEADER:
                   sticky: Agar header menempel saat di scroll.
                   top-0: Posisi menempel di atas.
                   z-10: Agar berada di atas konten saat di scroll.
                   bg-gray-50: Memberi warna background agar tulisan di baliknya tidak tembus.
                */}
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600 border-b w-20">Image</th>
                    <th className="p-3 text-left font-semibold text-gray-600 border-b">Product Name</th>
                    <th className="p-3 text-left font-semibold text-gray-600 border-b w-32">Category</th>
                    <th className="p-3 text-right font-semibold text-gray-600 border-b w-32">Price</th>
                    <th className="p-3 text-center font-semibold text-gray-600 border-b w-24">Stock</th>
                    <th className="p-3 text-center font-semibold text-gray-600 border-b w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {produk.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        {p.image ? (
                            <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded border border-gray-200"/>
                        ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 border border-gray-200">No IMG</div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-gray-900">{p.name}</td>
                      <td className="p-3 text-gray-600 text-sm">{p.category}</td>
                      <td className="p-3 text-right font-mono text-sm">Rp {p.price.toLocaleString("id-ID")}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock <= 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {p.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                onClick={() => handleEdit(p)} 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(p._id, p.name)} 
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Hapus"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProdukAdmin;