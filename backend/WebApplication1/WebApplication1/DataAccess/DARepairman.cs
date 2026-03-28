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
    public class DARepairman : IRepairman
    {
        private readonly string ProcedureName = "Teknicity_Repairman";

        public Response GetAllRepairman(RepairmanRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairmanModel> RepairmanList = new List<RepairmanModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairmanModel Repairman = new RepairmanModel
                        {
                            repairman_id = row["repairman_id"].ToString(),
                            repairman_name = row["repairman_name"].ToString(),
                            repairman_email = row["repairman_email"].ToString(),
                            repairman_contact = row["repairman_contact"].ToString(),
                            specialty = row["specialty"].ToString(),
                            experience = row["experience"].ToString(),
                            status = row["status"].ToString()
                        };
                        RepairmanList.Add(Repairman);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = RepairmanList;
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

        public Response GetRepairmanbyID(RepairmanRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<RepairmanModel> RepairmanList = new List<RepairmanModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        RepairmanModel Repairman = new RepairmanModel
                        {
                            repairman_id = row["repairman_id"].ToString(),
                            repairman_name = row["repairman_name"].ToString(),
                            repairman_email = row["repairman_email"].ToString(),
                            repairman_contact = row["repairman_contact"].ToString(),
                            specialty = row["specialty"].ToString(),
                            experience = row["experience"].ToString(),
                            status = row["status"].ToString()
                        };
                        RepairmanList.Add(Repairman);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = RepairmanList;
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

        public Response AddRepairman(RepairmanRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateRepairman(RepairmanRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteRepairman(RepairmanRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Repairman deleted successfully!";
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