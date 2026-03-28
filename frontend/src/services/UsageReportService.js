import api from './api';

const UsageReportService = {
  // days: number of days for daily report (e.g. 30)
  getDailyReport: (days = 30) => api.get(`/UsageReport/GetDailyReport?Days=${encodeURIComponent(days)}`),

  // months: number of months for monthly aggregation (e.g. 6)
  getMonthlyReport: (months = 1) => api.get(`/UsageReport/GetMonthlyReport?Months=${encodeURIComponent(months)}`),

  // custom range: ISO dates (YYYY-MM-DD)
  getCustomReport: (startDate, endDate) => api.get(`/UsageReport/GetCustomReport?StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`),
};

export default UsageReportService;
