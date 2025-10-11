import React from 'react';
import Modal from './Modal';
import { useDispatch, useSelector } from 'react-redux';
import { login, signup } from '../features/user/userSlice';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\d{10}$/;

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const dispatch = useDispatch();
  const [tab, setTab] = React.useState('login'); // 'login' | 'signup'
  React.useEffect(() => {
    if (isOpen) setTab(initialTab);
  }, [initialTab, isOpen]);

  // Login form
  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState('');

  // Signup form
  const [name, setName] = React.useState('');
  const [mobile, setMobile] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const resetForms = () => {
    setLoginEmail(''); setLoginPassword(''); setLoginError('');
    setName(''); setMobile(''); setEmail(''); setPassword(''); setConfirmPassword(''); setErrors({});
  };

  // Accept any characters; require at least one letter and one number, length >= 8
  const strongPassword = (p) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(p);

  const validateSignup = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!mobileRegex.test(mobile)) e.mobile = 'Mobile must be 10 digits';
    if (!emailRegex.test(email)) e.email = 'Enter a valid email';
    if (!strongPassword(password)) e.password = 'Min 8 chars with letters and numbers';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // Require valid email/mobile and strong-ish password (min 8)
    if ((!emailRegex.test(loginEmail) && !mobileRegex.test(loginEmail)) || loginPassword.length < 8) {
      setLoginError('Enter valid email/mobile and password (min 8 chars)');
      return;
    }
    dispatch(login({ email: emailRegex.test(loginEmail) ? loginEmail : '', mobile: mobileRegex.test(loginEmail) ? loginEmail : '', name: 'User' }));
    resetForms();
    onClose?.();
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    dispatch(signup({ name, email, mobile }));
    resetForms();
    onClose?.();
  };

  const isLoginValid = React.useMemo(() => {
    return ((emailRegex.test(loginEmail) || mobileRegex.test(loginEmail)) && loginPassword.length >= 8);
  }, [loginEmail, loginPassword]);

  const isSignupValid = React.useMemo(() => {
    return (
      !!name && mobileRegex.test(mobile) && emailRegex.test(email) && strongPassword(password) && password === confirmPassword
    );
  }, [name, mobile, email, password, confirmPassword]);

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForms(); onClose?.(); }} title="Welcome to Ishita Gallery">
      <div className="px-2">
        {/* Tabs */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-gray-100 rounded-full p-1">
            <button type="button" className={`w-28 px-4 py-1 text-sm rounded-full ${tab==='login' ? 'bg-white shadow font-semibold' : 'text-gray-600'}`} onClick={() => setTab('login')} aria-pressed={tab==='login'}>Log In</button>
            <button type="button" className={`w-28 px-4 py-1 text-sm rounded-full ${tab==='signup' ? 'bg-white shadow font-semibold' : 'text-gray-600'}`} onClick={() => setTab('signup')} aria-pressed={tab==='signup'}>Sign Up</button>
          </div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Email/Mobile Number <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded px-3 py-2" placeholder="john@gmail.com" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label className="block text-sm mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" className="w-full border border-gray-200 rounded px-3 py-2" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {loginError && <p className="text-xs text-red-600">{loginError}</p>}
            <button
              type="submit"
              className={`w-full px-4 py-2 rounded transition ${isLoginValid ? 'bg-brand-900 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              disabled={!isLoginValid}
            >
              Log In
            </button>
            <div className="text-center text-xs text-gray-600">Forgot password? <button type="button" className="text-purple-700">Click here to reset</button></div>
            <div className="border-t my-2" />
            <div className="text-center text-xs text-gray-500">Or Login with</div>
            <div className="flex justify-center gap-3 mt-2">
              <button type="button" className="border rounded px-3 py-2">G</button>
              <button type="button" className="border rounded px-3 py-2">f</button>
              <button type="button" className="border rounded px-3 py-2"></button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Name <span className="text-red-500">*</span></label>
              <input className={`w-full border rounded px-3 py-2 ${errors.name? 'border-red-500':'border-gray-200'}`} value={name} onChange={(e)=>setName(e.target.value)} />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <input className={`w-full border rounded px-3 py-2 ${errors.mobile? 'border-red-500':'border-gray-200'}`} value={mobile} onChange={(e)=>setMobile(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="987 654 3210" inputMode="numeric" maxLength={10} />
              {errors.mobile && <p className="text-xs text-red-600">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Email/Mobile Number <span className="text-red-500">*</span></label>
              <input className={`w-full border rounded px-3 py-2 ${errors.email? 'border-red-500':'border-gray-200'}`} value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="jay@gmail.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" className={`w-full border rounded px-3 py-2 ${errors.password? 'border-red-500':'border-gray-200'}`} value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Min 8 chars, letters & numbers" autoComplete="new-password" />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input type="password" className={`w-full border rounded px-3 py-2 ${errors.confirmPassword? 'border-red-500':'border-gray-200'}`} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} autoComplete="new-password" />
              {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              className={`w-full px-4 py-2 rounded transition ${isSignupValid ? 'bg-brand-900 text-white hover:bg-brand-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
              disabled={!isSignupValid}
            >
              Sign Up
            </button>
            <div className="border-t my-2" />
            <div className="text-center text-xs text-gray-500">Or Sign up with</div>
            <div className="flex justify-center gap-3 mt-2">
              <button type="button" className="border rounded px-3 py-2">G</button>
              <button type="button" className="border rounded px-3 py-2">f</button>
              <button type="button" className="border rounded px-3 py-2"></button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
