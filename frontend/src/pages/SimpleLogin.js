// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { sendOtp, resendOtp } from '../actions/UserAction';
// import UserService from '../services/UserService';
// // import bgVideo from '../assets/login-background.mp4';
// import bgVideo from '../assets/VIDEO.mp4';



// const SimpleLogin = () => {
//   const navigate = useNavigate();
//   // Phone-only login flow: no email/password used

//   // Phone / OTP flow (demo): generate OTP, store unverifiedUser and demoOtp, then navigate
//   const [phone, setPhone] = useState('');
//   const [phoneError, setPhoneError] = useState('');
//   const [showOtp, setShowOtp] = useState(false);
//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
//   const [canResend, setCanResend] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(false);

//   const dispatch = useDispatch();

//   const sendOtpToPhone = async () => {
//     setPhoneError('');
//     const cleaned = phone.replace(/\D/g, '');
//     if (!cleaned || cleaned.length < 7) {
//       setPhoneError('Please enter a valid phone number');
//       return;
//     }

//     // Call backend to send OTP
//     const result = await dispatch(sendOtp(cleaned));
//     if (result && result.success) {
//       // Show OTP UI and start timer
//       setShowOtp(true);
//       setTimeLeft(180);
//       setCanResend(false);
//     } else {
//       setPhoneError(result.error || 'Failed to send OTP');
//     }
//   };

//   // Manage countdown when OTP UI is visible
//   useEffect(() => {
//     if (!showOtp) return undefined;
//     const timer = setInterval(() => {
//       setTimeLeft(prev => {
//         if (prev <= 1) {
//           setCanResend(true);
//           clearInterval(timer);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [showOtp]);

//   const otpRef = useRef(null);

//   useEffect(() => {
//     if (showOtp && otpRef.current) {
//       const first = otpRef.current.querySelector('input');
//       if (first) first.focus();
//     }
//   }, [showOtp]);

//   const handleOtpChange = (e, index) => {
//     const val = e.target.value.replace(/\D/g, '');
//     if (!val && e.target.value !== '') return; // non-numeric
//     const newOtp = [...otp];
//     newOtp[index] = val.slice(-1);
//     setOtp(newOtp);
//     // move focus
//     if (val && e.target.nextSibling) e.target.nextSibling.focus();
//   };

//   const handleOtpKeyDown = (e, index) => {
//     if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
//       e.target.previousSibling.focus();
//     }
//   };

//   const formatTime = (sec) => {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     return `${m}:${s < 10 ? '0' : ''}${s}`;
//   };

//   const verifyOtpInline = async () => {
//     setIsVerifying(true);
//     setPhoneError('');
//     const entered = otp.join('');
//     if (entered.length !== 6) {
//       setPhoneError('Please enter the full 6-digit OTP');
//       setIsVerifying(false);
//       return;
//     }
//     const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
//     const phoneClean = (unverifiedUser.phone || phone || '').toString().replace(/\D/g, '');

//     // Verify locally against stored demo OTP (set by sendOtp or generated client-side)
//     const demoOtpLocal = localStorage.getItem('demoOtp');
//     if (demoOtpLocal && entered === demoOtpLocal) {
//       // find or create user locally
//       const users = JSON.parse(localStorage.getItem('users') || '[]');
//       let user = users.find(u => (u.phone || '').toString().replace(/\D/g, '') === phoneClean);
//       if (!user) {
//         user = {
//           id: Date.now(),
//           name: 'Demo User',
//           username: 'user' + Date.now(),
//           email: `user${Date.now()}@demo.local`,
//           password: 'demo',
//           role: 'shopowner',
//           phone: phoneClean,
//           isVerified: true,
//           createdAt: new Date().toISOString()
//         };
//         users.push(user);
//         localStorage.setItem('users', JSON.stringify(users));
//       }

//       // mark logged in
//       localStorage.setItem('user', JSON.stringify(user));
//       localStorage.removeItem('unverifiedUser');
//       localStorage.removeItem('demoOtp');

