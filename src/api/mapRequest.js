import axios from 'axios'

export function createMap(id, config) {
    var map = L.mars.createMap({
        id: id, //地图Div容器的id，
        data: config.map,
        layerToMap: layerToMap,
    });
    return map;

}

export function getMapConfig() {
    const url = 'config/config.json'
    const data = ''
    return axios.get(url, {
        params: data
    }).then(res => {
        return Promise.resolve(res.data)
    })
}

// export function getWidgetConfig(){
//   const url = 'config/mars2d/widget.json'
//   const data = ''
//   return axios.get(url, {
//     params: data
//   }).then(res => {
//     return Promise.resolve(res.data)
//   })
// }


//自定义图层添加方法
function layerToMap(config, layer) {
    if (config.type == "wfs") {
        layer = L.wfsLayer(config); //wfs插件
        return layer;
    }
};



// var url = "http://113.140.95.222:7017/lc-data"
// var url = window._CONFIG['domianURL']
//     // var url ="http://192.168.0.156:8080/lc-data"
//     //查询叠加分析之后的结果
// export function GetOverlapResult(param) {
//     return axios({
//         url: "/data/analysis/superposition",
//         baseURL: url,
//         method: 'post',
//         data: param,
//         headers: {
//             'Content-Type': 'application/json;charset=UTF-8',
//             'X-Access-Token': JSON.parse(localStorage.getItem('pro__Access-Token')).value
//         },
//     })
// }


//查询缓冲区处理之后的数据
// export function GetBufferData(param) {
//     return axios({
//         url: "/data/analysis/buffer",
//         baseURL: url,
//         method: 'post',
//         data: param,
//         headers: {
//             'Content-Type': 'application/json;charset=UTF-8',
//             'X-Access-Token': JSON.parse(localStorage.getItem('pro__Access-Token')).value
//         },
//     })
// }