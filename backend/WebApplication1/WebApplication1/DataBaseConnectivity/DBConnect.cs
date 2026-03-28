using System;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;
using WebApplication1.Models;

namespace WebApplication1.Database_Layer
{
    internal class DBconnect : IDisposable
    {
        private readonly string _connectionString;
        private SqlConnection _connection;

        public DBconnect()
        {

           _connectionString = string.Format("Data Source=(localdb)\\MSSQLLocalDB; " +
              "Initial Catalog=TeknicityDB;" +
              "Integrated Security=True; " +
              "MultipleActiveResultSets=true;" +
              "Max Pool Size=600;");


            //_connectionString = string.Format("Data Source=DESKTOP-TIS4N3S; " +
            //  "Initial Catalog=foodorderingdb;" +
            //  "Integrated Security=True; " +
            //  "MultipleActiveResultSets=true;" +
            //  "Max Pool Size=600;");



            //_connectionString = "Data Source=ALL-SER-LAP01\\DTSSQLSERVER; Initial Catalog=foodorderingdb; User id=sa; Password=DSadmin@123; MultipleActiveResultSets=true;";

        }



        public SqlConnection GetOpenConnection()
        {
            SqlConnection connection = new SqlConnection(_connectionString);
            connection.Open();
            return connection;
        }

        public SqlDataReader ReadTable(string readStr)
        {
            SqlConnection connection = GetOpenConnection();
            var command = new SqlCommand(readStr, connection);
            return command.ExecuteReader(CommandBehavior.CloseConnection);
        }
        //public ProcedureDBModel ProcedureRead(RequestAPI requestAPI, string procedureName)
        //{
        //    ProcedureDBModel result = new ProcedureDBModel();
        //    using (SqlConnection connection = GetOpenConnection())
        //    using (SqlCommand cmd = new SqlCommand(procedureName, connection))
        //    {
        //        cmd.CommandType = CommandType.StoredProcedure;

        //        // Map properties of requestAPI to stored procedure parameters
        //        Type type = requestAPI.GetType();
        //        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

        //        foreach (var property in properties)
        //        {
        //            string paramName = "@" + property.Name;
        //            object value = property.GetValue(requestAPI) ?? DBNull.Value;

        //            SqlParameter param = new SqlParameter(paramName, SqlDbType.VarChar)
        //            {
        //                Direction = ParameterDirection.Input,
        //                Value = value
        //            };

        //            cmd.Parameters.Add(param);
        //        }

        //        // Now execute the procedure and load results into DataTable
        //        try
        //        {
        //            using (SqlDataReader reader = cmd.ExecuteReader())
        //            {
        //                DataTable dt = new DataTable();
        //                dt.Load(reader);
        //                result.ResultDataTable = dt;
        //                result.ResultStatusCode = "1";  // success
        //                result.Result = "Success";
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            result.ResultStatusCode = "-1";
        //            result.ExceptionMessage = ex.Message;
        //        }

        //        return result;
        //    }
        //}
        public ProcedureDBModel ProcedureRead(RequestAPI requestAPI, string procedureName)
        {
            ProcedureDBModel result = new ProcedureDBModel();
            using (SqlConnection connection = GetOpenConnection())
            using (SqlCommand cmd = new SqlCommand(procedureName, connection))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                // Add output parameters
                SqlParameter statusCodeParam = new SqlParameter("@ResultStatusCode", SqlDbType.Int)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(statusCodeParam);

                SqlParameter resultParam = new SqlParameter("@Result", SqlDbType.VarChar, -1)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(resultParam);

                SqlParameter exceptionParam = new SqlParameter("@ExceptionMessage", SqlDbType.VarChar, -1)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(exceptionParam);

                // Map input properties
                Type type = requestAPI.GetType();
                var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

                foreach (var property in properties)
                {
                    string paramName = "@" + property.Name;
                    object value = property.GetValue(requestAPI) ?? DBNull.Value;

                    SqlParameter param = new SqlParameter(paramName, SqlDbType.VarChar)
                    {
                        Direction = ParameterDirection.Input,
                        Value = value
                    };
                    cmd.Parameters.Add(param);
                }

                try
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        result.ResultDataTable = dt;
                    }

                    // Get output parameter values after execution
                    result.ResultStatusCode = statusCodeParam.Value != DBNull.Value ?
                        statusCodeParam.Value.ToString() : "1";
                    result.Result = resultParam.Value != DBNull.Value ?
                        resultParam.Value.ToString() : "Success";
                    result.ExceptionMessage = exceptionParam.Value != DBNull.Value ?
                        exceptionParam.Value.ToString() : null;
                }
                catch (Exception ex)
                {
                    result.ResultStatusCode = "-1";
                    result.ExceptionMessage = ex.Message;
                }

                return result;
            }
        }

        public bool AddEditDel(string AddEditDelStr)
        {
            SqlConnection connection = GetOpenConnection();
            var command = new SqlCommand(AddEditDelStr, connection);
            int affectedRows = command.ExecuteNonQuery();
            connection.Close(); // Close the connection after executing the query
            return affectedRows > 0;
        }

        public void Dispose()
        {
            if (_connection != null)
            {
                _connection.Dispose();
                _connection = null;
            }
        }

        internal void ExecuteQuery(string query)
        {
            throw new NotImplementedException();
        }
    }
}
