import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { Eye, EyeOff } from "lucide-react";

export default function ForgotPassword({ email, token, onSuccess }) {
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSave = async () => {
        setMsg("");
        setIsSuccess(false);

        if (!newPassword || newPassword.length < 8) {
            setMsg("Password must be at least 8 characters.");
            return;
        }

        if (newPassword !== confirm) {
            setMsg("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMsg(data.message || "Something went wrong");
                setIsSuccess(false);
            } else {
                setMsg("Password reset successfully!");
                setIsSuccess(true);
                setNewPassword("");
                setConfirm("");
            }
        } catch (error) {
            setMsg("Network error. Try again later.");
            setIsSuccess(false);
        }

        setLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
                Enter a new password for <span className="font-semibold">{email || "your account"}</span>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="Min 8 characters"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="Confirm your password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {msg && (
                <p className={`text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                    {msg}
                </p>
            )}

            <button
                onClick={isSuccess ? onSuccess : handleSave}
                disabled={!isSuccess && (loading || !newPassword || !confirm)}
                className={`w-full py-2.5 rounded text-sm font-semibold transition ${isSuccess
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : (!loading && newPassword && confirm
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed")
                    }`}
            >
                {isSuccess ? "Continue Login" : (loading ? "Resetting..." : "Reset Password")}
            </button>
        </div>
    );
}
