

const html = require("fs").readFileSync(__dirname + "/../index.html");

const server = require('http').createServer(
    (req, res) => {
        if (req.url.match(/^\/?(\??.*)$/)) {
            res.writeHead(200, {"content-type": "text/html"});
            res.end(html);
        }
    }
);
const io = require('socket.io')(server);

let interval = null;
let lastSent = [];
let updated =  null;

module.exports = {
    start(minInterval, callback) {
        this.stop();
        interval = setInterval(
            () => this.run(),
            minInterval
        );

        server.listen(8080, callback);
    },
    run() {
        if (updated) {
            const chk = JSON.stringify(updated);
            if (chk === lastSent)
                return;

            lastSent = chk;

            io.emit("data", updated);
            updated = null;
        }
    },
    stop() {
        clearInterval(interval);
        server.close();
    },
    update(data) {
        updated = data;
    }
};
