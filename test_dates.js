const chrono = require('chrono-node')
const moment = require('moment')

const test_cases = [
  'How about this thursday?',
  'Next tuesday works?',
  'You can come today at 2pm',
  'Monday at noon',
  'Nothing',
  'is tmrw ok?',
  'how about tommorw?',
  'can we do tommorrow?',
  'thurs?',
  'how about 3pm?',
]

test_cases.forEach((text) => {
  console.log('===============================')
  const results = chrono.parseDate(text)
  console.log(results)
  console.log(text)
  console.log(moment(results).fromNow())
  console.log(moment(results).format("dddd, MMMM Do YYYY, h:mm"))
  console.log('===============================')
})

// we would use below if we wanted to offset time from Greenwich Mean Time to Toronto Time (5 hours behind)
// moment(results).utcOffset(60*5)
