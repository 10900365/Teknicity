import api from './api';

const login = async (email, password) => api.post('/User/Login', { email, password });

const signup = async (name, email, phone, password, role) => api.post('/User/Signup', { name, email, phone, password, role });

const verifyOtp = async (phone, otp_code) => api.post('/User/VerifyOtp', { phone, otp_code });

const resendOtp = async (phone) => api.post('/User/ResendOtp', { phone });

// Send OTP using legacy Login controller endpoint (returns Result and optionally ResultSet with demo otp)
const sendOtp = async (mobileNo) => api.get('/Login/SendOtp', { params: { MobileNo: mobileNo } });

// TestGetUserRole - returns the role for a given mobile number
// Add simple in-memory caching and request deduplication to avoid repeated
// backend calls when multiple components request the same mobile in quick succession.
const _roleCache = {}; // { [mobile]: { expires: timestamp, value: response } }
const _rolePromises = {}; // ongoing requests to dedupe concurrent calls
const testGetUserRole = async (mobileNo) => {
	const key = String(mobileNo || '').replace(/\D/g, '');
	const now = Date.now();
	// short TTL: 60 seconds
	const TTL = 60 * 1000;

	if (!key) return Promise.resolve(null);

	// return cached response if still valid
	const cached = _roleCache[key];
	if (cached && cached.expires > now) {
		return Promise.resolve(cached.value);
	}

	// if a request is already in-flight for this key, return its promise
	if (_rolePromises[key]) return _rolePromises[key];

	// otherwise start a request and cache the promise
	const p = api.get('/Login/TestGetUserRole', { params: { mobileNo: key } })
		.then((res) => {
			try {
				_roleCache[key] = { expires: Date.now() + TTL, value: res };
			} catch (e) {
				// ignore cache set failures
			}
			delete _rolePromises[key];
			return res;
		})
		.catch((err) => {
			delete _rolePromises[key];
			throw err;
		});

	_rolePromises[key] = p;
	return p;
};

// Add new user (Admin creation uses Login/AddUser endpoint as provided)
const addUser = async (userPayload) => api.post('/Login/AddUser', userPayload);

// Some legacy MVC controllers expect form-encoded data. Provide a form-encoded variant.
const addUserForm = async (userPayload) => {
	const params = new URLSearchParams();
	Object.keys(userPayload || {}).forEach(k => {
		const v = userPayload[k];
		if (v !== undefined && v !== null) params.append(k, String(v));
	});
	return api.request({
		method: 'post',
		url: '/Login/AddUser',
		data: params.toString(),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});
};

const UserService = { login, signup, verifyOtp, resendOtp, sendOtp, testGetUserRole, addUser, addUserForm };

export default UserService;