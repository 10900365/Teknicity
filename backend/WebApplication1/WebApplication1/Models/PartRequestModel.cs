using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class PartRequestModel
    {
        public string partrequest_id { get; set; }
        public string part_name { get; set; }
        public string quantity { get; set; }
        public string supplier_name { get; set; }
        public string urgency { get; set; }
        public string requested_date { get; set; }
        public string needed_by { get; set; }
        public string status { get; set; }
        public string actions { get; set; }
    }
}