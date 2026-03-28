using biZTrack.Static;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using WebApplication1.Database_Layer;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.DataAccess
{
    public class DASupplierInventory : ISupplierInventory
    {
        private readonly string ProcedureName = "Teknicity_SupplierInventory";

        public Response GetAllSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierInventoryModel> SupplierInventoryList = new List<SupplierInventoryModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierInventoryModel SupplierInventory = new SupplierInventoryModel
                        {
                            inventory_id = row["inventory_id"].ToString(),
                            part_name = row["part_name"].ToString(),
                            category = row["category"].ToString(),
                            stock_quantity = row["stock_quantity"].ToString(),
                            price = row["price"].ToString(),
                            status = row["status"].ToString()
                        };
                        SupplierInventoryList.Add(SupplierInventory);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = SupplierInventoryList;
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response GetSupplierInventorybyID(SupplierInventoryRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierInventoryModel> SupplierInventoryList = new List<SupplierInventoryModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierInventoryModel SupplierInventory = new SupplierInventoryModel
                        {
                            inventory_id = row["inventory_id"].ToString(),
                            part_name = row["part_name"].ToString(),
                            category = row["category"].ToString(),
                            stock_quantity = row["stock_quantity"].ToString(),
                            price = row["price"].ToString(),
                            status = row["status"].ToString()
                        };
                        SupplierInventoryList.Add(SupplierInventory);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = SupplierInventoryList;
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
                return result;
            }
        }

        public Response AddSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Inventory added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Inventory updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteSupplierInventory(SupplierInventoryRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Inventory deleted successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }
    }
}