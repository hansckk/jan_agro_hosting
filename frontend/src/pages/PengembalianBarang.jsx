import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const PengembalianBarang = ({ order, onSubmitReturn }) => {
  const [reason, setReason] = useState("");
  const [videos] = useState([{ id: 1, icon: "📹" }]);
  const [photos] = useState([
    { id: 1, icon: "📸" },
    { id: 2, icon: "📸" },
    { id: 3, icon: "📸" },
    { id: 4, icon: "📸" },
    { id: 5, icon: "📸" },
    { id: 6, icon: "📸" },
  ]);

  const isFormValid =
    reason.trim() !== "" && videos.length >= 1 && photos.length >= 6;

  const handleSubmit = () => {
    if (!isFormValid) return;
    const returnData = {
      orderId: order.id,
      reason,
      videos: videos.map((v) => `dummy_video_${v.id}.mp4`),
      photos: photos.map((p) => `dummy_photo_${p.id}.jpg`),
    };
    onSubmitReturn(returnData);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <p>Order not found. Please go back.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Converted to Link */}
        <Link
          to="/pesanan"
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back to Order History
        </Link>

        <div className="bg-white p-8 rounded-lg border">
          <h1 className="text-3xl font-bold text-black mb-2">
            Submit a Product Return
          </h1>
          <p className="text-gray-500 mb-6">For Order #{order.id}</p>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for Return
              </label>
              <textarea
                id="reason"
                rows="5"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe in detail the reason you want to return this product..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              ></textarea>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Video Evidence (Minimum 1)
              </h3>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed rounded-md">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="w-24 h-24 bg-gray-100 rounded-md flex flex-col items-center justify-center"
                  >
                    <span className="text-4xl">{video.icon}</span>
                    <span className="text-xs mt-1">Video {video.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Photo Evidence (Minimum 6)
              </h3>
              <div className="flex flex-wrap gap-4 p-4 border-2 border-dashed rounded-md">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="w-24 h-24 bg-gray-100 rounded-md flex flex-col items-center justify-center"
                  >
                    <span className="text-4xl">{photo.icon}</span>
                    <span className="text-xs mt-1">Photo {photo.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-black text-white rounded-md font-semibold transition disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800"
              >
                <Send size={18} />
                Submit Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengembalianBarang;
