//task.js
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
    content: JSON.stringify(content),
    showCancel: false
  });
};


Page({
  data: {
  },
  onReady: function() {
    console.log("onReady");
    // this.setData({name: wx.getStorageSync("USERNAME")});

    // this.getSjlist();
  },
  onLoad: function(options) {
    var {
      orderno,
      xc
    } = options;
    console.log(orderno);
    this.setData({
      orderno,
      xc
    })

    this.getBlyy();
    this.getXmjy(orderno, xc);
  },
  onClicktask: function(e) {
    console.log("onClicktask", e);
    var orderno = e.currentTarget.dataset.id;
    this.onClickThtask(orderno);
  },
  onClickThtask: function(orderno) {
    var task = this.data.thtask.find(t => t.TC_TTA01 == orderno);
    if (!task) {
      return;
    }
    var url = 'thsm/thsm?orderno=' + orderno +
      '&thkh=' + task.TC_TTA03 +
      wx.navigateTo({
        url
      })
  },
  getXmjy: function(orderno, xc) {
    var context = this;
    console.log("request getXmjy");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getxmjy',
        data: {
          orderno,
          xc
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);

        if (result.data.data.length > 0) {
          var xmjy = result.data.data[0]
          var resultlist = Array(xmjy.TC_TTQ07).fill('');
          var resultblyy = Array(xmjy.TC_TTQ07).fill('');
          context.setData({
            xmjy,
            resultlist,
            resultblyy
          })
          context.getResultlist(orderno, xc);
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
  getBlyy: function (orderno, xc) {
    var context = this;
    console.log("request getBlyy");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getblyy',
        data: {
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);

        context.setData({blyy: result.data.data});
      },

      fail(error) {
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    });
  },
  getResultlist: function(orderno, xc) {
    var context = this;
    console.log("request getresultlist");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'getresultlist',
        data: {
          orderno,
          xc
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        var resultlist = context.data.resultlist;
        var resultblyy = context.data.resultblyy;
        var result = result.data.data;
        for (var i = 0; i < result.length; i++) {
          var stringres = String(result[i].TC_BMQ04);
          if(stringres.length >= 8){
            stringres = result[i].TC_BMQ04.toFixed(3);
          }
          resultlist[result[i].TC_BMQ03 - 1] = stringres;
          resultblyy[result[i].TC_BMQ03 - 1] = result[i].TC_BMQ06
        }
        context.setData({
          resultlist,
          resultblyy
        });
      },

      fail(error) {
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
      }
    });
  },
  updatexmjy: function() {
    var context = this;
    var {
      orderno,
      xc,
      xmjy,
      resultlist,
      resultblyy
    } = this.data;

    console.log("request updatexmjy");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'updatexmjy',
        data: {
          orderno,
          xc,
          resultlist,
          resultblyy,
          jytype: xmjy.TC_TTQ15
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
  bindcyslInput: function(e) {

  },
  getBlyyIndex: function(){
    console.log("");
    return 1
  },
  bindPickerChange: function(e) {
    var {
      resultblyy,
      blyy
    } = this.data;
    var index = e.currentTarget.dataset.index;
    console.log('bindPickerChange', index, e.detail.value)
    resultblyy[index] = blyy[e.detail.value].QCE01;
    this.setData({
      resultblyy
    })
  },
  onClickjymx: function(e) {
    console.log("onclickjymx", e);
    var xh = e.currentTarget.id;
  },
  bindsizeinput: function(e) {
    var {
      resultlist
    } = this.data;
    var index = e.currentTarget.dataset.index;
    if (index < resultlist.length) {
      resultlist[index] = e.detail.value;
      this.setData({
        resultlist
      });
    }
  },

  checkSubmit: function() {
    var {
      resultlist
    } = this.data;
    for (var i = 0; i < resultlist.length; i++) {
      if (resultlist[i] == '') {
        wx.showModal({
          title: '提示',
          content: '测量值不够',
          showCancel: false
        })
        return false;
      }
    }

    return true;
  },
  ontapsubmit: function() {
    // wx.navigateBack({
    // });
    // return;

    if (!this.checkSubmit()) {
      return;
    }
    wx.showModal({
      content: "确定要提交信息吗？",
      confirmText: "确定",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.updatexmjy();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

})