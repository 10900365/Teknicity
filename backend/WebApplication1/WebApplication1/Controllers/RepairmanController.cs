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
    public class RepairmanController : Controller
    {
        private readonly IRepairman _repairman;
        public RepairmanController(IRepairman repairman)
        {
            _repairman = repairman;
        }

        [HttpGet]
        public ActionResult GetAllRepairman(RepairmanRequestAPI requestAPI)
        {
            var response = _repairman.GetAllRepairman(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetRepairmanByID(RepairmanRequestAPI requestAPI)
        {
            var response = _repairman.GetRepairmanbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddRepairman(RepairmanRequestAPI requestAPI)
        {
            var response = _repairman.AddRepairman(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateRepairman(RepairmanRequestAPI requestAPI)
        {
            var response = _repairman.UpdateRepairman(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteRepairman(RepairmanRequestAPI requestAPI)
        {
            var response = _repairman.DeleteRepairman(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}