
Page({
  data: {
  },
  onReady: function () {
    console.log("onReady");
  },
  rk: function(e){
    console.log('rk');
    wx.navigateTo({
      url: '../rk/rk',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  ck: function (e) {
    console.log('ck');
    wx.navigateTo({
      url: '../ck/ck',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  kc: function (e) {
    console.log('kc');
    wx.navigateTo({
      url: '../kc/kc',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})
