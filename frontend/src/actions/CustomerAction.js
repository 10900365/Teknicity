import {
    GETALL_CUSTOMER_REQUEST,
    GETALL_CUSTOMER_SUCCESS,
    GETALL_CUSTOMER_FAIL,
    GETBYID_CUSTOMER_REQUEST,
    GETBYID_CUSTOMER_SUCCESS,
    GETBYID_CUSTOMER_FAIL,
    ADD_CUSTOMER_REQUEST,
    ADD_CUSTOMER_SUCCESS,
    ADD_DEPARTMENT_FAIL,
    UPDATE_CUSTOMER_REQUEST,
    UPDATE_CUSTOMER_SUCCESS,
    UPDATE_CUSTOMER_FAIL,
    DELETE_CUSTOMER_REQUEST,
    DELETE_CUSTOMER_SUCCESS,
    DELETE_CUSTOMER_FAIL,
    ADD_CUSTOMER_FAIL
}
from '../constants/CustomerConstant';
 
import CustomerService from '../services/CustomerService';
 
export const GetAllCustomers = () => async (dispatch) => {
    dispatch({
        type: GETALL_CUSTOMER_REQUEST,
    });
 
    return await CustomerService.GetAllCustomers().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETALL_CUSTOMER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETALL_CUSTOMER_FAIL,
                    payload: {
                        msg: "Soory, something went wrong. Please try again later.",
                    },
                });
            }
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: GETALL_CUSTOMER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};

export const GetCustomerByID = () => async (dispatch) => {
    dispatch({
        type: GETBYID_CUSTOMER_REQUEST,
    });
 
    return await CustomerService.GetCustomerByID().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETBYID_CUSTOMER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETBYID_CUSTOMER_FAIL,
                    payload: {
                        msg: "Soory, something went wrong. Please try again later.",
                    },
                });
            }
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: GETBYID_CUSTOMER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const AddCustomers = () => async (dispatch) => {
    dispatch({
        type: ADD_CUSTOMER_REQUEST,
    });
 
    return await CustomerService.AddCustomers().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: ADD_CUSTOMER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: ADD_CUSTOMER_FAIL,
                    payload: {
                        msg: "Soory, something went wrong. Please try again later.",
                    },
                });
            }
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: ADD_CUSTOMER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const UpdateCustomers = () => async (dispatch) => {
    dispatch({
        type: UPDATE_CUSTOMER_REQUEST,
    });
 
    return await CustomerService.UpdateCustomers().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: UPDATE_CUSTOMER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: UPDATE_CUSTOMER_FAIL,
                    payload: {
                        msg: "Soory, something went wrong. Please try again later.",
                    },
                });
            }
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: UPDATE_CUSTOMER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const DeleteCustomers = () => async (dispatch) => {
    dispatch({
        type: DELETE_CUSTOMER_REQUEST,
    });
 
    return await CustomerService.DeleteCustomers().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: DELETE_CUSTOMER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: DELETE_CUSTOMER_FAIL,
                    payload: {
                        msg: "Soory, something went wrong. Please try again later.",
                    },
                });
            }
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: DELETE_CUSTOMER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
   
 