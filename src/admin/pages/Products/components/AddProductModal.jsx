import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

export default function AddProductModal({ onClose }) {
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

  // -------------------------------
  //  FETCH PRODUCT CATEGORIES
  // -------------------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/products/categories");
        const data = await res.json();
        console.log("data ", data);
        
        if (res.ok && Array.isArray(data?.data)) {
          setCategories(data.data); // [{_id,name}, ...]
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  // -------------------------------
  //  SKU GENERATOR (Always Unique)
  // -------------------------------
  const generateSKU = (productName) => {
    const prefix = productName
      ? productName.substring(0, 3).toUpperCase()
      : "PRD";

    const uniqueNumber = Date.now().toString().slice(-6); // last 6 digits of timestamp

    return `${prefix}-${uniqueNumber}`;
  };

  // -------------------------------
  // Numeric-only validator
  // -------------------------------
  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["price", "discountPrice", "stock"].includes(name)) {
      setFormData({ ...formData, [name]: allowOnlyNumbers(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // -------------------------------
  // Image Upload
  // -------------------------------
  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  // -------------------------------
  // SUBMIT NEW PRODUCT
  // -------------------------------
 const handleAddNewProduct = async () => {
  try {
    const selectedCategory = categories.find(
      (c) => c.name.trim() === prodCategory.trim()
    );

    if (!selectedCategory) {
      alert("Please select a valid category.");
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

    // ✅ FIXED → use selectedCategory
    formDataToSend.append("categoryId", selectedCategory._id);

    formDataToSend.append("sku", sku);
    formDataToSend.append("tags", JSON.stringify([]));

    const response = await fetch("http://localhost:3000/api/v1/products", {
      method: "POST",
      body: formDataToSend,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend rejected:", data);
      return;
    }

    console.log("✅ Product created:", data);
    onClose();
  } catch (error) {
    console.error("Request failed:", error);
  }
};


  // -------------------------------
  // FORM VALIDATION
  // -------------------------------
  const isFormValid =
    preview &&
    formData.name.trim() !== "" &&
    prodCategory.trim() !== "" &&
    formData.price !== "" &&
    formData.stock !== "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl p-5 md:p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-gray-800">Add New Product</p>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </div>

        <div className="space-y-5">

          {/* IMAGE UPLOAD */}
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
                className={`w-20 h-20 border-2 rounded-xl flex items-center justify-center cursor-pointer ${
                  preview ? "border-none" : "border-dashed border-gray-200"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
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

          {/* CATEGORY DROPDOWN */}
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">
              Category *
            </label>

            <Dropdown
              options={categories.map((c) => c.name)}
              value={prodCategory}
              onChange={setProdCategory}
              placeholder="Select Category"
            />
          </div>

          {/* PRICE + DISCOUNT + STOCK */}
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

            <div className="hidden md:block">
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

          {/* Stock mobile view */}
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

        {/* BUTTONS */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end md:gap-4">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-5 py-2 border border-gray-300 rounded-lg text-gray-600"
          >
            Cancel
          </button>

          <button
            disabled={!isFormValid}
            className={`w-full md:w-auto px-5 py-2 rounded-lg text-white ${
              isFormValid
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleAddNewProduct}
          >
            Add Product
          </button>
        </div>

      </div>
    </div>
  );
}
