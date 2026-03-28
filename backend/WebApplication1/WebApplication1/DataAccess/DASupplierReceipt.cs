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
    public class DASupplierReceipt : ISupplierReceipt
    {
        private readonly string ProcedureName = "Teknicity_SupplierReceipt";

        public Response GetAllSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierReceiptModel> SupplierReceiptList = new List<SupplierReceiptModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierReceiptModel SupplierReceipt = new SupplierReceiptModel
                        {
                            receipt_id = row["receipt_id"].ToString(),
                            receipt_date = row["receipt_date"].ToString(),
                            inventory_id = row["inventory_id"].ToString(),
                            quantity = row["quantity"].ToString(),
                            unit_price = row["unit_price"].ToString(),
                            discount = row["discount"].ToString(),
                            note = row["note"].ToString(),
                            subtotal = row["subtotal"].ToString(),
                            tax = row["tax"].ToString(),
                            total = row["total"].ToString(),
                            part_name = row["part_name"].ToString(),
                            category = row["category"].ToString(),
                            inventory_price = row["inventory_price"].ToString()
                        };
                        SupplierReceiptList.Add(SupplierReceipt);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = SupplierReceiptList;
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

        public Response GetSupplierReceiptbyID(SupplierReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierReceiptModel> SupplierReceiptList = new List<SupplierReceiptModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierReceiptModel SupplierReceipt = new SupplierReceiptModel
                        {
                            receipt_id = row["receipt_id"].ToString(),
                            receipt_date = row["receipt_date"].ToString(),
                            inventory_id = row["inventory_id"].ToString(),
                            quantity = row["quantity"].ToString(),
                            unit_price = row["unit_price"].ToString(),
                            discount = row["discount"].ToString(),
                            note = row["note"].ToString(),
                            subtotal = row["subtotal"].ToString(),
                            tax = row["tax"].ToString(),
                            total = row["total"].ToString(),
                            part_name = row["part_name"].ToString(),
                            category = row["category"].ToString(),
                            inventory_price = row["inventory_price"].ToString()
                        };
                        SupplierReceiptList.Add(SupplierReceipt);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = SupplierReceiptList;
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

        public Response AddSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Receipt added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Receipt updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteSupplierReceipt(SupplierReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier Receipt deleted successfully!";
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