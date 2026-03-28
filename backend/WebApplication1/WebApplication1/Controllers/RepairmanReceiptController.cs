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
    public class RepairmanReceiptController : Controller
    {
        private readonly IRepairmanReceipt _repairmanReceipt;
        public RepairmanReceiptController(IRepairmanReceipt repairmanReceipt)
        {
            _repairmanReceipt = repairmanReceipt;
        }

        [HttpGet]
        public ActionResult GetAllRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            var response = _repairmanReceipt.GetAllRepairmanReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetRepairmanReceiptByID(RepairmanReceiptRequestAPI requestAPI)
        {
            var response = _repairmanReceipt.GetRepairmanReceiptbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            var response = _repairmanReceipt.AddRepairmanReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            var response = _repairmanReceipt.UpdateRepairmanReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            var response = _repairmanReceipt.DeleteRepairmanReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}