
Page({
  data: {
  },
  onReady: function () {
    console.log("onReady");
  },
  kc_cx: function(e){
    console.log('kc_cx');
    wx.navigateTo({
      url: './kccx/kccx',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  kc_yw: function (e) {
    console.log('kc_yw');
    wx.navigateTo({
      url: './kcyw/kcyw',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  kc_pd: function (e) {
    console.log('kc_pd');
    wx.navigateTo({
      url: './kcpd/kcpd',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})
