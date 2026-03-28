using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class SupplierInventoryRequestAPI : RequestAPI
    {
        public string inventory_id { get; set; }
        public string part_name { get; set; }
        public string category { get; set; }
        public string stock_quantity { get; set; }
        public string price { get; set; }
        public string status { get; set; }
    }
}