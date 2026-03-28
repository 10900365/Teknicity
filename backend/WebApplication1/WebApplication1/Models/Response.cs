using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class Response
    {
        public int StatusCode { get; set; } = 404;
        public string Result { get; set; }
        public object ResultSet { get; set; }
        public string NewID { get; set; } //New one

    }
}