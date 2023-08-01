import { config } from 'dotenv';
config();

import axios from 'axios';
import { Telegraf } from 'telegraf';

const telegramBotToken: any = process.env.TELEGRAM_BOT_TOKEN;
const chuckNorrisApiUrl = 'https://api.chucknorris.io/jokes/random';
const chuckNorrisCategoryApiUrl = 'https://api.chucknorris.io/jokes/random?category=';
const chuckNorrisCategoriesApiUrl = 'https://api.chucknorris.io/jokes/categories'

const bot = new Telegraf(telegramBotToken);

bot.start(async (ctx) => {
  const chatId = ctx.chat?.id;

  let response = await axios.get(chuckNorrisCategoriesApiUrl);
  let categories: Array<any> = await response.data;

  if (chatId) {
    const categoryButtons = categories.map((item) => ({
      text: `/joke ${item}`,
    }));

    const categoryButtonRows: Array<any> = categoryButtons.map((button) => [button]); // Each row contains one button

    const message =
      `Welcome to Chuck Norris bot. Type /joke for facts.`;

    ctx.telegram.sendMessage(chatId, message, {
      reply_markup: {
        keyboard:  categoryButtonRows,
        resize_keyboard: true, // Allow the keyboard to resize
        one_time_keyboard: true, // Hide the keyboard after the user makes a selection
      },
    });
  }
});


bot.on('text', async (ctx) => {
  const chatId = ctx.chat?.id;
  const inputText = ctx.message?.text;
  
  if (chatId && inputText) {
    const jokeCommandRegex = /^\/joke\b(.+)?/;
    const match = inputText.match(jokeCommandRegex);

    if (match) {
      const category = match[1]?.trim();
      
      try {
        const response = category
          ? await axios.get(`${chuckNorrisCategoryApiUrl}${encodeURIComponent(category)}`)
          : await axios.get(chuckNorrisApiUrl);

        const joke = response.data.value;

        if (joke) {
          ctx.telegram.sendMessage(chatId, joke);
        } else {
          const message = category
            ? `"${category}" kateqoriyasında zarafat tapılmadı. Fərqli kateqoriya yoxlayın`
            : 'Zarafat tapılmadı. Yenidən yoxlayın.';

          ctx.telegram.sendMessage(chatId, message);
        }
      } catch (error) {
        ctx.telegram.sendMessage(chatId, `"${category}" kateqoriyasında zarafat tapılmadı. Fərqli kateqoriya yoxlayın`);
      }
    }
  }
});

bot.launch().then(() => {
  console.log('Bot started!');
});