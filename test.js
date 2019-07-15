const zookeeper = require('./index');
const STATE = zookeeper.State;
const ACL = zookeeper.ACL;
const CreateMode = zookeeper.CreateMode;

const options = {
    id: "myregistry",
    address: "zk3.kktv2.com:2181,zk2.kktv2.com:2181,zk1.kktv2.com:2181", // zk1.kktv2.com:2181,zk2.kktv2.com:2181,zk3.kktv2.com:2181
    timeout: 30000,
    retries: 3,
    spinDelay: 1000,
    reconnectTimes: 3
}


var client = zookeeper.createClient(options.address, {
    sessionTimeout: options.timeout,
    retries: options.retries,
    spinDelay: options.spinDelay
});


var watcher = function (event) {
    console.info('data event: -------------> ', JSON.stringify(event))
}

var watcher1 = function (event) {
    console.info('data event: ----------------> ', JSON.stringify(event))
}
var init = function (cb) {

    // var timer = setTimeout(function (err) {
    //     throw new 
    // }, 1000 * 15);

    client = zookeeper.createClient(options.address, {
        sessionTimeout: options.timeout,
        // sessionId: 100000,
        retries: options.retries,
        spinDelay: options.spinDelay
    });

    client.once(`connected`, () => {
        console.warn(`zk  connected`);

        let path = '/test/cs';
        let data = '常赛';
        // client.mkdirp(path, new Buffer(data), ACL.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT, (err, path) => {
        //     console.log('mkdirp', err, path);

        client.getData(path, watcher, function (err, data, stat) {
            console.error('getData', JSON.stringify(err) || err.stack);
            console.log('getData', err, data.toString(), JSON.stringify(stat));
        })

        client.exists(path, watcher1, function (err, stat) {
            console.error('exists', JSON.stringify(err) || err.stack);
            console.info('exists', JSON.stringify(stat));
        })

        client.setData(path, new Buffer(data + Math.random()), function (err, stat) {
            console.error('setData', JSON.stringify(err) || err.stack);
            console.info('setData', JSON.stringify(stat));
        })

        // });

        // setInterval(function () {
        //     console.error('尝试改变数据');
        //     client.setData(path, new Buffer(data + Math.random()), function (err, stat) {
        //         console.error('改变数据成功');
        //     })
        // }, 2000);


    })

    client.once('disconnected', () => {
        console.warn(`zk  disconnected`);
    });

    client.once(`expired`, () => {
        console.warn(`zk session timeout`);
        if (client.getState() == STATE.EXPIRED) {
            console.info('begin reconnect');
            init();
        }
    })

    client.connect();
}

init();