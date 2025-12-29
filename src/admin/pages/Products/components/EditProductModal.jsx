import { X, Upload } from "lucide-react";
import { useRef, useState, useEffect, useMemo } from "react";
import { BASE_URL } from "../../../../utils/constants";
import Dropdown from "../../../../../src/components/Dropdown";

export default function EditProductModal({
  onClose,
  existingProduct = {},
  onUpdated,
}) {
  const fileInputRef = useRef(null);

  /* -------------------------------------------
      MULTIPLE IMAGES (NEW + EXISTING)
  ------------------------------------------- */
  const [images, setImages] = useState([
    ...(existingProduct?.images || []).map((img) => ({
      url: `${BASE_URL}${img.url}`,
      file: null,
    })),

    ...(existingProduct?.image
      ? [{ url: `${BASE_URL}${existingProduct.image}`, file: null }]
      : []),
  ]);

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* -------------------------------------------
      CATEGORY + FORM STATES
  ------------------------------------------- */
  const [prodCategory, setProdCategory] = useState(
    existingProduct?.category?.name || ""
  );
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const materialType = [
    { type: "Marble", subType: "Hand-carved" },
    { type: "Resin", subType: "High-Density" },
  ];

  const sizeOptions = [
    { type: "Small", value: "small", subType: "Under 6 in" },
    { type: "Medium", value: "medium", subType: "6 in - 10 in" },
    { type: "Large", value: "large", subType: "10 in - 15 in" },
    { type: "Extra Large", value: "x-large", subType: "Above 15 in" },
  ];

  const [formData, setFormData] = useState({
    name: existingProduct?.name || "",
    description: existingProduct?.description || "",
    listPrice: existingProduct?.listPrice || "",
    discount: existingProduct?.discount || "",
    stock: existingProduct?.stock || "",
    weight: existingProduct?.weight || "",

    dimensions: {
      sizeCategory:
        existingProduct?.dimensions?.sizeCategory ||
        existingProduct?.dimensions?.size ||
        "",
      height: existingProduct?.dimensions?.height || "",
      width: existingProduct?.dimensions?.width || "",
    },

    attributes: {
      primaryMaterial: existingProduct?.attributes?.primaryMaterial || "",
      finish: existingProduct?.attributes?.finish || "",
      origin: existingProduct?.attributes?.origin || "",
      material:
        existingProduct?.attributes?.material ||
        existingProduct?.material ||
        "",
    },
  });

  const allowOnlyNumbers = (val) => val.replace(/[^0-9.]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numeric = ["listPrice", "discount", "stock", "weight"];

    setFormData((prev) => ({
      ...prev,
      [name]: numeric.includes(name) ? allowOnlyNumbers(value) : value,
    }));
  };

  const handleDimensionChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [name]: allowOnlyNumbers(value),
      },
    }));
  };

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [name]: value,
      },
    }));
  };

  /* -------------------------------------------
      VALIDATION
  ------------------------------------------- */
  const errors = useMemo(() => {
    const e = {};

    if (!formData.name.trim()) e.name = "Required";
    if (!formData.description.trim()) e.description = "Required";
    if (!formData.listPrice) e.listPrice = "Required";
    if (!formData.stock) e.stock = "Required";
    if (!formData.weight) e.weight = "Required";

    if (!formData.dimensions.sizeCategory) e.size = "Required";
    if (!formData.dimensions.height) e.height = "Required";
    if (!formData.dimensions.width) e.width = "Required";

    if (!formData.attributes.primaryMaterial.trim())
      e.primaryMaterial = "Required";
    if (!formData.attributes.finish.trim()) e.finish = "Required";
    if (!formData.attributes.origin.trim()) e.origin = "Required";

    if (!formData.attributes.material) e.materialType = "Required";
    if (!prodCategory) e.category = "Required";

    return e;
  }, [formData, prodCategory]);

  const isFormValid = Object.keys(errors).length === 0;

  /* -------------------------------------------
      FETCH CATEGORIES
  ------------------------------------------- */
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

  /* -------------------------------------------
      SAVE CHANGES
  ------------------------------------------- */
  const handleSaveChanges = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const selected = categories.find((c) => c.name === prodCategory);
      if (!selected) return;

      const form = new FormData();

      /* MULTIPLE NEW IMAGES */
      images.forEach((img) => {
        if (img.file) form.append("images", img.file);
      });

      /* TEXT FIELDS */
      // Calculate discounted price from listPrice and discount percentage
      const listPrice = Number(formData.listPrice);
      const discountPercent = Number(formData.discount || 0);
      const discountedPrice = listPrice - (listPrice * discountPercent) / 100;

      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("listPrice", listPrice);
      form.append("price", discountedPrice);
      form.append("discount", discountPercent);
      form.append("stock", Number(formData.stock));
      form.append("weight", Number(formData.weight));

      /* DIMENSIONS */
      form.append("dimensions[sizeCategory]", formData.dimensions.sizeCategory);
      form.append("dimensions[height]", Number(formData.dimensions.height));
      form.append("dimensions[width]", Number(formData.dimensions.width));

      /* ATTRIBUTES */
      form.append(
        "attributes",
        JSON.stringify({
          material: formData.attributes.material,
          primaryMaterial: formData.attributes.primaryMaterial,
          finish: formData.attributes.finish,
          origin: formData.attributes.origin,
        })
      );

      form.append("categoryId", selected._id);

      await fetch(`${BASE_URL}/api/v1/products/${existingProduct._id}`, {
        method: "PATCH",
        body: form,
      });

      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------------------------------
      UI
  ------------------------------------------- */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[850px] rounded-t-2xl md:rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200">
          {/* Top row: Title + Close */}
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-gray-900">
              Edit Product
            </p>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Warning below title */}
          <div className="mt-2 flex items-start gap-2">
            <span className="text-sm text-red-600">
              <strong>Warning:</strong> Please fill all details before editing
              the product.
            </span>
          </div>
        </div>

        <div className="max-h-[70dvh] overflow-y-auto px-6 py-5 space-y-5">
          {/* MULTIPLE IMAGES */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Product Images
            </label>

            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={openFileDialog}
              className="w-24 h-24 border-2 border-dashed border-brand-500 rounded-xl flex items-center justify-center cursor-pointer"
            >
              <Upload />
            </div>

            {/* PREVIEW GRID */}
            <div className="grid  grid-cols-3 md:grid-cols-6 lg:grid-cols-6 gap-3 mt-3">
              {images.map((img, index) => (
                <div key={index} className="relative group w-24 h-24">
                  <img
                    src={img.url}
                    className="w-full h-full rounded-lg object-cover"
                  />

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 cursor-pointer"
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* INPUTS */}
          {renderInput("Product Name", "name")}
          {renderInput("Description", "description")}

          {/* ATTRIBUTES */}
          <Input
            label="Primary Material"
            name="primaryMaterial"
            value={formData.attributes.primaryMaterial}
            onChange={handleAttributeChange}
            error={errors.primaryMaterial}
          />

          <Input
            label="Finish"
            name="finish"
            value={formData.attributes.finish}
            onChange={handleAttributeChange}
            error={errors.finish}
          />

          <Input
            label="Origin"
            name="origin"
            value={formData.attributes.origin}
            onChange={handleAttributeChange}
            error={errors.origin}
          />

          {/* DROPDOWNS */}
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
              value={formData.attributes.material}
              onChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  attributes: { ...prev.attributes, material: val },
                }))
              }
              error={errors.materialType}
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
                  dimensions: { ...prev.dimensions, sizeCategory: val },
                }))
              }
              error={errors.size}
            />
          </div>

          {/* NUMBERS */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {renderInput("Price (₹)", "listPrice")}
            {renderInput("Discount (%)", "discount")}
            {renderInput("Stock", "stock")}

            <Input
              label="Height (cm)"
              name="height"
              value={formData.dimensions.height}
              onChange={handleDimensionChange}
              error={errors.height}
            />

            <Input
              label="Width (cm)"
              name="width"
              value={formData.dimensions.width}
              onChange={handleDimensionChange}
              error={errors.width}
            />

            {renderInput("Weight", "weight")}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!isFormValid || isLoading}
            onClick={handleSaveChanges}
            className={`px-5 py-2 rounded-lg text-white cursor-pointer ${
              isFormValid && !isLoading ? "bg-brand-600" : "bg-gray-300"
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------
      HELPERS
  ------------------------------------------- */
  function renderInput(label, name) {
    return (
      <Input
        label={label}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        error={errors[name]}
      />
    );
  }
}

/* INPUT COMPONENT */
function Input({ label, error, ...props }) {
  return (
    <div>
      <label className="text-sm mb-1 block">{label}</label>
      <input
        {...props}
        className={`w-full px-3 py-2 rounded-lg border
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-300 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none"
          }`}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

/* DROPDOWN COMPONENT */
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
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
