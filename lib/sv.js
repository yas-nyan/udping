/**
 * UDPING server
 */
"use strict";
const dgram = require("dgram");
const ip = require("ip");

class Server {

    constructor(host, port, wait, errCallback, successCallback) {
        this.host = host;
        this.port = port;

        //UDPのソケットをあける
        this.socket = dgram.createSocket("udp4");
        //タイムアウトとする時間。デフォルトは1500
        this.wait = wait || 1500;

        //TIMEOUTを検知するタイマー。
        //アロー関数を使うことでtこのインスタンス自体を表すthisが使える！
        this.timeoutCheck = setInterval(() => {
            //エラー用のコールバックが存在する時は実行。（指定しなかった時はプリミティブ型のfalseが入ってる。）
            if (this.errCallback) {
                this.errCallback();
            }
            this.TIMEOUT();
        }, this.wait);

        //TIMEOUTするとtrueになる。
        this.timeoutFlag = false;

        //TimeoutやError が起こった際に呼ばれる関数。ない場合はfalseを入れる。
        this.errCallback = errCallback || false;
        //正しく受け取れた時に実行する関数。ない場合はfalseを入れる。
        this.successCallback = successCallback || false;

        //スタンバイ
        this.stanby();

    }

    stanby() {
        //関数内でクラスを参照するために変数に入れる。
        let thisserver = this;
        //サーバーを立てる。
        thisserver.socket.bind(thisserver.port, thisserver.host);

        //受付を開始すると呼ばれる。
        thisserver.socket.on("listening", function() {
            let address = thisserver.socket.address();
            console.log(`[UDPING]:SERVER Server : ${address.address}:${address.port}`);
        });

        //メッセージを受け取ると呼ばれる。
        thisserver.socket.on("message", function(msg, rinfo) {
            //timerを終了させる。
            clearInterval(thisserver.timeoutCheck);
            //片道の時間を求める。msgの13文字目までがUNIXTIME,それ以降はシーケンス番号。
            let checkTime = new Date();
            let msgCount = msg.slice(13);
            let katamichiTT = checkTime.getTime() - Number(msg.slice(0, 13));
            //メッセージを返す。
            thisserver.returnMsg(msg, rinfo);
            console.log(`[UDPING]:SERVER ${checkTime.getTime()} ${rinfo.address}:${rinfo.port} HTT: ${katamichiTT} ms. COUNT: ${msgCount}`);
            //successCallbackが存在していれば、
            if (thisserver.successCallback) {
                let backObj = {
                    "endTime": endTime.getTime(),
                    "HTT": katamichiTT,
                }
                successCallback(backObj);
            }

        });

        //エラーで呼ばれる。
        thisserver.socket.on("error", function(err) {
            console.log("[UDPING]:SERVER server error:\n" + err.stack);
            thisserver.errCallback();
            thisserver.socket.close();
        });

    }
    TIMEOUT() {
        console.log("[UDPING]:SERVER REQUEST TIMEOUT");
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
        thisserver.socket.send(msg, 0, msg.length, rinfo.port, rinfo.address, function(err, bytes) {
            if (err) throw err;
        });
        //返したのでタイマースタート
        this.timeoutCheck = setInterval(() => {
            //エラー用のコールバックが存在する時は実行。（指定しなかった時はプリミティブ型のfalseが入ってる。）
            if (this.errCallback) {
                this.errCallback();
            }
            this.TIMEOUT();
        }, this.wait);

    }
}


//モジュール化

module.exports = Server;