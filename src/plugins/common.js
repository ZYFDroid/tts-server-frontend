import axios from 'axios';

var apiroot = "";

var apiget = function (path, param, callback) {
    axios.get(apiroot + path, { params: param })
        .then(res => {
            
            var data = res.data;
            if(data.code == 0){
            callback(200, data.msg, data);
            }else{
                callback(590, data.message, {});
            }
        })
        .catch(err => {
            callback(590, err, {});
        });
}
// eslint-disable-next-line
function setSearchParam(param) {
    var searchstr = "";
    var keys = Object.keys(param);
    for (var i = 0; i < keys.length; i++) {
        searchstr = searchstr + keys[i];
        searchstr = searchstr + "=";
        searchstr = searchstr + encodeURI(param[keys[i]]);
        if (i < keys.length - 1) {
            searchstr = searchstr + "&";
        }
    }
    return searchstr;
}




var apidata = function (path, jsondata, callback) {
    axios.post(apiroot + path,
        (jsondata)
    ).then(res => {
        var data = res.data;
        callback(data.code, data.msg, data);
    }).catch(err => {
        callback(590, err, {});
    });
}





var playAudio = function (blob) {
    var fr = new FileReader();
    fr.onload = function () {
        var audioContext = new AudioContext();
        var arrBuff = this.result; // ab是转换后的结果
        audioContext.decodeAudioData(arrBuff, function (buffer) {
            var source = audioContext.createBufferSource();
            source.buffer = buffer; // This is the line that generates the error
            source.connect(audioContext.destination);
            source.start(0);
        });
    }
    fr.readAsArrayBuffer(blob);
}

export { apiget, apidata,playAudio }