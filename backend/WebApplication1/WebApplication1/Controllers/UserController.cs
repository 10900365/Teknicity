using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Models.RequestApiModels;
using WebApplication1.Interfaces;

namespace WebApplication1.Controllers
{
    public class UserController : Controller
    {
        private readonly IUser _user;
        public UserController(IUser user)
        {
            _user = user;
        }

        [HttpPost]
        public ActionResult Login(UserRequestAPI requestAPI)
        {
            var response = _user.Login(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Signup(UserRequestAPI requestAPI)
        {
            var response = _user.Signup(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult VerifyOtp(UserRequestAPI requestAPI)
        {
            var response = _user.VerifyOtp(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult ResendOtp(UserRequestAPI requestAPI)
        {
            var response = _user.ResendOtp(requestAPI);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
    }
}