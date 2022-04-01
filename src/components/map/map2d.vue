<!-- 二维底图组件 -->
<template>
  <div :id="mapId" class="map2d"></div>
</template>

<script>
import { createMap, getMapConfig } from "@api/mapRequest";
export default {
  name: "MapTwo",
  data() {
    return {};
  },
  props: {
    mapId: {
      type: String,
      default: "map2d",
    },
  },
  components: {},

  computed: {},

  mounted() {
    // console.log("创建地图")
    // let map = this.createMap(this.mapId, this.options);
  },

  methods: {
    createMap(callback) {
        getMapConfig().then(config => {
          let map = createMap(this.mapId, config)
      			console.log(map, 'map')
          callback(map)
          this.initFun(map)
        })
    },
    initFun(_map) {
      //加载矢量切片
      // const url = 'http://192.168.0.111:8200/mapway/spatialserver/postgis1/CHN_adm0/tile/{z}/{x}/{y}.pbf';
      //
      // const vecLayer = vectorTileLayer(url, null);
      // vecLayer.addTo(_map);
      // L.mars.layer.createLayer({
      //     type: "arcgis_dynamic",
      //     url: "http://113.140.82.109:6080/arcgis/rest/services/HEICHA/HEICHA_YINGX/MapServer/",
      //     //layers: [37,39],
      //     popup: "all",
      // }).addTo(_map);

      var baseLayers = {
            "天地图地图": L.mars.layer.createLayer({
                type: "www_tdt",
                layer: "vec"
            }).addTo(_map),
            "天地图影像": L.mars.layer.createLayer({
                type: "www_tdt",
                layer: "img"
            }),
            "天地图地形": L.mars.layer.createLayer({
                type: "www_tdt",
                layer: "ter"
            }),
        };
        var overlays = {

        };
        L.control.layers(baseLayers, overlays, {
            position: "bottomright"
        }).addTo(_map);
    },
  },
};
</script>
<style scoped>
  .map2d {
    width: 100%;
    height: 100%;
    position: relative;
    user-select: none;
    z-index: 10;
    }  
</style>

