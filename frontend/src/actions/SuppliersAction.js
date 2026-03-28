import {
    GETALL_SUPPLIER_REQUEST,
    GETALL_SUPPLIER_SUCCESS,
    GETALL_SUPPLIER_FAIL,
    GETBYID_SUPPLIER_REQUEST,
    GETBYID_SUPPLIER_SUCCESS,
    GETBYID_SUPPLIER_FAIL,
    ADD_SUPPLIER_REQUEST,
    ADD_SUPPLIER_SUCCESS,
    ADD_SUPPLIER_FAIL,
    UPDATE_SUPPLIER_REQUEST,
    UPDATE_SUPPLIER_SUCCESS,
    UPDATE_SUPPLIER_FAIL,   
    DELETE_SUPPLIER_REQUEST,
    DELETE_SUPPLIER_SUCCESS,
    DELETE_SUPPLIER_FAIL
}
from '../constants/SuppliersConstant';
 
import SuppliersService from '../services/SuppliersService';
 
export const GetAllSupplier = () => async (dispatch) => {
    dispatch({
        type: GETALL_SUPPLIER_REQUEST,
    });
 
    return await SuppliersService.GetAllSupplier().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETALL_SUPPLIER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETALL_SUPPLIER_FAIL,
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
                type: GETALL_SUPPLIER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};

export const GetSupplierbyId = () => async (dispatch) => {
    dispatch({
        type: GETBYID_SUPPLIER_REQUEST,
    });
 
    return await SuppliersService.GetSupplierbyId().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETBYID_SUPPLIER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETBYID_SUPPLIER_FAIL,
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
                type: GETBYID_SUPPLIER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const AddSupplier = () => async (dispatch) => {
    dispatch({
        type: ADD_SUPPLIER_REQUEST,
    });
 
    return await SuppliersService.AddSupplier().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: ADD_SUPPLIER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: ADD_SUPPLIER_FAIL,
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
                type: ADD_SUPPLIER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const UpdateSupplier = () => async (dispatch) => {
    dispatch({
        type: UPDATE_SUPPLIER_REQUEST,
    });
 
    return await SuppliersService.UpdateSupplier().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: UPDATE_SUPPLIER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: UPDATE_SUPPLIER_FAIL,
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
                type: UPDATE_SUPPLIER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const DeleteSupplier = () => async (dispatch) => {
    dispatch({
        type: DELETE_SUPPLIER_REQUEST,
    });
 
    return await SuppliersService.DeleteSupplier().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: DELETE_SUPPLIER_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: DELETE_SUPPLIER_FAIL,
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
                type: DELETE_SUPPLIER_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
   
 