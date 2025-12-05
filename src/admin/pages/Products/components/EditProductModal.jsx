import { X, Upload } from "lucide-react";
import { useRef, useState } from "react";
import Dropdown from "../../../../../src/components/Dropdown";

export default function EditProductModal({
  onClose,
  existingProduct = {},
  onUpdated
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(
    existingProduct.images?.[0].url || existingProduct.image || null
  );
  const [prodCategory, setProdCategory] = useState(
    existingProduct?.category?.name || ""
  );

  // form fields
  const [formData, setFormData] = useState({
    name: existingProduct.name || "",
    price: existingProduct.price || "",
    discountPrice: existingProduct.discount || "",
    stock: existingProduct.stock || ""
  });

  const productCategory = ["Soft Toys", "Home Decor", "Cards", "Personalized", "Hampers"];

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

  const isFormValid =
    formData.name.trim() &&
    prodCategory &&
    formData.price &&
    formData.stock;

  // ------------------------------------------------
  // PATCH PRODUCT API CALL
  // ------------------------------------------------
  const handleSaveChanges = async () => {
    try {
      const form = new FormData();

      const imageFile = fileInputRef.current?.files?.[0];
      if (imageFile) {
        form.append("images", imageFile); // new image
      }

      form.append("name", formData.name);
      form.append("price", Number(formData.price));
      form.append("discount", Number(formData.discountPrice || 0));
      form.append("stock", Number(formData.stock));
      form.append("categoryName", prodCategory); // update category by name

      const response = await fetch(
        `http://localhost:3000/api/v1/products/${existingProduct._id}`,
        { method: "PATCH", body: form }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Error updating:", data);
        return;
      }

      onUpdated?.();  // refresh products list
      onClose();      // close modal

    } catch (error) {
      console.log("Update error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:w-[800px] rounded-t-2xl md:rounded-2xl shadow-xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold">Edit Product</p>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="space-y-5">

          {/* IMAGE */}
          <div>
            <label className="block mb-2 text-sm font-medium">Product Image *</label>

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
                ${preview ? "border-none" : "border-dashed border-gray-300"}`}
              >
                {preview ? (
                  <img
                    src={preview.startsWith("blob:") ? preview : `http://localhost:3000${preview}`}
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

          {/* NAME */}
          <div>
            <label className="block text-sm mb-1">Product Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm mb-1">Category *</label>
            <Dropdown
              options={productCategory}
              value={prodCategory}
              onChange={setProdCategory}
            />
          </div>

          {/* PRICE + DISCOUNT + STOCK */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Price */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">Price *</label>
              <input
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Eg:- 2000"
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
                placeholder="Discount"
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

        {/* BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
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
}

