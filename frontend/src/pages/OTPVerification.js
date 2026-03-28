import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resendOtp } from '../actions/UserAction';
import UserService from '../services/UserService';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userState = useSelector(state => state.user);

  useEffect(() => {
    const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
    if (!unverifiedUser.phone) {
      navigate('/signup');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleResendOTP = async () => {
    const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
    
    const result = await dispatch(resendOtp(unverifiedUser.phone));
    
    if (result.success) {
      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
      document.getElementById('otp-0').focus();
    } else {
      setError(result.error);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const enteredOTP = otp.join('');
    if (enteredOTP.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      setIsLoading(false);
      return;
    }
    const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');

    // Local verification: check demo OTP stored by sendOtp/resendOtp (or generated client-side)
    const demoOtpLocal = localStorage.getItem('demoOtp');
    const phoneClean = (unverifiedUser.phone || '').toString().replace(/\D/g, '');
    if (demoOtpLocal && enteredOTP === demoOtpLocal) {
      // find or create user locally
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find(u => (u.phone || '').toString().replace(/\D/g, '') === phoneClean);
      if (!user) {
        user = {
          id: Date.now(),
          name: unverifiedUser.name || 'Demo User',
          username: 'user' + Date.now(),
          email: unverifiedUser.email || (`user${Date.now()}@demo.local`),
          password: 'demo',
          role: unverifiedUser.role || 'shopowner',
          phone: unverifiedUser.phone || phoneClean,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
      }

      // mark user as logged in
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('unverifiedUser');
      localStorage.removeItem('demoOtp');

      // Query backend for authoritative role and navigate accordingly
      try {
        const res = await UserService.testGetUserRole(phoneClean);
        let role = null;
        let serverUserName = '';
        if (res && res.data) {
          role = (res.data.ResultSet && res.data.ResultSet[0] && (res.data.ResultSet[0].Role || res.data.ResultSet[0].role || res.data.ResultSet[0].UserRole)) || res.data.Result;
          const maybe = (res.data.ResultSet && res.data.ResultSet[0]) || res.data.Result || res.data;
          serverUserName = (maybe && (maybe.UserName || maybe.User || maybe.name || maybe.displayName || maybe.fullName)) || '';
        }

        // persist canonical username for other pages
        if (serverUserName) {
          user.displayName = user.displayName || serverUserName;
          if (!user.username || String(user.username).startsWith('user')) user.username = serverUserName;
          try { localStorage.setItem('rep_name', serverUserName); } catch (e) { /* ignore */ }
          localStorage.setItem('user', JSON.stringify(user));
        }

        const r = (role || user.role || '').toString().trim().toLowerCase();
        // Map short codes to canonical roles used by ProtectedRoute
        let canonicalRole = user.role || 'shopowner';
        if (r === 'a' || r.startsWith('a') || r === 'admin' || r.includes('shop')) {
          canonicalRole = 'shopowner';
        } else if (r === 'r' || r.startsWith('r') || r === 'repairman') {
          canonicalRole = 'repairman';
        } else if (r.includes('supplier')) {
          canonicalRole = 'supplier';
        }

        // persist canonical role so ProtectedRoute accepts it
        user.role = canonicalRole;
        localStorage.setItem('user', JSON.stringify(user));

        if (canonicalRole === 'shopowner') {
          navigate('/shop-owner/dashboard');
        } else if (canonicalRole === 'repairman') {
          navigate('/repairman/dashboard');
        } else if (canonicalRole === 'supplier') {
          navigate('/supplier/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        // fallback to local role
        switch (user.role) {
          case 'shopowner':
            navigate('/shop-owner/dashboard');
            break;
          case 'repairman':
            navigate('/repairman/dashboard');
            break;
          case 'supplier':
            navigate('/supplier/dashboard');
            break;
          default:
            navigate('/');
        }
      }
      setIsLoading(false);
      return;
    }

    setError('Invalid OTP');
    setIsLoading(false);

    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Verify Phone Number</h1>
          <p className="text-gray-600 mt-2">
            Enter the OTP sent to <span className="font-semibold">{unverifiedUser.phone}</span>
          </p>
        </div>

        

        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="block text-gray-700 font-medium text-center">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center space-x-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition duration-200"
                />
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Time remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Didn't receive the code?{' '}
            <button
              onClick={handleResendOTP}
              disabled={!canResend || userState.loading}
              className="text-blue-600 hover:text-blue-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {userState.loading ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            <strong>Note:</strong> In production, this OTP is sent via SMS to your mobile phone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;