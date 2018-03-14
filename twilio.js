exports.twilio_send_text = function (recipient_number){

  var accountSid = 'AC2465c193b99bee044572bcc388da25c2'; // Your Account SID from www.twilio.com/console
  var authToken = '8258fab68ffe234e5e344a5f7d340673';   // Your Auth Token from www.twilio.com/console

  var twilio = require('twilio');
  var client = new twilio(accountSid, authToken);

  client.messages.create({
      body: 'Hello from Node ... this is Mr. Bryce texting you ... :) ',
      to: recipient_number,  // Text this number
      from: '+14422374210' // From a valid Twilio number
  })
  .then((message) => console.log(message.sid));
  console.log('inside twilio_send_text function');
};



//https://channels.lex.us-east-1.amazonaws.com/twilio-sms/webhook/a9d62a27-9061-4cbe-b6f2-f99478669664
//nagi resume bot

//https://vhvbhxyrxk.execute-api.us-west-2.amazonaws.com/Prod
//endpoint for api gateway dentist bot

//https://channels.lex.us-east-1.amazonaws.com/twilio-sms/webhook/a35a945c-cd71-4128-b4b7-e57fa58116d9