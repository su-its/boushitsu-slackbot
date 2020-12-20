import { createEventAdapter } from '@slack/events-api'
import { config } from 'dotenv'
import https from 'https'

config()

const port = 5000
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET || '')
const beebotte_config = {
  token: process.env.BEEBOTTE_CHANNEL_TOKEN || '',
  channel: process.env.BEEBOTTE_CHANNEL || 'test',
  resource: process.env.BEEBOTTE_RESOURCE || 'res'
}

interface AppMentionEvent {
  type: string
  user: string
  text: string
  ts: string
  channel: string
  events_ts: string
}

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('app_mention', (event: AppMentionEvent) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`)

  const postData = {
    data: {
      text: event.text.replace(/<.*>\s?/, ''), // Remove mentioned user(bot) name
      channel: event.channel
    }
  }

  const req = https.request({
    host: 'api.beebotte.com',
    path: `/v1/data/publish/${beebotte_config.channel}/${beebotte_config.resource}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': beebotte_config.token
    }
  })
  req.on('error', err => console.error(err))
  req.on('response', res => console.log('STATUS', res.statusCode))
  req.write(JSON.stringify(postData))
  req.end()
})

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error)

// Start a basic HTTP server
slackEvents.start(port).then(() => {
  // Listening on path '/slack/events' by default
  console.log(`server listening on port ${port}`);
})
