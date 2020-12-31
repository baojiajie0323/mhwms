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
    shinfo: {},
  },
  onReady: function (option) {
    console.log("onReady", option);
    //this.scanCode();
  },
  scanCode: function () {
    wx.scanCode({
      success: (res) => {
        this.setData({ orderno: res.result }, () => {
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ orderno: '1805290002' }, () => {
        //   this.check()
        // })
      }
    })
  },
  scanCode_kw: function () {
    wx.scanCode({
      success: (res) => {
        this.setData({ kwh: res.result }, () => {
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ kwh: 'A010104' }, () => {
        //   this.check()
        // })
      }
    })
  },
  scanCode_pd: function () {
    wx.scanCode({
      success: (res) => {
        this.setData({ pdh: res.result })
      },
      // fail: (res) => {
      //   this.setData({ pdh: '5P1-MH011806190001' })
      // }
    })
  },
  check() {
    var { kwh, orderno } = this.data;
    if (kwh && orderno) {
      this.getkcinfo(kwh, orderno)
    }
  },
  getkcinfo: function (kwh, orderno) {
    var context = this;
    console.log("request getshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getkcinfo',
        data: {
          kwh,
          orderno
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        if (result.data.data.length <= 0) {
          showModel("查询失败", "没有找到相应的库存信息");
          return;
        }
        context.setData({ kcinfo: result.data.data[0] });
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  updatepdinfo: function () {
    var context = this;
    console.log("request updatepdinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatekcpd',
        data: {
          kcinfo: this.data.kcinfo,
          sjsl: this.data.sjsl,
          pdh: this.data.pdh,
          kwh: this.data.kwh,
          orderno:this.data.orderno,
          username: wx.getStorageSync("USERNAME"),
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("盘点完成！");
        setTimeout(()=>{
          wx.navigateBack();
        },1000);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  onInputChange: function (e) {
    this.setData({ sjsl: e.detail.value })
  },
  checkSubmit: function () {
    var { sjsl,pdh,kcinfo } = this.data;
    if (!sjsl || !pdh ){
      wx.showModal({
        title: '提示',
        content: '请填写信息',
        showCancel: false
      })
      return false;
    }
    return true;
  },
  ontapsubmit: function () {
    if (!this.checkSubmit()) {
      return;
    }
    wx.showModal({
      content: "确定要提交盘点信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatepdinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})
