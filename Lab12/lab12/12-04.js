const redis = require('redis')

const client = redis.createClient({url: 'redis://localhost:6379'});

client.on('ready', () => console.log('ready'));
client.on('error', (e) => console.log('error', e));
client.on('connect', () => console.log('connect'));
client.on('end', () => console.log('end'));

(async () => {
    await client.connect();

    console.time('HSET');
    for (let i = 1; i <= 10000; i++) {
        await client.hSet('myhash', i.toString(), JSON.stringify({id: i, val: `val-${i}`}));
    }
    console.timeEnd('HSET');


    console.time('HGET');
    for (let i = 0; i < 10000; i++) {
        await client.hGet('myhash', i.toString());
    }
    console.timeEnd('HGET');

    await client.quit();
})();