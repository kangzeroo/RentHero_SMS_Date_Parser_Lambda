const chrono = require('chrono-node')
const moment = require('moment')
const uuid = require('uuid')
const insertTourHint = require('./message_logs/dynamodb_api').insertTourHint

exports.handler = (event, context, callback) => {

    console.log("======= BEGIN ========")
    console.log("How many units in array: " + event.Records.length)

    event.Records.forEach((record, index) => {
      console.log("========== THIS THE " + index + " EVENT ===========")
      console.log(record.dynamodb)
    })

    if (event && event.Records && event.Records[0] && event.Records[0].dynamodb && event.Records[0].dynamodb.NewImage) {
        console.log("========== DynamoDB Entry ===========")
        console.log(event.Records[0].dynamodb.NewImage)

        const DYNAMO_OBJECT = event.Records[0].dynamodb.NewImage
        const ACTION = DYNAMO_OBJECT.ACTION.S
        if ((ACTION === 'SMS_MESSAGE' || ACTION === 'INITIAL_TOUR_REQUEST' || ACTION === 'INITIAL_MESSAGE') && DYNAMO_OBJECT.TEXT && DYNAMO_OBJECT.TEXT.S) {
            const TEXT = DYNAMO_OBJECT.TEXT.S
            parseForDate(TEXT, DYNAMO_OBJECT)
                .then((data) => {
                  if (data.success) {
                    console.log("========== SUCCESS ==========")
                    console.log(data.parsed_date)
                    console.log(data)
                    insertTourHint({
                      'ACTION': 'PARSED_TOUR_HINT',
                      'TOUR_HINT_ID': uuid.v4(),
                      'DATE': new Date().getTime(),
                      'ORIGINAL_CONTENTS': JSON.stringify(DYNAMO_OBJECT) || 'NONE',

                      'PROXY_CONTACT_ID': DYNAMO_OBJECT.PROXY_CONTACT_ID.S || 'NONE',
                      'SENDER_ID': DYNAMO_OBJECT.SENDER_ID.S || 'NONE',
                      'RECEIVER_ID': DYNAMO_OBJECT.RECEIVER_ID.S || 'NONE',
                      'SENDER_CONTACT_ID': DYNAMO_OBJECT.SENDER_CONTACT_ID.S || 'NONE',
                      'RECEIVER_CONTACT_ID': DYNAMO_OBJECT.RECEIVER_CONTACT_ID.S || 'NONE',

                      'TEXT': DYNAMO_OBJECT.TEXT.S || 'NONE',

                      'GUESSED_DATE': data.parsed_date,
                      'VERIFIED': false,
                    })
                  } else {
                    console.log("========== NO DATE FOUND ==========")
                  }
                  callback(null, data);
                })
                .catch((err) => {
                    console.log("========== ERROR ==========")
                    console.log(err)
                    callback(err);
                })
        }
    }
};


const parseForDate = (TEXT, DYNAMO_OBJECT) => {
    const p = new Promise((res, rej) => {
        const results = chrono.parseDate(TEXT)
        if (results) {
          const parsedDate = moment(results).format("dddd, MMMM Do YYYY, h:mm")
          res({
            original_object: DYNAMO_OBJECT,
            parsed_date: parsedDate,
            success: true,
          })
        } else {
          parseForSlangDates(TEXT).then((data) => {
            res({
              original_object: DYNAMO_OBJECT,
              parsed_date: data.message,
              success: data.success,
            })
          }).catch((err) => {
            rej(err)
          })
        }
    })
    return p
}

// parses for slang dates and mentions of a tour
const parseForSlangDates = (TEXT) => {
  const p = new Promise((res, rej) => {
    const matchedSlangs = []
    slangDates.forEach((slangDate, index) => {
      let regexMatch = new RegExp(`(${slangDate.alias})`, 'ig')
    	let parsed_dates = TEXT.match(regexMatch)
      if (parsed_dates && parsed_dates.length > 0) {
        matchedSlangs.push(parsed_dates)
      }
    })
    if (matchedSlangs.length > 0) {
      res({
        success: true,
        message: 'Found at least one mention of a slang date: ' + matchedSlangs[0][0]
      })
    } else {
      res({
        success: false,
        message: 'No regular dates or slang dates found'
      })
    }
  })
  return p
}

const slangDates = [
  { alias: 'tmrw' },
  { alias: 'tommorow' },
  { alias: 'tomorow' },
  { alias: 'tommorow' },
  { alias: 'tomrw' },
  { alias: 'tommorrow' },
  { alias: 'tour' },
  { alias: 'check' },
  { alias: 'visit' },
  { alias: 'see the place' },
  { alias: 'take a look' },
]
