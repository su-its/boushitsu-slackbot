import { config } from 'dotenv'
import http from 'http'
import https from 'https'
import { parse } from 'querystring'

config()

const server = http.createServer((req, res) => {
  const beebotte_config = {
    token: process.env.BEEBOTTE_CHANNEL_TOKEN || '',
    channel: process.env.BEEBOTTE_CHANNEL || 'test',
    resource: process.env.BEEBOTTE_RESOURCE || 'res'
  }

  let data = ''
  req.on('data', chunk => { /* chunk: Buffer */
    data += chunk
  })
  req.on('end', () => {
    const queries = parse(data)
    /* debug */
    // console.log(queries)
    const postData = {
      data: {
        text: queries.text,
        channel: queries.channel_id,
        user: queries.user_id
      }
    }

    const bbtreq = https.request({
      host: 'api.beebotte.com',
      path: `/v1/data/publish/${beebotte_config.channel}/${beebotte_config.resource}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': beebotte_config.token
      }
    })

    bbtreq.on('error', err => console.error(err))
    bbtreq.on('response', res => console.log('STATUS', res.statusCode))
    bbtreq.write(JSON.stringify(postData))
    bbtreq.end()
    res.writeHead(200)
    res.end()
  })
})

// Start a basic HTTP server
const port = parseInt(process.env.PORT as string, 10) || 5000
server.on('listening', () => {
  // Listening on path '/'
  console.log(`Server listening on port ${port}`);
})
server.listen(port)
