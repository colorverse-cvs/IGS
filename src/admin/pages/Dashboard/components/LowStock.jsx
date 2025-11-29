export default function LowStockCard({ allProducts = [] }) {
  // Filter products with low stock
  const lowStockProducts = allProducts.filter(
    (product) => product.stock <= 10 // adjust threshold as needed
  );

  return (
    <div className="bg-white rounded-xl shadow p-6 md:max-h-[290px] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-semibold">Low stock alert</p>
      </div>

      <div className="space-y-4">
        {lowStockProducts.length === 0 ? (
          <p className="text-xs text-gray-500">No low stock products</p>
        ) : (
          lowStockProducts.map((product) => (
            <div key={product._id} className="">
              <div className="space-y-1 p-2 bg-red-100 border rounded-xl border-red-300">
                <p className="text-sm text-gray-700">{product.name}</p>
                <p className="text-xs text-red-500">
                  {product.stock === 0
                    ? "Out of stock"
                    : `Only ${product.stock} left`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

