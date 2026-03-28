import {
    GETALL_CUSTOMER_REQUEST,
    GETALL_CUSTOMER_SUCCESS,
    GETALL_CUSTOMER_FAIL,
    GETBYID_CUSTOMER_REQUEST,
    GETBYID_CUSTOMER_SUCCESS,
    GETBYID_CUSTOMER_FAIL,  
    ADD_CUSTOMER_REQUEST,
    ADD_CUSTOMER_SUCCESS,
    ADD_CUSTOMER_FAIL,   
    UPDATE_CUSTOMER_REQUEST,
    UPDATE_CUSTOMER_SUCCESS,
    UPDATE_CUSTOMER_FAIL,
    DELETE_CUSTOMER_REQUEST,
    DELETE_CUSTOMER_SUCCESS,
    DELETE_CUSTOMER_FAIL
 
} from '../constants/CustomerConstant';
 
const initialState = {
    responseBody: [],
    loading: false,
    msg: null,
};
 
export const GetAllCustomers = (state = initialState, action) => {
    switch (action.type) {
        case GETALL_CUSTOMER_REQUEST:
            return {
                ...state,
                loading: true,
                msg: null,
            };
        case GETALL_CUSTOMER_SUCCESS:
            return {
                ...state,
                responseBody: action.payload,
                loading: false,
                msg: null,
            };
        case GETALL_CUSTOMER_FAIL:
            return {
                ...state,
                loading: false,
                msg: action.payload,
            };
        default:
            return state;
    }
}

export const GetCustomerByID = (state = initialState, action) => {
    switch (action.type) {
        case GETBYID_CUSTOMER_REQUEST:
            return {
                ...state,
                loading: true,
                msg: null,
            };
        case GETBYID_CUSTOMER_SUCCESS:  
            return {
                ...state,
                responseBody: action.payload,
                loading: false,
                msg: null,
            };  
        case GETBYID_CUSTOMER_FAIL:
            return {
                ...state,
                loading: false,
                msg: action.payload,
            };
        default:
            return state;
    }   
}
 
export const AddCustomers = (state = initialState, action) => {
    switch (action.type) {
        case ADD_CUSTOMER_REQUEST:
            return {
                ...state,
                loading: true,
                msg: null,
            };
        case ADD_CUSTOMER_SUCCESS:
            return {
                ...state,
                responseBody: action.payload,
                loading: false,
                msg: null,
            };
        case ADD_CUSTOMER_FAIL:
            return {
                ...state,
                loading: false,
                msg: action.payload,
            };
        default:
            return state;
    }
}
 
export const UpdateCustomers = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_CUSTOMER_REQUEST:
            return {
                ...state,
                loading: true,
                msg: null,
            };
        case UPDATE_CUSTOMER_SUCCESS:
            return {
                ...state,
                responseBody: action.payload,
                loading: false,
                msg: null,
            };
        case UPDATE_CUSTOMER_FAIL:
            return {
                ...state,
                loading: false,
                msg: action.payload,
            };
        default:
            return state;
    }
}
 
export const DeleteCustomers = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_CUSTOMER_REQUEST:
            return {
                ...state,
                loading: true,
                msg: null,
            };
        case DELETE_CUSTOMER_SUCCESS:
            return {
                ...state,
                responseBody: action.payload,
                loading: false,
                msg: null,
            };
        case DELETE_CUSTOMER_FAIL:
            return {
                ...state,
                loading: false,
                msg: action.payload,
            };
        default:
            return state;
    }
}
 