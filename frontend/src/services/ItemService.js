import api from './api';
 
const GetAllItems = async () => {
    let config = {
        method: 'get',
        url: '/Item/GetAllItems',
    };
   
    return api.request(config);
};

const GetItemByID = async () => {
    let config = {
        method: 'get',
        url: '/Item/GetItemByID',
    };
   
    return api.request(config);
};

const AddItem = async () => {
    let config = {
        method: 'post',
        url: '/Item/AddItem',
    };
   
    return api.request(config);
};

const UpdateItem = async () => {
    let config = {
        method: 'put',
        url: '/Item/UpdateItem',
    };
   
    return api.request(config);
};

const DeleteItem = async () => {
    let config = {
        method: 'delete',
        url: '/Item/DeleteItem',
    };
   
    return api.request(config);
};
const ItemService = {
    GetAllItems,
    GetItemByID,
    AddItem,
    UpdateItem,
    DeleteItem
};

export default ItemService;