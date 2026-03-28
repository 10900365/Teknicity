import api from './api';
 
const GetAllSupplier = async () => {
    let config = {
        method: 'get',
        url: '/Supplier/GetAllSupplier',
    };
   
    return api.request(config);
};

 
const GetSupplierbyId = async () => {
    let config = {
        method: 'get',
        url: '/Supplier/GetSupplierbyId',
    };
   
    return api.request(config);
};

const AddSupplier = async () => {
    let config = {
        method: 'post',
        url: '/Supplier/AddSupplier',
    };
   
    return api.request(config);
};

const UpdateSupplier = async () => {
    let config = {
        method: 'put',
        url: '/Supplier/UpdateSupplier',
    };
   
    return api.request(config);
};

const DeleteSupplier = async () => {
    let config = {
        method: 'delete',
        url: '/Supplier/DeleteSupplier',
    };
   
    return api.request(config);
};
 
const SuppliersService = {
    GetAllSupplier,
    GetSupplierbyId,
    AddSupplier,
    UpdateSupplier,
    DeleteSupplier
};

export default SuppliersService;