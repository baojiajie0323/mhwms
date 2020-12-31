"use strict"

var _dao = require('./dao');
var _sql = require('./sqlMapping');
var async = require('async');

var jsonWrite = _dao.jsonWrite;
var dbcode = _dao.dbcode;

module.exports = {
  listresult: function (res, err, result) {
    console.log('dbresult', err, result);
    if (err) {
      jsonWrite(res, {}, dbcode.FAIL);
    } else {
      var dbresult = [];
      var head = result.metaData;
      dbresult = result.rows.map((r) => {
        var json = {};
        r.map((r1, i) => {
          json[head[i].name] = r1;
        })
        return json;
      })
      jsonWrite(res, dbresult, dbcode.SUCCESS);
    }
  },
  login: function (req, res, next) {
    console.log('infoDao login');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.login;
      var where_params = [param.username, param.password];
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getshinfo: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getshinfo');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getshinfo;
      var where_params = [param.orderno];
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updateshinfo: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao updateshinfo', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.insertshinfo;
        var shinfo = param.shinfo;
        var where_params = [
          shinfo.TC_AID01,
          shinfo.TC_AID02,
          param.ssl,
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username,
          !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
          !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : ''
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var sqlstring = _sql.updateshcount;
        var shinfo = param.shinfo;
        var where_params = [param.ssl, shinfo.TC_AID02];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  updatesjinfo: function (req, res, next) {
    console.log('infoDao updatesjinfo', req.body.data);
    var param = req.body.data;
    var context = this;
    var hasKwRecord = false;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.insertsjinfo;
        var shinfo = param.shinfo;
        var where_params = [shinfo.TC_AID01,
        param.kwh, shinfo.TC_AID02, param.sjsjl,
        new Date().Format('yyyy-MM-dd'),
        new Date().Format('hh:mm:ss'),
        param.username,
        !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
        !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : ''
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var sqlstring = _sql.updatesjcount;
        var shinfo = param.shinfo;
        var where_params = [param.sjsjl, shinfo.TC_AID02];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var sqlstring = _sql.checkkw;
        var shinfo = param.shinfo;
        var where_params = [shinfo.TC_AID01, param.kwh, param.orderno];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          if (!err) {
            console.log("checkkw", result.rows[0][0]);
            hasKwRecord = result.rows[0][0] > 0;
          }
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var shinfo = param.shinfo;
        if (hasKwRecord) {
          var sqlstring = _sql.updatekw;
          var where_params = [param.sjsjl, shinfo.TC_AID01, param.kwh, param.orderno];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            callback(err);
          })
        } else {
          var sqlstring = _sql.insertkw;
          var where_params = [shinfo.TC_AID01, param.kwh, param.orderno, param.sjsjl, shinfo.TC_AID08];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            callback(err);
          })
        }
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },

  getkcinfo: function (req, res, next) {
    console.log('infoDao getkcinfo');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getkcinfo;
      if (param.kwh != "") {
        sqlstring += " and tc_aig02=" + "'" + param.kwh + "'";
      }
      if (param.orderno != "") {
        sqlstring += " and tc_aig03=" + "'" + param.orderno + "'";
      }

      sqlstring += " order by tc_aig02,tc_aig03,ima02";
      var where_params = [];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getsjhsl: function (req, res, next) {
    console.log('infoDao getsjhsl');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getsjhsl;
      var where_params = [param.ljbh];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getkwlist: function (req, res, next) {
    console.log('infoDao getkwlist');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getkwlist;
      var where_params = [param.kwh];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  checkkcyw: function (req, res, next) {
    console.log('infoDao checkkcyw');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.checkkcyw;
      var where_params = [param.ljbh, param.kwh, param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getkcywjykw: function (req, res, next) {
    console.log('infoDao getkcywjykw');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getkcywjykw;
      var where_params = [param.ljbh,param.kwh,param.kwh];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatekcyw: function (req, res, next) {
    console.log('infoDao updatekcyw', req.body.data);
    var param = req.body.data;
    var haskcinfo = false;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.getkccount;
        var where_params = [param.mbkw, param.orderno];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          if (!err) {
            haskcinfo = result.rows[0][0] > 0;
          }
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var kcinfo = param.kcinfo;
        if (haskcinfo) {
          var sqlstring = _sql.updatekcinfo_new;
          var where_params = [param.ywsl, param.mbkw, param.orderno];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            callback(err);
          })
        } else {
          var sqlstring = _sql.insertkcinfo;
          var where_params = [kcinfo.TC_AIG01, param.mbkw, param.orderno, param.ywsl, kcinfo.TC_AIG05];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            callback(err);
          })
        }
      })
      tasks.push(function (callback) {
        var sqlstring = _sql.updatekcinfo_old;
        var where_params = [param.ywsl, param.kwh, param.orderno];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })

      var nowDate = new Date();

      // 插入记录 2条old 2条new
      tasks.push(function (callback) {
        var kcinfo = param.kcinfo;
        var sqlstring = _sql.insertkcrecord_old1;
        var where_params = [
          kcinfo.TC_AIG01,
          param.kwh,
          param.orderno,
          param.ywsl,
          nowDate.Format('yyyy-MM-dd'),
          nowDate.Format('hh:mm:ss'),
          param.username,
          nowDate.Format('OyyyyMMddhhmmssS'),
          param.ywsl
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var kcinfo = param.kcinfo;
        var sqlstring = _sql.insertkcrecord_old2;
        var where_params = [
          kcinfo.TC_AIG01,
          param.kwh,
          param.orderno,
          param.ywsl,
          nowDate.Format('yyyy-MM-dd'),
          nowDate.Format('hh:mm:ss'),
          param.username,
          nowDate.Format('OyyyyMMddhhmmssS'),
          new Date(param.entryTime).Format('yyyy-MM-dd'),
          new Date(param.entryTime).Format('hh:mm:ss'),
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var kcinfo = param.kcinfo;
        var sqlstring = _sql.insertkcrecord_new1;
        var where_params = [
          kcinfo.TC_AIG01,
          param.orderno,
          param.ywsl,
          nowDate.Format('yyyy-MM-dd'),
          nowDate.Format('hh:mm:ss'),
          param.username,
          kcinfo.TC_AIG05,
          nowDate.Format('IyyyyMMddhhmmssS'),
          param.ywsl,
          param.ywsl
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var kcinfo = param.kcinfo;
        var sqlstring = _sql.insertkcrecord_new2;
        var where_params = [
          kcinfo.TC_AIG01,
          param.mbkw,
          param.orderno,
          param.ywsl,
          nowDate.Format('yyyy-MM-dd'),
          nowDate.Format('hh:mm:ss'),
          param.username,
          nowDate.Format('IyyyyMMddhhmmssS'),
          new Date(param.entryTime).Format('yyyy-MM-dd'),
          new Date(param.entryTime).Format('hh:mm:ss'),
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })

      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  updatekcpd: function (req, res, next) {
    console.log('infoDao updatekcpd', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.updatekcpd;
        var kcinfo = param.kcinfo;
        var where_params = [param.sjsl, param.pdh, kcinfo.TC_AIG01, param.orderno, param.kwh];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },

  getfyinfo: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getfyinfo');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getfyinfo;
      var where_params = [param.orderno];
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getfyinfo_new: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getfyinfo_new');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getfyinfo_new;
      var where_params = [param.orderno];
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatefyinfo: function (req, res, next) {
    console.log('infoDao updatefyinfo', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.insertfyinfo;
        var fyinfo = param.fyinfo;
        var where_params = [
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username,
          fyinfo.TC_AIF10,
          param.bm,
          param.shr,
          !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
          !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : ''
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  updatefyinfo_new: function (req, res, next) {
    console.log('infoDao updatefyinfo_new', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.insertfyinfo_new;
        var where_params = [
          param.orderno,
          !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
          !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : '',
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.bm || "",
          param.shr || "",
          param.cph || "",
          param.sjname || "",
          param.cardno || "",
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getjhinfo: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getjhinfo');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getjhinfo;
      var where_params = [param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatejhinfo: function (req, res, next) {
    console.log('infoDao updatejhinfo', req.body.data);
    var param = req.body.data;
    var jhinfo = param.jhinfo;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.insertfpjl;
        var where_params = [
          jhinfo.TC_AIF01,
          jhinfo.TC_AIF02,
          jhinfo.TC_AIF03,
          parseFloat(param.jhl),
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username,
          jhinfo.TC_AIF10,
          !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
          !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : ''
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      tasks.push(function (callback) {
        var sqlstring = _sql.updatefpjl;
        var where_params = [
          param.jhl,
          jhinfo.TC_AIF10,
          jhinfo.TC_AIF01,
          jhinfo.TC_AIF02,
          jhinfo.TC_AIF03,
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      // tasks.push(function (callback) {
      //   var sqlstring = _sql.deletekc;
      //   var where_params = [
      //     jhinfo.TC_AIF10, 
      //     jhinfo.TC_AIF01,
      //     jhinfo.TC_AIF02,
      //     jhinfo.TC_AIF03
      //   ];
      //   console.log(sqlstring, where_params)
      //   connection.execute(sqlstring, where_params, function (err, result) {
      //     callback(err);
      //   })
      // })


      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getjhqr: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getjhqr');
    var param = req.body.data;
    var context = this;

    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getjhqr;
      var where_params = [param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatejhqr: function (req, res, next) {
    console.log('infoDao updatejhqr', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.updatejhqr;
        var where_params = [
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username,
          param.orderno,
          !!param.enterDate ? new Date(param.enterDate).Format('yyyy-MM-dd') : '',
          !!param.enterDate ? new Date(param.enterDate).Format('hh:mm:ss') : ''
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getThTask: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getthtask');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getthtask;
      var where_params = [];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getlstm: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getlstm');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getlstm;
      var where_params = [param.lstm];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatethshinfo: function (req, res, next) {
    console.log('infoDao updatethshinfo', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.updatethshinfo;
        var where_params = [
          param.orderno,
          param.lstm,
          param.ljbh,
          param.shcount,
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, {}, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getcgshTask: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getcgshTask');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getcgsh;
      var where_params = [new Date().Format('yyyy-MM-dd')];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatecgsh: function (req, res, next) {
    console.log('infoDao updatecgsh', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var xwlcount = 0;
      var tasks = [];
      tasks.push(function (callback) {
        var sqlstring = _sql.getcgzwl;
        var where_params = [
          param.cgdh,
          param.xc,
          param.cgdh,
          param.xc,
          param.cgdh,
          param.xc
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          if (!err) {
            if (!!result.rows[0]) {
              xwlcount = result.rows[0][0];
              if (parseFloat(param.shcount) > parseFloat(xwlcount)) {
                err = "实收量大于在外量，不可收货";
                callback({ err: err });
                return;
              }
            }
          }
          callback(err);

        })
      })


      tasks.push(function (callback) {
        var sqlstring = _sql.updatecgsh;
        var where_params = [
          param.shcount,
          param.bccount,
          param.username,
          new Date().Format("hh:mm:ss"),
          param.orderno,
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, err, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },

  getjljyTask: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getjljyTask');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getjljy;
      var where_params = [];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },

  getjymx: function (req, res, next) {
    console.log('infoDao getjymx');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getjymx;
      var where_params = [param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getjymx2: function (req, res, next) {
    console.log('infoDao getjymx2');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getjymx2;
      var where_params = [param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatejymx: function (req, res, next) {
    console.log('infoDao updatejymx', req.body.data);
    var param = req.body.data;
    _dao.getConnection(res, function (connection) {
      var tasks = [];

      tasks.push(function (callback) {
        var sqlstring = _sql.updatejymx;
        var where_params = [
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.username,
          param.orderno,
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })

      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, err, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getxmjy: function (req, res, next, sql) {
    //var pool = _dao.getPool();
    console.log('infoDao getxmjy');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql[sql];
      var where_params = [param.orderno, param.xmbh];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getresultlist: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getresultlist');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getresultlist;
      var where_params = [param.orderno, param.xc];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  getresultlist2: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getresultlist');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getresultlist2;
      var where_params = [param.orderno];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
  updatexmjy: function (req, res, next) {
    console.log('infoDao updatexmjy', req.body.data);
    var param = req.body.data;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      var resultlist = param.resultlist;
      for (let i = 0; i < resultlist.length; i++) {
        tasks.push(function (callback) {
          var sqlstring = _sql.updatexmjy;
          var where_params = [
            param.orderno,
            param.xc,
            i + 1,
            parseFloat(resultlist[i]) || resultlist[i],
            param.jytype,
          ];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            callback(err);
          })
        })
      }

      tasks.push(function (callback) {
        var sqlstring = _sql.updatejystatus;
        var where_params = [
          param.username,
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.xmjy.TC_TTQ24,
          param.xmjy.TC_TTQ25,
          param.orderno,
          param.xc,
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, err, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  updatexmjy2: function (req, res, next) {
    console.log('infoDao updatexmjy', req.body.data);
    var param = req.body.data;
    _dao.getConnection(res, function (connection) {
      var tasks = [];
      var resultlist = param.resultlist;
      for (let i = 0; i < resultlist.length; i++) {
        for (let xc in resultlist[i]) {
          tasks.push(function (callback) {
            var sqlstring = _sql.updatexmjy2;
            console.log(resultlist[i][xc]);
            var where_params = [
              param.orderno,
              xc,
              i + 1,
              parseFloat(resultlist[i][xc]) || resultlist[i][xc],
              param.jytype,
            ];
            console.log(sqlstring, where_params)
            connection.execute(sqlstring, where_params, function (err, result) {
              callback(err);
            })
          })
        }
      }

      tasks.push(function (callback) {
        var sqlstring = _sql.updatejystatus2;
        var where_params = [
          param.username,
          new Date().Format('yyyy-MM-dd'),
          new Date().Format('hh:mm:ss'),
          param.xmjy.TC_TTQ24,
          param.xmjy.TC_TTQ25,
          param.orderno,
          param.xmbh,
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          callback(err);
        })
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, err, dbcode.FAIL);
        } else {
          jsonWrite(res, param, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },
  getAdviceKw: function (req, res, next) {
    console.log('infoDao getAdviceKw', req.body.data);
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var ljxz = 0;
      var kq = '';
      var kccount = 0;
      var kwh = "";
      var tasks = [];

      // 获取产品性质和库区
      tasks.push(function (callback) {
        var sqlstring = _sql.getAdviceKw1;
        var where_params = [
          param.ljbh,
          param.orderno
        ];
        console.log(sqlstring, where_params)
        connection.execute(sqlstring, where_params, function (err, result) {
          if (!err) {
            ljxz = result.rows[0][0];
            kq = result.rows[0][1];
            console.log('ljxz', ljxz, 'kq', kq);
          }
          callback(err);
        })
      })

      //查看是否有库存
      tasks.push(function (callback) {
        if (ljxz == 1 || kq == 'B') {
          var sqlstring = _sql.getAdviceKw2_1;
          var where_params = [
            kq,
            param.ljbh
          ];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            if (!err) {
              kccount = result.rows[0][0];
              console.log('kccount', kccount);
            }
            callback(err);
          })
        } else if (ljxz == 0 && kq != 'B') {
          var sqlstring = _sql.getAdviceKw2_2;
          var where_params = [
            param.ljbh
          ];
          console.log(sqlstring, where_params)
          connection.execute(sqlstring, where_params, function (err, result) {
            if (!err) {
              kccount = result.rows[0][0];
              console.log('kccount', kccount);
            }
            callback(err);
          })
        }
      })

      //找库位
      tasks.push(function (callback) {
        if (ljxz == 1 || kq == 'B') {
          if (kccount <= 0) {
            var sqlstring = _sql.getAdviceKw3_1;
            var where_params = [
              kq,
              kq
            ];
            console.log(sqlstring, where_params)
            connection.execute(sqlstring, where_params, function (err, result) {
              if (!err) {
                kwh = result.rows[0][0];
                console.log('kwh', kwh);
              }
              callback(err);
            })
          } else {
            var sqlstring = _sql.getAdviceKw3_2;
            var where_params = [
              param.ljbh,
              kq
            ];
            console.log(sqlstring, where_params)
            connection.execute(sqlstring, where_params, function (err, result) {
              if (!err) {
                kwh = result.rows[0][0];
                console.log('kwh', kwh);
              }
              callback(err);
            })
          }
        } else if (ljxz == 0 && kq != 'B') {
          if (kccount <= 0) {
            var sqlstring = _sql.getAdviceKw3_3;
            var where_params = [
              kq,
              kq
            ];
            console.log(sqlstring, where_params)
            connection.execute(sqlstring, where_params, function (err, result) {
              if (!err) {
                kwh = result.rows[0][0];
                console.log('kwh', kwh);
              }
              callback(err);
            })
          } else {
            var sqlstring = _sql.getAdviceKw3_4;
            var where_params = [
              param.ljbh,
            ];
            console.log(sqlstring, where_params)
            connection.execute(sqlstring, where_params, function (err, result) {
              if (!err) {
                kwh = result.rows[0][0];
                console.log('kwh', kwh);
              }
              callback(err);
            })
          }
        }
      })
      async.series(tasks, function (err, results) {
        if (err) {
          console.log('tasks error', err);
          connection.rollback(); // 发生错误事务回滚
          jsonWrite(res, err, dbcode.FAIL);
        } else {
          jsonWrite(res, { kwh }, dbcode.SUCCESS);
        }
        connection.release();
      });
    });
  },

  getblyy: function (req, res, next) {
    //var pool = _dao.getPool();
    console.log('infoDao getblyy');
    var param = req.body.data;
    var context = this;
    _dao.getConnection(res, function (connection) {
      var sqlstring = _sql.getblyy;
      var where_params = [];
      console.log(sqlstring, where_params)
      connection.execute(sqlstring, where_params, function (err, result) {
        context.listresult(res, err, result);
        connection.release();
      });
    });
  },
};
