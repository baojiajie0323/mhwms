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
    curjhIndex: 0,
    jhinfo:[]
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
      //   this.setData({ orderno:'431-MH011902130001' });
      //   this.getfyinfo('431-MH011902130001')
      // }
    })
  },
  scanCode_kw: function () {
    var { jhinfo, curjhIndex } = this.data;
    wx.scanCode({
      success: (res) => {
        var kwh = res.result;
        if (kwh != jhinfo[curjhIndex].TC_AIF02) {
          wx.showModal({
            title: '提示',
            content: '库位号错误',
            showCancel: false
          })
          return false;
        }
        this.setData({ kwh});
      },
      // fail: (res) => {
      //  this.setData({ kwh: 'B123403'})
      // }
    })
  },
  scanCode_gz: function () {
    var { jhinfo, curjhIndex } = this.data; 
    wx.scanCode({
      success: (res) => {
        var gzh = res.result;
        if (gzh != jhinfo[curjhIndex].TC_AIF03) {
          wx.showModal({
            title: '提示',
            content: '跟踪号错误',
            showCancel: false
          })
          return false;
        }
        this.setData({ gzh })
      },
      // fail: (res) => {
      //   this.setData({ gzh: '1809080002'})
      // }
    })
  },
  getfyinfo: function (orderno) {
    if (!orderno){
      orderno = this.data.orderno;
    }
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

        var fyinfo = result.data.data;

        if (fyinfo.length <= 0) {
          showModel('拣货失败', '未找到此单据编号!');
          return;
        }
        if (!fyinfo.some(f => f.TC_AIF09 == 2)) {
          showModel('拣货失败', '请先分配再拣货!');
          return;
        }
        if (!fyinfo.some(f => f.TC_AIF12 == 'N')) {
          showModel('拣货失败', '已经全部拣货，不可再拣货!');
          return;
        }
        context.getjhinfo(orderno);
        //context.setData({ shinfo: result.data.data[0] })

      },
      fail(error) {
        console.log('request fail', error);
      },
      complete() {
        console.log('request complete');
      }
    });
  },
  getjhinfo: function (orderno) {
    if (!orderno) {
      orderno = this.data.orderno;
    }
    var context = this;
    console.log("request getjhinfo");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getjhinfo',
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
        jhinfo.forEach(j => {
          j.TC_AIF05 = j.TC_AIF05.toFixed(3);
          j.BZSL = j.BZSL.toFixed(3);
          j.TC_AIG04 = j.TC_AIG04.toFixed(3);
        })
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
  onClickPrev: function(){
    console.log(this.data.curjhIndex);
    var { curjhIndex } = this.data; 
    if (curjhIndex > 0){
      curjhIndex --;
    }
    this.setData({curjhIndex});
  },
  onClickNext: function() {
    console.log(this.data.curjhIndex);
    var { curjhIndex,jhinfo } = this.data;
    if (curjhIndex < jhinfo.length - 1) {
      curjhIndex++;
    }
    this.setData({ curjhIndex });
  },
  updatejhinfo: function () {
    var context = this;
    console.log("request updatejhinfo");
    if(this.data.jhl == ""){
      return;
    }
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatejhinfo',
        data: {
          jhinfo: this.data.jhinfo[this.data.curjhIndex],
          jhl: this.data.jhl,
          username: wx.getStorageSync("USERNAME"),
          enterDate: this.enterDate.Format('yyyy-MM-dd hh:mm:ss')
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        console.log('request success', result);
        showSuccess("拣货成功！");
        context.getjhinfo();
        context.setData({kwh:"",gzh:"",jhl:""})
        // setTimeout(() => {
        //   wx.navigateBack();
        // }, 1000);
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
    this.setData({ jhl: e.detail.value })
  },
  checkSubmit: function () {
    var { gzh,kwh,jhl,jhinfo,curjhIndex } = this.data;
    if (!gzh || !kwh || !jhl) {
      wx.showModal({
        title: '提示',
        content: '请填写记录',
        showCancel: false
      })
      return false;
    }
    if(parseFloat(jhl) != parseFloat(jhinfo[curjhIndex].TC_AIF05)){
      wx.showModal({
        title: '提示',
        content: '拣货量与分配量不一致',
        showCancel: false
      })
      return false;
    }
    if (gzh != jhinfo[curjhIndex].TC_AIF03) {
      wx.showModal({
        title: '提示',
        content: '跟踪号错误',
        showCancel: false
      })
      return false;
    }
    if (kwh != jhinfo[curjhIndex].TC_AIF02) {
      wx.showModal({
        title: '提示',
        content: '库位号错误',
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
      content: "确定要提交拣货信息吗？",
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
