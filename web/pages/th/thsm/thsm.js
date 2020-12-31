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
    lsInfo: {},
    shcount: 1
  },
  onReady: function (option) {
    console.log("onReady", option);
    //this.scanCode();
  },
  onLoad: function (options) {
    var orderno = options.orderno;
    var thkh = options.thkh;
    var lhrq = options.lhrq;
    var thzxx = options.thzxx;
    var thxz = options.thxz;

    console.log(orderno, thkh, lhrq, thzxx, thxz);
    this.setData({ orderno, thkh, lhrq, thzxx, thxz})
  },
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        var lstm = res.result;
        this.getlstm(lstm);
      },
      fail: (res) => {
        // this.setData({ orderno: '1805290003' }, () => {
        //   this.check()
        // })
      }
    })
  },
  getlstm: function (lstm) {
    var context = this;
    console.log("request getlstm");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getlstm',
        data: {
          lstm
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        if (result.data.data.length <= 0){
          showModel("查询失败","条码不存在");
          return;
        }
        var lsInfo = result.data.data[0];
        context.setData({ lsInfo });
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  onInputCount: function(e) {
    this.setData({ shcount: e.detail.value });
  },
  checkSubmit: function () {
    var { lsInfo } = this.data;
    if (!lsInfo.IMA01) {
      wx.showModal({
        title: '提示',
        content: '请扫描条码',
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
      content: "确定要收货吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatethshinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  updatethshinfo: function () {
    var context = this;
    console.log("request updatethshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatethshinfo',
        data: {
          lstm: this.data.lsInfo.IMAUD03,
          ljbh: this.data.lsInfo.IMA01,
          shcount: this.data.shcount,
          orderno: this.data.orderno,
          kwh: this.data.kwh,
          username: wx.getStorageSync("USERNAME"),
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("收货完成！");
        // setTimeout(() => {
        //   wx.navigateBack();
        // }, 1000);
        context.setData({lsInfo:{},shcount:1});
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
