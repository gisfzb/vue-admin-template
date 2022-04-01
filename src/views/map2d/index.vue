<!--  -->
<template>
  <div class="map">
    <div class="btn_group">
      <el-button type="primary" @click="drawPolygon">绘制范围</el-button>
    </div>
    <div class="tableData">
      <el-table v-loading="loading" :data="gridData" height="95%">
        <el-table-column property="satelliteId" label="卫星ID" width="90" />
        <!-- <el-table-column property="productId" label="产品景ID" width="200"></el-table-column> -->
        <el-table-column property="imagingTime" width="180" label="成像时间" />
        <!-- <el-table-column property="Sensor" label="传感器类型"></el-table-column> -->
        <el-table-column label="景面积">
          <template slot-scope="scope">
            <span>{{ getArea(scope.row) }}</span>
            <!-- <span>{{Number(scope.productArea).toFixed(2)}}</span> -->
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100"
        >
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleClick(scope.row)">定位</el-button>
            <el-button type="text" size="small" @click="showClick(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pageMen"
        :page-size="params.pageSize"
        :pager-count="params.pageCount"
        :current-page="params.pageNum"
        layout="prev, pager, next"
        :hide-on-single-page="hidePage"
        :total="params.total"
        @current-change="currentChange"
      />
    </div>
    <map2d ref="map2d" />
    <el-dialog
      title="详细信息"
      :visible.sync="dialogVisible"
      width="40%"
      :before-close="handleClose"
    >
      <div>
        <!-- <p v-for="(item,i) in detailData" :key="i">{{item.key+": "+item.value}}</p> -->
        <el-table
          :data="detailData"
          style="width: 100%"
        >
          <el-table-column prop="key" label="字段" width="200" />
          <el-table-column prop="value" label="值" width="300" />
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getAction, postAction } from '@api/manage'
import map2d from '@comp/map/map2d'
export default {

  components: {
    map2d
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      workDraw: null,
      imgLayerGroup: null,
      table: false,
      gridData: [],
      hidePage: true,
      params: {
        pageSize: 25,
        pageNum: 1,
        pageCount: 9,
        total: 1,
        geo: null
      },
      detailData: null,
      conf: {
        id:	'数据内部id',
        satelliteId:	'卫星ID',
        // productId	:	'产品景ID',
        imagingTime:	'成像时间',
        imageGsd:	'像元分辨率',
        cloudPercent:	'云量',
        productQuality:	'产品质量级别',
        rollSatelliteAngle:	'侧摆角',
        pruductType:	'	产品类型',
        bandAmount:	'产品谱段数量',
        band:	'产品谱段',
        solarElevation:	'太阳高度角',
        Sensor:	'传感器类型',
        productBand:	'产品谱段信息',
        productArea:	'景面积'
      }
    }
  },

  computed: {},

  mounted() {
    var that = this
    this.$refs.map2d.createMap(function(map) {
      console.log('地图初始化')
      window.map = map
      that.workDraw = new L.mars.Draw({
        map: map,
        // hasDel: true, //是否可以删除
        isOnly: true,
        onCreate: function(e) {
          // 创建完成后回调
          that.queryData()
        },
        onChange: function(e) {
          // 编辑修改后回调
        }
      })
    })
  },

  methods: {
    getArea(row) {
      // debugger
      return Number(row.productArea).toFixed(2)
    },
    handleClose(done) {
      this.dialogVisible = false
      // this.$confirm('确认关闭？')
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
    },
    drawPolygon() {
      console.log('绘制范围')
      this.workDraw.startDraw('rectangle')
    },
    queryData() {
      const params = {
        'pageNum': this.params.pageNum,
        'pageSize': this.params.pageSize,
        'geo': this.workDraw.toJson()
      }
      // debugger

      // this.table = true;
      this.loading = true
      this.gridData = []
      if (this.imgLayerGroup) {
        this.imgLayerGroup.clearLayers()
      }
      postAction('rest/v1/data/changguangweixing/queryData', params).then((res) => {
        this.loading = false

        if (res.code == 200) {
          const list = res.result.result.data.records
          // debugger
          this.params.pageSize = res.result.result.data.pageSize
          this.params.total = res.result.result.data.totalSize
          // this.params.pageCount = res.result.result.data.totalPages
          if (list.length == 0) {
            this.$message('该区域暂无数据！')
          }
          this.showData(list)
        }
      })
    },
    showData(list) {
      this.gridData = list
      if (this.imgLayerGroup) {
        this.imgLayerGroup.clearLayers()
      } else {
        this.imgLayerGroup = L.layerGroup().addTo(map)
      }
      this.workDraw.clearDraw()
      list.forEach(item => {
        const geom = JSON.parse(item.imageGeo)
        // 加载范围
        L.geoJSON(geom, {
          style: function(feature) {
            return {
              fill: false,
              color: '#33FF66'
            }
          }
        }).addTo(this.imgLayerGroup)
        // 加载缩略图
        const imgUrl = item.jpg
        const topleft = [geom.coordinates[0][0][1], geom.coordinates[0][0][0]]
        const topright = [geom.coordinates[0][1][1], geom.coordinates[0][1][0]]
        const bottomleft = [geom.coordinates[0][3][1], geom.coordinates[0][3][0]]

        L.imageOverlay.rotated(imgUrl, topleft, topright, bottomleft, {
          opacity: 0.8,
          interactive: true
        }).addTo(this.imgLayerGroup)
      })
    },
    currentChange(pageNum) {
      this.params.pageNum = pageNum
      this.queryData()
    },
    handleClick(row) {
      console.log(row)
      const geom = JSON.parse(row.imageGeo)
      const layer = L.geoJSON(geom)
      map.centerAtLayer(layer)
    },
    showClick(row) {
      this.dialogVisible = true
      this.detailData = new Array()
      Object.keys(row).forEach(key => {
        if (this.conf[key]) {
          // let key2 = this.conf[key];
          // this.detailData.push(new Object().push(this.conf[key],row[key]))
          this.detailData.push({
            key: this.conf[key],
            value: row[key]
          })
        }
      })
    }
  }
}
</script>
<style scoped>
.map {
  width: 100%;
  height: calc(100vh);
}
.tableData{
    position: absolute;
    z-index: 999;
    width: 25%;
    background-color: cadetblue;
    right: 20px;
    top: 100px;
    height: 75%
  }
.btn_group {
  position: absolute;
  z-index: 999;
  right: 50px;
  top: 30px;
}
.pageMen{
  position: initial;
    text-align: center;
}
</style>
