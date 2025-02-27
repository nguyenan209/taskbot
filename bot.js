const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

// replace the value below with the Telegram token you receive from @BotFather
const token = '7969158574:AAEe1btSBENJVYRCJciEVcSEbKQWDPuq5gk';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});


const TASKS_FILE = 'tasks.json';

// Xóa task đã hoàn thành
bot.onText(/^Done: (.+)/i, (msg, match) => {
    console.log("Received Delete Task command:", match[1]); // Debug log
    const task = match[1].trim();
    const index = tasks.indexOf(task);
    if (index !== -1) {
        tasks.splice(index, 1);
        saveTasks();  // Cập nhật file
        bot.sendMessage(msg.chat.id, `✅ Đã hoàn thành task: *${task}*`, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(msg.chat.id, `⚠ Task *${task}* không tồn tại!`, { parse_mode: 'Markdown' });
    }
});

// Xem danh sách task
bot.onText(/\/tasks/, (msg) => {
    if (tasks.length === 0) {
        bot.sendMessage(msg.chat.id, `🎉 Không có task nào cần làm!`);
    } else {
        const taskList = tasks.map((task, index) => `📌 *${index + 1}. ${task}*`).join("\n");
        bot.sendMessage(msg.chat.id, `📝 Danh sách task còn lại:\n${taskList}`, { parse_mode: 'Markdown' });
    }
});

*/
// Đọc danh sách task từ file JSON
let tasks = [];
if (fs.existsSync(TASKS_FILE)) {
    tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
}

// Hàm lưu task vào file JSON
function saveTasks() {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// 🎯 Thêm Task: Task: [Android/iOS/Web/BE] Nội dung task
bot.onText(/^Task: (Android|iOS|Web|BE) (.+)/i, (msg, match) => {
    const platform = match[1].trim();
    const content = match[2].trim();
    const newTask = {
        id: tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1, // ID tăng dần
        platform,
        content
    };
    tasks.push(newTask);
    saveTasks();
    bot.sendMessage(msg.chat.id, `✅ Đã thêm task [${platform}]: *${content}* (ID: ${newTask.id})`, { parse_mode: 'Markdown' });
});

// 🎯 Xóa Task: Done: ID
bot.onText(/^Done: (\d+)/i, (msg, match) => {
    const taskId = parseInt(match[1]);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        const removedTask = tasks.splice(taskIndex, 1)[0];
        saveTasks();
        bot.sendMessage(msg.chat.id, `✅ Đã xoá task [${removedTask.platform}]: *${removedTask.content}* (ID: ${taskId})`, { parse_mode: 'Markdown' });
    } else {
        bot.sendMessage(msg.chat.id, `⚠ Không tìm thấy task có ID: ${taskId}`);
    }
});

// 🎯 Danh sách Task còn lại
bot.onText(/^\/task(s)?/i, (msg) => {
    if (tasks.length === 0) {
        bot.sendMessage(msg.chat.id, "📭 Không có task nào trong danh sách.");
    } else {
        let taskList = tasks.map(t => `${t.id} - ${t.platform}: ${t.content}`).join("\n");
        bot.sendMessage(msg.chat.id, `📌 *Danh sách Task còn lại:*\n${taskList}`, { parse_mode: 'Markdown' });
    }
});

// 🎯 Lọc danh sách Task theo nền tảng: "Task Android", "Task iOS", "Task Web", "Task BE"
bot.onText(/^\/(Android|iOS|Web|BE)/i, (msg, match) => {
  const platform = match[1].trim();
  const filteredTasks = tasks.filter(t => t.platform.toLowerCase() === platform.toLowerCase());

  if (filteredTasks.length === 0) {
      bot.sendMessage(msg.chat.id, `📭 Không có task nào thuộc *${platform}*.`);
  } else {
      let taskList = filteredTasks.map(t => `${t.id} - ${t.content}`).join("\n");
      bot.sendMessage(msg.chat.id, `📌 *Danh sách Task ${platform}:*\n${taskList}`, { parse_mode: 'Markdown' });
  }
});

// 🎯 Hướng dẫn sử dụng bot
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

const schedule = require('node-schedule');

// 🎯 Hàm gửi báo cáo lỗi hằng ngày vào 9h sáng (UTC+7)
const sendDailyBugReport = () => {
    if (tasks.length === 0) {
        bot.sendMessage(CHAT_ID, "📭 Không có lỗi nào trong hệ thống hôm nay.");
        return;
    }

    let platforms = ["Android", "iOS", "Web", "BE"];
    let report = "📢 *Báo cáo Bug hàng ngày:*\n\n";

    platforms.forEach(platform => {
        let platformBugs = tasks.filter(task => task.platform.toLowerCase() === platform.toLowerCase());

        if (platformBugs.length > 0) {
            report += `*${platform}:*\n`;
            platformBugs.forEach(task => {
                report += `+ ${task.id} - ${task.content}\n`;
            });
            report += "\n";
        }
    });

    bot.sendMessage(CHAT_ID, report, { parse_mode: "Markdown" });
};

// ⏰ Lên lịch gửi báo cáo lỗi vào 9h sáng (UTC+7)
schedule.scheduleJob({ hour: 11, minute: 30 }, sendDailyBugReport);


