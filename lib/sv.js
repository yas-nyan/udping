/**
 * UDPING server
 */
"use strict";
const dgram = require("dgram");
const ip = require("ip");

class Server {

    constructor(host, port, wait) {
        this.host = host ;
        this.port = port ;

        //UDPのソケットをあける
        this.socket = dgram.createSocket("udp4");
        //タイムアウトとする時間。デフォルトは1500
        this.wait = wait || 1500;
        //TIMEOUTを検知するタイマー タイムアウトは1500ミリ秒で検知する。
        this.timeoutCheck = setInterval(this.TIMEOUT, this.wait);
        //TIMEOUTするとtrueになる。
        this.timeoutFlag = false;

        //スタンバイ
        this.stanby();

    }

    stanby() {
        //関数内でクラスを参照するために変数に入れる。
        let thisserver = this;
        //サーバーを立てる。
        thisserver.socket.bind(thisserver.port,thisserver.host);

        //受付を開始すると呼ばれる。
        thisserver.socket.on("listening", function () {
            let address = thisserver.socket.address();
            console.log(`UDPING Server : ${address.address}:${address.port}`);
        });

        //メッセージを受け取ると呼ばれる。
        thisserver.socket.on("message", function (msg, rinfo) {
            //timerを終了させる。
            clearInterval(thisserver.timeoutCheck);
            //片道の時間を求める。msgの13文字目までがUNIXTIME,それ以降はシーケンス番号。
            let checkTime = new Date();
            let msgCount = msg.slice(13);
            let katamichiTT = checkTime.getTime() - Number(msg.slice(0,13));
            console.log(`${checkTime.toTimeString()} ${rinfo.address}:${rinfo.port} HTT: ${katamichiTT} ms. COUNT: ${msgCount}`);
            //メッセージを返す。
            thisserver.returnMsg(msg, rinfo);

        });

        //エラーで呼ばれる。
        thisserver.socket.on("error", function (err) {
            console.log("server error:\n" + err.stack);
            thisserver.socket.close();
        });

    }
    TIMEOUT() {
        console.log("UDPING REQUEST TIMEOUT");
        //タイムアウトしたのでtrueにする。
        this.timeoutFlag = true;
    }

    stop() {
        //止める
        this.socket.close();
    }


    returnMsg(msg, rinfo) {
        //関数内でクラスを参照するために変数に入れる。
        let thisserver = this;
        //クライアントにメッセージをそのまま返す
        thisserver.socket.send(msg, 0, msg.length, rinfo.port, rinfo.address, function (err, bytes) {
            if (err) throw err;
            //console.log('RETURN MSG TO : ' + rinfo.address + ':' + rinfo.port);
        });
        //返したのでタイマースタート
        this.timeoutCheck = setInterval(this.TIMEOUT, this.wait);

    }
}


//モジュール化

module.exports = Server;