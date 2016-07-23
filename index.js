var fs = require('fs');
const exec = require('child_process').exec;

const CONFIG = JSON.parse(fs.readFileSync('./config.json'));

var TelegramBot = require('node-telegram-bot-api');

var token = CONFIG['BOT_TOKEN'];
// Setup polling way
var bot = new TelegramBot(token, {
    polling: {
        timeout: 30
    }
});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;

    if (msg.text === '/photo') {

        exec('sh ./capture.sh', function (error, stdout, stderr) {
            if (error) {
                console.error('exec error:', error);
                return;
            }

            console.log(stderr);
            console.log(stdout);

            var path = String(stdout).trim();
            bot.sendPhoto(chatId, path);
        });

        bot.sendChatAction(chatId, 'upload_photo');
    }

});