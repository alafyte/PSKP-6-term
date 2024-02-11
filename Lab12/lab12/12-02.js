const redis = require('redis')

const client = redis.createClient({url: 'redis://localhost:6379'});

client.on('ready', () => console.log('ready'));
client.on('error', (e) => console.log('error', e));
client.on('connect', () => console.log('connect'));
client.on('end', () => console.log('end'));

(async () => {
    await client.connect();

    console.time('SET');
    for (let i = 1; i <= 10000; i++) {
        await client.set(i.toString(), `set${i}`);
    }
    console.timeEnd('SET');

    console.time('GET');
    for (let i = 1; i <= 10000; i++) {
        await client.get(i.toString());
    }
    console.timeEnd('GET');

    console.time('DEL');
    for (let i = 1; i <= 10000; i++) {
        await client.del(i.toString());
    }
    console.timeEnd('DEL');
    await client.quit();
})();