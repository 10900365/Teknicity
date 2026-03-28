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
    public class DASupplier : ISupplier
    {
        private readonly string ProcedureName = "Teknicity_Supplier";

        public Response GetAllSupplier(SupplierRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierModel> SupplierList = new List<SupplierModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierModel Supplier = new SupplierModel
                        {
                            supplier_id = row["supplier_id"].ToString(),
                            company_name = row["company_name"].ToString(),
                            phone_no = row["phone_no"].ToString(),
                            email = row["email"].ToString(),
                            address = row["address"].ToString(),
                            parts_specialty = row["parts_specialty"].ToString()
                        };
                        SupplierList.Add(Supplier);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = SupplierList;
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

        public Response GetSupplierbyID(SupplierRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<SupplierModel> SupplierList = new List<SupplierModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        SupplierModel Supplier = new SupplierModel
                        {
                            supplier_id = row["supplier_id"].ToString(),
                            company_name = row["company_name"].ToString(),
                            phone_no = row["phone_no"].ToString(),
                            email = row["email"].ToString(),
                            address = row["address"].ToString(),
                            parts_specialty = row["parts_specialty"].ToString()
                        };
                        SupplierList.Add(Supplier);
                    }
                    result.StatusCode = 200;
                    result.ResultSet = SupplierList;
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

        public Response AddSupplier(SupplierRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier added successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response UpdateSupplier(SupplierRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier updated successfully!";
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        public Response DeleteSupplier(SupplierRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "5";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Supplier deleted successfully!";
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