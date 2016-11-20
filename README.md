# UDPING

## instalation
```shell:~/
npm install udping
```


## EXAMPLE

```shell:~/udping/
npm start 
```

### options

Show this help message
    --help
Wait wait seconds between sending each packet.
    -t, --time <value>
Wait wait seconds between sending each packet.
    -i, --wait <value>
output text file path
    -f, --file <value>
server host name
    -h, --host <value> 
server port number
    -p, --port <value>
use server mode
    -s, --server
use client mode
    -c, --client

## module

```node:yourscript.js
const Udping =require("udping");
cosnt Server = new Udping(env).server;


/*

env = {
    //server or client  default:client
    mode:  mode || "client",
    //server host name default:ip.address();
    host: opts.get("host") || opts.args()[0] || ip.address(),
    // server port default:55555
    port: opts.get("port") || 55555,
    execTIme: new Date().getTime(),
    // output path default:"./udping_result.txt"
    savepath: opts.get("file") || "./udping_result.txt",
    //wait time default 1000
    wait: parseInt(opts.get("wait") * 1000) || 1000,
    //try time default:0(infinity)
    time: opts.get("time") || 0
    //callback function that is called when timeout or error occures.default is false(primitive).
    errCallback : yourCallbackFunction || false
}
*/
```