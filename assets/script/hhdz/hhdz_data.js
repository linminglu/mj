var gameDefine = require('gameDefine');
var errorCode = require('errorCode');
var hhdz_roomUtil = require('hhdz_roomUtil');

var room_hhdz = {

    tableInfo: {
        tablePlayer: [],
        winHistory: [],
        cardHistory: []
    },
    resultInfo: {
        card:{
            red: {},
            black: {},
            winner: undefined
        },
        winLoseInfo: []
    },
    time: 0,
    roomStatus: hhdz_roomUtil.GameStatus.WaitStart
};

module.exports = room_hhdz;

room_hhdz.getTableInfoData = function(){
    return this.tableInfo;
};

room_hhdz.getStartPourTime = function(){
    return this.time;
};

room_hhdz.getResultInfoData = function(){
    return this.resultInfo;
};

room_hhdz.getRoomStatus = function(){
    return this.roomStatus;
};

room_hhdz.setPour = function(type, index) {
    GameNet.getInstance().request("room.redBlackWarHandler.setPour", {type:type, index:index}, function (rtn) {
        if (rtn.result == errorCode.Success) {
            sendEvent('rbw-selfSetPour', {index: index});
        }
    });
};

room_hhdz.registMessage_hhdz = function() {
    cc.log("....hhdz data registMessage.");

    var self = this;

    GameNet.getInstance().setCallBack('rbw-roomStatus', function (data) {
        self.roomStatus = data.status;

        sendEvent('rbw-roomStatus');
    });
    GameNet.getInstance().setCallBack('rbw-dealCard', function (data) {
        sendEvent('rbw-dealCard');
    });
    GameNet.getInstance().setCallBack('rbw-startPour', function (data) {
        self.time = data.time;

        sendEvent('rbw-startPour');
    });
    GameNet.getInstance().setCallBack('rbw-tableInfo', function (data) {
        self.tableInfo.tablePlayer = data.tablePlayer;
        self.tableInfo.winHistory = data.winHistory;
        self.tableInfo.cardHistory = data.cardHistory;

        sendEvent('rbw-tableInfo');
    });
    GameNet.getInstance().setCallBack('rbw-result', function (data) {
        self.resultInfo.card.red = data.card.red;
        self.resultInfo.card.black = data.card.black;
        self.resultInfo.card.winner = data.card.winner;
        self.resultInfo.winLoseInfo = data.winLoseInfo;
        self.resultInfo.self = data.self;

        sendEvent('rbw-result');
    });
    GameNet.getInstance().setCallBack('rbw-onSetPour', function (data) {
        sendEvent('rbw-onSetPour', data);
    });
};

//检查神算子和大赢家是否为同一人
room_hhdz.checkPlayerSame = function(){
    var tablePlayer = this.tableInfo.tablePlayer;
    if(tablePlayer == undefined || tablePlayer.length <= 0){
        return false;
    }

    var same = false;
    var oneUId = undefined,
        twoUId = undefined;

    if(tablePlayer[0]){
        oneUId = tablePlayer[0].uid;
    }
    if(tablePlayer[1]){
        twoUId = tablePlayer[1].uid;
    }
    oneUId == twoUId ? same = true : null;

    return same;
};

room_hhdz.arrayChangeObject = function(data){
    var object = {};
    for(var ii = 0;ii < data.length;ii++){
        var cardId = data[ii];
        var cardNum = room_hz.getArrayElementNumber(data,cardId);
        object[cardId] = cardNum;
    }
    return object;
};
room_hhdz.getArrayElementNumber = function(array,element){
    var num = 0;
    if(array == undefined){
        return num;
    }
    for(var ii = 0;ii < array.length;ii++){
        if(array[ii] == element){
            num++;
        }
    }
    return num;
};