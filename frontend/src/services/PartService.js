import api from './api';
 
const GetAllParts = async () => {
    let config = {
        method: 'get',
        url: '/Part/GetAllParts',
    };
   
    return api.request(config);
};

const GetPartByID = async () => {
    let config = {
        method: 'get',
        url: '/Part/GetPartByID',
    };
   
    return api.request(config);
};

const AddPart = async () => {
    let config = {
        method: 'post',
        url: '/Part/AddPart',
    };
   
    return api.request(config);
};

const UpdatePart = async () => {
    let config = {
        method: 'put',
        url: '/Part/UpdatePart',
    };
   
    return api.request(config);
};

const DeletePart = async () => {
    let config = {
        method: 'delete',
        url: '/Part/DeletePart',
    };
   
    return api.request(config);
};
const PartService = {
    GetAllParts,
    GetPartByID,
    AddPart,
    UpdatePart,
    DeletePart
};

export default PartService;