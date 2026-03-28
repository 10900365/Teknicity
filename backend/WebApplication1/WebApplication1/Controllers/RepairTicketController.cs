using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models.RequestApiModels;
using HttpGetAttribute = System.Web.Http.HttpGetAttribute;
using HttpPostAttribute = System.Web.Http.HttpPostAttribute;
using HttpPutAttribute = System.Web.Http.HttpPutAttribute;
using HttpDeleteAttribute = System.Web.Http.HttpDeleteAttribute;

namespace WebApplication1.Controllers
{
    public class RepairTicketController : Controller
    {
        private readonly IRepairTicket _repairTicket;
        public RepairTicketController(IRepairTicket repairTicket)
        {
            _repairTicket = repairTicket;
        }

        [HttpGet]
        public ActionResult GetAllRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            var response = _repairTicket.GetAllRepairTicket(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetRepairTicketByID(RepairTicketRequestAPI requestAPI)
        {
            var response = _repairTicket.GetRepairTicketbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            var response = _repairTicket.AddRepairTicket(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            var response = _repairTicket.UpdateRepairTicket(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            var response = _repairTicket.DeleteRepairTicket(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}