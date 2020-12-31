var express = require('express');
var router = express.Router();

var infoDao = require('../dao/infoDao');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function (req, res, next) {
  console.log('info :' + JSON.stringify(req.body));

  if (req.body.cmd == "login") {
    console.log('login');
    infoDao.login(req, res, next);
  } else if (req.body.cmd == "getshinfo") {
    console.log('getshinfo');
    infoDao.getshinfo(req, res, next);
  } else if (req.body.cmd == "getsjhsl") {
    console.log('getsjhsl');
    infoDao.getsjhsl(req, res, next);
  } else if (req.body.cmd == "getkwlist") {
    console.log('getkwlist');
    infoDao.getkwlist(req, res, next);
  } else if (req.body.cmd == "updateshinfo") {
    console.log('updateshinfo');
    infoDao.updateshinfo(req, res, next);
  } else if (req.body.cmd == "updatesjinfo") {
    console.log('updatesjinfo');
    infoDao.updatesjinfo(req, res, next);
  } else if (req.body.cmd == "getkcinfo") {
    console.log('getkcinfo');
    infoDao.getkcinfo(req, res, next);
  } else if (req.body.cmd == "checkkcyw") {
    console.log('checkkcyw');
    infoDao.checkkcyw(req, res, next);
  } else if (req.body.cmd == "updatekcyw") {
    console.log('updatekcyw');
    infoDao.updatekcyw(req, res, next);
  } else if (req.body.cmd == "getkcywjykw") {
    console.log('getkcywjykw');
    infoDao.getkcywjykw(req, res, next);
  } else if (req.body.cmd == "updatekcpd") {
    console.log('updatekcpd');
    infoDao.updatekcpd(req, res, next);
  } else if (req.body.cmd == "getfyinfo") {
    console.log('getfyinfo');
    infoDao.getfyinfo(req, res, next);
  } else if (req.body.cmd == "getfyinfo_new") {
    console.log('getfyinfo_new');
    infoDao.getfyinfo_new(req, res, next);
  } else if (req.body.cmd == "getjhinfo") {
    console.log('getjhinfo');
    infoDao.getjhinfo(req, res, next);
  } else if (req.body.cmd == "getjhqr") {
    console.log('getjhqr');
    infoDao.getjhqr(req, res, next);
  } else if (req.body.cmd == "updatejhqr") {
    console.log('updatejhqr');
    infoDao.updatejhqr(req, res, next);
  } else if (req.body.cmd == "updatefyinfo") {
    console.log('updatefyinfo');
    infoDao.updatefyinfo(req, res, next);
  } else if (req.body.cmd == "updatefyinfo_new") {
    console.log('updatefyinfo_new');
    infoDao.updatefyinfo_new(req, res, next);
  } else if (req.body.cmd == "updatejhinfo") {
    console.log('updatejhinfo');
    infoDao.updatejhinfo(req, res, next);
  } else if (req.body.cmd == "getthtask") {
    console.log("getthtask");
    infoDao.getThTask(req,res,next);
  } else if (req.body.cmd == "getlstm") {
    console.log("getlstm");
    infoDao.getlstm(req,res,next);
  } else if (req.body.cmd == "updatethshinfo") {
    console.log("updatethshinfo");
    infoDao.updatethshinfo(req,res,next);
  } else if (req.body.cmd == "getcgshTask") {
    console.log("getcgshTask");
    infoDao.getcgshTask(req,res,next);
  } else if (req.body.cmd == "updatecgsh") {
    console.log("updatecgsh");
    infoDao.updatecgsh(req,res,next);
  } else if (req.body.cmd == "getAdviceKw") {
    console.log("getAdviceKw");
    infoDao.getAdviceKw(req,res,next);
  } else if (req.body.cmd == "getjljyTask") {
    console.log("getjljyTask");
    infoDao.getjljyTask(req,res,next);
  } else if (req.body.cmd == "getjymx") {
    console.log("getjymx");
    infoDao.getjymx(req,res,next);
  } else if (req.body.cmd == "getjymx2") {
    console.log("getjymx2");
    infoDao.getjymx2(req,res,next);
  } else if (req.body.cmd == "updatejymx") {
    console.log("updatejymx");
    infoDao.updatejymx(req,res,next);
  } else if (req.body.cmd == "getxmjy") {
    console.log("getxmjy");
    infoDao.getxmjy(req,res,next,"getxmjy");
  } else if (req.body.cmd == "getxmjy2") {
    console.log("getxmjy2");
    infoDao.getxmjy(req,res,next,"getxmjy2");
  } else if (req.body.cmd == "getresultlist") {
    console.log("getresultlist");
    infoDao.getresultlist(req,res,next);
  } else if (req.body.cmd == "getresultlist2") {
    console.log("getresultlist2");
    infoDao.getresultlist2(req,res,next);
  } else if (req.body.cmd == "updatexmjy") {
    console.log("updatexmjy");
    infoDao.updatexmjy(req,res,next);
  } else if (req.body.cmd == "updatexmjy2") {
    console.log("updatexmjy2");
    infoDao.updatexmjy2(req,res,next);
  } else if (req.body.cmd == "getblyy") {
    console.log("getblyy");
    infoDao.getblyy(req,res,next);
  } 
});


module.exports = router;
