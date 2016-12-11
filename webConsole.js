#!/usr/bin/env node

/**
 * UDPING WEBCONSOLE
 * 
 * 
 */


/**
 * lib dependences
 */
const express = require("express");
const app = express();
//socketioのサーバーはテスト用
const server = require("http").createServer(app);
const io = require("socket.io")(server);


/**
 * lib dependences
 */
const Udping = require("./index.js");




io.on(`connection`, function(client) {
    console.log("[UDPING WEBCONSOLE]:socket.io connected");

    //このclientが使うudpingclient達
    const udpingClients = []


    client.on('disconnect', function() {
        console.log("[UDPING WEBCONSOLE]:socket.io disconnected");
        for (udping of udpingClients) {
            //作ったものは全部殺す
            udping.client.stop();
        }
    });

    client.on('init', function(webenv) {
        /**
         * webenv はwebから来たenv
         * 
         * webenv = {
         * host:サーバーのIP,
         * port:サーバーのポート番号,
         * wait:何ミリ秒おきに送るか タイムアウト時間はその二倍
         * }
         */
        let udping_env = {
            //udping用のenv
            mode: "client",
            //mode: "server",
            //サーバーのホストネーム IP 
            host: webenv.host,
            port: webenv.port,
            execTIme: new Date().getTime(),
            savepath: `./result_udping/${Date.now()}_result.txt`,
            //何ミリ秒おきに送るか タイムアウト時間はその二倍
            wait: webenv.wait,
            //タイムアウトやエラーが起きた時のcallback。初期設定はプリミティブ型のfalseを入れておく。
            errCallback: function() {
                console.error("[UDPING] TIMEOUT発生!! ");
                let obj = {
                    status: false,
                    endTime: Date.now(),
                    RTT: "1000" //とりあえず仮に1000
                }
                client.emit("network", obj);
            },
            successCallback: function(obj) {
                /**
                 * obj = {
                 *  endTime : "",
                 *  RTT : ""
                 * }
                 */
                obj.status = true;

                client.emit("network", obj);

            }
        }
        console.log("[UDPING WEBCONSOLE]:コンソールから開始命令を受けました。");

        //udpingをスタート
        udpingClients.push(new Udping(udping_env));
    });
    client.on("stop", () => {
        console.log("[UDPING WEBCONSOLE]:stop command is received.");
        for (udping of udpingClients) {
            //作ったものは全部殺す
            udping.client.stop();
        }
    });
    //このクライアントをグローバル変数に入れておく。
    socketioClient = client;
});


app.use(express.static('html'));
server.listen(3012);