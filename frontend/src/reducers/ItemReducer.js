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
} from '../constants/ItemConstant';

const initialState = {
    responseBody: [],
    loading: false,
    msg: null,
};

export const GetAllItems = (state = initialState, action) => {
    switch (action.type) {
        case GETALL_ITEM_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case GETALL_ITEM_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false,
                msg: null 
            };
        case GETALL_ITEM_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const GetItemByID = (state = initialState, action) => {
    switch (action.type) {
        case GETBYID_ITEM_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case GETBYID_ITEM_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case GETBYID_ITEM_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const AddItem = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ITEM_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case ADD_ITEM_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case ADD_ITEM_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const UpdateItem = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_ITEM_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case UPDATE_ITEM_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case UPDATE_ITEM_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const DeleteItem = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_ITEM_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case DELETE_ITEM_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case DELETE_ITEM_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};
