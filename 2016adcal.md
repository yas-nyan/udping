# 題名
Node.jsでudpで回線監視をするアプリケーション(udping)を作った話

# 概要
* Node.jsで簡単な回線監視を行うアプリケーションを作った
* コマンドラインツール,WEBアプリケーション,Node.jsモジュールの３つの使い方が出来るようにする
* RaspberryPiなどのIoT機器で回線監視に用いることをを想定。
* サーバー側・クライアント側の両方から、RTTの上昇や不通といった回線異常を検知できます。


# 構成
## 環境
* Node.js v6.9.2 (v4以降なら動くはず)
* Mac OS X 10.12.1
* Ubuntu 16.04 

Windowsは未確認です。大したことはやってないので大丈夫だとは思いますが、出来ないこともあるかもしれません。

## シーケンス図
基本的な仕組みはこんな感じ。



# 使い方

プライベートIPを介する場合、必要に応じてポートフォワーディングを行ってください。
## コマンドラインツールとして利用する


```shell:~/
npm install udping --global
```

グローバルオプションをつければ、```udping```をそのままターミナルのコマンドとして使えます。

### サーバー側

```shell:~/
udping -s
```


### クライアント側

```shell:~/
udping [サーバー側のIPアドレス]
```

### 主なオプション
ping風です。

*  -s, --server
サーバーモードで起動します。
   
* -c, --client
クライアントモードで起動します。

*  -t, --time <value>
実行時間(秒) デフォルトは無限です。
   
*  -i, --wait <value>
実行間隔(秒)　デフォルトは1秒です。サーバー側は1.5秒
   
*  -f, --file <value>
ログデータを書き出すパスを指定できます。
デフォルトは```[実行ディレクトリ]/result_udping/```
   
* -h, --host <value> 
サーバー側のIPアドレスです。
通常は``udping 192.168.1.1``のように省略します。
    
* -p, --port <value>
サーバー側のポート番号を指定します。デフォルトは55555。独自にで指定したい場合や他のプログラムとの競合がある場合のみ変更してください。



## モジュールとして他のNode．jsアプリケーションから利用する

普通にnpmでインストールしてください。

```shell:~/
npm install --save udping
```

udpingクラスを呼び出すと使えます。
引数に環境設定用のオブジェクトを与えてください。
```node.js:yourApp.js
const Udping = require(`udping`);
const _env = {
    //サーバーorクライアント クライアントが初期値。
    //mode: "client",
    mode: "server",

    //サーバーのホストネーム IP 
    host: "localhost",
    
    port: 55555,
    execTIme: new Date().getTime(),
    savepath: `./result_udping/${Date.now()}_result.txt`,
    //何ミリ秒おきに送るか。モードをサーバーにした場合は1.5倍
    wait: 1000,
    //タイムアウトやエラーが起きた時のcallback。初期設定はプリミティブ型のfalseを入れておく。
    errCallback: false,
    //成功時のcallback.初期設定はプリミティブ型のfalseを入れておく。
    successCallback: false
}
const udpingServer = new Udping(_env);
```



## WEBコンソールでRTTを可視化する(おまけ機能)
RTTを可視化させて楽しむ機能を作りました。
あとで更新(すんません)


# 参考文献
