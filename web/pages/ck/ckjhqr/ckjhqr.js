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
    jhinfo:[]
    // jhinfo : [
    //   {
    //     JHL:10,
    //     TC_AIC02: 'AA',
    //     BZL: 20,
    //     FPL:30,
    //     TC_AIC03:'bb',
    //     IMA02: 'FFF',
    //     TC_AIF01: '123'
    //   }
    // ]
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
        this.setData({orderno: res.result});
        this.getfyinfo(res.result)
      },
      // fail: (res) => {
      //   this.setData({ orderno:'5C1-MH011905310014' });
      //   this.getfyinfo('5C1-MH011905310014')
      // }
    })
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

        var jhinfo = result.data.data;
        if (!!jhinfo.find(j => j.TC_AIF09 == 4)) {
          showModel('拣货确认失败', '此单据已经拣货确认!');
          return;
        }
        jhinfo = jhinfo.filter(j => j.TC_AIF09 == 2);
        if (jhinfo.length <= 0) {
          showModel('拣货确认失败', '单据没有分配，不可拣货确认!');
          return;
        }
        if (!!jhinfo.find(j => j.TC_AIF12 == 'N')) {
          showModel('拣货确认失败', '单据没有完全拣货!');
          return;
        }
        
        context.getjhqr(orderno);
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  getjhqr: function (orderno) {
    if (!orderno){
      orderno = this.data.orderno;
    }
    var context = this;
    console.log("request getjhqr");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getjhqr',
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

        var jhinfo = result.data.data;
        context.setData({ jhinfo })

      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  
  updatejhinfo: function () {
    var context = this;
    console.log("request updatejhinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatejhqr',
        data: {
          // jhinfo: this.data.jhinfo[this.data.curjhIndex],
          // jhl: this.data.jhl,
          orderno: this.data.orderno,
          username: wx.getStorageSync("USERNAME"),
          enterDate: this.enterDate.Format('yyyy-MM-dd hh:mm:ss')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("拣货确认成功！");
        // context.getjhinfo();
        // context.setData({kwh:"",gzh:"",jhl:""})
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
  checkSubmit: function () {
    var { jhinfo} = this.data;
    if (jhinfo.length <= 0) {
      wx.showModal({
        title: '提示',
        content: '确认失败',
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
      content: "确定拣货确认信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatejhinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})
