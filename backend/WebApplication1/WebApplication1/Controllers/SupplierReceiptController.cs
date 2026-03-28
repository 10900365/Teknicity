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
    public class SupplierReceiptController : Controller
    {
        private readonly ISupplierReceipt _supplierReceipt;
        public SupplierReceiptController(ISupplierReceipt supplierReceipt)
        {
            _supplierReceipt = supplierReceipt;
        }

        [HttpGet]
        public ActionResult GetAllSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            var response = _supplierReceipt.GetAllSupplierReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetSupplierReceiptByID(SupplierReceiptRequestAPI requestAPI)
        {
            var response = _supplierReceipt.GetSupplierReceiptbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            var response = _supplierReceipt.AddSupplierReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            var response = _supplierReceipt.UpdateSupplierReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            var response = _supplierReceipt.DeleteSupplierReceipt(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}