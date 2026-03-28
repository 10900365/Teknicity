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
    public class PartRequestController : Controller
    {
        private readonly IPartRequest _partRequest;
        public PartRequestController(IPartRequest partRequest)
        {
            _partRequest = partRequest;
        }

        [HttpGet]
        public ActionResult GetAllPartRequest(PartRequestRequestAPI requestAPI)
        {
            var response = _partRequest.GetAllPartRequest(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetPartRequestByID(PartRequestRequestAPI requestAPI)
        {
            var response = _partRequest.GetPartRequestbyID(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult AddPartRequest(PartRequestRequestAPI requestAPI)
        {
            var response = _partRequest.AddPartRequest(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPut]
        public ActionResult UpdatePartRequest(PartRequestRequestAPI requestAPI)
        {
            var response = _partRequest.UpdatePartRequest(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpDelete]
        public ActionResult DeletePartRequest(PartRequestRequestAPI requestAPI)
        {
            var response = _partRequest.DeletePartRequest(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}