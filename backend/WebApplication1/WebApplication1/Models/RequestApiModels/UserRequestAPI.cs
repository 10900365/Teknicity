using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class UserRequestAPI : RequestAPI
    {
        public string user_id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string password { get; set; }
        public string role { get; set; }
        public string isVerified { get; set; }
        public string otp_code { get; set; }
    }
}