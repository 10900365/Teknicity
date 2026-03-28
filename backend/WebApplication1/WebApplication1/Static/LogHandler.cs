using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace biZTrack.Static
{
    public static class LogHandler
    {
        public static void WriteToLog(string exceptionMsg, string methodName)
        {

            DateTime now = new DateTime();

            //var filePath = @"C:\inetpub\wwwroot\backend-Test\BizTrack\ExceptionLogs.txt";
            var filePath = @"D:\teknicity\TeknicityBackend\WebApplication1\Exceptionlogs.txt";

            string message = now.ToString("MM/dd/yyyy HH:mm:ss") + " ~ " + methodName + " ~ " + exceptionMsg + ";";

            using (StreamWriter writer = File.AppendText(filePath))
            {
                writer.WriteLine(message);
            }
        }
    }
}