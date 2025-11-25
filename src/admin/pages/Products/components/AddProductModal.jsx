import { X, Upload } from "lucide-react";
import { useRef, useState } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

export default function AddProductModal({ onClose }) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [prodCategory, setProdCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stock: ""
  });

  const productCategory = [
    "Soft Toys",
    "Home Decor",
    "Cards",
    "Personalized",
    "Hampers"
  ];

  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["price", "discountPrice", "stock"].includes(name)) {
      setFormData({ ...formData, [name]: allowOnlyNumbers(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleAddNewProduct = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          description: "Ergonomic wireless mouse",
          price: Number(formData.price),
          sku: "WM-12345",
          quantity: Number(formData.stock),
          categoryId: "6925df66617fc8e7b0ddd573",
          images: [{
            url : "https://pikaso.cdnpk.net/private/production/1837955319/upload.png",
            alt: formData.name
          }],
          tags: []
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend rejected:", data);
        return;
      }

      console.log("✅ Product created:", data);

    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const isFormValid =
    preview &&
    formData.name.trim() !== "" &&
    prodCategory !== "" &&
    formData.price !== "" &&
    formData.stock !== "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl p-5 md:p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-gray-800">
            Add New Product
          </p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </div>

        <div className="space-y-5">

          {/* IMAGE SECTION - MOBILE STYLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <div
                onClick={openFileDialog}
                className={`w-20 h-20 border-2 rounded-xl flex items-center justify-center cursor-pointer
                ${preview ? "border-none" : "border-dashed border-gray-200"}`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Upload className="text-gray-400" />
                )}
              </div>

              <button
                type="button"
                onClick={openFileDialog}
                className="border border-gray-200 px-4 py-2 rounded-lg text-sm"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Teddy Bear"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Category *
            </label>
            <Dropdown
              options={productCategory}
              value={prodCategory}
              onChange={(val) => setProdCategory(val)}
              placeholder="Select Category"
            />
          </div>

          {/* PRICE + DISCOUNT - 2 COL */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Price (₹) *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="350"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Discount (₹)
              </label>
              <input
                type="text"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="299"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            {/* DESKTOP ONLY THIRD COLUMN */}
            <div className="hidden md:block">
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Stock Qty *
              </label>
              <input
                type="text"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="2"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* STOCK - MOBILE FULL */}
          <div className="md:hidden">
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Stock Qty *
            </label>
            <input
              type="text"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="10"
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

        </div>

        {/* BUTTONS - MOBILE STACK */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-5 py-2 border border-gray-300 rounded-lg text-gray-600"
          >
            Cancel
          </button>

          <button
            disabled={!isFormValid}
            className={`w-full md:w-auto px-5 py-2 rounded-lg text-white
              ${isFormValid
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300 cursor-not-allowed"}`}
                onClick={()=> handleAddNewProduct()}
          >
            Add Product
          </button>
        </div>

      </div>
    </div>
  );
}

