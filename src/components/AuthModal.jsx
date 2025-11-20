import React from "react";
import Modal from "./Modal";
import { useDispatch, useSelector } from "react-redux";
import { login, signup } from "../features/user/userSlice";
import googleButton from "../assets/google_buttons.png";
import facebookButton from "../assets/facebook_buttons.png";
import appleButton from "../assets/apple_buttons.png";
import { Eye, EyeOff } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;

export default function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const dispatch = useDispatch();
  const [tab, setTab] = React.useState("login"); // 'login' | 'signup'
  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [initialTab, isOpen]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Login form
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);

  // Signup form
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetStatus, setResetStatus] = React.useState("");

  const resetForms = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setName("");
    setMobile("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrors({});
  };

  // OAuth popup handling
  const oauthWindowRef = React.useRef(null);
  const oauthIntervalRef = React.useRef(null);

  const startOAuth = (provider) => {
    // Open a centered popup for OAuth
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const url = `/auth/${provider}`;
    oauthWindowRef.current = window.open(
      url,
      `oauth_${provider}`,
      `toolbar=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    // Poll for closed window in case no postMessage is sent
    oauthIntervalRef.current = setInterval(() => {
      const w = oauthWindowRef.current;
      if (!w || w.closed) {
        clearInterval(oauthIntervalRef.current);
        oauthIntervalRef.current = null;
        oauthWindowRef.current = null;
      }
    }, 500);
  };

  React.useEffect(() => {
    const handler = (e) => {
      // Accept messages from same-origin (or adjust as needed)
      try {
        if (!e.data || typeof e.data !== "object") return;
        if (e.data.type === "oauth_success") {
          const { token, user } = e.data;
          if (token) localStorage.setItem("token", token);
          if (user) {
            dispatch(
              login({
                email: user.email || "",
                name: user.name || user.fullName || "User",
              })
            );
          }
          // Close popup if still open
          if (oauthWindowRef.current && !oauthWindowRef.current.closed) {
            oauthWindowRef.current.close();
          }
          clearInterval(oauthIntervalRef.current);
          oauthIntervalRef.current = null;
          oauthWindowRef.current = null;
          onClose?.();
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [dispatch, onClose]);

  // Accept any characters; require at least one letter and one number, length >= 8
  const strongPassword = (p) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p);

  const validateSignup = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!mobileRegex.test(mobile)) e.mobile = "Mobile must be 10 digits";
    if (!emailRegex.test(email)) e.email = "Enter a valid email";
    if (!strongPassword(password))
      e.password = "Min 8 chars with letters and numbers";
    if (password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    // Frontend validation
    if (
      (!emailRegex.test(loginEmail) && !mobileRegex.test(loginEmail)) ||
      loginPassword.length < 8
    ) {
      setLoginError("Enter valid email/mobile and password (min 8 chars)");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailRegex.test(loginEmail) ? loginEmail : undefined,
          mobile: mobileRegex.test(loginEmail) ? loginEmail : undefined,
          password: loginPassword,
          role: "customer",
        }),
      });

      const data = await res.json();
      console.log("Data", data);

      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }

      // Save token (important!)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Update Redux store
      dispatch(
        login({
          email: data.user?.email || loginEmail,
          name: data.user?.name || "User",
          mobile: data.user?.mobile || "",
          token: data.token,
        })
      );

      resetForms();
      onClose?.();
    } catch (error) {
      setLoginError("Network error. Please try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateSignup()) return;

    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: name.split(" ")[0],
          lastName: name.split(" ")[1] || "",
          password,
          role: "customer",
        }),
      });

      const data = await res.json();
      console.log("REGISTER SUCCESS:", data);

      resetForms();
      onClose?.();
    } catch (err) {
      console.error("REGISTER ERROR:", err);
    }
  };

  const isLoginValid = React.useMemo(() => {
    return (
      (emailRegex.test(loginEmail) || mobileRegex.test(loginEmail)) &&
      loginPassword.length >= 8
    );
  }, [loginEmail, loginPassword]);

  const isSignupValid = React.useMemo(() => {
    return (
      !!name &&
      mobileRegex.test(mobile) &&
      emailRegex.test(email) &&
      strongPassword(password) &&
      password === confirmPassword
    );
  }, [name, mobile, email, password, confirmPassword]);

  // Password reset handler (opens small modal)
  const handleResetSubmit = async (e) => {
    e?.preventDefault();
    setResetStatus("");
    if (!emailRegex.test(resetEmail) && !mobileRegex.test(resetEmail)) {
      setResetStatus("Enter a valid email or 10-digit mobile number");
      return;
    }
    try {
      const res = await fetch("/api/v1/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetEmail }),
      });
      if (res.ok) {
        setResetStatus("If an account exists, a reset link has been sent.");
      } else {
        const body = await res.json().catch(() => ({}));
        setResetStatus(body.message || "Unable to send reset link.");
      }
    } catch (err) {
      setResetStatus("Network error. Please try again later.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForms();
        onClose?.();
      }}
      title="Welcome to Ishita Gallery"
    >
      <div className="px-4 sm:px-6">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
            <button
              type="button"
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                tab === "login"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTab("login")}
              aria-pressed={tab === "login"}
            >
              Log In
            </button>
            <button
              type="button"
              className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                tab === "signup"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTab("signup")}
              aria-pressed={tab === "signup"}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Login Form */}
        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Social Login Buttons */}
            <div className="flex justify-center gap-4 pb-4">
              <button
                type="button"
                onClick={() => startOAuth("google")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Login with Google"
              >
                <img
                  src={googleButton}
                  alt="Google"
                  className="h-12 w-12 object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => startOAuth("facebook")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Login with Facebook"
              >
                <img
                  src={facebookButton}
                  alt="Facebook"
                  className="h-12 w-12 object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => startOAuth("apple")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Login with Apple"
              >
                <img
                  src={appleButton}
                  alt="Apple"
                  className="h-12 w-12 object-contain"
                />
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                Or Login with
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email/Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="john@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={
                    showLoginPassword ? "Hide password" : "Show password"
                  }
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-login"
                className="w-4 h-4 text-brand-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />
              <label
                htmlFor="remember-login"
                className="text-sm text-gray-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                isLoginValid
                  ? "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 cursor-pointer"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isLoginValid}
            >
              Log In
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Forgot password?{" "}
                <button
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="text-brand-600 hover:text-purple-700 font-semibold hover:underline transition"
                >
                  Click here to reset
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Social Login Buttons */}
            <div className="flex justify-center gap-4 pb-4">
              <button
                type="button"
                onClick={() => startOAuth("google")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Sign up with Google"
              >
                <img
                  src={googleButton}
                  alt="Google"
                  className="h-12 w-12 object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => startOAuth("facebook")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Sign up with Facebook"
              >
                <img
                  src={facebookButton}
                  alt="Facebook"
                  className="h-12 w-12 object-contain"
                />
              </button>
              <button
                type="button"
                onClick={() => startOAuth("apple")}
                className="transition-transform hover:scale-110 active:scale-95"
                title="Sign up with Apple"
              >
                <img
                  src={appleButton}
                  alt="Apple"
                  className="h-12 w-12 object-contain"
                />
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
                Or Sign up with
              </span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.mobile
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="000 000 0000"
                inputMode="numeric"
                maxLength={10}
              />
              {errors.mobile && (
                <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email/Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@gmail.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, letters & numbers"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={
                    showSignupPassword ? "Hide password" : "Show password"
                  }
                >
                  {showSignupPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSignupConfirm ? "text" : "password"}
                  className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={
                    showSignupConfirm ? "Hide password" : "Show password"
                  }
                >
                  {showSignupConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                isSignupValid
                  ? "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 cursor-pointer"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isSignupValid}
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
      {/* Password Reset Modal */}
      <Modal
        isOpen={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setResetStatus("");
        }}
        title="Reset your password"
      >
        <form onSubmit={handleResetSubmit} className="space-y-4 px-2">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email or Mobile <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="john@gmail.com or 9876543210"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </div>
          {resetStatus && (
            <div className="text-sm text-gray-700">{resetStatus}</div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Send reset link
            </button>
            <button
              type="button"
              onClick={() => {
                setResetOpen(false);
                setResetStatus("");
              }}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
}
