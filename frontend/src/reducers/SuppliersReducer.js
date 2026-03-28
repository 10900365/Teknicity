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
} from '../constants/SuppliersConstant';

const initialState = {
    responseBody: [],
    loading: false,
    msg: null,
};

export const GetAllSupplier = (state = initialState, action) => {
    switch (action.type) {
        case GETALL_SUPPLIER_REQUEST:
            return { ...state, loading: true, msg: null };
        case GETALL_SUPPLIER_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case GETALL_SUPPLIER_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const GetSupplierbyId = (state = initialState, action) => {
    switch (action.type) {
        case GETBYID_SUPPLIER_REQUEST:
            return { ...state, loading: true, msg: null };
        case GETBYID_SUPPLIER_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case GETBYID_SUPPLIER_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const AddSupplier = (state = initialState, action) => {
    switch (action.type) {
        case ADD_SUPPLIER_REQUEST:
            return { ...state, loading: true, msg: null };
        case ADD_SUPPLIER_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case ADD_SUPPLIER_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const UpdateSupplier = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_SUPPLIER_REQUEST:
            return { ...state, loading: true, msg: null };
        case UPDATE_SUPPLIER_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case UPDATE_SUPPLIER_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const DeleteSupplier = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_SUPPLIER_REQUEST:
            return { ...state, loading: true, msg: null };
        case DELETE_SUPPLIER_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case DELETE_SUPPLIER_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};
