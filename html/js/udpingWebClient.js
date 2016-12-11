var settings = {
    host: {
        ip: "localhost",
        port: "3012"
    }
}
const ip = require("ip");
const io = require('socket.io-client');

class UdpingWebClient {
    constructor(settings, networkCallback) {
        this.hostIP = settings.host.ip;
        this.hostPort = settings.host.port;
        this.myIP = ip.address();

        let hostAddress = this.hostIP + ":" + this.hostPort;

        //ソケット通信を開く。
        this.socket = io(hostAddress);
        //コネクションが開いた時のバインド。
        this.socket.on("connect", function() {
            console.log(`［UDPING WEB Client］socketio to ProxyServer::${hostAddress} is connected.`)
        });
        //ネットワーク周りを受信したらnetworkCallbackを実行。
        this.socket.on("network", function(data) {
            networkCallback(data);
            console.log(`［UDPING WEB Client］］NET WORK DATA.`);
        });
    }

    init(webenv) {
        /**
         * webenv = {
         * host:サーバーのIP,
         * port:サーバーのポート番号,
         * wait:何ミリ秒おきに送るか タイムアウト時間はその二倍
         * }
         */
        this.socket.emit("init", webenv);
    }

    stop() {
        //複数起動出来るようにしたいのでそのあたりもまた考える。
        this.socket.emit("stop");
    }


}

module.exports = UdpingWebClient;