import React from "react";
import Modal from "./Modal";
import ForgotPassword from "./ForgotPassword";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { login, signup, fetchUserProfileAsync } from "../features/user/userSlice";
import { initializeCart, fetchCartSummaryAsync } from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import logo from "/assets/images/ishita-gallery-logo.jpg";
import { Eye, EyeOff, X } from "lucide-react";
import CustomPopupModal from "./CustomPopupModal";

// Auth Banner
import authBanner from "/assets/images/auth_banner.jpg";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;
const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const validEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "aol.com",

  // India-popular domains
  "rediffmail.com",
  "rediff.com",
  "in.com",

  // Company / Developer domains
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "yandex.com",

  // Education / Organization
  "edu.in",
  "ac.in",
  "gov.in",
  "nic.in"
];

const isValidDomain = (email) => {
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return validEmailDomains.includes(domain);
};

export default function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const dispatch = useDispatch();

  const [tab, setTab] = React.useState(initialTab); // 'login' | 'signup'
  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [initialTab, isOpen]);

  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);


  // Login
  const [loginIdentifier, setLoginIdentifier] = React.useState("");
  const [loginIdentifierError, setLoginIdentifierError] = React.useState(""); // New state for inline error
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);
  const [loginDisabledTemporarily, setLoginDisabledTemporarily] = React.useState(false);

  // Signup
  const [name, setName] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showSignupPassword, setShowSignupPassword] = React.useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = React.useState(false);
  const [signupErrors, setSignupErrors] = React.useState({});
  const [signupLoading, setSignupLoading] = React.useState(false);
  const [apiMessage, setApiMessage] = React.useState(null);

  // Reset
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetStatus, setResetStatus] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetToken, setResetToken] = React.useState("");

  // Email conflict popup
  const [showEmailConflictPopup, setShowEmailConflictPopup] = React.useState(false);

  /* -------------------------
     Helpers
  ------------------------- */
  const resetAllForms = () => {
    setLoginIdentifier("");
    setLoginIdentifierError("");
    setLoginPassword("");
    setLoginError("");
    setName("");
    setMobile("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSignupErrors({});
    setApiMessage(null);
    setResetEmail("");
    setResetStatus("");
  };

  const validateSignupClient = () => {
    const e = {};
    if (!name.trim()) e.name = "Please enter your name";
    if (!emailRegex.test(email)) {
      e.email = "Email is not correct";
    } else if (!isValidDomain(email)) {
      e.email = "Email is not correct";
    }
    if (!mobileRegex.test(mobile)) e.mobile = "Enter a 10-digit mobile number";
    if (!strongPasswordRegex.test(password))
      e.password = "Min 8 chars with letters and numbers";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setSignupErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------------------------
     OAuth popup handling (UI only)
  ------------------------- */
  const startOAuth = (provider) => {
    const width = 600;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const url = `/auth/${provider}`;
    oauthWindowRef.current = window.open(
      url,
      `oauth_${provider}`,
      `toolbar=no,width=${width},height=${height},top=${top},left=${left}`
    );

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
                mobile: user.mobile || "",
              })
            );
          }
          if (oauthWindowRef.current && !oauthWindowRef.current.closed)
            oauthWindowRef.current.close();
          clearInterval(oauthIntervalRef.current);
          oauthIntervalRef.current = null;
          oauthWindowRef.current = null;
          resetAllForms();

          dispatch(fetchCartAsync());
          onClose?.();
        }
      } catch (err) {
        // ignore
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [dispatch, onClose]);

  /* -------------------------
     Helper: normalize user object from API responses
  ------------------------- */
  const normalizeUserFromResponse = (payload = {}) => {
    const candidates = [
      payload.user,
      payload.data?.user,
      payload.data,
      payload
    ];

    const u = candidates.find(c => c && (c.email || c.id || c._id)) || {};

    let profile = null;
    if (u.profile) {
      if (Array.isArray(u.profile) && u.profile.length > 0) profile = u.profile[0];
      else if (typeof u.profile === "object") {
        if (u.profile["0"]) profile = u.profile["0"];
        else profile = u.profile;
      }
    }

    const mobile =
      profile?.mobile ||
      u.mobile ||
      u.phone ||
      u.phoneNumber ||
      (u.phones && u.phones[0]?.number) ||
      "";

    let name = profile?.displayName;
    if (!name) {
      if (u.firstName) {
        name = `${u.firstName} ${u.lastName || ""}`.trim();
      } else if (u.name) {
        name = u.name;
      } else if (u.fullName) {
        name = u.fullName;
      }
    }

    const dob = profile?.dob || u.dob || "";
    const gender = profile?.gender || u.gender || "Male";

    const token = payload.accessToken || payload.token || payload.data?.token || payload.data?.accessToken;
    const refreshToken = payload.refreshToken || payload.data?.refreshToken;

    return {
      id: u.id || u._id || payload.id || null,
      email: u.email || payload.email || "",
      name: name || "User",
      mobile,
      dob,
      gender,
      token,
      refreshToken,
    };
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginIdentifierError("");
    setApiMessage(null);

    const normalizedIdentifier = loginIdentifier.toLowerCase();

    // Improved validation for Login
    if (normalizedIdentifier.includes('@')) {
      // Treat as email
      if (!emailRegex.test(normalizedIdentifier) || !isValidDomain(normalizedIdentifier)) {
        setLoginIdentifierError("Email is not correct");
        return;
      }
    } else {
      // Treat as mobile
      if (!mobileRegex.test(normalizedIdentifier)) {
        setLoginIdentifierError("Email or Mobile is not correct");
        return;
      }
    }

    if (!loginPassword || loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters");
      return;
    }

    setLoginLoading(true);

    try {
      const payload = {
        email: emailRegex.test(normalizedIdentifier) ? normalizedIdentifier : "",
        password: loginPassword,
        role: "customer",
      };

      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle nested message object from 401 response
        const errorMsg = data?.message?.message || data?.message || "Login failed";
        setLoginError(errorMsg);
        toast.error(errorMsg);

        // Disable login button for 3 seconds on 401
        if (res.status === 401 || data?.message?.statusCode === 401) {
          setLoginDisabledTemporarily(true);
          setTimeout(() => setLoginDisabledTemporarily(false), 3000);
        }
        return;
      }

      const normalized = normalizeUserFromResponse(data);

      if (normalized.token) {
        localStorage.setItem("token", normalized.token);
        if (normalized.refreshToken) localStorage.setItem("refreshToken", normalized.refreshToken);
      }

      dispatch(
        login({
          id: normalized.id,
          email: normalized.email,
          name: normalized.name,
          mobile: normalized.mobile,
          dob: normalized.dob,
          gender: normalized.gender,
          token: normalized.token,
          refreshToken: normalized.refreshToken,
        })
      );

      // Fetch full profile data
      dispatch(fetchUserProfileAsync());

      // Initialize user cart
      dispatch(fetchCartSummaryAsync());
      dispatch(initializeCart(normalized.id)); // Keep this to set basic state if needed, or remove if fetchCartSummaryAsync handles everything.
      // Actually per previous plan, fetchCartSummaryAsync is the key. initializeCart sets currentUserId.
      // Let's keep initializeCart just to update currentUserId in state, then fetch.

      toast.success("Login Successful", {
        style: {
          color: "green",
        },
      });
      resetAllForms();
      onClose?.();

    } catch (err) {
      console.error(err);
      setLoginError("Something went wrong. Try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    if (!validateSignupClient()) return;

    setSignupLoading(true);

    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(" ");

    const payload = {
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      addresses: [],
      password,
      role: "customer",
      profile: {
        avatarUrl: "",
        displayName: name,
        bio: "",
        gender: "",
        dob: "",
        mobile: mobile,
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Check for 409 Conflict (Email already exists)
        if (res.status === 409 || json.statusCode === 409) {
          const errorMessage = json.message?.message || json.message || "Email already exists";

          // Save email for prefilling login
          const existingEmail = email;

          // Reset forms
          resetAllForms();

          // Prefill login email
          setLoginIdentifier(existingEmail);

          // Show popup
          setShowEmailConflictPopup(true);

          setSignupLoading(false);
          return;
        }

        // Handle other errors
        setApiMessage(json.message || "Signup failed. Please try again.");
        setSignupLoading(false);
        return;
      }

      // REDIRECT TO LOGIN LOGIC
      // 1. Reset forms but keep the email for prefilling
      const registeredEmail = email;
      resetAllForms();

      // 2. Prefill login email
      setLoginIdentifier(registeredEmail);

      // 3. Switch to login tab
      setTab("login");

      // 4. Show success message
      toast.success("Account created! Please log in.", {
        style: { color: "green" },
        duration: 4000
      });

    } catch (err) {
      console.error("Signup error:", err);
      setApiMessage("Network error. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  // Verify user exists before opening forgot password modal
  const handleForgotPasswordClick = async () => {
    const emailToVerify = (loginIdentifier || resetEmail || "").toLowerCase();

    if (!emailToVerify || !emailRegex.test(emailToVerify)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToVerify }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data?.resetToken) {
        // User exists and token received, open the modal
        setResetToken(data.data.resetToken);
        setResetEmail(emailToVerify);
        setResetOpen(true);
      } else {
        // User not found or error occurred
        const errorMessage = data.message?.message || data.message || "User not found. Please check your email.";
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Email verification error:", err);
      toast.error("Network error. Please try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  // const handleResetSubmit = async (e) => {
  //   e?.preventDefault();
  //   setResetStatus("");
  //   if (!emailRegex.test(resetEmail) && !mobileRegex.test(resetEmail)) {
  //     setResetStatus("Enter a valid email or 10-digit mobile number");
  //     return;
  //   }

  //   setResetLoading(true);
  //   try {
  //     const res = await fetch(`${BASE_URL}/api/v1/auth/reset`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ identifier: resetEmail }),
  //     });
  //     if (res.ok) setResetStatus("If an account exists, a reset link has been sent.");
  //     else {
  //       const body = await res.json().catch(() => ({}));
  //       setResetStatus(body.message || "Unable to send reset link.");
  //     }
  //   } catch (err) {
  //     setResetStatus("Network error. Try again later.");
  //   } finally {
  //     setResetLoading(false);
  //   }
  // };

  const isLoginValid =
    (emailRegex.test(loginIdentifier) || mobileRegex.test(loginIdentifier)) &&
    loginPassword.length >= 8;

  const isSignupValid =
    name.trim().length > 0 &&
    emailRegex.test(email) &&
    mobileRegex.test(mobile) &&
    strongPasswordRegex.test(password) &&
    password === confirmPassword;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetAllForms();
        onClose?.();
      }}
      showHeader={false}
      className="max-w-5xl w-full m-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] max-h-[600px] relative">
        {/* Close Button - Top Right */}
        <button
          onClick={() => {
            resetAllForms();
            onClose?.();
          }}
          className="absolute top-2 right-3 z-10 p-2 text-gray-400 hover:text-gray-600 bg-gray-25 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Close modal"
        >
          <X size={24} className="cursor-pointer" />
        </button>

        {/* Left Side - Form */}
        <div className="p-10 lg:p-16 flex flex-col">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Ishita Gallery" className="h-16 object-contain" />
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Ishita Gallery</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex border-b-2 border-gray-300 gap-8">
              <button
                type="button"
                onClick={() => setTab("login")}
                className={`pb-2 text-sm font-medium transition ${tab === "login"
                  ? "border-b-2 border-brand-600 text-brand-600 -mb-[2px]"
                  : "text-gray-600 hover:text-gray-900 cursor-pointer"
                  }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setTab("signup")}
                className={`cursor-pointer pb-2 text-sm font-medium transition ${tab === "signup"
                  ? "border-b-2 border-brand-600 text-brand-600 -mb-[2px]"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    if (loginIdentifierError) setLoginIdentifierError(""); // Clear error on type
                  }}
                  placeholder="john@gmail.com"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 transition ${loginIdentifierError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"}`}
                  autoComplete="username"
                />
                {loginIdentifierError && <p className="text-xs text-red-600 mt-1">{loginIdentifierError}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-700">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  disabled={resetLoading}
                  className="text-brand-600 hover:underline disabled:opacity-50"
                >
                  {resetLoading ? "Verifying..." : "Forgot password?"}
                </button>
              </div>

              <button
                type="submit"
                disabled={!isLoginValid || loginLoading || loginDisabledTemporarily}
                className={`w-full py-2.5 rounded text-sm font-semibold transition ${isLoginValid && !loginLoading && !loginDisabledTemporarily
                  ? "bg-brand-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {loginLoading ? "Logging in..." : loginDisabledTemporarily ? "Retry" : "Log In"}
              </button>

              {/* <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300" />
                <span className="text-xs text-gray-500">Or continue with</span>
                <div className="flex-1 border-t border-gray-300" />
              </div> */}

              {/* <OAuthButtons /> */}

            </form>
          )}

          {/* Signup Form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 flex-1 overflow-y-auto px-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Name"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 transition ${signupErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                    }`}
                />
                {signupErrors.name && <p className="text-xs text-red-600 mt-1">{signupErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter Whatsapp Mobile"
                  inputMode="numeric"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 transition ${signupErrors.mobile ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                    }`}
                />
                {signupErrors.mobile && <p className="text-xs text-red-600 mt-1">{signupErrors.mobile}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 transition ${signupErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                    }`}
                />
                {signupErrors.email && <p className="text-xs text-red-600 mt-1">{signupErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, letters & numbers"
                    className={`w-full border rounded px-3 py-2 text-sm placeholder:w-[90%] truncate focus:outline-none focus:ring-1 transition ${signupErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupErrors.password && <p className="text-xs text-red-600 mt-1">{signupErrors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSignupConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 transition ${signupErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showSignupConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{signupErrors.confirmPassword}</p>}
              </div>

              {apiMessage && <p className="text-sm text-center text-gray-700">{apiMessage}</p>}

              <button
                type="submit"
                disabled={!isSignupValid || signupLoading}
                className={`w-full py-2.5 rounded text-sm font-semibold transition ${isSignupValid && !signupLoading
                  ? "bg-brand-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {signupLoading ? "Creating account..." : "Create account"}
              </button>

              {/* <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300" />
                <span className="text-xs text-gray-500">Or continue with</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>

              <OAuthButtons /> */}
            </form>
          )}
        </div>

        {/* Right Side - Product Gallery - Replaced with Banner */}
        <div className="hidden lg:block h-full relative overflow-hidden rounded-r-lg">
          <img src={authBanner} alt="Auth Banner" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setResetEmail("");
          setResetStatus("");
          setResetToken("");
        }}
        title="Reset your password"
      >
        <ForgotPassword
          email={resetEmail}
          token={resetToken}
          onSuccess={() => {
            setResetToken("");
            setResetOpen(false);
            setTab("login");
            toast.success("Password reset successfully! Please login with your new password.");
          }}
        />
      </Modal>

      {/* Email Conflict Popup */}
      <CustomPopupModal
        isOpen={showEmailConflictPopup}
        onClose={() => {
          setShowEmailConflictPopup(false);
          setTab("login");
        }}
        title="Email Already Registered"
        message="This email is already registered. Please log in with your existing account."
        confirmText="Go to Login"
        onConfirm={() => {
          setShowEmailConflictPopup(false);
          setTab("login");
        }}
      />
    </Modal>
  );
}

