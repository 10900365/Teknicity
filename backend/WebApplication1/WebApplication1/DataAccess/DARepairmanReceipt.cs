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
    public class DARepairmanReceipt : IRepairmanReceipt
    {
        private readonly string ProcedureName = "Teknicity_RepairmanReceipt";

        public Response GetAllRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairmanReceiptModel> RepairmanReceiptList = new List<RepairmanReceiptModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairmanReceiptModel RepairmanReceipt = new RepairmanReceiptModel
                        {
                            repairman_receipt_id = row["repairman_receipt_id"].ToString(),
                            repair_ticket_id = row["repair_ticket_id"].ToString(),
                            supplier_receipt_id = row["supplier_receipt_id"].ToString(),
                            receipt_date = row["receipt_date"].ToString(),
                            labor_cost = row["labor_cost"].ToString(),
                            discount = row["discount"].ToString(),
                            parts_total = row["parts_total"].ToString(),
                            subtotal = row["subtotal"].ToString(),
                            tax = row["tax"].ToString(),
                            total = row["total"].ToString(),
                            status = row["status"].ToString(),
                            customer_name = row["customer_name"].ToString(),
                            brand = row["brand"].ToString(),
                            model = row["model"].ToString(),
                            supplier_receipt_no = row["supplier_receipt_no"].ToString(),
                            supplier_total = row["supplier_total"].ToString()
                        };
                        RepairmanReceiptList.Add(RepairmanReceipt);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = RepairmanReceiptList;
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

        public Response GetRepairmanReceiptbyID(RepairmanReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairmanReceiptModel> RepairmanReceiptList = new List<RepairmanReceiptModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairmanReceiptModel RepairmanReceipt = new RepairmanReceiptModel
                        {
                            repairman_receipt_id = row["repairman_receipt_id"].ToString(),
                            repair_ticket_id = row["repair_ticket_id"].ToString(),
                            supplier_receipt_id = row["supplier_receipt_id"].ToString(),
                            receipt_date = row["receipt_date"].ToString(),
                            labor_cost = row["labor_cost"].ToString(),
                            discount = row["discount"].ToString(),
                            parts_total = row["parts_total"].ToString(),
                            subtotal = row["subtotal"].ToString(),
                            tax = row["tax"].ToString(),
                            total = row["total"].ToString(),
                            status = row["status"].ToString(),
                            customer_name = row["customer_name"].ToString(),
                            brand = row["brand"].ToString(),
                            model = row["model"].ToString(),
                            supplier_receipt_no = row["supplier_receipt_no"].ToString(),
                            supplier_total = row["supplier_total"].ToString()
                        };
                        RepairmanReceiptList.Add(RepairmanReceipt);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = RepairmanReceiptList;
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

        public Response AddRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman Receipt added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman Receipt updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteRepairmanReceipt(RepairmanReceiptRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman Receipt deleted successfully!";
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