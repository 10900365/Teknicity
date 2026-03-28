import {
    GETALL_PART_REQUEST,
    GETALL_PART_SUCCESS,
    GETALL_PART_FAIL,
    GETBYID_PART_REQUEST,
    GETBYID_PART_SUCCESS,
    GETBYID_PART_FAIL,
    ADD_PART_REQUEST,
    ADD_PART_SUCCESS,
    ADD_PART_FAIL,
    UPDATE_PART_REQUEST,
    UPDATE_PART_SUCCESS,
    UPDATE_PART_FAIL,
    DELETE_PART_REQUEST,
    DELETE_PART_SUCCESS,
    DELETE_PART_FAIL
} from '../constants/PartConstant';

const initialState = {
    responseBody: [],
    loading: false,
    msg: null,
};

export const GetAllParts = (state = initialState, action) => {
    switch (action.type) {
        case GETALL_PART_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case GETALL_PART_SUCCESS:
            return {
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case GETALL_PART_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const GetPartByID = (state = initialState, action) => {
    switch (action.type) {
        case GETBYID_PART_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case GETBYID_PART_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case GETBYID_PART_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const AddPart = (state = initialState, action) => {
    switch (action.type) {
        case ADD_PART_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case ADD_PART_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case ADD_PART_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const UpdatePart = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_PART_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case UPDATE_PART_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case UPDATE_PART_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};

export const DeletePart = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_PART_REQUEST:
            return { 
                ...state, 
                loading: true, 
                msg: null 
            };
        case DELETE_PART_SUCCESS:
            return { 
                ...state, 
                responseBody: action.payload, 
                loading: false, 
                msg: null 
            };
        case DELETE_PART_FAIL:
            return { 
                ...state, 
                loading: false, 
                msg: action.payload 
            };
        default:
            return state;
    }
};
