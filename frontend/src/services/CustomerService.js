import api from './api';
 
const GetAllCustomers = async () => {
    let config = {
        method: 'get',
        url: '/Customer/GetAllCustomers',
    };
   
    return api.request(config);
};

const GetCustomerByID = async () => {
    let config = {
        method: 'get',
        url: '/Customer/GetCustomerByID',
    };
   
    return api.request(config);
};
 
const AddCustomers = async () => {
    let config = {
        method: 'post',
        url: '/Customer/AddCustomers',
    };
   
    return api.request(config);
};
 
const UpdateCustomers = async () => {
    let config = {
        method: 'put',
        url: '/Customer/UpdateCustomers',
    };
   
    return api.request(config);
};
 
const DeleteCustomers = async () => {
    let config = {
        method: 'delete',
        url: '/Customer/DeleteCustomers',
    };
   
    return api.request(config);
};
const CustomerService = {
    GetAllCustomers,
    GetCustomerByID,
    AddCustomers,
    UpdateCustomers,
    DeleteCustomers
};

export default CustomerService;
 
 