using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IPartRequest
    {
        Response GetAllPartRequest(PartRequestRequestAPI requestAPI);
        Response GetPartRequestbyID(PartRequestRequestAPI requestAPI);
        Response AddPartRequest(PartRequestRequestAPI requestAPI);
        Response UpdatePartRequest(PartRequestRequestAPI requestAPI);
        Response DeletePartRequest(PartRequestRequestAPI requestAPI);
    }
}