//       // Save rep_name for later API calls (used in AssignedRepairs, etc.)


//       // ask backend for authoritative role and navigate accordingly (if backend available)
//       try {
//         const res = await UserService.testGetUserRole(phoneClean);
//         let role = null;
//         let serverUserName = '';
//         if (res && res.data) {
//           role = (res.data.ResultSet && res.data.ResultSet[0] && (res.data.ResultSet[0].Role || res.data.ResultSet[0].role || res.data.ResultSet[0].UserRole)) || res.data.Result;
//           const maybe = (res.data.ResultSet && res.data.ResultSet[0]) || res.data.Result || res.data;
//           serverUserName = (maybe && (maybe.UserName || maybe.User || maybe.name || maybe.displayName || maybe.fullName)) || '';
//         }

//         // If server returned canonical username, persist it for other pages
//         if (serverUserName) {
//           user.displayName = user.displayName || serverUserName;
//           if (!user.username || String(user.username).startsWith('user')) user.username = serverUserName;
//           try { localStorage.setItem('rep_name', serverUserName); } catch (e) { /* ignore */ }
//           localStorage.setItem('user', JSON.stringify(user));
//         }

//         const r = (role || user.role || '').toString().trim().toLowerCase();
//           // Map short codes to canonical roles used by ProtectedRoute
//           let canonicalRole = user.role || 'shopowner';
//           if (r === 'a' || r.startsWith('a') || r === 'admin' || r.includes('shop')) {
//             canonicalRole = 'shopowner';
//           } else if (r === 'r' || r.startsWith('r') || r === 'repairman') {
//             canonicalRole = 'repairman';
//           } else if (r.includes('supplier')) {
//             canonicalRole = 'supplier';
//           }

//           // persist canonical role so ProtectedRoute accepts it
//           user.role = canonicalRole;
//           localStorage.setItem('user', JSON.stringify(user));

//           if (canonicalRole === 'shopowner') {
//             navigate('/shop-owner/dashboard');
//           } else if (canonicalRole === 'repairman') {
//             navigate('/repairman/dashboard');
//           } else if (canonicalRole === 'supplier') {
//             navigate('/supplier/dashboard');
//           } else {
//             navigate('/');
//           }
//       } catch (err) {
//         // fallback to local role
//         if (user.role === 'shopowner') navigate('/shop-owner/dashboard');
//         else if (user.role === 'repairman') navigate('/repairman/dashboard');
//         else navigate('/');
//       }
//       return;
//     }

//     setPhoneError('Invalid OTP or no OTP found. Please resend.');
//     setIsVerifying(false);
//     return;
//   };

//   const resendOtpInline = async () => {
//     const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
//     const phoneForResend = (unverifiedUser.phone || phone || '').toString().replace(/\D/g, '');
//     if (!phoneForResend) {
//       setPhoneError('No phone to resend to');
//       return;
//     }

//     const result = await dispatch(resendOtp(phoneForResend));
//     if (result.success) {
//       setOtp(['', '', '', '', '', '']);
//       setTimeLeft(180);
//       setCanResend(false);
//       setPhoneError('');
//     } else {
//       setPhoneError(result.error || 'Failed to resend OTP');
//     }
//   };

//   // Component render
//   return (
//     <div className="min-h-screen w-full relative overflow-hidden">
//       {/* Fullscreen background video */}
//       <video src={bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />

//       {/* Animated colorful overlay (semi-transparent) */}
//       <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 opacity-60 mix-blend-multiply animate-pulse" />

//       {/* Soft dark overlay to increase contrast */}
//       <div className="absolute inset-0 bg-black/25" />

//       {/* Centered glass card */}
//       <div className="relative z-30 min-h-screen flex items-center justify-center p-6">
//         <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
//           <div className="flex items-center justify-center mb-6">
//             <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
//               TC
//             </div>
//           </div>

//           <h2 className="text-center text-2xl font-semibold text-white mb-2">Welcome to TekniCity</h2>
//           <p className="text-center text-sm text-white/80 mb-6">Secure access — enter your phone to receive an OTP</p>

