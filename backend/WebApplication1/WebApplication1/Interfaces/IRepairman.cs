using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IRepairman
    {
        Response GetAllRepairman(RepairmanRequestAPI requestAPI);
        Response GetRepairmanbyID(RepairmanRequestAPI requestAPI);
        Response AddRepairman(RepairmanRequestAPI requestAPI);
        Response UpdateRepairman(RepairmanRequestAPI requestAPI);
        Response DeleteRepairman(RepairmanRequestAPI requestAPI);
    }
}