//wlqd.js
const util = require('../../../utils/util.js')
// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../../vendor/qcloud-weapp-client-sdk/index');
// 引入配置
var config = require('../../../config');

// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  icon: 'loading',
  duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();

  wx.showModal({
    title,
    content,
    showCancel: false
  });
};

Page({
  data: {
    curkcIndex: 0,
    kcinfo: [],
  },
  onReady: function (option) {
    console.log("onReady", option);
    //this.scanCode();
  },
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ orderno: res.result },()=>{
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ orderno: '1805290003' }, () => {
        //   this.check()
        // })
      }
    })
  },
  scanCode_kw: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ kwh: res.result }, () => {
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ kwh: 'A010103' }, () => {
        //   this.check()
        // })
      }
    })
  },
  check() {
    var { kwh, orderno } = this.data;
    //if(kwh && orderno){
      this.getkcinfo(kwh,orderno)
    //}
  },
  onClickPrev: function () {
    console.log(this.data.curkcIndex);
    var { curkcIndex } = this.data;
    if (curkcIndex > 0) {
      curkcIndex--;
    }
    this.setData({ curkcIndex });
  },
  onClickNext: function () {
    console.log(this.data.curkcIndex);
    var { curkcIndex, kcinfo } = this.data;
    if (curkcIndex < kcinfo.length - 1) {
      curkcIndex++;
    }
    this.setData({ curkcIndex });
  },
  getkcinfo: function (kwh,orderno) {
    var context = this;
    console.log("request getshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getkcinfo',
        data: {
          kwh: !!kwh ? kwh : '',
          orderno: !!orderno ? orderno : ''
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        if (result.data.data.length <= 0){
          showModel("查询失败","没有找到相应的库存信息");
          return;
        }
        var kcinfo = result.data.data;
        kcinfo.forEach(j => {
          j.TC_AIG04 = j.TC_AIG04.toFixed(3);
          j.BZL = j.BZL.toFixed(3);
        })
        context.setData({ kcinfo: result.data.data });
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },

})
