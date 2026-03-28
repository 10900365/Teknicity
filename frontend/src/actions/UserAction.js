import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_SIGNUP_REQUEST,
  USER_SIGNUP_SUCCESS,
  USER_SIGNUP_FAIL,
  USER_OTP_VERIFY_REQUEST,
  USER_OTP_VERIFY_SUCCESS,
  USER_OTP_VERIFY_FAIL,
  USER_OTP_RESEND_REQUEST,
  USER_OTP_RESEND_SUCCESS,
  USER_OTP_RESEND_FAIL,
  USER_SENDOTP_REQUEST,
  USER_SENDOTP_SUCCESS,
  USER_SENDOTP_FAIL,
} from "../constants/UserConstant";
import UserService from "../services/UserService";

export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: USER_LOGIN_REQUEST });
  try {
    const res = await UserService.login(email, password);
    
    if (res.data.StatusCode === 200) {
      const userData = res.data.ResultSet[0];
      dispatch({ type: USER_LOGIN_SUCCESS, payload: userData });
      localStorage.setItem("user", JSON.stringify(userData));
      return { success: true, user: userData };
    } else {
      dispatch({ type: USER_LOGIN_FAIL, payload: res.data.Result });
      return { success: false, error: res.data.Result };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.Result || err.response?.data?.ExceptionMessage || "Login failed";
    dispatch({
      type: USER_LOGIN_FAIL,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const signupUser = (userData) => async (dispatch) => {
  dispatch({ type: USER_SIGNUP_REQUEST });
  try {
    const res = await UserService.signup(
      userData.name,
      userData.email,
      userData.phone,
      userData.password,
      userData.role
    );
    
    if (res.data.StatusCode === 200) {
      dispatch({ 
        type: USER_SIGNUP_SUCCESS, 
        payload: {
          phone: res.data.Result,
          otp: res.data.ResultSet && res.data.ResultSet[0] ? res.data.ResultSet[0].otp : null
        }
      });
      
      // Store unverified user data for OTP verification
      const unverifiedUser = {
        ...userData,
        phone: res.data.Result
      };
      localStorage.setItem('unverifiedUser', JSON.stringify(unverifiedUser));
      
      // Server handled OTP delivery; do not store demo OTP locally in production
      
      return { 
        success: true, 
        requiresOtp: true,
        phone: res.data.Result 
      };
    } else {
      dispatch({ type: USER_SIGNUP_FAIL, payload: res.data.Result });
      return { success: false, error: res.data.Result };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.Result || err.response?.data?.ExceptionMessage || "Signup failed";
    dispatch({
      type: USER_SIGNUP_FAIL,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const verifyOtp = (phone, otp) => async (dispatch) => {
  dispatch({ type: USER_OTP_VERIFY_REQUEST });
  try {
    const res = await UserService.verifyOtp(phone, otp);
    
    if (res.data.StatusCode === 200) {
      const userData = res.data.ResultSet[0];
      dispatch({ type: USER_OTP_VERIFY_SUCCESS, payload: userData });
  localStorage.setItem("user", JSON.stringify(userData));
  localStorage.removeItem('unverifiedUser');
      return { success: true, user: userData };
    } else {
      dispatch({ type: USER_OTP_VERIFY_FAIL, payload: res.data.Result });
      return { success: false, error: res.data.Result };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.Result || err.response?.data?.ExceptionMessage || "OTP verification failed";
    dispatch({
      type: USER_OTP_VERIFY_FAIL,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

export const resendOtp = (phone) => async (dispatch) => {
  dispatch({ type: USER_OTP_RESEND_REQUEST });
  try {
    const res = await UserService.resendOtp(phone);
    
    if (res.data.StatusCode === 200) {
      dispatch({ type: USER_OTP_RESEND_SUCCESS });
      // Prefer OTP returned in res.data.Result, then ResultSet[0].otp; otherwise generate one for demo
      if (res.data.Result && /^[0-9]{4,8}$/.test(res.data.Result.toString())) {
        const newOtp = res.data.Result.toString();
        console.log('Resent Demo OTP (from server Result):', newOtp);
        localStorage.setItem('demoOtp', newOtp);
      } else if (res.data.ResultSet && res.data.ResultSet[0] && res.data.ResultSet[0].otp) {
        const newOtp = res.data.ResultSet[0].otp.toString();
        console.log('Resent Demo OTP (from server ResultSet):', newOtp);
        localStorage.setItem('demoOtp', newOtp);
      } else {
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Resent Demo OTP (generated):', newOtp);
        localStorage.setItem('demoOtp', newOtp);
      }

      return { success: true };
    } else {
      dispatch({ type: USER_OTP_RESEND_FAIL, payload: res.data.Result });
      return { success: false, error: res.data.Result };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.Result || err.response?.data?.ExceptionMessage || "Failed to resend OTP";
    dispatch({
      type: USER_OTP_RESEND_FAIL,
      payload: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

// Send OTP for login (calls backend Login/SendOtp?MobileNo=...)
export const sendOtp = (mobile) => async (dispatch) => {
  dispatch({ type: USER_SENDOTP_REQUEST });
  try {
    const res = await UserService.sendOtp(mobile);

    if (res.data.StatusCode === 200) {
      // Store unverified user phone for later verification step
      const unverifiedUser = { phone: mobile };
      localStorage.setItem('unverifiedUser', JSON.stringify(unverifiedUser));

      // Prefer OTP returned in res.data.Result, then ResultSet[0].otp; otherwise generate one for demo/testing
      if (res.data.Result && /^[0-9]{4,8}$/.test(res.data.Result.toString())) {
        const demoOtp = res.data.Result.toString();
        console.log('Demo OTP (from server Result):', demoOtp);
        localStorage.setItem('demoOtp', demoOtp);
      } else if (res.data.ResultSet && res.data.ResultSet[0] && res.data.ResultSet[0].otp) {
        const demoOtp = res.data.ResultSet[0].otp.toString();
        console.log('Demo OTP (from server ResultSet):', demoOtp);
        localStorage.setItem('demoOtp', demoOtp);
      } else {
        const demoOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Demo OTP (generated client-side):', demoOtp);
        localStorage.setItem('demoOtp', demoOtp);
      }

      dispatch({ type: USER_SENDOTP_SUCCESS, payload: { phone: res.data.Result } });
      return { success: true, phone: res.data.Result };
    } else {
      dispatch({ type: USER_SENDOTP_FAIL, payload: res.data.Result });
      return { success: false, error: res.data.Result };
    }
  } catch (err) {
    const errorMessage = err.response?.data?.Result || err.response?.data?.ExceptionMessage || "Failed to send OTP";
    dispatch({ type: USER_SENDOTP_FAIL, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};