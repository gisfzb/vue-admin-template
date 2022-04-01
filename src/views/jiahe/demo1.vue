<!--  -->
<template>
  <div class="map">
    <map2d ref="map2d" />
  </div>
</template>
<script>
  import { getAction, postAction } from "@api/manage";
  import map2d from "@comp/map/map2d";
  export default {
    components: {
      map2d,
    },
    data() {
      return {};
    },

    computed: {},

    mounted() {
      var that = this;
      this.$refs.map2d.createMap(function (map) {
        console.log("地图初始化");
        window.map = map;
        that.loadWMS();
      });
    },

    methods: {
      loadWMS() {
        console.log("加载服务");
        L.tileLayer
          .wms(
            "http://114.115.185.126:8015/agent/rest/v1/jh-api/cropndviRegionApi/loadTileLayer",
            {
              regionId: 3104001644,
              cropId: 107,
              dataTime: "2021-04-20",
              format: "image/png",
              transparent: true,
              crs: L.CRS.EPSG4326,
              zIndex: 999,
            }
          )
          .addTo(map);

        map.setView({ lat: 36.95181235494688, lng: 117.70889282226564 }, 11);
      },
    },
  };
</script>
<style scoped>
.map {
  width: 100%;
  height: calc(100vh);
}
.tableData {
  position: absolute;
  z-index: 999;
  width: 25%;
  background-color: cadetblue;
  right: 20px;
  top: 100px;
  height: 75%;
}
.btn_group {
  position: absolute;
  z-index: 999;
  right: 50px;
  top: 30px;
}
.pageMen {
  position: initial;
  text-align: center;
}
</style>
