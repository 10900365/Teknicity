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
} from '../constants/RepairmanConstant';

const initialState = {
    responseBody: [],
    loading: false,
    msg: null,
};

export const GetAllRepairman = (state = initialState, action) => {
    switch (action.type) {
        case GETALL_REPAIRMAN_REQUEST:
            return { ...state, loading: true, msg: null };
        case GETALL_REPAIRMAN_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case GETALL_REPAIRMAN_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const GetRepairmanByID = (state = initialState, action) => {
    switch (action.type) {
        case GETBYID_REPAIRMAN_REQUEST:
            return { ...state, loading: true, msg: null };
        case GETBYID_REPAIRMAN_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case GETBYID_REPAIRMAN_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const AddRepairman = (state = initialState, action) => {
    switch (action.type) {
        case ADD_REPAIRMAN_REQUEST:
            return { ...state, loading: true, msg: null };
        case ADD_REPAIRMAN_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case ADD_REPAIRMAN_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const UpdateRepairman = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_REPAIRMAN_REQUEST:
            return { ...state, loading: true, msg: null };
        case UPDATE_REPAIRMAN_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case UPDATE_REPAIRMAN_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};

export const DeleteRepairman = (state = initialState, action) => {
    switch (action.type) {
        case DELETE_REPAIRMAN_REQUEST:
            return { ...state, loading: true, msg: null };
        case DELETE_REPAIRMAN_SUCCESS:
            return { ...state, responseBody: action.payload, loading: false, msg: null };
        case DELETE_REPAIRMAN_FAIL:
            return { ...state, loading: false, msg: action.payload };
        default:
            return state;
    }
};
