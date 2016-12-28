var fs = require('fs');
const exec = require('child_process').exec;

const CONFIG = JSON.parse(fs.readFileSync('./config.json'));

var TelegramBot = require('node-telegram-bot-api');

var token = CONFIG['BOT_TOKEN'];
// Setup polling way
var bot = new TelegramBot(token, {
    polling: {
        interval: 10000
    }
});

bot.on('message', function (msg) {
    var chatId = msg.chat.id;

    if (msg.text === '/photo') {

        exec('sh ./capture_photo.sh', function (error, stdout, stderr) {
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

    if (msg.text === '/video') {

        exec('sh ./capture_video.sh', function (error, stdout, stderr) {
            if (error) {
                console.error('exec error:', error);
                return;
            }

            console.log(stderr);
            console.log(stdout);

            var path = String(stdout).trim();
            bot.sendVideo(chatId, path);
        });

        bot.sendChatAction(chatId, 'upload_video');
    }

});
