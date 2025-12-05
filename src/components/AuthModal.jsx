import React from "react";
import Modal from "./Modal";
import { useDispatch } from "react-redux";
import { login, signup } from "../features/user/userSlice";
import googleButton from "../assets/google_buttons.png";
import facebookButton from "../assets/facebook_buttons.png";
import appleButton from "../assets/apple_buttons.png";
import { Eye, EyeOff } from "lucide-react";


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


  // Below is function for Login with API Call

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setLoginError("");
  //   setApiMessage(null);

  //   // VALIDATION
  //   if (!emailRegex.test(loginIdentifier) && !mobileRegex.test(loginIdentifier)) {
  //     setLoginError("Enter valid email or 10-digit mobile");
  //     return;
  //   }
  //   if (!loginPassword || loginPassword.length < 8) {
  //     setLoginError("Password must be at least 8 characters");
  //     return;
  //   }

  //   setLoginLoading(true);

  //   try {
  //     const payload = {
  //       email: emailRegex.test(loginIdentifier) ? loginIdentifier : "",
  //       password: loginPassword,
  //       role: "customer",
  //     };

  //     const res = await fetch("http://localhost:3000/api/v1/auth/login", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json();
  //     console.log("LOGIN API RESPONSE:", data);

  //     if (!res.ok) {
  //       setLoginError(data?.message || "Login failed");
  //       return;
  //     }

  //     // SUCCESS — Save user and auth token
  //     dispatch(
  //       login({
  //         email: data.user?.email,
  //         name: data.user?.name,
  //         token: data.token,
  //       })
  //     );

  //     resetAllForms();
  //     onClose?.();

  //   } catch (err) {
  //     console.error(err);
  //     setLoginError("Something went wrong. Try again.");
  //   } finally {
  //     setLoginLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setApiMessage(null);

    if (!emailRegex.test(loginIdentifier) && !mobileRegex.test(loginIdentifier)) {
      setLoginError("Enter valid email or 10-digit mobile");
      return;
    }
    if (!loginPassword || loginPassword.length < 8) {
      setLoginError("Password must be at least 8 characters");
      return;
    }

    setLoginLoading(true);
    try {
      // If you have a real login API, call it here. For now we just dispatch.
      dispatch(
        login({
          email: emailRegex.test(loginIdentifier) ? loginIdentifier : "",
          mobile: mobileRegex.test(loginIdentifier) ? loginIdentifier : "",
          name: "User",
        })
      );
      resetAllForms();
      onClose?.();
    } catch (err) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  /* -------------------------
     Signup handler (sends full body)
  ------------------------- */
  const handleSignup = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    if (!validateSignupClient()) return;

    setSignupLoading(true);

    // split name into first/last
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
      profile: [
        {
          avatarUrl: "",
          displayName: name,
          bio: "",
        },
      ],
    };

    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/register", {
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

      // success
      dispatch(signup({ name, email, mobile }));
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

  /* -------------------------
     Password reset handler
  ------------------------- */
  const handleResetSubmit = async (e) => {
    e?.preventDefault();
    setResetStatus("");
    if (!emailRegex.test(resetEmail) && !mobileRegex.test(resetEmail)) {
      setResetStatus("Enter a valid email or 10-digit mobile number");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/v1/auth/reset", {
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

  /* -------------------------
     Derived states
  ------------------------- */
  const isLoginValid =
    (emailRegex.test(loginIdentifier) || mobileRegex.test(loginIdentifier)) &&
    loginPassword.length >= 8;

  const isSignupValid =
    name.trim().length > 0 &&
    emailRegex.test(email) &&
    mobileRegex.test(mobile) &&
    strongPasswordRegex.test(password) &&
    password === confirmPassword;

  /* -------------------------
     Small presentational subcomponents
  ------------------------- */

  const OAuthButtons = () => (
    <div className="flex justify-center gap-4 pb-4">
      <button
        type="button"
        onClick={() => startOAuth("google")}
        title="Continue with Google"
        className="transform hover:scale-105 active:scale-95"
      >
        <img src={googleButton} alt="Google" className="h-12 w-12 object-contain" />
      </button>
      <button
        type="button"
        onClick={() => startOAuth("facebook")}
        title="Continue with Facebook"
        className="transform hover:scale-105 active:scale-95"
      >
        <img src={facebookButton} alt="Facebook" className="h-12 w-12 object-contain" />
      </button>
      <button
        type="button"
        onClick={() => startOAuth("apple")}
        title="Continue with Apple"
        className="transform hover:scale-105 active:scale-95"
      >
        <img src={appleButton} alt="Apple" className="h-12 w-12 object-contain" />
      </button>
    </div>
  );

  /* -------------------------
     Render
  ------------------------- */
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetAllForms();
        onClose?.();
      }}
      title="Welcome to Ishita Gallery"
    >
      <div className="max-w-md w-full px-6 py-5">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-full p-1 gap-2">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                tab === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              aria-pressed={tab === "login"}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition ${
                tab === "signup" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              aria-pressed={tab === "signup"}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Login */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <OAuthButtons />

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-500">Or login with</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="john@gmail.com or 9876543210"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && <p className="text-sm text-red-600">{loginError}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="w-4 h-4 border-gray-300 rounded" />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="text-sm text-purple-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={!isLoginValid || loginLoading}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                isLoginValid && !loginLoading ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loginLoading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {/* Signup */}
        {tab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-5">
            <OAuthButtons />

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-500">Or sign up with</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>

            {/* name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  signupErrors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {signupErrors.name && <p className="text-xs text-red-600 mt-1">{signupErrors.name}</p>}
            </div>

            {/* mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile <span className="text-red-500">*</span></label>
              <input
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                inputMode="numeric"
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  signupErrors.mobile ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {signupErrors.mobile && <p className="text-xs text-red-600 mt-1">{signupErrors.mobile}</p>}
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                  signupErrors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                }`}
              />
              {signupErrors.email && <p className="text-xs text-red-600 mt-1">{signupErrors.email}</p>}
            </div>

            {/* password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, letters & numbers"
                  className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    signupErrors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={showSignupPassword ? "Hide password" : "Show password"}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signupErrors.password && <p className="text-xs text-red-600 mt-1">{signupErrors.password}</p>}
            </div>

            {/* confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showSignupConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${
                    signupErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-purple-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupConfirm((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600"
                  aria-label={showSignupConfirm ? "Hide password" : "Show password"}
                >
                  {showSignupConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {signupErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{signupErrors.confirmPassword}</p>}
            </div>

            {/* api message */}
            {apiMessage && <p className="text-sm text-center text-gray-700">{apiMessage}</p>}

            <button
              type="submit"
              disabled={!isSignupValid || signupLoading}
              className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                isSignupValid && !signupLoading ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {signupLoading ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        {/* Reset password modal (inline small modal) */}
        <Modal
          isOpen={resetOpen}
          onClose={() => {
            setResetOpen(false);
            setResetEmail("");
            setResetStatus("");
          }}
          title="Reset your password"
        >
          <form onSubmit={handleResetSubmit} className="space-y-4 px-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Mobile <span className="text-red-500">*</span></label>
              <input
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="john@example.com or 9876543210"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            {resetStatus && <p className="text-sm text-gray-700">{resetStatus}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={resetLoading} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                {resetLoading ? "Sending..." : "Send reset link"}
              </button>
              <button type="button" onClick={() => { setResetOpen(false); setResetStatus(""); }} className="px-4 py-2 rounded border">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Modal>
  );
}
