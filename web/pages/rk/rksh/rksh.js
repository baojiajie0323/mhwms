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
  },
  onReady: function (option) {
    console.log("onReady", option);
    this.enterDate = new Date();
    this.scanCode();
  },
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ orderno: res.result});
        this.getshinfo(res.result)
      },
      fail: (res) => {
        //this.getshinfo('1805300003')
      }
    })
  },
  getshinfo: function (orderno) {
    var context = this;
    console.log("request getshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getshinfo',
        data: {
          orderno
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);

        var shinfo = result.data.data[0];
        if (shinfo.SYL <= 0) {
          showModel('收货失败', '此跟踪号已经完成收货！');
          return;
        }

        context.setData({ shinfo: result.data.data[0] })

      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  updateshinfo: function () {
    var context = this;
    console.log("request updateshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updateshinfo',
        data: {
          shinfo: this.data.shinfo,
          ssl: this.data.ssl,
          username: wx.getStorageSync("USERNAME"),
          enterDate: this.enterDate.Format('yyyy-MM-dd hh:mm:ss')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("收货完成！");
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
    this.setData({ ssl: e.detail.value })
  },
  checkSubmit: function () {
    var { ssl,shinfo } = this.data;
    if(!ssl || parseFloat(ssl) <= 0 || parseFloat(ssl) > shinfo.SYL){
      wx.showModal({
        title: '提示',
        content: '实收量填写错误',
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
      content: "确定要提交收货信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updateshinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})
