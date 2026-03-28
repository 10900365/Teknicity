import api from './api';

const GetTodayBillCount = async () => {
  const config = {
    method: 'get',
    url: '/CustomerBill/GetTodayBillCount',
  };
  return api.request(config);
};

const GetBillByDate = async (billDate) => {
  const config = {
    method: 'get',
    url: `/CustomerBill/GetBillByDate?BillDate=${encodeURIComponent(billDate)}`,
  };
  return api.request(config);
};

const GetMonthlyBillCount = async (month, year) => {
  const config = {
    method: 'get',
    url: `/CustomerBill/GetMonthlyBillCount?Month=${encodeURIComponent(month)}&Year=${encodeURIComponent(year)}`,
  };
  return api.request(config);
};

const GetYearlyBillCount = async (year) => {
  const config = {
    method: 'get',
    url: `/CustomerBill/GetYearlyBillCount?Year=${encodeURIComponent(year)}`,
  };
  return api.request(config);
};

const CustomerBillService = {
  GetTodayBillCount,
  GetBillByDate,
  GetMonthlyBillCount,
  GetYearlyBillCount,
};

export default CustomerBillService;
