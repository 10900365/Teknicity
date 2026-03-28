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
    public class SupplierController : Controller
    {
        private readonly ISupplier _supplier;
        public SupplierController(ISupplier supplier)
        {
            _supplier = supplier;
        }

        [HttpGet]
        public ActionResult GetAllSupplier(SupplierRequestAPI requestAPI)
        {
            var response = _supplier.GetAllSupplier(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetSupplierByID(SupplierRequestAPI requestAPI)
        {
            var response = _supplier.GetSupplierbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddSupplier(SupplierRequestAPI requestAPI)
        {
            var response = _supplier.AddSupplier(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdateSupplier(SupplierRequestAPI requestAPI)
        {
            var response = _supplier.UpdateSupplier(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeleteSupplier(SupplierRequestAPI requestAPI)
        {
            var response = _supplier.DeleteSupplier(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}