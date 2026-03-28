using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using WebApplication1.Database_Layer;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;
using WebApplication1.Interfaces;

namespace WebApplication1.DataAccess
{
    public class DAUser : IUser
    {
        private readonly string ProcedureName = "Teknicity_UserLogin";

        public Response Login(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<UserModel> UserList = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        UserModel user = new UserModel
                        {
                            user_id = row["user_id"].ToString(),
                            name = row["name"].ToString(),
                            email = row["email"].ToString(),
                            phone = row["phone"].ToString(),
                            role = row["role"].ToString(),
                            isVerified = row["isVerified"].ToString()
                        };
                        UserList.Add(user);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = UserList;
                }
                else
                {
                    result.StatusCode = 401;
                    result.Result = res.Result;
                }
            }
            return result;
        }

        public Response Signup(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = requestAPI.phone; // Return phone for OTP verification
                    result.ResultSet = new List<object> { new { otp = res.Result } }; // Include OTP for demo
                }
                else
                {
                    result.StatusCode = 400;
                    result.Result = res.Result;
                }
            }
            return result;
        }

        public Response VerifyOtp(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    List<UserModel> UserList = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        UserModel user = new UserModel
                        {
                            user_id = row["user_id"].ToString(),
                            name = row["name"].ToString(),
                            email = row["email"].ToString(),
                            phone = row["phone"].ToString(),
                            role = row["role"].ToString(),
                            isVerified = row["isVerified"].ToString()
                        };
                        UserList.Add(user);
                    }

                    result.StatusCode = 200;
                    result.ResultSet = UserList;
                    result.Result = "OTP verified successfully";
                }
                else
                {
                    result.StatusCode = 400;
                    result.Result = res.Result;
                }
            }
            return result;
        }

        public Response ResendOtp(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "4";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);

                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = requestAPI.phone;
                    result.ResultSet = new List<object> { new { otp = res.Result } }; // Include OTP for demo
                }
                else
                {
                    result.StatusCode = 400;
                    result.Result = res.Result;
                }
            }
            return result;
        }
    }
}