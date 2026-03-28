using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class RepairTicketRequestAPI : RequestAPI
    {
        public string ticket_id { get; set; }
        public string brand { get; set; }
        public string model { get; set; }
        public string imei { get; set; }
        public string issue_description { get; set; }
        public string customer_name { get; set; }
        public string phone_no { get; set; }
       // public string created_date { get; set; }
        public string email { get; set; }
        public string notes { get; set; }
        public string status { get; set; }
    }
}