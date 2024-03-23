import { http } from '@google-cloud/functions-framework'
import TelegramBot from 'node-telegram-bot-api'
import { handleCatch, getTanglePrices } from './functions/index.js'
import { Storage } from '@google-cloud/storage'

let storage = new Storage()
let bucket = storage.bucket('tngl-bucket0')

http('tnglpricebot', async (req, res) => {
    try {
        if (!req.body.message) throw new Error(JSON.stringify({ error: 'req.body has no property "message"', body: req.body }))
        let message = req.body.message
        if (message.text != '/p' && message.text != '/price') {
            res.writeHead(200).end()
            return
        }
        let tanglePrices = await getTanglePrices().catch(handleCatch)
        let bot = new TelegramBot(String(process.env['token']))
        bot.deleteMessage(message.chat.id, message.message_id).catch(() => {})
        let files = (await bucket.getFiles())[0]
        files.forEach(file => bot.deleteMessage(message.chat.id, file.name).catch(() => {}))
        bucket.deleteFiles({ force: true }).catch(() => {})
        message = await bot.sendMessage(
            message.chat.id, `\`\`\`\n(USD/TNGL)\n${tanglePrices}\n\`\`\``, 
            { parse_mode: "MarkdownV2" }
        ).catch(handleCatch)
        bucket.file(message['message_id']).createWriteStream().end()
        res.writeHead(200).end()
    } catch (e) {
        res.writeHead(200).end()
        console.error(e)
    }
})