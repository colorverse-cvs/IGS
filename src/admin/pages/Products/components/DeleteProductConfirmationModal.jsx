// export default function DeleteProductConfirmationModal({ onClose }) { 
//     return(
//         <>
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white w-[500px] rounded-2xl shadow-xl p-6">
      
//                 <div className="flex flex-col gap-4 mb-6">
//                     <p className="text-md">Delete Product</p>
//                     <div className="">
//                         <p className="text-md text-gray-700">Are you sure you want to delete Teddy Bear - Small?</p>
//                         <p className="text-md text-gray-700">This action cannot be undone.</p>
//                     </div>
//                 </div>

//                 <div className="flex justify-end gap-4 mt-8">
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2 cursor-pointer border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
//                     >
//                         Cancel
//                     </button>
//                     <button className="px-6 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700">
//                     Delete
//                     </button>
//                 </div>  
//             </div>  
//         </div>  
//         </>
//     )
// }


export default function DeleteProductConfirmationModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-[500px] rounded-2xl shadow-xl p-5 md:p-6">

        <div className="flex flex-col gap-3 mb-5">
          <p className="text-base font-semibold text-gray-800">
            Delete Product
          </p>

          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete Teddy Bear - Small?
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
            className="w-full md:w-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>

      </div>
    </div>
  );
}

