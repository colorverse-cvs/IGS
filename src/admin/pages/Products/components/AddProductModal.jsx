import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { BASE_URL } from "../../../../utils/constants";
import Dropdown from "../../../../../src/components/Dropdown";

export default function AddProductModal({ onClose, onProductAdded }) {
  const fileInputRef = useRef(null);

  const [previews, setPreviews] = useState([]); // Preview URLs
  const [files, setFiles] = useState([]); // Original image files

  const [categories, setCategories] = useState([]);
  const [prodCategory, setProdCategory] = useState("");
  const [errors, setErrors] = useState({});

  const materialType = useMemo(
    () => [
      { type: "Marble", subType: "Hand-carved" },
      { type: "Resin", subType: "High-Density" }
    ],
    []
  );

  const sizeOptions = useMemo(
    () => [
      { type: "Small", value: "small", subType: "Under 6 in" },
      { type: "Medium", value: "medium", subType: "6 in - 10 in" },
      { type: "Large", value: "large", subType: "10 in - 15 in" },
      { type: "Extra Large", value: "x-large", subType: "Above 15 in" }
    ],
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    weight: "",
    dimensions: {
      sizeCategory: "",
      height: "",
      width: ""
    },
    attributes: {
      primaryMaterial: "",
      origin: "",
      finish: "",
      material: ""
    }
  });

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/products/categories`);
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

  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  /* ---------------- FORM CHANGE HANDLER ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = ["price", "discount", "stock", "weight"];

    if (["height", "width"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [name]: allowOnlyNumbers(value)
        }
      }));
    } else if (["primaryMaterial", "origin", "finish"].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [name]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: numericFields.includes(name) ? allowOnlyNumbers(value) : value
      }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ---------------- MULTIPLE IMAGE UPLOAD ---------------- */
  const openFileDialog = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);

    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (files.length === 0) newErrors.image = "At least one product image is required";
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!prodCategory) newErrors.category = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (!formData.stock) newErrors.stock = "Stock is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const isFormValid =
    files.length > 0 &&
    formData.name.trim() &&
    prodCategory &&
    formData.price &&
    formData.stock;

  /* ---------------- SKU GENERATOR ---------------- */
  const generateSKU = (name) => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "PRD";
    const code = Date.now().toString().slice(-6);
    return `${prefix}-${code}`;
  };

  /* ---------------- SUBMIT HANDLER ---------------- */
  const handleAddNewProduct = async () => {
    if (!validateForm()) return;

    try {
      const selectedCategory = categories.find((c) => c.name === prodCategory);
      if (!selectedCategory) return;

      const sku = generateSKU(formData.name);

      const formDataToSend = new FormData();

      // Append multiple images
      files.forEach((file) => {
        formDataToSend.append("images", file);
      });

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", Number(formData.price));
      formDataToSend.append("discount", Number(formData.discount || 0));
      formDataToSend.append("stock", Number(formData.stock));
      formDataToSend.append("weight", Number(formData.weight || 0));
      formDataToSend.append("attributes", JSON.stringify(formData.attributes));
      formDataToSend.append("dimensions", JSON.stringify(formData.dimensions));
      formDataToSend.append("categoryId", selectedCategory._id);
      formDataToSend.append("sku", sku);
      formDataToSend.append("tags", JSON.stringify([]));

      const res = await fetch(`${BASE_URL}/api/v1/products`, {
        method: "POST",
        body: formDataToSend
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onProductAdded?.();
      onClose();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <p className="text-base font-semibold">Add New Product</p>
          <button onClick={onClose}><X /></button>
        </div>

        {/* BODY */}
        <div className="p-6 overflow-y-auto space-y-5 max-h-[70vh]">

          {/* MULTIPLE IMAGES */}
          <div>
            <label className="text-sm mb-2 block">Product Images</label>

            <input type="file" hidden ref={fileInputRef} multiple onChange={handleFileChange} />

            {/* Upload Box */}
            <div
              onClick={openFileDialog}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Upload />
            </div>

            {/* Image Previews */}
            <div className="grid grid-cols-4 gap-3 mt-3">
              {previews.map((img, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img src={img} className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {errors.image && <ErrorText text={errors.image} />}
          </div>

          <Input required label="Product Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
          <Input label="Description" name="description" value={formData.description} onChange={handleChange} />

          <Input label="Primary Material" name="primaryMaterial" value={formData.attributes.primaryMaterial} onChange={handleChange} />
          <Input label="Finish" name="finish" value={formData.attributes.finish} onChange={handleChange} />
          <Input label="Origin" name="origin" value={formData.attributes.origin} onChange={handleChange} />

          {/* DROPDOWNS */}
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
              />
              {errors.category && <ErrorText text={errors.category} />}
            </div>

            <DropdownField
              label="Material Type"
              options={materialType.map((m) => `${m.type} - ${m.subType}`)}
              value={formData.attributes.material}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  attributes: { ...prev.attributes, material: val }
                }))
              }
            />

            <DropdownField
              label="Size"
              options={sizeOptions.map((s) => ({
                label: `${s.type} - ${s.subType}`,
                value: s.value,
              }))}
              value={formData.dimensions.sizeCategory}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  dimensions: { ...prev.dimensions, sizeCategory: val }
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input required label="Price (₹)" name="price" value={formData.price} onChange={handleChange} error={errors.price} />
            <Input label="Discount (%)" name="discount" value={formData.discount} onChange={handleChange} />
            <Input required label="Stock" name="stock" value={formData.stock} onChange={handleChange} error={errors.stock} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Height (cm)" name="height" value={formData.dimensions.height} onChange={handleChange} />
            <Input label="Width (cm)" name="width" value={formData.dimensions.width} onChange={handleChange} />
            <Input label="Weight (gm)" name="weight" value={formData.weight} onChange={handleChange} />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded-lg">Cancel</button>

          <button
            disabled={!isFormValid}
            onClick={handleAddNewProduct}
            className={`px-5 py-2 rounded-lg text-white ${isFormValid ? "bg-purple-600" : "bg-gray-300"
              }`}
          >
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- INPUT / DROPDOWN / ERROR ---- */
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>
      <input
        {...props}
        className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${error
          ? "border-red-500 focus:ring-red-400"
          : "border-gray-300 focus:ring-violet-500"
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
      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={`Select ${label}`}
      />
    </div>
  );
}

function ErrorText({ text }) {
  return <p className="text-red-500 text-xs mt-1">{text}</p>;
}
