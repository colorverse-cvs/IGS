import { useRef, useState } from "react";
import { Upload } from "lucide-react";

export default function Settings() {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <div className="mb-6 px-2 flex justify-between items-center">
        <div>
          <p className="text-xl">Settings</p>
          <p className="text-md">Manage your shop settings</p>
        </div>
      </div>

      <div className="space-y-6 bg-white p-4 rounded-md">
        <p className="mb-2 text-lg">Shop Information</p>

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shop Name
          </label>
          <input
            type="text"
            placeholder="The Gift Shop"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Contact & Email Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <input
              type="number"
              placeholder="9876543210"
              className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              placeholder="shop@email.com"
              className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Address Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            rows="3"
            placeholder="Enter full shop address"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Shop Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Logo
          </label>

          <div className="flex items-center gap-6">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={openFileDialog}
              className={`w-24 h-24 border-2 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer transition
              ${
                preview
                  ? "border-none"
                  : "border-dashed hover:border-purple-500"
              }`}
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
      </div>

      {/* <div className="space-y-6 bg-white p-4 rounded-md">
        <p className="mb-2 text-lg">Delivery Settings</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Delivery Charge (Local)
          </label>
          <input
            type="text"
            placeholder="50"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Free Delivery Above (₹)
          </label>
          <input
            type="text"
            placeholder="500"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div> */}

      {/* <div className="space-y-6 bg-white p-4 rounded-md my-4">
        <p className="text-lg mb-2">Payment Methods</p>

        <div>
          <div className="mb-4">
            <input type="checkbox" id="Cash on Delivery (COD)" name="Cash on Delivery (COD)" value="Cash on Delivery (COD)" />
            <label  for="Cash on Delivery (COD)"> Cash on Delivery (COD)</label><br></br>
          </div>

          <div className="mb-4">
            <input type="checkbox" id="UPI / PhonePe / Google Pay" name="UPI / PhonePe / Google Pay" value="UPI / PhonePe / Google Pay" />
            <label  for="UPI / PhonePe / Google Pay"> UPI / PhonePe / Google Pay</label><br></br>
          </div>

          <div className="mb-4">
            <input type="checkbox" id="Razorpay (Cards, Net Banking)" name="Razorpay (Cards, Net Banking)" value="Razorpay (Cards, Net Banking)" />
            <label  for="Razorpay (Cards, Net Banking)"> Razorpay (Cards, Net Banking)</label><br></br>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
          UPI ID
          </label>
          <input
            type="text"
            placeholder="yourshop@paytm"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

      </div> */}

      <div className="space-y-6 bg-white p-4 rounded-md my-4">
        <p className="mb-2 text-lg">Change Admin Password</p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Current Password
          </label>
          <input
            type="text"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           New Password
          </label>
          <input
            type="text"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
           Confirm New Password
          </label>
          <input
            type="text"
            className="w-full border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg">
          Save Changes
        </button>
      </div>
    </>
  );
}
