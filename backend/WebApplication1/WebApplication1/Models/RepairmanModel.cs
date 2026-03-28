using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class RepairmanModel
    {
        public string repairman_id { get; set; }
        public string repairman_name { get; set; }
        public string repairman_email { get; set; }
        public string repairman_contact { get; set; }
        public string specialty { get; set; }
        public string experience { get; set; }
        public string status { get; set; }
    }
}