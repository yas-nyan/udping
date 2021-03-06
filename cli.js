#!/usr/bin/env node

/**
 *　UDPINGのノードをスタートする。
 * 
 */
"use strict";
/**
 * npm dependences
 */
const ip = require("ip");
const opts = require("opts");

/**
 * lib dependences
 * 
 */
const Udping = require("./index.js");

opts.parse([

    {
        "short": 's',
        'long': "server",
        "description": "use server mode",
        "value": false,
        "required": false
    },
    {
        "short": 'p',
        'long': "port",
        "description": "server port number",
        "value": true,
        "required": false
    },
    {
        "short": 'h',
        'long': "host",
        "description": "server host name",
        "value": true,
        "required": false
    },
    {
        "short": 'f',
        'long': "file",
        "description": "output text file path",
        "value": true,
        "required": false
    },
    {
        "short": "i",
        "long": "wait",
        "description": "wait time  between sending each packet.(second)",
        "value": true,
        "required": false
    },
    {
        "short": "t",
        "long": "time",
        "description": "time in seconds to transmit for (default Infinity)",
        "value": true,
        "required": false
    }
], true);

var mode;
//-sオプション,-cオプションがtrueだった時の処理。
if (opts.get("server")) {
    mode = "server";
} else if (opts.get("client")) {
    mode = "client;"
}

const env = {
    //サーバーorクライアント クライアントが初期値。
    mode: mode || "client",
    //サーバーのホストネーム IP 
    host: opts.get("host") || opts.args()[0] || ip.address(),
    port: opts.get("port") || 55555,
    execTIme: new Date().getTime(),
    savepath: opts.get("file") || `./result_udping/result_${Date.now()}.txt`,
    //何ミリ秒おきに送るか タイムアウト時間はその二倍
    wait: parseInt(opts.get("wait") * 1000) || 1000,
    //回数制限
    time: opts.get("time") || 0,

    //CLIで使う時はコールバック使わないと思う。
}

var udping = new Udping(env);