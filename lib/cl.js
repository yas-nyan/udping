/**
 * UDPING client 
 */
"use strict";
const dgram = require("dgram");
const ip = require("ip");
const fs = require("fs");
const path = require("path");

class Client {
    constructor(host, port, wait, path, time, errCallback, successCallback) {

        // この host,portは送り先を指す。
        this.host = host;
        this.port = port;
        this.count = 0;
        //何ミリ秒おきに送るか
        this.wait = wait || 1000;
        //回数制限
        this.time = Number(time) || 0;
        //保存先のパス
        this.savepath = path;
        //送ったらtrueになる
        this.sentflag = false;
        //最後に送った時間
        this.LaststartTime;
        //TimeoutやError が起こった際に呼ばれる関数。ない場合はfalseを入れる。
        this.errCallback = errCallback || false;
        //正しく受け取れた時の関数
        this.successCallback = successCallback || false;

        //ソケット
        this.socket = dgram.createSocket("udp4");

        //タイマーはここに入れる
        this.timer = null;
        //スタンバイ
        this.stanby();


    }

    stanby() {
        //関数内でこのインスタンスのパラメーターにアクセスするために宣言。多分あんまり良くない
        let thisclient = this;
        //client側のポートはサーバー側の+1とする
        this.socket.bind(Number(this.port) + 1);
        //
        thisclient.socket.on("listening", function() {
            let address = thisclient.socket.address();
            //サーバーの情報
            let host = thisclient.host;
            let port = thisclient.port;

            //logを表示する。
            let log_msg = `[UDPING]:CLIENT Client : ${address.address}:${address.port}\n[UDPING]:CLIENT Server : ${host}:${port}`;
            console.log(log_msg);
            //ディレクトリの存在を確認する。
            let dir = path.dirname(thisclient.savepath);
            if (fs.existsSync(dir)) {
                //既にディレクトリが存在していれば、
                //書き込む
                fs.writeFile(thisclient.savepath, `${log_msg}\n`, "utf8", () => {
                    console.log(`[UDPING]:CLIENT SAVEPATH=>${thisclient.savepath}`)
                });
            } else {
                //存在して無ければ
                //ディレクトリを作成して
                fs.mkdirSync(dir);
                //書き込む
                fs.writeFile(thisclient.savepath, `${log_msg}\n`, "utf8", () => {
                    console.log(`[UDPING]:CLIENT SAVEPATH=>${thisclient.savepath}`)
                });
            }
        });

        //メッセージを受信した時、
        thisclient.socket.on("message", function(msg, rinfo) {
            ///受け取ったmsgの13文字目までが時間。なので、msgの13文字目までを切り取る。
            let endTime = new Date();
            let RTT = endTime.getTime() - Number(msg.slice(0, 13));
            //シーケンス番号を受け取る。 最初の13文字をなくしたものがそれ。
            let msg_count = Number(msg.slice(13));
            //logを表示する。
            let log_msg = `[UDPING]:CLIENT ${endTime.getTime()} ${rinfo.address}:${rinfo.port} RTT: ${RTT} ms. COUNT: ${msg_count}`;
            console.log(log_msg);
            //ファイルにログを書き込む
            fs.appendFileSync(thisclient.savepath, `${log_msg}\n`, 'utf8');
            //もし成功時のcallbackが存在すれば実行
            if (thisclient.successCallback) {
                //backObjに必要そうな情報を入れる
                let backObj = {
                    "endTime": endTime.getTime(),
                    "RTT": RTT,
                }
                thisclient.successCallback(backObj);
            }

            //LaststartTimeを更新しておく
            thisclient.LaststartTime = endTime.getTime();

            //受け取ったのでfalseに。
            thisclient.sentflag = false;




        });
        //絶えず送信する
        thisclient.timer = setInterval(function() {
            thisclient.send();
        }, this.wait);
    }

    send() {
        let sendTime = new Date();
        //最後に発射した時間を入れておく
        this.LaststartTime = sendTime.getTime();
        //bufferの中身は
        /**
         * bufferInside = 時間count番号 (文字列連結)
         * 
         */
        let bufferInside = this.LaststartTime.toString();
        //13文字目まではUNIXTIME。(UNIXTIMEが終わるまではなんとかなる。)
        let message = new Buffer(bufferInside + this.count);

        //現在のflagを確認
        let flag = this.sentflag;
        //関数内でこのインスタンスのパラメーターにアクセスするために宣言。多分あんまり良くない
        let thisclient = this;
        thisclient.socket.send(message, 0, message.length, thisclient.port, thisclient.host, function(err, bytes) {
            if (err) throw err;

            //まだ前に送ったやつを受け取ってなければ(sentflagがtrueのままなら)タイムアウト表示する。今送ったやつの-2個目がタイムアウトしてるやつ。
            if (flag) {
                //最初にerr用のコールバックがあれば実行。
                if (thisclient.errCallback) {
                    thisclient.errCallback();
                }

                let now = new Date();
                //2個前のもの
                let timeoutCount = thisclient.count - 2;
                //log表示
                let log_msg = `[UDPING]:CLIENT ${now.getTime()} REQUEST TIME OUT. COUNT: ${timeoutCount}`;
                console.log(log_msg);
                fs.appendFileSync(thisclient.savepath, `${log_msg}\n`, 'utf8');
            } else {
                //console.log('UDP message sent to ' + SERVER_INFO.ip +':'+ SERVER_INFO.port + ":");
            }
        });
        //送ったのでflagをtrueに。
        this.sentflag = true;
        //シーケンス番号を足す
        this.count++;

        //もし、-tオプションで設定した制限回数に達していて、その回数だけレスポンスが帰ってきていたら、(かつ、thisclient.time !== 0)
        if (this.time != 0 && this.count > this.time + 1) {
            console.log("[UDPING]:CLIENT PROCESS FINISH.");
            process.exit(0);
        }






    }

    stop() {
        //タイマーを止める。
        clearInterval(this.timer);
        //止める。
        this.socket.close();
    }

}


//モジュールに
module.exports = Client;