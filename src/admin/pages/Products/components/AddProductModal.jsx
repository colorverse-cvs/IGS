import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

export default function AddProductModal({ onClose, onProductAdded }) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [prodCategory, setProdCategory] = useState("");
  const [errors, setErrors] = useState({});

  const materialType = useMemo(
    () => [
      { type: "Marble", subType: "Hand-carved" },
      { type: "Resin", subType: "High-Density" },
    ],
    []
  );

  const sizeOptions = useMemo(
    () => [
      { type: "Small", subType: "Under 6 in" },
      { type: "Medium", subType: "6 in - 10 in" },
      { type: "Large", subType: "10 in - 15 in" },
      { type: "Extra Large", subType: "Above 15 in" },
    ],
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    origin: "",
    price: "",
    discount: "",
    stock: "",
    finish: "",
    height: "",
    width: "",
    weight: "",
    primaryMaterial: "",
    materialType: "",
    materialCategory: "",
    size: "",
  });

  /* ----------------------------------------------------
      FETCH CATEGORIES
  ---------------------------------------------------- */
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

  const generateSKU = (name) => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "PRD";
    const code = Date.now().toString().slice(-6);
    return `${prefix}-${code}`;
  };

  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["price", "discount", "stock", "height", "width", "weight"];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? allowOnlyNumbers(value) : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  /* ----------------------------------------------------
      VALIDATION
  ---------------------------------------------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!preview) newErrors.image = "Product image is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!prodCategory) newErrors.category = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.stock) newErrors.stock = "Stock is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    preview &&
    formData.name.trim() &&
    prodCategory &&
    formData.price &&
    formData.stock;

  /* ----------------------------------------------------
      SUBMIT
  ---------------------------------------------------- */
  const handleAddNewProduct = async () => {
    const valid = validateForm();
    if (!valid) return;

    try {
      const selectedCategory = categories.find((c) => c.name === prodCategory);
      if (!selectedCategory) return;

      const sku = generateSKU(formData.name);

      const formDataToSend = new FormData();
      const imageFile = fileInputRef.current?.files?.[0];

      if (imageFile) formDataToSend.append("images", imageFile);

      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      formDataToSend.append("price", Number(formData.price));
      formDataToSend.append("discount", Number(formData.discount));
      formDataToSend.append("quantity", Number(formData.stock));
      formDataToSend.append("stock", Number(formData.stock));
      formDataToSend.append("categoryId", selectedCategory._id);
      formDataToSend.append("sku", sku);
      formDataToSend.append("tags", JSON.stringify([]));

      console.log("✅ Final FormData");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ":", value);
      }

      // const response = await fetch("http://localhost:3000/api/v1/products", {
      //   method: "POST",
      //   body: formDataToSend,
      // });

      // const data = await response.json();
      // if (!response.ok) {
      //   console.error("Backend error:", data);
      //   return;
      // }

      onProductAdded?.();
      onClose();
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <p className="text-base font-semibold">Add New Product</p>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">

          {/* Image */}
          <div>
            <label className="text-sm mb-2 block">Product Image</label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
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
            {errors.image && <ErrorText text={errors.image} />}
          </div>

          <Input required label="Product Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />

          <Input label="Description" name="description" value={formData.description} onChange={handleChange} />

          <Input label="Primary Material" name="primaryMaterial" value={formData.primaryMaterial} onChange={handleChange} />

          <Input label="Finish" name="finish" value={formData.finish} onChange={handleChange} />

          <Input label="Origin" name="origin" value={formData.origin} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="text-sm mb-1 block">Category</label>
              <Dropdown
                options={categories.map((c) => c.name)}
                value={prodCategory}
                onChange={(val) => {
                  setProdCategory(val);
                  setErrors((prev) => ({ ...prev, category: "" }));
                }}
                placeholder="Select Category"
                key="category"
              />
              {errors.category && <ErrorText text={errors.category} />}
            </div>

            <DropdownField
              key="materialType"
              label="Material Type"
              options={materialType.map((m) => `${m.type} - ${m.subType}`)}
              value={formData.materialType}
              onChange={(val) => setFormData({ ...formData, materialType: val })}
            />

            <DropdownField
              key="size"
              label="Size"
              options={sizeOptions.map((s) => `${s.type} - ${s.subType}`)}
              value={formData.size}
              onChange={(val) => setFormData({ ...formData, size: val })}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input required label="Price (₹)" name="price" value={formData.price} onChange={handleChange} error={errors.price} />
            <Input label="Discount (%)" name="discount" value={formData.discount} onChange={handleChange} />
            <Input required label="Stock" name="stock" value={formData.stock} onChange={handleChange} error={errors.stock} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
            <Input label="Width (cm)" name="width" value={formData.width} onChange={handleChange} />
            <Input label="Weight (gm)" name="weight" value={formData.weight} onChange={handleChange} />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>

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

/* -------------- REUSABLE INPUT COMPONENT -------------- */
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>
      <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-violet-500"
        }`}
      />
      {error && <ErrorText text={error} />}
    </div>
  );
}

function DropdownField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>
      <Dropdown options={options} value={value} onChange={onChange} placeholder={`Select ${label}`} />
    </div>
  );
}

function ErrorText({ text }) {
  return <p className="text-red-500 text-xs mt-1">{text}</p>;
}
