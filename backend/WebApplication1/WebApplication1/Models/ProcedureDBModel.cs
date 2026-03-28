using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace WebApplication1
{
    public class ProcedureDBModel
    {
        public string ResultStatusCode { get; set; }
        public string Result { get; set; }
        public string ExceptionMessage { get; set; }
        public DataTable ResultDataTable { get; set; }
    }
}