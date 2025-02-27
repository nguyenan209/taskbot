const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const schedule = require('node-schedule');
const connectDB = require('../config/database');
const taskHandlers = require('../handlers/taskHandlers');

const token = '7969158574:AAEe1btSBENJVYRCJciEVcSEbKQWDPuq5gk';
const bot = new TelegramBot(token);
const app = express();

const CHAT_ID = 'YOUR_CHAT_ID_HERE'; // Thay bằng chat ID thực tế của bạn

// Middleware để parse JSON từ Telegram
app.use(express.json());

// Kết nối database
connectDB();

// Webhook endpoint
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// Xử lý các lệnh
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
    const helpMessage = `
🤖 *Hướng dẫn sử dụng Bot Task Manager*:

✅ *Thêm Task*  
_Gửi:_  
\`Task: [Android|iOS|Web|BE] Nội dung task\`  
_Ví dụ:_  
\`Task: Android Fix lỗi login\`  

✅ *Xóa Task*  
_Gửi:_  
\`Done: [ID task]\`  
_Ví dụ:_  
\`Done: 3\`  

✅ *Xem danh sách Task còn lại*  
\`/tasks\`  

✅ *Xem Task theo nền tảng*  
\`/Android\` – Xem danh sách Task Android  
\`/iOS\` – Xem danh sách Task iOS  
\`/Web\` – Xem danh sách Task Web  
\`/BE\` – Xem danh sách Task Backend  

📌 *Liên hệ Admin nếu cần thêm tính năng!* 🚀  
    `;
    bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

// Lên lịch báo cáo hàng ngày (chạy trong một endpoint riêng nếu cần)
app.get('/schedule-report', (req, res) => {
    taskHandlers.sendDailyBugReport(bot, CHAT_ID);
    res.send('Daily report triggered');
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server chạy trên port ${PORT}`);
});

module.exports = app;