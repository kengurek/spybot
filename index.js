var fs = require('fs');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const killProcess = require('./utils/').killProcess;

const CONFIG = JSON.parse(fs.readFileSync('./config.json'));

var TelegramBot = require('node-telegram-bot-api');

var token = CONFIG['BOT_TOKEN'];
// Setup polling way
var bot = new TelegramBot(token, {
    polling: {
        interval: 1000
    }
});

var audiosArr = [];
onAudiosArrayUpdate();
fs.watch('./audios', {}, onAudiosArrayUpdate);
function onAudiosArrayUpdate() {
    audiosArr = fs.readdirSync('./audios/').filter(track => track.indexOf('.mp3') > -1);
}

var ls;
var currentIndex = -1;

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
    } else if (msg.text === '/video') {

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
    } else if (msg.text === '/audio') {
        sendAudiosAvailable(chatId);
    } else if (!isNaN(msg.text.substr(1))) {
        play(Number(msg.text.substr(1)) - 1, chatId);
    } else if (msg.text == 'ПРЕДЫДУЩАЯ') {
        play(currentIndex - 1, chatId);
    }
    else if (msg.text == 'СЛЕДУЮЩАЯ') {
        play(currentIndex + 1, chatId);
    } else if (msg.text == 'СТОП') {
        if (ls) {
            killProcess(ls.pid);
        }
        sendAudiosAvailable(chatId);
    }
});

function sendAudiosAvailable(chatId) {
    var commands = [];
    var keyboard = [];
    var row = [];
    var message = '';
    audiosArr.forEach((track, index) => {
        const trackName = track.replace(/[0-9]+\-/, '').replace('.mp3', '');
        var command = '/' + (index + 1);
        commands.push(command);
        message += command + ' ' + trackName + '\n';
    })

    commands.forEach(function (command) {
        row.push(command);
        if (row.length == 10) {
            keyboard.push(row);
            row = [];
        }
    })
    keyboard.push(row);

    bot.sendMessage(chatId, message, {parse_mode: 'HTML', reply_markup: {keyboard: keyboard}});
}

function play(index, chatId) {
    if (index < 0) {
        currentIndex = -1;
        return;
    }
    if (index >= audiosArr.length) {
        currentIndex = audiosArr.length;
        return;
    }
    const track = audiosArr[index];
    if (!track) {
        return;
    }
    currentIndex = index;
    const trackName = track.replace(/[0-9]+\-/, '').replace('.mp3', '');
    const nav = [];
    if (currentIndex > 0) {
        nav.push('ПРЕДЫДУЩАЯ');
    }
    if (currentIndex < audiosArr.length - 1) {
        nav.push('СЛЕДУЮЩАЯ');
    }

    bot.sendMessage(chatId, trackName, {reply_markup: {keyboard: [nav, ['СТОП']]}});

    if (ls) {
        killProcess(ls.pid);
    }

    ls = spawn('/usr/bin/omxplayer', ['./audios/' + track]);
}
