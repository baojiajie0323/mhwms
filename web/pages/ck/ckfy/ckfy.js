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
    canFy: false
  },
  onReady: function (option) {
    console.log("onReady", option);
    this.enterDate = new Date();
    this.scanCode();
  },
  scanCode: function () {
    this.setData({ fyinfo: null })
    wx.scanCode({
      success: (res) => {
        this.setData({ orderno: res.result });
        this.getfyinfo(res.result)
      },
      fail: (res) => {
        this.setData({ orderno: '5C1-MH011905200020' });
        this.getfyinfo('5C1-MH011905200020')
      }
    })
  },
  getfyinfo_new: function (orderno) {
    var context = this;
    console.log("request getfyinfo_new");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getfyinfo_new',
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

        var fylist = result.data.data;
        var fylength = fylist.length;
        if (fylength > 0) {
          showModel('提示', '此单据已经发运');
          return;
        }
        context.setData({canFy: true})

      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  getfyinfo: function (orderno) {
    var context = this;
    console.log("request getfyinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getfyinfo',
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

        var fylist = result.data.data;
        if(!fylist.find(f => f.TC_AIF09 == 4)){
          showModel('提示', '此单据未拣货确认');
          return;
        }
        context.getfyinfo_new(orderno);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  updatefyinfo: function () {
    var context = this;
    console.log("request updatefyinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatefyinfo_new',
        data: {
          orderno: this.data.orderno,
          bm: this.data.bm,
          shr: this.data.shr,
          cph: this.data.cph,
          sjname: this.data.sjname,
          cardno: this.data.cardno,
          enterDate: this.enterDate.Format('yyyy-MM-dd hh:mm:ss')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("发运完成！");
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  onInputBmChange: function (e) {
    this.setData({ bm: e.detail.value })
  },
  onInputShrChange: function (e) {
    this.setData({ shr: e.detail.value })
  },
  onInputCphChange: function (e) {
    this.setData({ cph: e.detail.value })
  },
  onInputSjnameChange: function (e) {
    this.setData({ sjname: e.detail.value })
  },
  onInputCardnoChange: function (e) {
    this.setData({ cardno: e.detail.value })
  },
  
  checkSubmit: function () {
    var { canFy , bm, shr, cph, sjname, cardno } = this.data;
    if (!canFy) {
      wx.showModal({
        title: '提示',
        content: '没有发运信息',
        showCancel: false
      })
      return false;
    }
    if (bm == '' || shr == '' || cph == '' || sjname == '' || cardno == '') {
      wx.showModal({
        title: '提示',
        content: '请填写发运信息',
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
      content: "确定要提交发运信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatefyinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})
