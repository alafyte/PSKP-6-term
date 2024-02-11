const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('ready', () => console.log('ready'));
client.on('error', (e) => console.log('error', e));
client.on('connect', () => console.log('connect'));
client.on('end', () => console.log('end'));


(async () => {
    await client.connect();

    setTimeout(async () => {
        await client.publish('channel1', 'Message 1');
    }, 1500);

    setTimeout(async () => {
        await client.publish('channel2', 'Message 2');
    }, 3000);

    setTimeout(async () => {
        await client.quit();
    }, 9000);
})();