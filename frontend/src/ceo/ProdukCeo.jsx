import React, { useState } from "react";
import { Plus, X, Edit, Trash2, Upload, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProdukCeo({ produk = [], onAdd, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    detail: "",
    image: "",
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
      alert("Please select a valid image file (PNG or JPG).");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Please select a product image by uploading a new file.");
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
    setForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      detail: "",
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    const fileInput = document.getElementById("image-upload-native");
    if (fileInput) fileInput.value = "";
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
    window.scrollTo(0, 0);
  };

  const handleDelete = (id, name) => {
    if (
      window.confirm(`Are you sure you want to delete the product "${name}"?`)
    ) {
      onDelete(id);
    }
  };

  const isFormInvalid =
    !form.name ||
    !form.category ||
    !imagePreview ||
    !form.detail ||
    form.price <= 0 ||
    form.stock < 0;

  // --- STYLE CLASSES MANUAL (AGAR TIDAK ERROR & PASTI PUTIH) ---
  // Input Style: Background abu terang, border abu, text hitam.
  const inputClass =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5";
  const labelClass = "block mb-2 text-sm font-medium text-gray-900";

  // Button Styles
  const btnPrimary =
    "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 focus:outline-none flex items-center justify-center gap-2";
  const btnSecondary =
    "py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-2";
  const btnNav =
    "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 flex items-center gap-2";

  // Table Styles
  const thClass =
    "px-6 py-3 bg-gray-100 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200";
  const tdClass =
    "px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200";

  return (
    // WRAPPER UTAMA: Putih bersih, teks hitam
    <div className="w-full min-h-screen bg-white text-gray-900 p-6 space-y-8 font-sans">
      {/* --- CARD FORM --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        {/* Header Form */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-4 border-b border-gray-200 gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingId ? "Edit Product Details" : "Add New Products"}
          </h2>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {/* Tombol Navigasi Manual - Pasti terlihat jelas */}
            <button
              onClick={() => navigate("/laporan-barang-terlaku-ceo")}
              className={btnNav}
            >
              <FileText size={16} /> Product Report
            </button>
            <button
              onClick={() => navigate("/laporan-stok-ceo")}
              className={btnNav}
            >
              <FileText size={16} /> Stock Report
            </button>
            <button
              onClick={() => navigate("/laporan-movement-ceo")}
              className={btnNav}
            >
              <FileText size={16} /> Movement Report
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Product Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className={labelClass}>
              Product name
            </label>
            <input
              id="name"
              type="text"
              className={inputClass}
              placeholder="Example: Pupuk Organik Super"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Tools">Tools</option>
              <option value="Seeds">Seeds</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image-upload-native" className={labelClass}>
              Product Image (PNG/JPG)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-24 h-24 flex items-center justify-center border border-gray-300 rounded bg-gray-50 overflow-hidden shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Preview</span>
                )}
              </div>

              <div className="w-full">
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  id="image-upload-native"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                />
                <p className="mt-1 text-xs text-gray-500">PNG or JPG only.</p>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Short Description
            </label>
            <textarea
              id="description"
              className={inputClass}
              placeholder="A brief summary of the product"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows="3"
            />
          </div>

          {/* Full Details */}
          <div className="md:col-span-2">
            <label htmlFor="detail" className={labelClass}>
              Full Details (Required)
            </label>
            <textarea
              id="detail"
              className={inputClass}
              placeholder="Complete product specifications"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows="5"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className={labelClass}>
              Price (IDR)
            </label>
            <input
              id="price"
              type="number"
              className={inputClass}
              placeholder="Example: 25000"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Math.max(0, Number(e.target.value)) })
              }
              required
            />
          </div>

          {/* Stock */}
          <div>
            <label htmlFor="stock" className={labelClass}>
              Stock Quantity
            </label>
            <input
              id="stock"
              type="number"
              className={inputClass}
              placeholder="Example: 100"
              value={form.stock}
              onChange={(e) =>
                setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })
              }
              required
            />
          </div>

          {/* Action Buttons - MANUAL TAILWIND AGAR TIDAK ERROR & SESUAI WARNA */}
          <div className="flex flex-col sm:flex-row md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={isFormInvalid}
              className={`${btnPrimary} ${
                isFormInvalid ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus className="h-5 w-5" />
              {editingId ? "Update Products" : "Add Product"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className={btnSecondary}
              >
                <X className="h-5 w-5" /> Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Product Inventory List
        </h2>

        <div className="relative overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className={thClass}>
                  Image
                </th>
                <th scope="col" className={thClass}>
                  Product Name
                </th>
                <th scope="col" className={thClass}>
                  Category
                </th>
                <th scope="col" className={thClass}>
                  Price
                </th>
                <th scope="col" className={thClass}>
                  Stock
                </th>
                <th scope="col" className={`${thClass} text-center`}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {produk.length === 0 ? (
                <tr className="bg-white border-b border-gray-200">
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-gray-500 italic"
                  >
                    There are no products yet or they are loading...
                  </td>
                </tr>
              ) : (
                produk.map((p) => (
                  <tr
                    key={p._id}
                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className={tdClass}>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded border border-gray-300"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className={`${tdClass} font-semibold`}>{p.name}</td>
                    <td className={tdClass}>{p.category}</td>
                    <td className={tdClass}>
                      Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td className={tdClass}>{p.stock}</td>
                    <td className={`${tdClass} text-center`}>
                      <div className="flex justify-center gap-2">
                        {/* Tombol Edit Manual */}
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {/* Tombol Delete Manual */}
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProdukCeo;
