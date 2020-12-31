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
    kcinfo: {},
    checkkc : [],
    ywsl:0,
    hsl:1,
    jykw: ""
  },
  onReady: function (option) {
    console.log("onReady", option);
    this.entryTime = new Date();
    //this.scanCode();
  },
  //跟踪号
  scanCode: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ orderno: res.result },()=>{
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ orderno: '1805290003' }, () => {
        //   this.check()
        // })
      }
    })
  },
  //库位号
  scanCode_kw: function () {
    var context = this
    wx.scanCode({
      success: (res) => {
        this.setData({ kwh: res.result }, () => {
          this.check()
        })
      },
      fail: (res) => {
        // this.setData({ kwh: 'A010103' }, () => {
        //   this.check()
        // })
      }
    })
  },
  //目标库位号
  scanCode_mbkw: function () {
    wx.scanCode({
      success: (res) => {
        var mbkw = res.result;
        if(mbkw == this.data.kwh){
          showModel("扫描失败", "同库位不需要进行转移");
          return;
        }
        this.setData({ mbkw: res.result }, this.getkwlist)
      },
      // fail: (res) => {
      //   this.setData({ pdh: '5P1-MH011806190001' })
      // }
    })
  },
  getkwlist() {
    var context = this;
    console.log("request getkwlist");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getkwlist',
        data: {
          kwh: context.data.mbkw
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var kwlist = result.data.data;
        if (!kwlist || kwlist.length == 0) {
          showModel('提示', '目标库位不存在!');
          context.setData({ mbkw: "" });
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
  check() {
    var { kwh, orderno } = this.data;
    if(kwh && orderno){
      this.getkcinfo(kwh,orderno);
    }
  },
  getkcinfo: function (kwh,orderno) {
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
        if (result.data.data.length <= 0){
          showModel("查询失败","没有找到相应的库存信息");
          return;
        }
        var kcinfo = result.data.data[0];
        kcinfo.TC_AIG04 = kcinfo.TC_AIG04.toFixed(3);
        kcinfo.BZL = kcinfo.BZL.toFixed(3);
        context.setData({ kcinfo },
          context.checkkcyw
        );

        context.gethsl(kcinfo.TC_AIG01);
        context.getjykw(kwh,kcinfo.TC_AIG01);
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
  getjykw: function (kwh,ljbh) {
    var context = this;
    console.log("request gethsl");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getkcywjykw',
        data: {
          ljbh,
          kwh
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var jykw = result.data.data[0].JYKW || "";
        context.setData({ jykw })
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  checkkcyw : function() {
    var { kwh, orderno, kcinfo } = this.data;
    var context = this;
    console.log("request checkkcyw");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'checkkcyw',
        data: {
          kwh,
          orderno,
          ljbh: kcinfo.TC_AIG01
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        context.setData({ checkkc: result.data.data })
      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  updateywinfo: function () {
    var context = this;
    console.log("request updateywinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatekcyw',
        data: {
          kcinfo: this.data.kcinfo,
          ywsl: this.data.ywsl,
          mbkw: this.data.mbkw,
          kwh: this.data.kwh,
          orderno: this.data.orderno,
          username: wx.getStorageSync("USERNAME"),
          entryTime: this.entryTime
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("移位完成！");
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
    this.setData({ ywsl: e.detail.value })
  },
  onInputbz: function (e) {
    var { hsl } = this.data;
    this.setData({ ywsl: e.detail.value * hsl })
  },
  checkSubmit: function () {
    var { ywsl, mbkw, kcinfo, checkkc,orderno,kwh } = this.data;
    if (!ywsl || !mbkw || mbkw == "" || ywsl == 0 || !orderno || !kwh) {
      wx.showModal({
        title: '提示',
        content: '请填写信息',
        showCancel: false
      })
      return false;
    }
    if (checkkc.length > 0){
      wx.showModal({
        title: '提示',
        content: '此跟踪号库存被占用，不可移库',
        showCancel: false
      })
      return false;
    }
    if (parseFloat(ywsl) > kcinfo.TC_AIG04 ) {
      wx.showModal({
        title: '提示',
        content: '转移数量不可大于库存余量',
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
      content: "确定要提交移位信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updateywinfo();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
})
