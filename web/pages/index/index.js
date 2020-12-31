/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

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

var userRole = [{ value: 'JXY', name: '机修员' },
{ value: 'SCZZ', name: '生产组长' },
{ value: 'PGY', name: '品管员' },
{ value: 'CGY', name: '仓管员' },
{ value: 'SCJHY', name: '生产计划员' },
{ value: 'ADMIN', name: '系统管理员' },
{ value: 'SCZZ_JXY', name: '生产组长+机修员' },]
/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
Page({

  /**
   * 初始数据，我们把服务地址显示在页面上
   */
  data: {
    userInfo: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    //userRole: '',
    username: '',
    password: '',
    items: [
      { value: 'JXY', name: '机修员' },
      { value: 'SCZZ', name: '生产组长' },
      { value: 'PGY', name: '品管员' },
      { value: 'CGY', name: '仓管员' },
      { value: 'SCJHY', name: '生产计划员' },
      { value: 'ADMIN', name: '系统管理员' },
    ],
    welcomeText: "欢迎使用满好报工系统,请登录微信"
  },
  radioChange(value) {
    this.setData({
      userRole: value.detail.value
    })
    console.log(value);
  },
  onLoad: function () {
    this.doLogin();
    //var userRole = wx.getStorageSync("ROLE");
    var username = wx.getStorageSync("USERNAME");
    var password = wx.getStorageSync("PASSWORD");
    this.setData({ username, password });
    // if (userRole) {
    //   // Do something with return value
    //   this.setData({
    //     userRole
    //   })
    // }
    // wx.navigateTo({
    //   url: '../task/task'
    // })
  },
  doLogin() {
    //showBusy('正在授权');
    var context = this;
    // 登录之前需要调用 qcloud.setLoginUrl() 设置登录地址，不过我们在 app.js 的入口里面已经调用过了，后面就不用再调用了
    qcloud.login({
      success(result) {
        //showSuccess('登录成功');
        console.log('登录成功', result);
        context.setData({ userInfo: result })
      },

      fail(error) {
        showModel('微信授权失败', error);
        console.log('登录失败', error);
      }
    });
  },
  loginbg: function () {
    var context = this;
    console.log("request loginbg");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'login',
        data: {
          username: this.data.username,
          password: this.data.password
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        if (result.data.data.length > 0) {
          var userInfo = result.data.data[0];
          wx.setStorageSync("USERNAME", context.data.username);
          wx.setStorageSync("PASSWORD", context.data.password);

          var useraccount = context.data.username;
          wx.setStorageSync("USERACCOUNT", useraccount);

          wx.setStorageSync("name", userInfo.TC_AFV05);
          
          wx.switchTab({
            url: '../home/home'
          })
        } else {
          wx.showModal({
            title: '登录失败',
            content: '账号或密码错误',
            showCancel: false
          });
        }
      },

      fail(error) {
        //showModel('请求失败', error);
        console.log('request fail', error);
      },

      complete() {
        console.log('request complete');
        //wx.stopPullDownRefresh();
      }
    });
  },
  startbg: function () {
    if (this.data.username == "") {
      wx.showModal({
        title: '登录失败',
        content: '请填写账号',
        showCancel: false
      });
      return;
    }
    if (this.data.password == "") {
      wx.showModal({
        title: '登录失败',
        content: '请填写密码',
        showCancel: false
      });
      return;
    }
    this.loginbg();
    // wx.setStorageSync("ROLE", this.data.userRole);
    // wx.navigateTo({
    //   url: '../task/task?role=' + this.data.userRole
    // })
  },
  ontapMore: function () {
    wx.showActionSheet({
      itemList: ['重启后台服务'],
      success: (res) => {
        console.log(res.tapIndex);
        if (res.tapIndex == 0) {
          this.restartServe();
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  restartServe: function () {
    var context = this;
    console.log("request restartServe");
    qcloud.request({
      // 要请求的地址
      url: config.service.requestUrl,
      data: {
        cmd: 'restartserve',
        data: {
        }
      },
      method: 'POST',
      // 请求之前是否登陆，如果该项指定为 true，会在请求之前进行登录
      login: true,

      success(result) {
        //showSuccess('列表更新成功');
        console.log('request success', result);
        wx.showToast({
          title: '重启后台服务成功',
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
  onbindInput_user: function (e) {
    this.setData({ username: e.detail.value });
  },
  onbindInput_pass: function (e) {
    this.setData({ password: e.detail.value });
  }
});
