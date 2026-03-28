import {
    GETALL_REPAIRMAN_REQUEST,
    GETALL_REPAIRMAN_SUCCESS,
    GETALL_REPAIRMAN_FAIL,
    GETBYID_REPAIRMAN_REQUEST,
    GETBYID_REPAIRMAN_SUCCESS,
    GETBYID_REPAIRMAN_FAIL,
    ADD_REPAIRMAN_REQUEST,
    ADD_REPAIRMAN_SUCCESS,
    ADD_REPAIRMAN_FAIL,
    UPDATE_REPAIRMAN_REQUEST,
    UPDATE_REPAIRMAN_SUCCESS,
    UPDATE_REPAIRMAN_FAIL,
    DELETE_REPAIRMAN_REQUEST,
    DELETE_REPAIRMAN_SUCCESS,
    DELETE_REPAIRMAN_FAIL
}
from '../constants/RepairmanConstant';
 
import RepairmanService from '../services/RepairmanService';
 
export const GetAllRepairman = () => async (dispatch) => {
    dispatch({
        type: GETALL_REPAIRMAN_REQUEST,
    });
 
    return await RepairmanService.GetAllRepairman().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETALL_REPAIRMAN_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETALL_REPAIRMAN_FAIL,
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
                type: GETALL_REPAIRMAN_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};

export const GetRepairmanByID = () => async (dispatch) => {
    dispatch({
        type: GETBYID_REPAIRMAN_REQUEST,
    });
 
    return await RepairmanService.GetRepairmanByID().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETBYID_REPAIRMAN_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETBYID_REPAIRMAN_FAIL,
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
                type: GETBYID_REPAIRMAN_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const AddRepairman = () => async (dispatch) => {
    dispatch({
        type: ADD_REPAIRMAN_REQUEST,
    });
 
    return await RepairmanService.AddRepairman().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: ADD_REPAIRMAN_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: ADD_REPAIRMAN_FAIL,
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
                type: ADD_REPAIRMAN_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const UpdateRepairman = () => async (dispatch) => {
    dispatch({
        type: UPDATE_REPAIRMAN_REQUEST,
    });
 
    return await RepairmanService.UpdateRepairman().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: UPDATE_REPAIRMAN_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: UPDATE_REPAIRMAN_FAIL,
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
                type: UPDATE_REPAIRMAN_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const DeleteRepairman = () => async (dispatch) => {
    dispatch({
        type: DELETE_REPAIRMAN_REQUEST,
    });
 
    return await RepairmanService.DeleteRepairman().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: DELETE_REPAIRMAN_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: DELETE_REPAIRMAN_FAIL,
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
                type: DELETE_REPAIRMAN_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
   
 