import { useState, useEffect } from "react";
import { MdEditNote, MdDelete } from "react-icons/md";

import AddProductModal from "./components/AddProductModal";
import EditProductModal from "./components/EditProductModal";
import DeleteProductConfirmationModal from "./components/DeleteProductConfirmationModal";

const products = [
  {
    id: 1,
    name: "Teddy Bear - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 2,
    name: "Photo Frame - Wooden",
    category: "Home Decor",
    price: "₹450",
    stock: 25,
    image: "https://via.placeholder.com/80",
    lowStock: false,
  },
  {
    id: 3,
    name: "Panda - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 4,
    name: "Panda - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 5,
    name: "Panda - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
  {
    id: 6,
    name: "Panda - Small",
    category: "Soft Toys",
    oldPrice: "₹350",
    price: "₹299",
    stock: 2,
    image: "https://via.placeholder.com/80",
    lowStock: true,
  },
];

export default function Products() {
  const [openAddProductModal, setAddProductModal] = useState(false);
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const [openDeleteProductModal, setOpenDeleteProductModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(result);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  //Get product API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v1/products");

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setAllProducts(result.data); 
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-md text-center">Loading products...</div>;

  return (
    <>
      {/* HEADER */}
      <div className="product-label-top-wrapper flex flex-col sm:flex-row sm:items-center justify-between mb-4 p-4 gap-3">
        <div className="dashboard-label-wrapper">
          <p className="text-xl font-semibold">Products</p>
          <p className="text-sm text-gray-500">
            Manage your gift shop inventory
          </p>
        </div>
        <button
          className="bg-brand-700 px-5 py-2 cursor-pointer text-white rounded-lg"
          onClick={() => setAddProductModal(true)}
        >
          + Add Product
        </button>
      </div>

      <div className="product-detail-wrapper space-y-6 bg-white p-4 rounded-md">
        {/* SEARCH */}
        <div className="search-bar-wrapper">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-100 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProducts.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              No products found
            </p>
          )}

          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-100 hover:border-violet-500 rounded-xl p-4 bg-white shadow-sm
                         flex flex-col md:flex-row md:justify-between md:items-center"
            >
              {/* LEFT CONTENT */}
              <div className="flex gap-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <p className="font-semibold text-sm leading-tight">
                      {product.name}
                    </p>

                    {product.lowStock && (
                      <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    {product.category}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    {product.oldPrice && (
                      <span className="line-through text-gray-400 text-xs">
                        {product.oldPrice}
                      </span>
                    )}
                    <span className="text-green-600 font-semibold text-sm">
                      {product.price}
                    </span>
                    <span className="text-gray-500 text-xs">
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-3 flex gap-2 md:mt-0 md:flex-row md:items-center">
                <button
                  className="flex items-center justify-center gap-2 border px-3 py-2 rounded-md hover:bg-gray-50
                             w-full md:w-auto"
                  onClick={() => setOpenEditProductModal(true)}
                >
                  <MdEditNote /> Edit
                </button>

                <button
                  className="text-red-600 hover:bg-red-50 p-2 rounded-md cursor-pointer"
                  onClick={() => setOpenDeleteProductModal(true)}
                >
                  <MdDelete className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {openAddProductModal && (
        <AddProductModal onClose={() => setAddProductModal(false)} />
      )}

      {openEditProductModal && (
        <EditProductModal onClose={() => setOpenEditProductModal(false)} />
      )}

      {openDeleteProductModal && (
        <DeleteProductConfirmationModal
          onClose={() => setOpenDeleteProductModal(false)}
        />
      )}
    </>
  );
}

