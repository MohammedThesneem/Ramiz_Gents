require('dotenv').config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process .env.TWILIO_SERVICE_ID
const client = require('twilio')(accountSid, authToken);



module.exports={
otpMake:(phoneNumber)=>{
    return new Promise((resolve,reject)=>{
        client.verify.v2.services(serviceId)
        .verifications
        .create({to: `+91${phoneNumber}`, channel: 'sms'})
        .then((response )=>{
            console.log(response) 
         resolve(response)
        } ).catch((err)=>{
            console.log('it is error'+err);
            reject(err)
        });

    });
   
},
verifyOtp:(phoneNumber,otp)=>{
    return new Promise((resolve,reject)=>{
        client.verify.v2.services(serviceId)
      .verificationChecks
      .create({to: `+91${phoneNumber}`, code: otp.otp})
      .then((verified) => {
        console.log(verified);
        resolve(verified)

      } ).catch((err)=>{
          console.log('it is error'+err);
          reject(err)
      });
    });


},
}