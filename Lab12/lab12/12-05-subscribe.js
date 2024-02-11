const redis = require('redis');
const client = redis.createClient({ url: 'redis://localhost:6379' });

client.on('ready', () => console.log('ready'));
client.on('error', (e) => console.log('error', e));
client.on('connect', () => console.log('connect'));
client.on('end', () => console.log('end'));

(async () => {
    const channelsSub = client.duplicate();
    await channelsSub.connect();

    await channelsSub.pSubscribe('channel*', (msg, channel) => {
        console.log(`Channel ${channel} sent message: ${msg}`);
    }, true);

    setTimeout(async () => {
        await channelsSub.pUnsubscribe();
        await channelsSub.quit();
    }, 10000);
})();