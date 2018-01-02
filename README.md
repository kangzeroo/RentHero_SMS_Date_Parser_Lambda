
# SMS Date Parser Lambda
This is an AWS Lambda function that parses every incoming SMS that is inserted into the 'Communication_Logs' DynamoDB table, to check for mentions of a date or tour. <br/>
It should do the following:

1. Check if ACTION === 'SMS_MESSAGE' so that we only parse for dates/tours in regular SMS messages between landlord and tenant
2. Check if there is any mention of a date using a JS library, as well as our own custom slang detector
3. If there is a mention of a date, we save to a different DynamoDB Table called 'Tour_Hints_Parsed' with the entry having a key:value of 'verified: false'
4. If there is no mention of a date, nothing will be done.

# So What Happens Next?
From our Admin Dashboard, we will pull all the entries in 'Tour_Hints_Parsed' table with verified=false <br/>
A human can now view all verified=false messages and verify their tour dates. The human will manually enter the tour date into the official tours database. <br/>
Upon doing so, the entry from 'Tour_Hints_Parsed' will change to verified=true so that next time it is not pulled <br/>
Note that when the human enters the tour date, they must also see the convo history <br/>


# Deployment Instructions
1. Deploy to AWS Lambda by zipping this entire folder and uploading
2. Set the trigger to DynamoDB --> 'Communication_Logs' table, batch size --> 10, Starting Position --> Latest
3. Test the code by manually inserting an SMS Entry into the database. You can use the below as a test (feel free to replace the "TEXT" value with other stuff such as 'thurs' or 'next monday' or 'today at noon' or 'tmrw at 3pm'. See full list of test cases at ./test_dates.js)

Test Entry for DynamoDB 'Communication_Logs' table:<br/>
{
  "ACTION": "SMS_MESSAGE",
  "DATE": 15144358456523,
  "GROUP_ID": "920ad991-9426-47b8-8390-a0f0b5f9495b",
  "INVITATION_ID": "d72342e3-3563-40f4-8dc3-a8c46836e47e",
  "PROXY_CONTACT_ID": "+12268940470",
  "RECEIVER_CONTACT_ID": "6475286355",
  "RECEIVER_ID": "6475286355",
  "SENDER_CONTACT_ID": "6475286355",
  "SENDER_ID": "a32daf81-d860-44e4-9d4e-60c083d91d94",
  "TEXT": "Can I come take a look?"
}
