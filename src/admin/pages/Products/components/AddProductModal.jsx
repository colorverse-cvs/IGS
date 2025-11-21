import { X, Upload } from "lucide-react";
import { useRef, useState } from "react";

export default function AddProductModal({ onClose }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const openFileDialog = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setPreview(URL.createObjectURL(file)); // preview image
        }
    };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] rounded-2xl shadow-xl p-6">
      
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-gray-800">Add New Product</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </div>

       
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>  

            <div className="flex items-center gap-6">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {/* Upload Box */}
                <div
                    onClick={openFileDialog}
                   className={`w-24 h-24 border-2 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer transition
                    ${preview ? "border-none" : "border-dashed hover:border-purple-500"}`}
                >
                    {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                    />
                    ) : (
                    <Upload />
                    )}
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                placeholder="Teddy Bear - Small"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                </label>

                <select
                    defaultValue=""
                    className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                >
                    <option value="" disabled hidden>
                    Select Category
                    </option>
                    <option value="Soft Toys">Soft Toys</option>
                    <option value="Home Decor">Home Decor</option>
                    <option value="Cards">Cards</option>
                    <option value="Personalized">Personalized</option>
                    <option value="Hampers">Hampers</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                placeholder="350"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (₹)
              </label>
              <input
                type="number"
                placeholder="299"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                placeholder="2"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 cursor-pointer rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-purple-700 cursor-pointer text-white rounded-lg hover:bg-purple-800">
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
