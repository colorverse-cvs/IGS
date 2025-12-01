import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

const REQUIRED_FIELDS = [
  "name",
  "description",
  "primaryMaterial",
  "finish",
  "origin",
  "materialType",
  "size",
  "price",
  "stock",
  "height",
  "width",
  "weight",
];

export default function EditProductModal({
  onClose,
  existingProduct = {},
  onUpdated,
}) {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(
    existingProduct?.images?.[0]?.url || existingProduct?.image || null
  );

  const [prodCategory, setProdCategory] = useState(
    existingProduct?.category?.name || ""
  );

  const [categories, setCategories] = useState([]);

  const materialType = [
    { type: "Marble", subType: "Hand-carved" },
    { type: "Resin", subType: "High-Density" },
  ];

  const sizeOptions = [
    { type: "Small", subType: "Under 6 in" },
    { type: "Medium", subType: "6 in - 10 in" },
    { type: "Large", subType: "10 in - 15 in" },
    { type: "Extra Large", subType: "Above 15 in" },
  ];

  const [formData, setFormData] = useState({
    name: existingProduct.name || "",
    description: existingProduct.description || "",
    primaryMaterial: existingProduct.primaryMaterial || "",
    finish: existingProduct.finish || "",
    origin: existingProduct.origin || "",
    materialType: existingProduct.materialType || "",
    size: existingProduct.size || "",
    price: existingProduct.price || "",
    discountPrice: existingProduct.discount || "",
    stock: existingProduct.stock || "",
    height: existingProduct.height || "",
    width: existingProduct.width || "",
    weight: existingProduct.weight || "",
  });

  const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "price",
      "discountPrice",
      "stock",
      "height",
      "width",
      "weight",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name)
        ? allowOnlyNumbers(value)
        : value,
    }));
  };

  // ✅ Validation system with memo (prevents re-renders)
  const errors = useMemo(() => {
    const newErrors = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!formData[field]?.toString().trim()) {
        newErrors[field] = `This field is required`;
      }
    });

    if (!prodCategory) {
      newErrors.category = "Category is required";
    }

    return newErrors;
  }, [formData, prodCategory]);

  const isFormValid = Object.keys(errors).length === 0;

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // FETCH CATEGORIES
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(
          "http://localhost:3000/api/v1/products/categories"
        );
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

  // UPDATE PRODUCT
  const handleSaveChanges = async () => {
    try {
      const selectedCategory = categories.find(
        (c) => c.name === prodCategory
      );

      if (!selectedCategory) return;

      const form = new FormData();

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) form.append("images", imageFile);

      Object.keys(formData).forEach((key) => {
        if (["price", "discountPrice", "stock"].includes(key)) {
          form.append(
            key === "discountPrice" ? "discount" : key,
            Number(formData[key])
          );
        } else {
          form.append(key, formData[key]);
        }
      });

      form.append("categoryId", selectedCategory._id);

      const response = await fetch(
        `http://localhost:3000/api/v1/products/${existingProduct._id}`,
        { method: "PATCH", body: form }
      );

      if (!response.ok) return;

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">

      <div className="bg-white w-full md:w-[850px] rounded-t-2xl md:rounded-2xl shadow-xl">

        {/* HEADER (STATIC) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <p className="text-base font-semibold">Edit Product</p>
          <button onClick={onClose}><X /></button>
        </div>

        {/* ✅ SCROLLABLE FORM */}
        <div className="max-h-[70vh] overflow-y-auto hide-scrollbar px-6 py-5 space-y-5">

          {/* IMAGE */}
          <div>
            <label className="block mb-2 text-sm font-medium">
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
                  preview
                    ? "border-none"
                    : "border-dashed border-gray-300"
                }`}
              >
                {preview ? (
                  <img
                    src={
                      preview.startsWith("blob:")
                        ? preview
                        : `http://localhost:3000${preview}`
                    }
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <Upload />
                )}
              </div>

              <button
                type="button"
                onClick={openFileDialog}
                className="border px-4 py-2 rounded-lg"
              >
                Change Image
              </button>
            </div>
          </div>

          {/* INPUT FIELDS */}
          {renderInput("Product Name", "name")}
          {renderInput("Description", "description")}
          {renderInput("Primary Material", "primaryMaterial")}
          {renderInput("Finish", "finish")}
          {renderInput("Origin", "origin")}

          {/* CATEGORY + TYPE + SIZE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DropdownField
              label="Category"
              options={categories.map((c) => c.name)}
              value={prodCategory}
              onChange={setProdCategory}
              error={errors.category}
            />

            <DropdownField
              label="Material Type"
              options={materialType.map((m) => `${m.type} - ${m.subType}`)}
              value={formData.materialType}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, materialType: val }))
              }
              error={errors.materialType}
            />

            <DropdownField
              label="Size"
              options={sizeOptions.map((s) => `${s.type} - ${s.subType}`)}
              value={formData.size}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, size: val }))
              }
              error={errors.size}
            />
          </div>

          {/* NUMERIC */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {renderInput("Price (₹)", "price")}
            {renderInput("Discount (%)", "discountPrice")}
            {renderInput("Stock", "stock")}
            {renderInput("Height (cm)", "height")}
            {renderInput("Width (cm)", "width")}
            {renderInput("Weight (gm)", "weight")}
          </div>
        </div>

        {/* FOOTER (STATIC) */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
          <button className="px-5 py-2 border rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            disabled={!isFormValid}
            onClick={handleSaveChanges}
            className={`px-5 py-2 rounded-lg text-white ${
              isFormValid ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  // Helpers
  function renderInput(label, name) {
    return (
      <Input
        key={name}
        label={label}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        error={errors[name]}
      />
    );
  }
}

/* ✅ REUSABLE INPUT */
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>

      <input
        {...props}
        className={`w-full border px-3 py-2 rounded-lg focus:outline-none 
        focus:border-transparent focus:ring-2 focus:ring-violet-500
        ${error ? "border-red-500" : "border-gray-300"}`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ✅ REUSABLE DROPDOWN */
function DropdownField({ label, options, value, onChange, error }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>

      <Dropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={`Select ${label}`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
