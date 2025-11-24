// import { X, Upload } from "lucide-react";
// import { useRef, useState } from "react";
// import Dropdown from "../../../../../src/components/Dropdown";

// export default function AddProductModal({ onClose }) {
//   const fileInputRef = useRef(null);

//   const [preview, setPreview] = useState(null);
//   const [prodCategory, setProdCategory] = useState("");

//   const [formData, setFormData] = useState({
//     name: "",
//     price: "",
//     discountPrice: "",
//     stock: ""
//   });

//   const productCategory = [
//     "Soft Toys",
//     "Home Decor",
//     "Cards",
//     "Personalized",
//     "Hampers"
//   ];

//   // ✅ Only allow numbers in text input
//   const allowOnlyNumbers = (value) => value.replace(/[^0-9]/g, "");

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (["price", "discountPrice", "stock"].includes(name)) {
//       setFormData({ ...formData, [name]: allowOnlyNumbers(value) });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const openFileDialog = () => fileInputRef.current.click();

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) setPreview(URL.createObjectURL(file));
//   };

//   // ✅ FORM VALIDATION
//   const isFormValid =
//     preview &&
//     formData.name.trim() !== "" &&
//     prodCategory !== "" &&
//     formData.price !== "" &&
//     formData.stock !== "";

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white w-[800px] rounded-2xl shadow-xl p-6">

//         <div className="flex items-center justify-between mb-6">
//           <p className="text-lg font-semibold text-gray-800 cursor-default">Add New Product</p>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-800 cursor-pointer">
//             <X />
//           </button>
//         </div>

//         <div className="space-y-6">

//           {/* IMAGE */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Product Image *
//             </label>
//             <input
//               type="file"
//               accept="image/*"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               className="hidden"
//             />

//             <div
//               onClick={openFileDialog}
//               className={`w-24 h-24 border-2 border-gray-100 rounded-xl flex items-center justify-center cursor-pointer transition
//               ${preview ? "border-none" : "border-dashed hover:border-purple-500"}`}
//             >
//               {preview ? (
//                 <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
//               ) : (
//                 <Upload className="text-gray-400" />
//               )}
//             </div>
//           </div>

//           {/* NAME & CATEGORY */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Product Name *
//               </label>
//               <input
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Teddy Bear - Small"
//                 className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1 text-gray-700">
//                 Category *
//               </label>
//               <Dropdown
//                 options={productCategory}
//                 value={prodCategory}
//                 onChange={(val) => setProdCategory(val)}
//                 placeholder="Select Category"
//               />
//             </div>
//           </div>

//           {/* PRICE DETAILS */}
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Price (₹) *
//               </label>
//               <input
//                 type="text"
//                 name="price"
//                 value={formData.price}
//                 onChange={handleChange}
//                 placeholder="350"
//                 className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Discount Price (₹)
//               </label>
//               <input
//                 type="text"
//                 name="discountPrice"
//                 value={formData.discountPrice}
//                 onChange={handleChange}
//                 placeholder="299"
//                 className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Stock Quantity *
//               </label>
//               <input
//                 type="text"
//                 name="stock"
//                 value={formData.stock}
//                 onChange={handleChange}
//                 placeholder="2"
//                 className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
//               />
//             </div>
//           </div>
//         </div>

//         {/* ACTION BUTTONS */}
//         <div className="flex justify-end gap-4 mt-8">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
//           >
//             Cancel
//           </button>

//           <button
//             disabled={!isFormValid}
//             className={`px-6 py-2 rounded-lg text-white transition
//             ${isFormValid 
//               ? "bg-purple-700 hover:bg-purple-800 cursor-pointer"
//               : "bg-gray-300 cursor-not-allowed"}`}
//           >
//             Add Product
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }


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
          >
            Add Product
          </button>
        </div>

      </div>
    </div>
  );
}

