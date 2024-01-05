const express = require('express')
const axios = require('axios')
const OAuthClient = require("./utils/oauth/client.js")
const cron = require('node-cron')
const { db } = require('./utils/db/client.js')
require('dotenv').config()

const oauthOptions = {
    client: {
        id: process.env.CLIENT_ID,
        secret: process.env.CLIENT_SECRET
    },
    auth: {
        tokenHost: "https://oauth.battle.net"
    }
}

const app = express()
const PORT = process.env.PORT || 4000
const cors = require('cors')
const oauthClient = new OAuthClient({ oauthOptions })

const servicesStartUp = async () => {
    await oauthClient.getToken()

    if (oauthClient.token) {
        console.log('token aquired')
    } else {
        console.error('NO TOKEN')
    }

    await db.connect()
    console.log('db connected')
}

servicesStartUp()
app.use(express.json())
app.use(cors({
	origin: 'http://localhost:3000'
}))

cron.schedule('*/20 * * * *', async () => {
    try {
        const tokenPrice = await axios.get('https://us.api.blizzard.com/data/wow/token/index', { 
            params: {
                "namespace": "dynamic-us",
                "locale": "en_US",
                "access_token": oauthClient.token.token.token.access_token
            }
        })

        const tokenData = {
            last_updated: tokenPrice.data.last_updated_timestamp,
            price: tokenPrice.data.price / 10000
        }

        await db.query('INSERT INTO token_data (time, price) VALUES ($1, $2)', [tokenData.last_updated, tokenData.price])

        console.log('cron job successful')
    } catch (err) {
        console.error(`cron job error: ${err}`)
    }
})

app.get('/token', async (req, res) => {
    try {
        const tokenPrice = await axios.get('https://us.api.blizzard.com/data/wow/token/index', { 
            params: {
                "namespace": "dynamic-us",
                "locale": "en_US",
                "access_token": oauthClient.token.token.token.access_token
            }
        })

        const tokenData = {
            last_updated: tokenPrice.data.last_updated_timestamp,
            price: tokenPrice.data.price / 10000
        }

        // await db.query('INSERT INTO token_data (time, price) VALUES ($1, $2)', [tokenData.last_updated, tokenData.price])
        res.status(200).json(tokenData)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'server error, contact chelk' })
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))