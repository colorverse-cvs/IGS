import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

export default function AddProductModal({ onClose, onProductAdded }) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [prodCategory, setProdCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stock: "",
  });

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:3000/api/v1/products/categories");
        const data = await res.json();

        if (res.ok && Array.isArray(data?.data)) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // SKU Generator
  const generateSKU = (name) => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "PRD";
    const code = Date.now().toString().slice(-6);
    return `${prefix}-${code}`;
  };

  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["price", "discountPrice", "stock"].includes(name)) {
      setFormData({ ...formData, [name]: allowOnlyNumbers(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Submit product
  const handleAddNewProduct = async () => {
    try {
      const selectedCategory = categories.find((c) => c.name === prodCategory);

      if (!selectedCategory) {
        alert("Please select a category.");
        return;
      }

      const sku = generateSKU(formData.name);

      const formDataToSend = new FormData();
      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) formDataToSend.append("images", imageFile);

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", "Product description...");
      formDataToSend.append("price", Number(formData.price));
      formDataToSend.append("discount", Number(formData.discountPrice || 0));
      formDataToSend.append("quantity", Number(formData.stock));
      formDataToSend.append("stock", Number(formData.stock));
      formDataToSend.append("categoryId", selectedCategory._id);
      formDataToSend.append("sku", sku);
      formDataToSend.append("tags", JSON.stringify([]));

      const response = await fetch("http://localhost:3000/api/v1/products", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Backend error:", data);
        return;
      }

      onProductAdded?.();  // refresh products
      onClose();           // close modal

    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  const isFormValid =
    preview &&
    formData.name.trim() &&
    prodCategory.trim() &&
    formData.price &&
    formData.stock;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold">Add New Product</p>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="space-y-5">

          {/* Image Upload */}
          <div>
            <label className="text-sm mb-2 block">Product Image</label>

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
                className={`w-20 h-20 border-2 rounded-xl flex items-center justify-center cursor-pointer ${
                  preview ? "border-none" : "border-dashed border-gray-300"
                }`}
              >
                {preview ? (
                  <img src={preview} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Upload />
                )}
              </div>

              <button
                type="button"
                onClick={openFileDialog}
                className="border px-4 py-2 rounded-lg"
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm mb-1 block">Product Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Teddy Bear"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm mb-1 block">Category *</label>

            <Dropdown
              options={categories.map((c) => c.name)}
              value={prodCategory}
              onChange={setProdCategory}
              placeholder="Select Category"
            />
          </div>

          {/* Price / Discount / Stock */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Price */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Price *</label>
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* Discount */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Discount (%) *</label>
              <input
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                placeholder="Discount (%)"
                className="border rounded-lg px-3 py-2"
              />
            </div>

            {/* Quantity */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Quantity *</label>
              <input
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="border rounded-lg px-3 py-2"
              />
            </div>

          </div>

        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg">
            Cancel
          </button>

          <button
            disabled={!isFormValid}
            onClick={handleAddNewProduct}
            className={`px-5 py-2 rounded-lg text-white ${
              isFormValid ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}
