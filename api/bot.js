const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const schedule = require('node-schedule');
const connectDB = require('../config/database');
const taskHandlers = require('../handlers/taskHandlers');

const token = '7969158574:AAEe1btSBENJVYRCJciEVcSEbKQWDPuq5gk';
const bot = new TelegramBot(token, { polling: true });
const app = express();

const CHAT_ID = 'YOUR_CHAT_ID_HERE'; // Thay bằng chat ID thực tế

app.use(express.json());
connectDB();

app.get('/', (req, res) => {
    return res.send({ message: "Welcome to an's bot" });
});

bot.onText(/^Done: (.+)/i, (msg, match) => {
    taskHandlers.deleteTaskByContent(msg, match[1], bot);
});

bot.onText(/\/tasks/, (msg) => {
    taskHandlers.listTasks(msg, bot);
});

bot.onText(/^Task: (Android|iOS|Web|BE) (.+)/i, (msg, match) => {
    taskHandlers.addTask(msg, match[1], match[2], bot);
});

bot.onText(/^Done: (\d+)/i, (msg, match) => {
    taskHandlers.deleteTaskById(msg, parseInt(match[1]), bot);
});

bot.onText(/^\/task(s)?/i, (msg) => {
    taskHandlers.listAllTasks(msg, bot);
});

bot.onText(/^\/(Android|iOS|Web|BE)/i, (msg, match) => {
    taskHandlers.filterTasksByPlatform(msg, match[1], bot);
});

bot.onText(/^\/help/, (msg) => {
    const helpMessage = `...`; // Giữ nguyên phần help
    bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

schedule.scheduleJob({ hour: 11, minute: 30 }, () => {
    taskHandlers.sendDailyBugReport(bot, CHAT_ID);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy trên port ${PORT}`);
});

module.exports = app;