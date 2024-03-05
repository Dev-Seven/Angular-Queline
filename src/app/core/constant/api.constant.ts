import { environment } from "../../../environments/environment";

const serverPath = environment.serverPath;
const apiPath = serverPath + "/api/";
let basePath = apiPath;

export const APIConstant = {
  basePath: serverPath,

  // Login and Registration
  signin: `${apiPath}admin/signin`,
  verify: `${apiPath}admin/verify`,
  signup: `${apiPath}admin/signup`,
  signupForLtPlan: `${apiPath}lt-plan/signup`,
  changepassword: `${apiPath}admin/changepassword`,
  forgot: `${apiPath}admin/forgot`,
  forgotpassword: `${apiPath}admin/forgotpassword`,
  logout: `${apiPath}admin/logout`,
  booking: `${apiPath}booking`,
  bb_booking: `${apiPath}bb-booking`,
  bb_calender: `${apiPath}bb-calender`,
  bb_slot: `${apiPath}bb-slot`,

  feedback: `${apiPath}feedback`,
  admin: `${apiPath}admin`,
  calendar: `${apiPath}calendar`,
  time: `${apiPath}time`,
  adminlocation: `${apiPath}admin/location`,
  // Upload
  upload: `${apiPath}upload`,
  base64File: `${apiPath}upload/GetBase64FromURL`,

  // Pages
  profile: `${apiPath}admin`,
  owner: `${apiPath}admin/sysadmin`,
  location: `${apiPath}location`,
  locationInput: `${apiPath}location_input`,
  chatUsers: `${apiPath}user/location`,
  user: `${apiPath}user`,
  activity: `${apiPath}booking/loc`,

  //List
  list: {
    paymenttype: `${basePath}groupcode/list/paymenttype`,
  },
  inquiry: `${apiPath}inquiry`,

  businessDetails: `${apiPath}business-details/getDetails`,
  upgradeBusinessPlan: `${apiPath}business-details/upgrade`,
  downgradeBusinessPlan: `${apiPath}business-details/cancelSubscription`,
  addSpots: `${apiPath}business-details/addSpots`,
  addSms: `${apiPath}business-details/addSms`,
  sms_count: `${apiPath}sassmantra/count`,
  getOrder: `${apiPath}order/pdfById`,
  getOrderList: `${apiPath}order/ordersById`,
  pushNotificattion: `${apiPath}user/pushNotificattion`,
  getUserDeviceToken: `${apiPath}user`,
  getSupportDeviceToken: `${apiPath}admin/getDeviceToken`,
  getAdminDeviceToken: `${apiPath}admin/getAdminDeviceToken`,
};

export const PublicAPI = [APIConstant.signin, APIConstant.signup];
