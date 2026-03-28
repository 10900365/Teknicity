using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class RepairmanReceiptModel
    {
        public string repairman_receipt_id { get; set; }
        public string repair_ticket_id { get; set; }
        public string supplier_receipt_id { get; set; }
        public string receipt_date { get; set; }
        public string labor_cost { get; set; }
        public string discount { get; set; }
        public string parts_total { get; set; }
        public string subtotal { get; set; }
        public string tax { get; set; }
        public string total { get; set; }
        public string status { get; set; }
        public string customer_name { get; set; }
        public string brand { get; set; }
        public string model { get; set; }
        public string supplier_receipt_no { get; set; }
        public string supplier_total { get; set; }
    }
}