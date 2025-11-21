export default function Topbar() {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <input
        className="border border-gray-100 rounded-lg px-3 py-2 w-75 focus:outline-none focus:ring focus:ring-purple-300"
        type="text"
        placeholder="Search..."
      />

      <div className="flex items-center gap-4">
        <span className="text-gray-600 font-medium">Admin</span>
        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </div>
  );
}
