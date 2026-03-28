using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class SupplierReceiptModel
    {
        public string receipt_id { get; set; }
        public string receipt_date { get; set; }
        public string inventory_id { get; set; }
        public string quantity { get; set; }
        public string unit_price { get; set; }
        public string discount { get; set; }
        public string note { get; set; }
        public string subtotal { get; set; }
        public string tax { get; set; }
        public string total { get; set; }
        public string part_name { get; set; }
        public string category { get; set; }
        public string inventory_price { get; set; }
    }
}