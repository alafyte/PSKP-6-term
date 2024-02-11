const redis = require('redis')

const client = redis.createClient({url: 'redis://localhost:6379'});

client.on('ready', () => console.log('ready'));
client.on('error', (e) => console.log('error', e));
client.on('connect', () => console.log('connect'));
client.on('end', () => console.log('end'));

(async () => {
    await client.connect();

    await client.set('incr', 0);

    console.time('INCR');
    for (let i = 0; i < 10000; i++) {
        await client.incr('incr');
    }
    console.timeEnd('INCR');


    console.time('DECR');
    for (let i = 0; i < 10000; i++) {
        await client.decr('incr');
    }
    console.timeEnd('DECR');

    await client.quit();
})();