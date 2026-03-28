using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class SupplierRequestAPI : RequestAPI
    {
        public string supplier_id { get; set; }
        public string company_name { get; set; }
        public string phone_no { get; set; }
        public string email { get; set; }
        public string address { get; set; }
        public string parts_specialty { get; set; }
    }
}