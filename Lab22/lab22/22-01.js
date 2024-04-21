const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cron = require('node-cron');
const Subscriber = require('./database');
require('dotenv').config();

const token = process.env.TOKEN;

const bot = new TelegramBot(token, {polling: true});

cron.schedule('0 15 * * *', async () => {
    const subscribers = await Subscriber.findAll();
    const data = await axios.get(`https://api.api-ninjas.com/v1/facts?limit=1`, {
        headers: {
            'Accept': 'application/json',
            'X-Api-Key': process.env.FACTS_API_KEY
        }
    });
    const fact = `FACT!\n${data.data[0].fact}`;

    subscribers.forEach((subscriber) => {
        bot.sendMessage(subscriber.chat_id, fact);
    });
});

bot.onText(/\/joke/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('/joke', chatId);

    const joke = await axios.get('https://official-joke-api.appspot.com/random_joke', {
        headers: {'Accept': 'application/json'}
    });
    if (joke.data) {
        await bot.sendMessage(chatId, `${joke.data.setup}\n${joke.data.punchline}`)
    } else {
        await bot.sendMessage(chatId, 'Шуток не будет :(')
    }
});

bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const subscriber = await Subscriber.findOne({where: {chat_id: chatId}});
    if (!subscriber) {
        await Subscriber.create({chat_id: chatId});
        await bot.sendMessage(chatId, 'Вы успешно подписались на ежедневную рассылку фактов.');
    } else {
        await bot.sendMessage(chatId, 'Вы уже подписаны на ежедневную рассылку.');
    }
})

bot.onText(/\/unsubscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const subscriber = await Subscriber.findOne({where: {chat_id: chatId}});

    if (subscriber) {
        await Subscriber.destroy({
            where: {chat_id: chatId}
        });
        await bot.sendMessage(chatId, 'Вы успешно отписались от ежедневной рассылки фактов.');
    } else {
        await bot.sendMessage(chatId, 'Вы уже отписались от ежедневной рассылки.');
    }
})

bot.onText(/\/cat/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('/cat', chatId);

    const cat = await axios.get('https://api.thecatapi.com/v1/images/search');
    const {data} = await axios.get(cat.data[0].url, {responseType: "stream"});
    if (data) {
        await bot.sendPhoto(chatId, data);
    } else {
        await bot.sendMessage(chatId, `Image not found`);
    }
})

bot.onText(/\/weather (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    console.log('/weather', chatId);

    const result = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${match[1]}&lang=ru&units=metric&appid=${process.env.WEATHER_API_KEY}`, {
        headers: {'Accept': 'application/json'}
    });

    const weather = result.data.weather[0];
    const main = result.data.main;
    const wind = result.data.wind;

    const resultWeather = {
        description: weather.description,
        temp: main.temp.toFixed(1).replace('.', '\\.'),
        feels_like: main.feels_like.toFixed(1).replace('.', '\\.'),
        humidity: main.humidity,
        wind: wind.speed.toString().replace('.', '\\.'),
        city: result.data.name
    };

    const response = `*Погода в городе ${resultWeather.city}*
Сейчас ${resultWeather.description}
Температура ${resultWeather.temp}°C, ощущается как ${resultWeather.feels_like}°C
Влажность ${resultWeather.humidity}%, скорость ветра ${resultWeather.wind} м/с
    `;

    await bot.sendMessage(chatId, response, {parse_mode: 'MarkdownV2'});
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text !== undefined) {
        if (msg.text.startsWith('/')) return;

        if (msg.text.toLowerCase() === 'привет' || msg.text.toLowerCase() === 'hello')
            await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEEudZmHNmrJMD2YJWWn3OVrbvbuGDsEQACRwADVrbpF9PXvhB28WAiNAQ');
        else
            await bot.sendMessage(chatId, `echo: ${msg.text}`);
    }
})

bot.on('polling_error', (error) => {
    console.log(error.code);
});
