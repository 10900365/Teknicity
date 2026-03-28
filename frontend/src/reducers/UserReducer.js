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

const initialState = {
  user: null,
  loading: false,
  error: null,
  otpSent: false,
  phone: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_SIGNUP_REQUEST:
    case USER_OTP_VERIFY_REQUEST:
    case USER_OTP_RESEND_REQUEST:
    case USER_SENDOTP_REQUEST:
      return { ...state, loading: true, error: null };
    case USER_LOGIN_SUCCESS:
    case USER_OTP_VERIFY_SUCCESS:
      return { ...state, loading: false, user: action.payload, otpSent: false };
    case USER_SIGNUP_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        otpSent: true, 
        phone: action.payload.phone 
      };
    case USER_SENDOTP_SUCCESS:
      return { ...state, loading: false, otpSent: true, phone: action.payload?.phone || null };
    case USER_OTP_RESEND_SUCCESS:
      return { ...state, loading: false };
    case USER_LOGIN_FAIL:
    case USER_SIGNUP_FAIL:
    case USER_OTP_VERIFY_FAIL:
    case USER_OTP_RESEND_FAIL:
    case USER_SENDOTP_FAIL:
      return { ...state, loading: false, error: action.payload, otpSent: false };
    default:
      return state;
  }
};