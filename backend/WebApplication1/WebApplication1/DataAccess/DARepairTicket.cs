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
    public class DARepairTicket : IRepairTicket
    {
        private readonly string ProcedureName = "Teknicity_RepairTicket";

        public Response GetAllRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairTicketModel> RepairTicketList = new List<RepairTicketModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairTicketModel RepairTicket = new RepairTicketModel
                        {
                            ticket_id = row["ticket_id"].ToString(),
                            brand = row["brand"].ToString(),
                            model = row["model"].ToString(),
                            imei = row["imei"].ToString(),
                            issue_description = row["issue_description"].ToString(),
                            customer_name = row["customer_name"].ToString(),
                            phone_no = row["phone_no"].ToString(),
                            email = row["email"].ToString(),
                            created_date = row["created_date"].ToString(),
                            notes = row["notes"].ToString(),
                            status = row["status"].ToString()
                        };
                        RepairTicketList.Add(RepairTicket);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = RepairTicketList;
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

        public Response GetRepairTicketbyID(RepairTicketRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairTicketModel> RepairTicketList = new List<RepairTicketModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairTicketModel RepairTicket = new RepairTicketModel
                        {
                            ticket_id = row["ticket_id"].ToString(),
                            brand = row["brand"].ToString(),
                            model = row["model"].ToString(),
                            imei = row["imei"].ToString(),
                            issue_description = row["issue_description"].ToString(),
                            customer_name = row["customer_name"].ToString(),
                            phone_no = row["phone_no"].ToString(),
                            email = row["email"].ToString(),
                            created_date = row["created_date"].ToString(),
                            notes = row["notes"].ToString(),
                            status = row["status"].ToString()
                        };
                        RepairTicketList.Add(RepairTicket);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = RepairTicketList;
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

        public Response AddRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repair Ticket added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repair Ticket updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteRepairTicket(RepairTicketRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repair Ticket deleted successfully!";
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