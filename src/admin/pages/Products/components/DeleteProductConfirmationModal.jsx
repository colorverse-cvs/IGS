
import { BASE_URL } from "../../../../utils/constants";

export default function DeleteProductConfirmationModal({
  onClose,
  existingProduct = {},
  onUpdated
}) {
  const handleDelete = async () => {

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/products/${existingProduct._id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete failed:", data);
        return;
      }

      // Refresh product list
      onUpdated?.();

      // Close modal
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-[500px] rounded-2xl shadow-xl p-6">

        {/* HEADER + MESSAGE */}
        <div className="flex flex-col gap-3 mb-5">
          <p className="text-base font-semibold text-gray-800">
            Delete Product
          </p>

          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {existingProduct?.name || "this product"}?
              </span>
            </p>
            <p className="text-sm text-gray-600">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-4 mt-6">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-5 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="w-full md:w-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}