//           <div className="space-y-4">
//             {!showOtp ? (
//               <>
//                 <div>
//                   <label className="block text-sm text-white/90 mb-2">Mobile number</label>
//                   <input
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     type="tel"
//                     placeholder="e.g. 0718081350"
//                     className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
//                   />
//                 </div>

//                 {phoneError && <p className="text-sm text-red-300">{phoneError}</p>}

//                 <div className="flex gap-3">
//                   <button onClick={sendOtpToPhone} className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow hover:scale-[1.02] transition">Send OTP</button>
//                 </div>
//               </>
//             ) : (
//               <>
//                 <div>
//                   <label className="block text-sm text-white/90 mb-2">Enter the 6-digit code</label>
//                   <div ref={otpRef} className="flex gap-2 justify-center">
//                     {otp.map((d, idx) => (
//                       <input
//                         key={idx}
//                         type="text"
//                         maxLength={1}
//                         value={d}
//                         onChange={(e) => handleOtpChange(e, idx)}
//                         onKeyDown={(e) => handleOtpKeyDown(e, idx)}
//                         className="w-12 h-12 text-center text-lg rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
//                       />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <p className="text-sm text-white/80">Time remaining: <span className="font-mono">{formatTime(timeLeft)}</span></p>
//                   <button onClick={resendOtpInline} disabled={!canResend} className="text-sm text-white/80 disabled:opacity-40">Resend</button>
//                 </div>

//                 {phoneError && <p className="text-sm text-red-300">{phoneError}</p>}

//                 <div className="flex gap-3">
//                   <button onClick={verifyOtpInline} disabled={isVerifying || otp.join('').length !== 6} className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow">Verify OTP</button>
//                 </div>
//               </>
//             )}
//           </div>

//           <div className="mt-6 text-center text-sm text-white/70">
//             Enter the code sent to your phone to continue.
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SimpleLogin;



import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { sendOtp, resendOtp } from '../actions/UserAction';
import UserService from '../services/UserService';
import bgVideo from '../assets/VIDEO.mp4';

