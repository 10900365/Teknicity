using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface ISupplier
    {
        Response GetAllSupplier(SupplierRequestAPI requestAPI);
        Response GetSupplierbyID(SupplierRequestAPI requestAPI);
        Response AddSupplier(SupplierRequestAPI requestAPI);
        Response UpdateSupplier(SupplierRequestAPI requestAPI);
        Response DeleteSupplier(SupplierRequestAPI requestAPI);
    }
}