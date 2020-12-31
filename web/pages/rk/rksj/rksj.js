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
    hsl:1,
    sjsjl:0
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
        this.getsjinfo(res.result)
      },
      fail: (res) => {
        // this.setData({ orderno:'1907040188' });
        // this.getsjinfo('1907040188')
      }
    })
  },
  scanCode_kw: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ kwh: res.result },
          context.getkwlist)
      },
      fail: (res) => {
       //this.setData({ kwh: '44'},context.getkwlist)

      }
    })
  },
  getkwlist(){
    var context = this;
    console.log("request getkwlist");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getkwlist',
        data: {
          kwh: context.data.kwh
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var kwlist = result.data.data;
        if(!kwlist || kwlist.length == 0){
          showModel('提示', '库位号异常!');
          context.setData({kwh:""});
        }
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  getsjinfo: function (orderno) {
    var context = this;
    console.log("request getsjinfo");
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

        if(!shinfo){
          showModel('上架失败', '未找到此跟踪号!');
          return;
        }
        if (shinfo.TC_AID04 > shinfo.TC_AID16){
          showModel('上架失败', '此跟踪号未全部收货!');
          return;
        }
        if (shinfo.TC_AID04 == shinfo.TC_AID17){
          showModel('上架失败', '此跟踪号已经全部上架!');
          return;
        }

        context.setData({ shinfo })
        context.gethsl(shinfo.TC_AID01);
        context.getjykwh(shinfo.TC_AID01);
      },
      fail(error) {
        console.log('request fail', error);

      },
      complete() {
        console.log('request complete');
      }
    });
  },
  gethsl: function (ljbh) {
    var context = this;
    console.log("request gethsl");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getsjhsl',
        data: {
          ljbh
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var hsl = result.data.data[0].HSL || 0;
        context.setData({ hsl })
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  getjykwh : function (ljbh) {
    var context = this;
    console.log("request getjykwh");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getAdviceKw',
        data: {
          ljbh,
          orderno: this.data.orderno,
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var jykwh = result.data.data.kwh || "";
        context.setData({ jykwh })
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  updatesjinfo: function () {
    var context = this;
    console.log("request updatesjinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatesjinfo',
        data: {
          shinfo: this.data.shinfo,
          sjsjl: this.data.sjsjl,
          orderno: this.data.orderno,
          kwh: this.data.kwh,
          username: wx.getStorageSync("USERNAME"),
          enterDate: this.enterDate.Format('yyyy-MM-dd hh:mm:ss')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("上架完成！");
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
  onInputChange: function (e) {
    this.setData({ sjsjl: e.detail.value })
  },
  onInputbz: function(e) {
    var {hsl} = this.data;
    this.setData({ sjsjl: e.detail.value * hsl })
  },
  checkSubmit: function () {
    var { sjsjl, kwh, shinfo, orderno } = this.data;
    if (!sjsjl || parseFloat(sjsjl) <= 0 || parseFloat(sjsjl) > shinfo.SJSYL) {
      wx.showModal({
        title: '提示',
        content: '实际上架量填写错误',
        showCancel: false
      })
      return false;
    }
    if (!kwh || kwh == '') {
      wx.showModal({
        title: '提示',
        content: '请扫描库位号',
        showCancel: false
      })
      return false;
    }
    if (!orderno || orderno == '') {
      wx.showModal({
        title: '提示',
        content: '请扫描跟踪号',
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
      content: "确定要提交上架信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatesjinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})
