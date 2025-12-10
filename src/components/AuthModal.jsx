import React from "react";
import Modal from "./Modal";
import ForgotPassword from "./ForgotPassword";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { login, signup, fetchUserProfileAsync } from "../features/user/userSlice";
import toast from "react-hot-toast";
import logo from "../assets/ishita-gallery-logo.jpg";
import { Eye, EyeOff, X } from "lucide-react";


// Import product images for gallery
import art1 from "../assets/art1.png";
import art2 from "../assets/art2.png";
import art3 from "../assets/art3.png";
import rect16 from "../assets/Rectangle 16.png";
import rect17 from "../assets/Rectangle 17.png";
import rect18 from "../assets/Rectangle 18.png";
import rect33 from "../assets/Rectangle 33.png";
import rect35 from "../assets/Rectangle 35.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;
const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

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
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");
  const [loginLoading, setLoginLoading] = React.useState(false);

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

  // OAuth popup
  const oauthWindowRef = React.useRef(null);
  const oauthIntervalRef = React.useRef(null);

  /* -------------------------
     Helpers
  ------------------------- */
  const resetAllForms = () => {
    setLoginIdentifier("");
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
    if (!emailRegex.test(email)) e.email = "Enter a valid email";
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
    setApiMessage(null);

    const normalizedIdentifier = loginIdentifier.toLowerCase();

    if (!emailRegex.test(normalizedIdentifier) && !mobileRegex.test(normalizedIdentifier)) {
      setLoginError("Enter valid email or 10-digit mobile");
      return;
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
      addresses: [
        {
          line1: "",
          line2: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          phone: mobile,
          isDefault: true,
        },
      ],
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
        setApiMessage(json.message || "Signup failed. Please try again.");
        setSignupLoading(false);
        return;
      }

      dispatch(signup({ name, email, mobile }));

      // Fetch profile (even if empty, establishes state)
      dispatch(fetchUserProfileAsync());

      setApiMessage("Account created successfully.");
      resetAllForms();
      onClose?.();
    } catch (err) {
      console.error("Signup error:", err);
      setApiMessage("Network error. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  // Verify user exists before opening forgot password modal
  const handleForgotPasswordClick = async () => {
    const emailToVerify = loginIdentifier || resetEmail;

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

  const handleResetSubmit = async (e) => {
    e?.preventDefault();
    setResetStatus("");
    if (!emailRegex.test(resetEmail) && !mobileRegex.test(resetEmail)) {
      setResetStatus("Enter a valid email or 10-digit mobile number");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetEmail }),
      });
      if (res.ok) setResetStatus("If an account exists, a reset link has been sent.");
      else {
        const body = await res.json().catch(() => ({}));
        setResetStatus(body.message || "Unable to send reset link.");
      }
    } catch (err) {
      setResetStatus("Network error. Try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  const isLoginValid =
    (emailRegex.test(loginIdentifier) || mobileRegex.test(loginIdentifier)) &&
    loginPassword.length >= 8;

  const isSignupValid =
    name.trim().length > 0 &&
    emailRegex.test(email) &&
    mobileRegex.test(mobile) &&
    strongPasswordRegex.test(password) &&
    password === confirmPassword;

  // const OAuthButtons = () => (
  //   <div className="flex justify-center gap-3">
  //     <button
  //       type="button"
  //       onClick={() => startOAuth("google")}
  //       title="Continue with Google"
  //       className="transform hover:scale-105 active:scale-95 transition"
  //     >
  //       <img src={googleButton} alt="Google" className="h-10 w-10 object-contain" />
  //     </button>
  //     <button
  //       type="button"
  //       onClick={() => startOAuth("facebook")}
  //       title="Continue with Facebook"
  //       className="transform hover:scale-105 active:scale-95 transition"
  //     >
  //       <img src={facebookButton} alt="Facebook" className="h-10 w-10 object-contain" />
  //     </button>
  //     <button
  //       type="button"
  //       onClick={() => startOAuth("apple")}
  //       title="Continue with Apple"
  //       className="transform hover:scale-105 active:scale-95 transition"
  //     >
  //       <img src={appleButton} alt="Apple" className="h-10 w-10 object-contain" />
  //     </button>
  //   </div>
  // );

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
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] relative">
        {/* Close Button - Top Right */}
        <button
          onClick={() => {
            resetAllForms();
            onClose?.();
          }}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Close modal"
        >
          <X size={24} className="cursor-pointer" />
        </button>

        {/* Left Side - Form */}
        <div className="p-8 lg:p-12 flex flex-col">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Ishita Gallery" className="h-16 object-contain" />
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Ishita Gallery</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex border-b-2 border-gray-200 gap-8">
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
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="john@gmail.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                  autoComplete="username"
                />
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
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
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
                disabled={!isLoginValid || loginLoading}
                className={`w-full py-2.5 rounded text-sm font-semibold transition ${isLoginValid && !loginLoading
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {loginLoading ? "Logging in..." : "Log In"}
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
            <form onSubmit={handleSignup} className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="FirstName LastName"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${signupErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-500"
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
                  placeholder=""
                  inputMode="numeric"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${signupErrors.mobile ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-500"
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
                  placeholder="sample@gmail.com"
                  className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${signupErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-500"
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
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${signupErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-500"
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
                    className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${signupErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-500"
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
                  ? "bg-brand-600 text-white hover:bg-brand-700"
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

        {/* Right Side - Product Gallery */}
        <div className="hidden lg:block bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 p-6 rounded-r-lg relative overflow-hidden">
          <div className="grid grid-cols-3 gap-3 h-full">
            {/* Column 1 */}
            <div className="space-y-3">
              <div className="bg-purple-200 rounded-lg overflow-hidden h-32">
                <img src={rect33} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden h-48">
                <img src={art1} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-purple-300 rounded-lg overflow-hidden h-32">
                <img src={rect35} alt="Product" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3 pt-12">
              <div className="bg-green-200 rounded-lg overflow-hidden h-40">
                <img src={art2} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-gray-300 rounded-lg overflow-hidden h-32">
                <img src={rect16} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-pink-200 rounded-lg overflow-hidden h-48">
                <img src={rect17} alt="Product" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-3">
              <div className="bg-blue-200 rounded-lg overflow-hidden h-40">
                <img src={rect18} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-orange-200 rounded-lg overflow-hidden h-32">
                <img src={art3} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="bg-gray-400 rounded-lg overflow-hidden h-48">
                <img src={rect33} alt="Product" className="w-full h-full object-cover grayscale" />
              </div>
            </div>
          </div>
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
            setResetOpen(false);
            setResetEmail("");
            setResetToken("");
            toast.success("Password reset successfully! Please login with your new password.");
          }}
        />
      </Modal>
    </Modal>
  );
}
