
Page({
  data: {
  },
  onReady: function () {
    console.log("onReady");
  },
  rk_sh: function(e){
    console.log('rk_sh');
    wx.navigateTo({
      url: './rksh/rksh',
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  rk_sj: function (e) {
    console.log('rk_sj'); 
    wx.navigateTo({
      url: './rksj/rksj',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})
