import {
    GETALL_ITEM_REQUEST,
    GETALL_ITEM_SUCCESS,
    GETALL_ITEM_FAIL,
    GETBYID_ITEM_REQUEST,
    GETBYID_ITEM_SUCCESS,   
    GETBYID_ITEM_FAIL,
    ADD_ITEM_REQUEST,
    ADD_ITEM_SUCCESS,
    ADD_ITEM_FAIL,
    UPDATE_ITEM_REQUEST,
    UPDATE_ITEM_SUCCESS,
    UPDATE_ITEM_FAIL,
    DELETE_ITEM_REQUEST,
    DELETE_ITEM_SUCCESS,
    DELETE_ITEM_FAIL

}
from '../constants/ItemConstant';
 
import ItemService from '../services/ItemService';
 
export const GetAllItem = () => async (dispatch) => {
    dispatch({
        type: GETALL_ITEM_REQUEST,
    });
 
    return await ItemService.GetAllItems().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETALL_ITEM_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETALL_ITEM_FAIL,
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
                type: GETALL_ITEM_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};

export const GetItemByID = () => async (dispatch) => {
    dispatch({
        type: GETBYID_ITEM_REQUEST,
    });
 
    return await ItemService.GetItemByID().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: GETBYID_ITEM_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: GETBYID_ITEM_FAIL,
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
                type: GETBYID_ITEM_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const AddItem = () => async (dispatch) => {
    dispatch({
        type: ADD_ITEM_REQUEST,
    });
 
    return await ItemService.AddItem().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: ADD_ITEM_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: ADD_ITEM_FAIL,
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
                type: ADD_ITEM_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const UpdateItem = () => async (dispatch) => {
    dispatch({
        type: UPDATE_ITEM_REQUEST,
    });
 
    return await ItemService.UpdateCustomers().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: UPDATE_ITEM_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: UPDATE_ITEM_FAIL,
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
                type: UPDATE_ITEM_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
 
export const DeleteItem = () => async (dispatch) => {
    dispatch({
        type: DELETE_ITEM_REQUEST,
    });
 
    return await ItemService.DeleteItem().then(
        (data) => {
            if (data.data.Status === 'Error') {
                dispatch({
                    type: DELETE_ITEM_SUCCESS,
                    payload: {
                        responseBody: data.data.ResultSet
                    },
                });
            } else {
                dispatch({
                    type: DELETE_ITEM_FAIL,
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
                type: DELETE_ITEM_FAIL,
                payload: {
                    msg: message,
                },
            });
            return Promise.reject();    
        }    
    );
};
   
 