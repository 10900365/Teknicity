using System.Web.Mvc;
using Unity;
using Unity.Mvc5;
using WebApplication1.Interfaces;
using WebApplication1.DataAccess;

namespace WebApplication1
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            // Register your interfaces and implementations
            container.RegisterType<IPartRequest, DAPartRequest>();
            container.RegisterType<IRepairman, DARepairman>();
            container.RegisterType<IRepairTicket, DARepairTicket>();
            container.RegisterType<ISupplierInventory, DASupplierInventory>();
            container.RegisterType<ISupplier, DASupplier>();
            container.RegisterType<IUser, DAUser>();
            container.RegisterType<ISupplierReceipt, DASupplierReceipt>();
            container.RegisterType<IRepairmanReceipt, DARepairmanReceipt>();


            // Set the dependency resolver for MVC
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}
