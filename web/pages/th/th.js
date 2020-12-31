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
    thtask: []
  },
  onReady: function () {
    console.log("onReady");
    this.setData({name: wx.getStorageSync("USERNAME")});

    this.getThTask();
  },
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        //this.setData({ orderno: res.result });
        var orderno = res.result;
        this.onClickThtask(orderno);
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
    this.onClickThtask(orderno);
  },
  onClickThtask: function(orderno){
    var task = this.data.thtask.find(t => t.TC_TTA01 == orderno);
    if(!task){
      return;
    }
    var url = 'thsm/thsm?orderno=' + orderno + 
      '&thkh=' + task.TC_TTA03 +
      '&lhrq=' + task.TC_TTA04 + 
      '&thzxx=' + task.TC_TTA05 + 
      '&thxz=' + task.TC_TTA10
    wx.navigateTo({
      url
    })
  },
  getThTask: function () {
    var context = this;
    console.log("request getThTask");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getthtask',
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
        var thtask = result.data.data;
        context.setData({
          thtask
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
