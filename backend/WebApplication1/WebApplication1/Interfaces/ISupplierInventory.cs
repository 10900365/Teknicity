using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface ISupplierInventory
    {
        Response GetAllSupplierInventory(SupplierInventoryRequestAPI requestAPI);
        Response GetSupplierInventorybyID(SupplierInventoryRequestAPI requestAPI);
        Response AddSupplierInventory(SupplierInventoryRequestAPI requestAPI);
        Response UpdateSupplierInventory(SupplierInventoryRequestAPI requestAPI);
        Response DeleteSupplierInventory(SupplierInventoryRequestAPI requestAPI);
    }
}