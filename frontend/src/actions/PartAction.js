import {
    GETALL_PARTS_REQUEST,
    GETALL_PARTS_SUCCESS,
    GETALL_PARTS_FAIL,  
    GETBYID_PARTS_REQUEST,
    GETBYID_PARTS_SUCCESS,
    GETBYID_PARTS_FAIL,
    ADD_PARTS_REQUEST,
    ADD_PARTS_SUCCESS,
    ADD_PARTS_FAIL,
    UPDATE_PARTS_REQUEST,
    UPDATE_PARTS_SUCCESS,
    UPDATE_PARTS_FAIL,
    DELETE_PARTS_REQUEST,
    DELETE_PARTS_SUCCESS,
    DELETE_PARTS_FAIL
}
from '../constants/PartsConstant';
 
import PartsService from '../services/PartsService';
 
export const GetAllParts = () => async (dispatch) => {
    dispatch({
        type: GETALL_PARTS_REQUEST,
    });
 
    return await PartsService.GetAllParts().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETALL_PARTS_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETALL_PARTS_FAIL,
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
                type: GETALL_PARTS_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};

export const GetPartByID = () => async (dispatch) => {
    dispatch({
        type: GETALL_PARTS_REQUEST,
    });
 
    return await PartsService.GetPartByID().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETBYID_PARTS_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETBYID_PARTS_FAIL,
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
                type: GETBYID_PARTS_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const AddPart = () => async (dispatch) => {
    dispatch({
        type: ADD_PARTS_REQUEST,
    });
 
    return await PartsService.AddPart().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: ADD_PARTS_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: ADD_PARTS_FAIL,
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
                type: ADD_PARTS_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const UpdatePart = () => async (dispatch) => {
    dispatch({
        type: UPDATE_PARTS_REQUEST,
    });
 
    return await PartsService.UpdatePart().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: UPDATE_PARTS_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: UPDATE_PARTS_FAIL,
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
                type: UPDATE_PARTS_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const DeletePart = () => async (dispatch) => {
    dispatch({
        type: DELETE_PARTS_REQUEST,
    });
 
    return await PartsService.DeletePart().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: DELETE_PARTS_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: DELETE_PARTS_FAIL,
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
                type: DELETE_PARTS_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
   
 