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
    public class SupplierInventoryController : Controller
    {
        private readonly ISupplierInventory _supplierInventory;
        public SupplierInventoryController(ISupplierInventory supplierInventory)
        {
            _supplierInventory = supplierInventory;
        }

        [HttpGet]
        public ActionResult GetAllSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            var response = _supplierInventory.GetAllSupplierInventory(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetSupplierInventoryByID(SupplierInventoryRequestAPI requestAPI)
        {
            var response = _supplierInventory.GetSupplierInventorybyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            var response = _supplierInventory.AddSupplierInventory(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            var response = _supplierInventory.UpdateSupplierInventory(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            var response = _supplierInventory.DeleteSupplierInventory(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}