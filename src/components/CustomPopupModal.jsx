import React from "react";
import Modal from "./Modal";

/**
 * CustomPopupModal Component
 *
 * A standardized popup modal for displaying messages to the user.
 * Replaces native browser alert() calls.
 *
 * Usage:
 * <CustomPopupModal 
 *   isOpen={showModal} 
 *   onClose={() => setShowModal(false)}
 *   title="Notice"
 *   message="This is a popup message."
 * />
 */
export default function CustomPopupModal({
    isOpen,
    onClose,
    title = "Notice",
    message,
    onConfirm,
    confirmText = "Confirm",
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            className="max-w-sm w-full m-4"
        >
            <div className="flex flex-col items-center text-center">
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex gap-4 w-full justify-center">
                    {onConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="px-6 py-2 bg-brand-700 text-white rounded hover:bg-purple-800 transition-colors flex-1"
                            >
                                {confirmText}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-brand-700 text-white rounded hover:bg-purple-800 transition-colors w-full sm:w-auto"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
