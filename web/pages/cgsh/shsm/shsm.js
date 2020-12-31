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
    task: {},
    shcount: "",
    bccount: ""
  },
  onReady: function (option) {
    console.log("onReady", option);
    //this.scanCode();
  },
  onLoad: function (options) {
    var task = JSON.parse(options.task);

    console.log(task);
    this.setData({ task })
  },
  onInputshCount: function(e) {
    this.setData({ shcount: e.detail.value });
  },
  onInputbcCount: function (e) {
    this.setData({ bccount: e.detail.value });
  },
  checkSubmit: function () {
    var { shcount,bccount } = this.data;
    if (shcount == "" || bccount == "") {
      wx.showModal({
        title: '提示',
        content: '请输入实收量和备次量',
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
          this.updatecgshinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  updatecgshinfo: function () {
    var context = this;
    console.log("request updatecgshinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatecgsh',
        data: {
          shcount: this.data.shcount,
          bccount: this.data.bccount,
          orderno: this.data.task.TC_AIP13,
          cgdh: this.data.task.TC_AIP04,
          xc: this.data.task.TC_AIP06,
          username: wx.getStorageSync("USERNAME"),
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        if(!!result.data.err){
          showModel("收货失败", result.data.err);
          return;
        }
        showSuccess("收货完成！");
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
        //context.setData({lsInfo:{},shcount:1});
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
