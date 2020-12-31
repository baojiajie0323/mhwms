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
    jymx: []
  },
  onReady: function(option) {
    console.log("onReady", option);
    //this.scanCode();
  },
  onLoad: function(options) {
    var task = JSON.parse(options.task);

    console.log(task);
    this.setData({
      task
    }, this.getJymx);
  },
  onShow: function(){
    this.getJymx();
  },
  getJymx: function() {
    var {
      task
    } = this.data;
    var context = this;
    console.log("request getjymx");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getjymx2',
        data: {
          orderno: task.TC_TTO01
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var jymx = result.data.data;
        context.setData({
          jymx
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
  onClickjycs: function (e) {
    var {
      task
    } = this.data;


    var xmbh = e.currentTarget.id;
    var xm = this.data.jymx.find(j => j.TC_TTQ03 == xmbh);

    if(xm.TC_TTQ22 === 'N'){
      wx.navigateTo({
        url: '../xmjy2/xmjy2' +
          '?orderno=' + task.TC_TTO01 +
          '&xmbh=' + xmbh
      })
    }else{
      wx.navigateTo({
        url: '../xmjy/xmjy' +
          '?orderno=' + task.TC_TTO01 +
          '&xmbh=' + xmbh
      })
    }
  },
  updatejymx: function () {
    var context = this;
    var {
      task
    } = this.data;

    console.log("request updatejymx");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatejymx',
        data: {
          orderno: task.TC_TTO01,
          username: wx.getStorageSync("name")
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('更新物料清点信息成功');
        console.log('request success', result);
        wx.navigateBack({})
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  checkSubmit: function () {
    var {
      jymx,
    } = this.data;
    if (jymx.some(j => j.TC_TTQ21 === 'N'))
    {
      wx.showModal({
        title: '提示',
        content: '全部检验完成后才能提交',
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
      content: "确定要提交信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatejymx();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})