const SimpleLogin = () => {
  const navigate = useNavigate();
  // Phone-only login flow: no email/password used

  // Phone / OTP flow (demo): generate OTP, store unverifiedUser and demoOtp, then navigate
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const dispatch = useDispatch();

  // Fixed: Enhanced back to home navigation
  const handleBackToHome = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Navigating to home...');
    navigate('/', { replace: true });
  };

  const sendOtpToPhone = async () => {
    setPhoneError('');
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 7) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    // Call backend to send OTP
    const result = await dispatch(sendOtp(cleaned));
    if (result && result.success) {
      // Show OTP UI and start timer
      setShowOtp(true);
      setTimeLeft(180);
      setCanResend(false);
    } else {
      setPhoneError(result.error || 'Failed to send OTP');
    }
  };

  // Manage countdown when OTP UI is visible
  useEffect(() => {
    if (!showOtp) return undefined;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showOtp]);

  const otpRef = useRef(null);

  useEffect(() => {
    if (showOtp && otpRef.current) {
      const first = otpRef.current.querySelector('input');
      if (first) first.focus();
    }
  }, [showOtp]);

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val && e.target.value !== '') return; // non-numeric
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    // move focus
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const verifyOtpInline = async () => {
    setIsVerifying(true);
    setPhoneError('');
    const entered = otp.join('');
    if (entered.length !== 6) {
      setPhoneError('Please enter the full 6-digit OTP');
      setIsVerifying(false);
      return;
    }
    const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
    const phoneClean = (unverifiedUser.phone || phone || '').toString().replace(/\D/g, '');

    // Verify locally against stored demo OTP (set by sendOtp or generated client-side)
    const demoOtpLocal = localStorage.getItem('demoOtp');
    if (demoOtpLocal && entered === demoOtpLocal) {
      // find or create user locally
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find(u => (u.phone || '').toString().replace(/\D/g, '') === phoneClean);
      if (!user) {
        user = {
          id: Date.now(),
          name: 'Demo User',
          username: 'user' + Date.now(),
          email: `user${Date.now()}@demo.local`,
          password: 'demo',
          role: 'shopowner',
          phone: phoneClean,
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
      }

      // mark logged in
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('unverifiedUser');
      localStorage.removeItem('demoOtp');

      // ask backend for authoritative role and navigate accordingly (if backend available)
      try {
        const res = await UserService.testGetUserRole(phoneClean);
            let role = null;
            if (res && res.data) {
              role = (res.data.ResultSet && res.data.ResultSet[0] && (res.data.ResultSet[0].Role || res.data.ResultSet[0].role || res.data.ResultSet[0].UserRole)) || res.data.Result;
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
        if (user.role === 'shopowner') navigate('/shop-owner/dashboard');
        else if (user.role === 'repairman') navigate('/repairman/dashboard');
        else navigate('/');
      }
      return;
    }

    setPhoneError('Invalid OTP or no OTP found. Please resend.');
    setIsVerifying(false);
    return;
  };

  const resendOtpInline = async () => {
    const unverifiedUser = JSON.parse(localStorage.getItem('unverifiedUser') || '{}');
    const phoneForResend = (unverifiedUser.phone || phone || '').toString().replace(/\D/g, '');
    if (!phoneForResend) {
      setPhoneError('No phone to resend to');
      return;
    }

    const result = await dispatch(resendOtp(phoneForResend));
    if (result.success) {
      setOtp(['', '', '', '', '', '']);
      setTimeLeft(180);
      setCanResend(false);
      setPhoneError('');
    } else {
      setPhoneError(result.error || 'Failed to resend OTP');
    }
  };

  // Component render
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fullscreen background video */}
      <video src={bgVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />

      {/* Animated colorful overlay (semi-transparent) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 opacity-60 mix-blend-multiply animate-pulse" />

      {/* Soft dark overlay to increase contrast */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gradient-to-b from-[#14002b]/80 via-[#1a0039]/70 to-transparent backdrop-blur-md border-b border-pink-500/20 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={handleBackToHome}
              className="flex items-center space-x-3 focus:outline-none group z-50 relative"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-fuchsia-500/30 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#1a0039]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-pink-400 tracking-tight group-hover:text-pink-300 transition-colors">Teknicity</span>
            </button>

            <button 
              onClick={handleBackToHome}
              className="text-pink-300 hover:text-white transition-colors duration-300 focus:outline-none flex items-center space-x-1 group z-50 relative px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Centered glass card */}
      <div className="relative z-30 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              TC
            </div>
          </div>

          <h2 className="text-center text-2xl font-semibold text-white mb-2">Welcome to TekniCity</h2>
          <p className="text-center text-sm text-white/80 mb-6">Secure access — enter your phone to receive an OTP</p>

          <div className="space-y-4">
            {!showOtp ? (
              <>
                <div>
                  <label className="block text-sm text-white/90 mb-2">Mobile number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    placeholder="e.g. 0718081350"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>

                {phoneError && <p className="text-sm text-red-300">{phoneError}</p>}

                <div className="flex gap-3">
                  <button onClick={sendOtpToPhone} className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-semibold shadow hover:scale-[1.02] transition">Send OTP</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-white/90 mb-2">Enter the 6-digit code</label>
                  <div ref={otpRef} className="flex gap-2 justify-center">
                    {otp.map((d, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        className="w-12 h-12 text-center text-lg rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/80">Time remaining: <span className="font-mono">{formatTime(timeLeft)}</span></p>
                  <button onClick={resendOtpInline} disabled={!canResend} className="text-sm text-white/80 disabled:opacity-40 hover:text-white transition-colors">Resend</button>
                </div>

                {phoneError && <p className="text-sm text-red-300">{phoneError}</p>}

                <div className="flex gap-3">
                  <button onClick={verifyOtpInline} disabled={isVerifying || otp.join('').length !== 6} className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100">Verify OTP</button>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-white/70">
            Enter the code sent to your phone to continue.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLogin;
