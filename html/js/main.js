/**
 * 
 * vue.js : 2.1.3
 */
//接続に必要なセッティング
var settings = {
    host: {
        ip: window.location.hostname,
        port: "3012"
    }
}

//モジュールの呼び出し。
const Vue = require("vue/dist/vue.js");
const udpingWebClient = require("./udpingWebClient.js");

//書き出しを行う。vue
//情報の書き出し,保持を行う定数
const info = new Vue({
    el: "#info",
    data: {
        udpingenv: {
            host: "localhost",
            port: 55555,
            wait: 1000
        },
        console: "ここにコンソールなど出す",
        network: {
            text: {
                RTT: "100(test)",
                endTime: ""
            },
            /**ネットワークのデータが上がってきたらここに打ち込む */
            RTTdata: [
                [0, 0]
            ]
        }

    },
    //書き換えを行うメソッド。
    methods: {
        renderNetwork: function(data) {
            //テキスト表示用
            this.network.text = data;

            /**
             * RTT表示のチャートをここで描く。
             * RTTDataの書式
             * [
             *  [0,114],[1,514],[2,1919]...
             * ]
             */

            //今送られてきたRTTのデータをInputRTTDataに入れる。
            this.network.RTTdata.push(
                //とりあえずx座標は仮置き
                [0, data.RTT]
            );
            //プロットの限界数は100とする
            if (this.network.RTTdata.length > 100) {
                //100を超えてたら先頭を削除。
                this.network.RTTdata.shift()
            }

            //プロット用のデータに整形する。
            for (index in this.network.RTTdata) {
                //X軸をそのindexとする
                this.network.RTTdata[index][0] = index;
            }
            //描画用のオブジェクトに入れる。
            interactive_plot.setData([this.network.RTTdata]);
            //描画する
            interactive_plot.draw();


        }
    }
});
//ソケットのコネクションを開く
const udp_web_cl = new udpingWebClient(settings, info.renderNetwork);

//init
$("#init").on("click", function() {
    udp_web_cl.init(info.udpingenv);
});
//stop
$("#stop").on("click", function() {
    udp_web_cl.stop();
});

/**
 * 
 * 以下RTTのチャート用
 */
/*
 * Flot Interactive Chart
 * -----------------------
 */
// We use an inline data source in the example, usually data would
// be fetched from a server

var data = [],
    totalPoints = 100;

//以下はランダムなデータを作る関数
function getRandomData() {

    if (data.length > 0)
        data = data.slice(1);

    // Do a random walk
    while (data.length < totalPoints) {

        var prev = data.length > 0 ? data[data.length - 1] : 50,
            y = prev + Math.random() * 10 - 5;

        if (y < 0) {
            y = 0;
        } else if (y > 100) {
            y = 100;
        }

        data.push(y);
    }

    // Zip the generated y values with the x values
    var res = [];
    for (var i = 0; i < data.length; ++i) {
        res.push([i * 2, data[i]]);
    }
    //どんな型なのかみたいンゴっていう感じ
    console.log(res);

    return res;
}

var interactive_plot = $.plot("#interactive", [
    //getRandomData()
], {
    grid: {
        borderColor: "#f3f3f3",
        borderWidth: 1,
        tickColor: "#f3f3f3"
    },
    series: {
        shadowSize: 0, // Drawing is faster without shadows
        color: "#3c8dbc"
    },
    lines: {
        fill: true, //Converts the line chart to area chart
        fillColor: //"#3c8dbc"
        { colors: ['rgba(12, 56, 100, 0.5)', 'rgba(255, 0, 0, 0.8)'] }
    },
    yaxis: {
        min: 0,
        max: 200,
        show: true
    },
    xaxis: {
        min: 0,
        max: 100,
        //何かあれなのであえてラベルを消しておく。。。
        show: false,
        reserveSpace: true
    }
});