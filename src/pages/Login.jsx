import React, { useState ,useEffect  } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);
  
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, resetField, formState: { errors } } = useForm();

  const handleLogin = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await login(data);
      if (response.success) {
        if (response.otpRequired) {
          setOtpRequired(true);
          setOtpToken(response.otpToken);
          resetField('otp');
          toast.success('OTP sent to your email');
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await verifyOTP({ otp: data.otp, otpToken });
      if (response.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(response.message || 'Verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await resendOTP(otpToken);
      if (response.success) {
        setOtpToken(response.otpToken);
        setResendCooldown(30);
        toast.success('New OTP sent!');
      } else {
        toast.error(response.message || 'Resend failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-gray-200 p-10 rounded-[2rem] shadow-xl shadow-gray-200/50">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              {otpRequired ? 'Verify Access' : 'Portal Login'}
            </h1>
            <p className="text-gray-500 font-medium">
              {otpRequired ? 'Verification code sent to email ' : 'Management & Administrative Access'}
            </p>
          </div>

          {!otpRequired ? (
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email"
                      }
                    })}
                    type="email"
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs text-red-500 ml-1 font-semibold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-xs text-red-500 ml-1 font-semibold">{errors.password.message}</p>}
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-900 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(handleVerifyOTP)} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Verification Code (otp will expire in 5 minutes)</label>
                
                {/* Dummy input to catch browser autofill (hidden from screen readers as well) */}
                <input type="text" style={{ display: 'none' }} aria-hidden="true" autoComplete="username" />
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                    <Shield className="h-5 w-5" />
                  </div>
                  <input
                    {...register('otp', { 
                      required: 'OTP required',
                      minLength: { value: 6, message: 'Must be 6 digits' },
                      pattern: {
                        value: /^[0-9]*$/,
                        message: "Only numbers are allowed"
                      }
                    })}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-black text-center text-3xl font-black tracking-[10px] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all appearance-none"
                    placeholder="000000"
                  />
                </div>
                {errors.otp && <p className="mt-2 text-xs text-red-500 ml-1 font-semibold">{errors.otp.message}</p>}
              </div>

              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Secure Sign In</span>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2 font-medium">Didn't receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isSubmitting}
                  className="text-sm font-black text-black hover:underline disabled:text-gray-400 disabled:no-underline flex items-center justify-center mx-auto space-x-1 uppercase tracking-tighter"
                >
                  {resendCooldown > 0 ? (
                    <span>Wait {resendCooldown}s</span>
                  ) : (
                    <span>Resend OTP</span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setOtpRequired(false)}
                className="w-full text-sm font-bold text-gray-400 hover:text-black transition-colors"
              >
                Go back to login
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              Secure Environment &bull; Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
