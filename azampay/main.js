
const axios = require('axios');

let tokenData = {};
let crendetial = {}

// authecate the user account
const getToken = async (req, res) => {
  const data = {
    appName: process.env.APP_NAME,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.API_KEY,
  };

  try {
    const response = await axios.post( `https://authenticator-sandbox.azampay.co.tz/AppRegistration/GenerateToken`,data);
    // axios automatically throws an error for non-2xx responses
    // You can access the response data with response.data
    console.log(response.data);
   if (response.data.data) {
     const { success, message, statusCode } = response.data
      // Get the current time
  const currentTime = new Date();
     res.status(statusCode).json({ success: success, message: message,date:currentTime})
     tokenData = response.data.data
   }
   
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    res.status(error.response?.status || 500).json({ success: false, error: error.message });
  }

}


// checkout data
const checkoutData = async (req, res) => {
  const config ={
    headers:{
    'Authorization': `Bearer ${tokenData.accessToken}`,
    'X-API-Key': process.env.API_KEY,
  } };

  const { accountNumber, amount, externalId, provider } = req.body
  console.log(req.body);
  try {
    const response = await axios.post(`https://sandbox.azampay.co.tz/azampay/mno/checkout`, req.body,config);
if (response.data.success === true) {
  crendetial = {
    msisdn: accountNumber,
    amount: amount,
    utilityref:process.env.CLIENT_ID,
    operator: provider,
    transitionstatus: 'success',
    reference:response.data.transitionstaId,
    message: 'pay food order to atk food',
  }

  res.json(response.data);

}
    
   
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    res.status(error.response?.status || 500).json({ success: false, error: error.message });
  }
}

// call back func to get payment status and info
const callBackFunc = async (req, res) => {
  const config ={
    headers:{
    'Authorization': `Bearer ${tokenData.accessToken}`,
    'X-API-Key': process.env.API_KEY,
    }
  };
 
  try {
    const response = await axios.post(`https://sandbox.azampay.co.tz/azampay/api/v1/Checkout/Callback`,crendetial, config);
    res.json(response.data);
   
  } catch (error) {
    // Handle errors
    console.error('Error:', error.message);
    res.status(error.response?.status || 500).json({ success: false, error: error.message });
  }
}

module.exports ={ getToken,checkoutData, callBackFunc};
