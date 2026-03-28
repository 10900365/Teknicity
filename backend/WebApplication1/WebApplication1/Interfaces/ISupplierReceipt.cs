using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface ISupplierReceipt
    {
        Response GetAllSupplierReceipt(SupplierReceiptRequestAPI requestAPI);
        Response GetSupplierReceiptbyID(SupplierReceiptRequestAPI requestAPI);
        Response AddSupplierReceipt(SupplierReceiptRequestAPI requestAPI);
        Response UpdateSupplierReceipt(SupplierReceiptRequestAPI requestAPI);
        Response DeleteSupplierReceipt(SupplierReceiptRequestAPI requestAPI);
    }
}