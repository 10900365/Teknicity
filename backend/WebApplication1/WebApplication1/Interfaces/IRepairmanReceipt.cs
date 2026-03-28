using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IRepairmanReceipt
    {
        Response GetAllRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI);
        Response GetRepairmanReceiptbyID(RepairmanReceiptRequestAPI requestAPI);
        Response AddRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI);
        Response UpdateRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI);
        Response DeleteRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI);
    }
}