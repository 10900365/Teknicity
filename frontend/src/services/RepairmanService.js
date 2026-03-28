import api from './api';
 
const GetAllRepairman = async () => {
    let config = {
        method: 'get',
        url: '/Repairman/GetAllRepairman',
    };
   
    return api.request(config);
};

const GetRepairmanByID = async () => {
    let config = {
        method: 'get',
        url: '/Repairman/GetRepairmanByID',
    };
   
    return api.request(config);
};

const AddRepairman = async (repairmanData) => {
    let config = {
        method: 'post',
        url: '/Repairman/AddRepairman',
        data: repairmanData
    };
   
    return api.request(config);
};

const UpdateRepairman = async () => {
    let config = {
        method: 'put',
        url: '/Repairman/UpdateRepairman',
    };
   
    return api.request(config);
};

const DeleteRepairman = async () => {
    let config = {
        method: 'delete',
        url: '/Repairman/DeleteRepairman',
    };
   
    return api.request(config);
};
const RepairmanService = {
    GetAllRepairman,
    GetRepairmanByID,
    AddRepairman,
    UpdateRepairman,
    DeleteRepairman
};

export default RepairmanService;