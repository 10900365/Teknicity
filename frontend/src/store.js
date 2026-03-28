import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk"; 
import { userReducer } from "./reducers/UserReducer";

import {
    GetAllCustomers,
    GetCustomerByID,
    AddCustomers,
    UpdateCustomers,
    DeleteCustomers,
} from "./reducers/CustomerReducer";
import {
    GetAllItems,
    GetItemByID,
    AddItem,
    UpdateItem,
    DeleteItem,
} from "./reducers/ItemReducer";
import {
    GetAllParts,
    GetPartByID,
    AddPart,
    UpdatePart,
    DeletePart,  
} from "./reducers/PartReducer";
import {
    GetAllRepairman,
    GetRepairmanByID,
    AddRepairman,
    UpdateRepairman,
    DeleteRepairman,
} from "./reducers/RepairmanReducer";
import {
    GetAllSupplier,
    GetSupplierbyId,
    AddSupplier,
    UpdateSupplier,
    DeleteSupplier,
} from "./reducers/SuppliersReducer";

const rootReducer = combineReducers({
    GetAllCustomers: GetAllCustomers,
    GetCustomerByID: GetCustomerByID,
    AddCustomerDetails: AddCustomers,
    PutCustomerDetails: UpdateCustomers,
    DeleteCustomerDetails: DeleteCustomers,
    GetAllItems: GetAllItems,
    GetItemByID: GetItemByID,
    AddItemDetails: AddItem,
    PutItemDetails: UpdateItem,
    DeleteItemDetails: DeleteItem,
    GetAllPart: GetAllParts,
    GetPartByID: GetPartByID,    
    AddPart: AddPart,
    PutPartDetails: UpdatePart,
    DeletePartDetails: DeletePart, 
    GetAllRepairman: GetAllRepairman,
    GetRepairmanByID: GetRepairmanByID,
    AddRepairmanDetails: AddRepairman,    
    PutRepairmanDetails: UpdateRepairman,
    DeleteRepairmanDetails: DeleteRepairman,
    GetAllSuppliers: GetAllSupplier,
    GetSupplierByID: GetSupplierbyId,
    AddSupplierDetails: AddSupplier,
    PutSupplierDetails: UpdateSupplier,
    DeleteSupplierDetails: DeleteSupplier,
    user: userReducer, // Only include userReducer, not individual constants
});

const store = createStore(rootReducer, applyMiddleware(thunk));
export default store;