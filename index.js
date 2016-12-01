/**
 *　UDPINGのノードをスタートする。
 * 
 */
"use strict";
/**
 * npm dependences
 */
const ip = require("ip");
/**
 * lib dependences
 * 
 */
const Client = require("./lib/cl.js");
const Server = require("./lib/sv.js");


/**
 * 
 * env options.
 */
const _env = {
    //サーバーorクライアント クライアントが初期値。
    //mode: "client",
    mode: "server",
    //サーバーのホストネーム IP 
    host: "localhost",
    port: 55555,
    execTIme: new Date().getTime(),
    savepath: `./result_udping/${Date.now()}_result.txt`,
    //何ミリ秒おきに送るか タイムアウト時間はその1.5倍となっています。
    wait: 1000,
    //タイムアウトやエラーが起きた時のcallback。初期設定はプリミティブ型のfalseを入れておく。
    errCallback: false,
    //成功時のcallback.
    successCallback: false
}



class Udping {
    constructor(env) {
        //引数がない場合、グローバルのenvが入る。
        this.env = env || _env;
        //はじめに、クライアントかサーバーかをはっきりさせる。
        switch (this.env.mode) {
            case "client":
                this.client = new Client(this.env.host, this.env.port, this.env.wait, this.env.savepath, this.env.time, this.env.errCallback, this.env.successCallback);
                console.log("Client start!");
                break;
            case "server":
                this.server = new Server(this.env.host, this.env.port, this.env.wait * 1.5, this.env.errCallback, this.env.successCallback);
                console.log("Server start!");
                break;
            default:
                console.log("Invailed process.env.mode. server or client");
                process.exit(1);
                break;
        }
    }
}

module.exports = Udping;