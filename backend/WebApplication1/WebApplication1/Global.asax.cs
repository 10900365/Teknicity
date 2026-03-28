using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Unity;
using WebApplication1.DataAccess;
using WebApplication1.Interfaces;

namespace WebApplication1
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Initialize Unity container
            UnityContainer container = new UnityContainer();
            UnityConfig.RegisterComponents(); // <-- no parameters
        }

        // Handle CORS and preflight OPTIONS requests
        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", "*");
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

            if (HttpContext.Current.Request.HttpMethod == "OPTIONS")
            {
                HttpContext.Current.Response.StatusCode = 200;
                HttpContext.Current.Response.End();
            }
        }

        // Global error handling
        protected void Application_Error(object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();
            Server.ClearError();

            HttpContext.Current.Response.Clear();
            HttpContext.Current.Response.StatusCode = 500;
            HttpContext.Current.Response.ContentType = "application/json";

            var errorResponse = new
            {
                Message = ex.Message,
                StackTrace = ex.StackTrace
            };

            HttpContext.Current.Response.Write(
                Newtonsoft.Json.JsonConvert.SerializeObject(errorResponse)
            );
            HttpContext.Current.Response.End();
        }
    }
}
