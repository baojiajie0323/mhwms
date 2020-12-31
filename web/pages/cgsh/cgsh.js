//task.js
const util = require('../../utils/util.js')
// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');
// 引入配置
var config = require('../../config');

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
    content: JSON.stringify(content),
    showCancel: false
  });
};


Page({
  data: {
    shtask: []
  },
  onReady: function () {
    console.log("onReady");
    this.setData({name: wx.getStorageSync("USERNAME")});
  },
  onShow: function() {
    this.getShTask();
  },
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        //this.setData({ orderno: res.result });
        var orderno = res.result;
        this.onClickShtask(orderno);
      },
      fail: (res) => {
        // this.setData({ orderno:'1902210005' });
        // this.getsjinfo('1902210005')
      }
    })
  },
  onClicktask: function(e){
    console.log("onClicktask",e);
    var orderno = e.currentTarget.dataset.id;
    this.onClickShtask(orderno);
  },
  onClickShtask: function(orderno){
    var task = this.data.shtask.find(t => t.TC_AIP13 == orderno);
    if(!task){
      return;
    }
    var url = 'shsm/shsm?task=' + JSON.stringify(task);
    wx.navigateTo({
      url
    })
  },
  getShTask: function () {
    var context = this;
    console.log("request getShTask");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getcgshTask',
        data: {
          //today: new Date().Format('yyyy-MM-dd')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var shtask = result.data.data;
        context.setData({
          shtask
        })
      },

      fail(error) {
        //showModel('请求失败', error);
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
        wx.stopPullDownRefresh();
      }
    });
  },
})
