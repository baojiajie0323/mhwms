
Page({
  data: {
  },
  onReady: function () {
    console.log("onReady");
  },
  ck_jh: function(e){
    console.log('ck_jh');
    wx.navigateTo({
      url: './ckjh/ckjh',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  ck_jhqr: function (e) {
    console.log('ck_jhqr');
    wx.navigateTo({
      url: './ckjhqr/ckjhqr',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  ck_fy: function (e) {
    console.log('ck_fy');
    wx.navigateTo({
      url: './ckfy/ckfy',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})
