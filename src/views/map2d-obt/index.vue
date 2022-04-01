<!--  -->
<template>
  <div class="map">
    <div class="btn_group">
      <!-- <el-button type="primary" @click="drawPolygon">绘制范围</el-button> -->
      <!-- <div class="block time_select"> -->
      <!-- <span class="demonstration">带快捷选项</span> -->
      <el-date-picker
        v-model="imgeDate"
        class="date_select"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        value-format="yyyy-MM-dd"
        @change="dateChange"
      />
      <el-button type="primary" @click="queryData">查询</el-button>
      <!-- </div> -->
    </div>
    <div class="tableData">
      <el-table v-loading="loading" :data="gridData" height="95%">
        <el-table-column property="satelliteID" label="拍摄卫星id" width="90" />
        <!-- <el-table-column property="productId" label="产品景ID" width="200"></el-table-column> -->
        <el-table-column property="imagingTime" width="185" label="拍摄时间" />
        <!-- <el-table-column property="Sensor" label="传感器类型"></el-table-column> -->
        <!-- <el-table-column label="景面积">
          <template slot-scope="scope">
            <span>{{ getArea(scope.row) }}</span>
          </template>
        </el-table-column> -->
        <el-table-column fixed="right" label="操作" width="130">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="handleClick(scope.row)"
            >定位</el-button>
            <el-button
              type="text"
              size="small"
              @click="showClick(scope.row)"
            >查看</el-button>
            <el-button
              type="text"
              size="small"
              @click="downloadFile(scope.row)"
            >下载</el-button>
            <!-- <a :href="scope.row.singleTif" download>下载</a> -->
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
        <el-table :data="detailData" style="width: 100%">
          <el-table-column prop="key" label="字段" width="150" />
          <el-table-column prop="value" label="值" />
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="dialogVisible = false"
        >确 定</el-button>
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
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      // value1: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      imgeDate: ['2020-01-01', '2020-05-26'],
      // ========================================
      dialogVisible: false,
      loading: false,
      workDraw: null,
      imgLayerGroup: null,
      tempLayerGroup: null,
      table: false,
      gridData: [],
      hidePage: true,
      params: {
        pageSize: 50,
        pageNum: 0,
        pageCount: 9,
        total: 7,
        geo: null
      },
      detailData: null,
      conf: {
        'satelliteID': '拍摄卫星id',
        'productID': '产品id',
        'productLevel': '产品级别',
        'cloudAmount': '云量',
        'imagingTime': '拍摄时间(UTC)',
        'timeZone': '时区',
        'heightInPixels': '长像素',
        'widthInPixels': '宽像素',
        'imageRowGSD': '分辨率',
        'swingSatelliteAngle': '侧摆角',
        'location': '条带中心点',
        'filename': '文件路径',
        'geopolygo': '条带边框'
      }
    }
  },

  computed: {},

  mounted() {
    var that = this
    this.$refs.map2d.createMap(function(map) {
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
    dateChange(e) {
      console.log(e)
    },
    downloadFile(row) {
      this.downloadIamge(row.singleTif)
    },
    getArea(row) {
      // debugger
      return Number(row.productArea).toFixed(2)
    },
    handleClose(done) {
      this.dialogVisible = false
    },
    drawPolygon() {
      this.workDraw.startDraw('rectangle')
    },
    queryData() {
      // const params = {
      //   'pageNum': this.params.pageNum,
      //   'pageSize': this.params.pageSize,
      //   'geo': this.workDraw.toJson()
      // }
      // debugger
      if (!this.imgeDate) {
        this.$message({
          message: '时间不能为空',
          type: 'warning'
        })
        return
      }
      const params = {
        'satellite': 'OHS-3A,OHS-3B',
        'startImage': this.imgeDate[0],
        'endImage': this.imgeDate[1],
        citycode: '460000',
        pageNo: this.params.pageNum - 1,
        pageSize: this.params.pageSize
      }
      // this.table = true;
      this.loading = true
      this.gridData = []
      if (this.imgLayerGroup) {
        this.imgLayerGroup.clearLayers()
      }
      postAction('rest/v1/data/OBTSatelliteData/queryData', params).then(
        (res) => {
          // debugger;
          this.loading = false
          if (res.code == 200) {
            const list = res.result.result.data.elements
            // debugger
            this.params.pageSize = res.result.result.data.pageSize
            this.params.total = res.result.result.data.totalElements
            // this.params.pageCount = res.result.result.data.totalPages
            if (list.length == 0) {
              this.$message('该区域暂无数据！')
            }
            this.showData(list)
          }
        }
      )
    },
    showData(list) {
      this.gridData = list
      if (this.imgLayerGroup) {
        this.imgLayerGroup.clearLayers()
      } else {
        this.imgLayerGroup = L.layerGroup().addTo(map)
      }
      this.workDraw.clearDraw()
      list.forEach((item) => {
        const geom = item.geopolygon
        // 加载范围
        L.geoJSON(geom, {
          style: function(feature) {
            return {
              fill: false,
              color: '#80FFFF'
            }

          }
        }).addTo(this.imgLayerGroup)
        // 加载缩略图
        // debugger
        const imgUrl = item.singleTif
        const topleft = [geom.coordinates[0][0][1], geom.coordinates[0][0][0]]
        const topright = [geom.coordinates[0][1][1], geom.coordinates[0][1][0]]
        const bottomleft = [geom.coordinates[0][3][1], geom.coordinates[0][3][0]]
        if (imgUrl) {
          L.imageOverlay
            .rotated(imgUrl, topleft, topright, bottomleft, {
              opacity: 1,
              interactive: true
            })
            .addTo(this.imgLayerGroup)
        }
      })
    },
    currentChange(pageNum) {
      this.params.pageNum = pageNum
      this.queryData()
    },
    handleClick(row) {
      if (this.tempLayerGroup) {
        this.tempLayerGroup.clearLayers();
      } else {
        this.tempLayerGroup = L.layerGroup().addTo(map);
      }
      const geom = row.geopolygon
      const layer = L.geoJSON(geom,{
        style: function (feature) {
          return {
            fill: false,
            color: "#55FF33"
            };
        }
      }).addTo(this.tempLayerGroup);
      map.centerAtLayer(layer)
    },
    showClick(row) {
      this.dialogVisible = true
      this.detailData = new Array()
      Object.keys(row).forEach((key) => {
        if (this.conf[key]) {
          // let key2 = this.conf[key];
          // this.detailData.push(new Object().push(this.conf[key],row[key]))
          let value=  typeof row[key] == 'object'?JSON.stringify(row[key]): (row[key] ||  '空')
          this.detailData.push({
            key: this.conf[key],
            value: value
          })
        }
      })
    },
    downloadIamge(imgUrl) { // 下载图片地址和图片名
      window.open(process.env.VUE_APP_BASE_API+"rest/v1/data/tpzhurl/urlZh?url=" + imgUrl,"_blank");
    }
  }
}
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
.date_select{
    margin-right: 30px;
  }
.pageMen {
  position: initial;
  text-align: center;
}

</style>
