using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IRepairTicket
    {
        Response GetAllRepairTicket(RepairTicketRequestAPI requestAPI);
        Response GetRepairTicketbyID(RepairTicketRequestAPI requestAPI);
        Response AddRepairTicket(RepairTicketRequestAPI requestAPI);
        Response UpdateRepairTicket(RepairTicketRequestAPI requestAPI);
        Response DeleteRepairTicket(RepairTicketRequestAPI requestAPI);
    }
}