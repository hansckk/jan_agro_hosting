import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Tambah useLocation
import {
  Star,
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  X,
  Video
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const Review = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk ambil state

  // 1. AMBIL ORDER ID DARI STATE
  const orderId = location.state?.orderId;

  const galleryInputRef = useRef(null); 
  const cameraInputRef = useRef(null);  

  const { token } = useSelector((state) => state.users);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 2. CEK VALIDASI AKSES
  useEffect(() => {
    if (!orderId) {
      alert("Invalid access. Please write a review from the Order History page.");
      navigate("/pesanan");
    }
  }, [orderId, navigate]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/products/get-all-products`);
        const found = response.data.data.find((p) => p._id === productId);
        if (found) setProduct(found);
        else setError("Product not found.");
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product info.");
      } finally {
        setLoadingProduct(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;

    if (selectedFiles.length + files.length > 6) {
      alert("You can only upload a maximum of 6 photos/videos.");
      return;
    }

    const validFiles = files.filter(file => {
      const isMedia = file.type.startsWith("image/") || file.type.startsWith("video/");
      const isSizeOk = file.size <= 10 * 1024 * 1024; // 10MB
      return isMedia && isSizeOk;
    });

    if (validFiles.length !== files.length) {
      alert("Some files were rejected. Only Images/Videos under 10MB allowed.");
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);

    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image"
    }));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    
    URL.revokeObjectURL(newPreviews[index].url);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    setError("");
    
    // Validasi dasar
    if (!orderId) {
      setError("Missing Order ID.");
      return;
    }
    if (rating === 0) {
      setError("Please give a star rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("productId", productId);
      // 3. KIRIM ORDER ID KE BACKEND
      formData.append("orderId", orderId); 
      formData.append("rating", rating);
      formData.append("comment", comment);

      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      await axios.post(`${API_URL}/reviews/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Review submitted successfully!");
      navigate("/pesanan");
    } catch (err) {
      console.error("Submit review error:", err);
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) return <div className="pt-24 text-center">Loading...</div>;

  // Jika orderId tidak ada, jangan render form (cegah user submit)
  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <button onClick={() => navigate("/pesanan")} className="flex items-center gap-2 mb-6 text-gray-600 hover:text-black">
          <ArrowLeft size={20} /> Back
        </button>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold mb-6">Write a Review</h1>
          
          {/* Product Card */}
          {product && (
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-md mb-8 border">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded border overflow-hidden shrink-0">
                <img src={product.image || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">{product.category}</p>
                <p className="text-xs text-gray-400 mt-1">Order ID: #{orderId.substring(0, 8)}</p>
              </div>
            </div>
          )}

          {/* Stars */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Rate Product <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star size={32} className={(hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black text-sm sm:text-base"
              rows="4"
              placeholder="How was the quality?"
            ></textarea>
          </div>

          {/* Media Upload */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-2">Add Photos/Videos (Max 6)</label>
            
            <input
              type="file"
              ref={galleryInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/mp4,video/quicktime"
              multiple
            />
            
            <input
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
              capture="environment" 
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              {/* Preview List */}
              {previews.map((file, idx) => (
                <div key={idx} className="relative w-full aspect-square border rounded-md overflow-hidden bg-black group">
                  {file.type === 'video' ? (
                    <video src={file.url} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                  )}
                  
                  {file.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Video className="text-white w-8 h-8 drop-shadow-md" />
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              {selectedFiles.length < 6 && (
                <div className="flex flex-col gap-2 w-full aspect-square">
                   <button
                    onClick={() => galleryInputRef.current.click()}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                  >
                    <ImageIcon size={20} />
                    <span className="text-[10px] sm:text-xs mt-1">Gallery</span>
                  </button>
                  
                  <button
                    onClick={() => cameraInputRef.current.click()}
                    className="flex-1 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center hover:bg-gray-50 text-gray-500 transition-colors"
                  >
                    <Camera size={20} />
                    <span className="text-[10px] sm:text-xs mt-1">Camera</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-black text-white py-4 rounded-md font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Review;