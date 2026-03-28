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
    public class DAPartRequest : IPartRequest
    {
        private readonly string ProcedureName = "Teknicity_PartRequest";

        public Response GetAllPartRequest(PartRequestRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";
             
            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<PartRequestModel> PartRequestList = new List<PartRequestModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        PartRequestModel PartRequest = new PartRequestModel
                        {
                            partrequest_id = row["partrequest_id"].ToString(),
                            part_name = row["part_name"].ToString(),
                            quantity = row["quantity"].ToString(),
                            supplier_name = row["supplier_name"].ToString(),
                            urgency = row["urgency"].ToString(),
                            requested_date = row["requested_date"].ToString(),
                            needed_by = row["needed_by"].ToString(),
                            status = row["status"].ToString(),
                            actions = row["actions"].ToString()
                        };
                        PartRequestList.Add(PartRequest);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = PartRequestList;
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

        public Response GetPartRequestbyID(PartRequestRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<PartRequestModel> PartRequestList = new List<PartRequestModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        PartRequestModel PartRequest = new PartRequestModel
                        {
                            partrequest_id = row["partrequest_id"].ToString(),
                            part_name = row["part_name"].ToString(),
                            quantity = row["quantity"].ToString(),
                            supplier_name = row["supplier_name"].ToString(),
                            urgency = row["urgency"].ToString(),
                            requested_date = row["requested_date"].ToString(),
                            needed_by = row["needed_by"].ToString(),
                            status = row["status"].ToString(),
                            actions = row["actions"].ToString()
                        };
                        PartRequestList.Add(PartRequest);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = PartRequestList;
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

        public Response AddPartRequest(PartRequestRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Part Request added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdatePartRequest(PartRequestRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Part Request updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeletePartRequest(PartRequestRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Part Request deleted successfully!";
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