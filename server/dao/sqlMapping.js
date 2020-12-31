var sqlmap = {

  /*=============================APP相关====================================*/
  login: "SELECT tc_afv01,tc_afv02,tc_afv05 FROM tc_afv_file \
  WHERE tc_afv03 IN ('4','6') AND tc_afv04='Y' \
  AND tc_afv01 = :username AND tc_afv02 = :password ",

  //入库-收货
  getshinfo: "SELECT tc_aid02,tc_aid01, ima02, nvl(tc_aid04,0) tc_aid04,round(tc_aid04/nvl(tc_aic04,1),3) bzl,tc_aid04 - nvl(tc_aid16,0) syl,tc_aid04 - nvl(tc_aid17,0) sjsyl,\
  to_char(tc_aid08,'yyyy-mm-dd') tc_aid08,tc_aid09,nvl(tc_aid16,0) tc_aid16,nvl(tc_aid17,0) tc_aid17,tc_aic02,tc_aic03 \
  FROM tc_aid_file \
  INNER JOIN ima_file ON tc_aid01=ima01 \
  LEFT JOIN tc_aic_file ON tc_aid01=tc_aic01 \
  WHERE tc_aid02=:orderno",
  insertshinfo: "INSERT INTO tc_aif_file (tc_aif01,tc_aif03,tc_aif05,tc_aif06,tc_aif07,tc_aif08,tc_aif09,tc_aif14,tc_aif15) \
  VALUES(:ljbh,:orderno,:ssl,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username,9,to_date(:enterdate,'yyyy-mm-dd'),:entertime)",
  updateshcount: "UPDATE tc_aid_file set tc_aid16=nvl(tc_aid16,0) + :ssl \
  WHERE tc_aid02=:orderno",

  //入库-上架
  insertsjinfo: "INSERT INTO tc_aif_file (tc_aif01,tc_aif02,tc_aif03,tc_aif05,tc_aif06,tc_aif07,tc_aif08,tc_aif09,tc_aif14,tc_aif15) \
  VALUES(:ljbh,:kwh,:orderno,:sjsjl,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username,1,to_date(:enterdate,'yyyy-mm-dd'),:entertime)",
  updatesjcount: "UPDATE tc_aid_file set tc_aid17=nvl(tc_aid17,0) + :sjsjl \
  WHERE tc_aid02=:orderno",
  getsjhsl: "select nvl(tc_aic04,1) as hsl from tc_aic_file where tc_aic01=:ljbh",
  getkwlist: "SELECT * FROM tc_aib_file where TC_AIB01=:khw",
  checkkw: "SELECT COUNT(*) FROM tc_aig_file WHERE tc_aig01=:ljbh AND tc_aig02=:kwh AND tc_aig03=:orderno",
  updatekw: "UPDATE tc_aig_file SET tc_aig04=tc_aig04 + :sjsjl \
  WHERE tc_aig01=:ljbh AND tc_aig02=:kwh AND tc_aig03=:orderno",
  insertkw: "INSERT INTO tc_aig_file (tc_aig01,tc_aig02,tc_aig03,tc_aig04,tc_aig05) VALUES (:ljbh,:kwh,:orderno,:sjsjl,to_date(:scrq,'yyyy-mm-dd'))",



  //库存查询
  getkcinfo: "SELECT tc_aig01,tc_aig02,tc_aig03,ima02,tc_aig04,round(tc_aig04/nvl(tc_aic04,1),3) bzl,to_char(tc_aig05,'yyyymmdd') as tc_aig05 ,tc_aic02,tc_aic03 \
    FROM tc_aig_file \
    LEFT JOIN ima_file ON tc_aig01 = ima01 \
    LEFT JOIN tc_aic_file ON tc_aig01 = tc_aic01 \
    where tc_aig04 > 0",

  //库存盘点
  updatekcpd: "update tc_aii_file SET tc_aii09=:sjsl \
    WHERE tc_aii01=:pdh AND tc_aii03=:ljbh AND tc_aii04=:orderno AND tc_aii05=:kwh ",

  //库存移位
  getkccount: "SELECT COUNT(*) FROM tc_aig_file WHERE tc_aig02=:kwh AND tc_aig03=:orderno",
  checkkcyw: "select * from tc_aie_file where tc_aie02=:ljbh and tc_aie03=:kwh AND tc_aie04=:orderno",
  updatekcinfo_new: "UPDATE tc_aig_file SET tc_aig04=tc_aig04 + :zyl \
       WHERE tc_aig02=:kwh AND tc_aig03=:orderno",
  insertkcinfo: "INSERT INTO tc_aig_file values (:ljbh,:kwh,:orderno,:zyl,to_date(:scrq,'yyyymmdd'),'','','','','','','','','','')",
  updatekcinfo_old: "update tc_aig_file SET tc_aig04=tc_aig04 - :zyl \
       where tc_aig02=:kwh AND tc_aig03=:orderno",
  insertkcrecord_old1: "insert into tc_aif_file values (:ljbh,:kwh,:orderno,'',:zyl1,to_date(:submitdate,'yyyy-mm-dd'),:submittime,:useraccount,'2',:submitstring,:zyl2,'Y','','','','')",
  insertkcrecord_old2: "insert into tc_aif_file values (:ljbh,:kwh,:orderno,'',:zyl1,to_date(:submitdate,'yyyy-mm-dd'),:submittime,:useraccount,'3',:submitstring,'','A','',to_date(:entrydate,'yyyy-mm-dd'),:entrytime,'')",
  insertkcrecord_new1: "insert into tc_aid_file values (:ljbh,:orderno,'',:zyl1,to_date(:submitdate,'yyyy-mm-dd'),:submittime,:useraccount,to_date(:scrq,'yyyymmdd'),:submitstring,'1','','3','','','',:zyl2,:zyl3,'')",
  insertkcrecord_new2: "insert into tc_aif_file values (:ljbh,:kwh,:orderno,'',:zyl1,to_date(:submitdate,'yyyy-mm-dd'),:submittime,:useraccount,'1',:submitstring,'','','',to_date(:entrydate,'yyyy-mm-dd'),:entrytime,'')",
  getkcywjykw:"SELECT a.tc_aig02 JYKW FROM ( \
    SELECT tc_aig02,sum(tc_aig04) tc_aig04 FROM tc_aig_file,tc_aib_file \
    WHERE tc_aig02=tc_aib01 AND tc_aig01=:ljbh \
    AND tc_aig04 > 0 AND tc_aig02 <> :kwh1 \
    AND tc_aib02 IN (SELECT tc_aib02 FROM tc_aib_file WHERE tc_aib01=:kwh2) \
    GROUP BY tc_aig02 ORDER BY tc_aig04 ) a \
    WHERE rownum=1",

  //出库发运
  getfyinfo: "SELECT * FROM tc_aif_file WHERE tc_aif10=:djbh ",
  getfyinfo_new: "SELECT * FROM tc_aiq_file WHERE tc_aiq01=:djbh ",
  insertfyinfo: "INSERT INTO tc_aif_file (tc_aif01, tc_aif02,tc_aif03,tc_aif05,tc_aif06,tc_aif07,tc_aif08,tc_aif09,tc_aif10,tc_aif12,tc_aif13,tc_aif14,tc_aif15,tc_aif16) \
    VALUES('aaa','aaa','aaa',0,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username,4,:djbh,'N',:bm,to_date(:enterdate,'yyyy-mm-dd'),:entertime,:shr)",
  insertfyinfo_new: "insert into tc_aiq_file (tc_aiq01,tc_aiq02,tc_aiq03,tc_aiq04,tc_aiq05,tc_aiq06,tc_aiq07,tc_aiq08,tc_aiq09,tc_aiq10) \
  values (:djbh,to_date(:enterdate,'yyyy-mm-dd'),:entertime,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:bm,:shr,:cph,:sjname,:cardno) ",

  //出库拣货
  getjhinfo: "SELECT tc_aif01,tc_aif10,ima01,ima02,tc_aif03,tc_aif02,round(tc_aif05,3) as tc_aif05,round(tc_aif05/nvl(tc_aic04,1),3) as bzsl,to_char(tc_aig05,'yyyymmdd') as tc_aig05,round(tc_aig04,3) as tc_aig04,tc_aic02,tc_aic03,round((tc_aig04/nvl(tc_aic04,1)),3) as KCBZL \
  FROM tc_aif_file,ima_file,tc_aic_file,tc_aig_file \
  WHERE tc_aif01=ima01 AND tc_aif01=tc_aic01(+) \
  AND tc_aif01=tc_aig01(+) AND tc_aif03=tc_aig03(+) AND tc_aif02=tc_aig02(+) \
  AND tc_aif10=:orderno AND tc_aif12='N' ORDER BY tc_aif02,tc_aif03,ima02,ima01",
  insertfpjl: "INSERT INTO tc_aif_file (tc_aif01,tc_aif02,tc_aif03,tc_aif05,tc_aif06,tc_aif07,tc_aif08,tc_aif09,tc_aif10,tc_aif12,tc_aif14,tc_aif15) \
  VALUES(:ljbh,:kwh,:gzh,:ydsl,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username,3,:orderno,'A',to_date(:enterdate,'yyyy-mm-dd'),:entertime)",
  updatefpjl: "UPDATE tc_aif_file SET tc_aif11=:jhsl,tc_aif12='Y' \
  WHERE tc_aif09=2 AND tc_aif10=:orderno AND tc_aif01=:jlbh AND tc_aif02=:kwh AND tc_aif03=:gzh",
  deletekc: "DELETE FROM tc_aie_file WHERE tc_aie01=:orderno AND tc_aie02=:ljbh AND tc_aie03=:kwh AND tc_aie04=:gzh",

  //出库拣货确认
  getjhqr: "SELECT tc_aif01,ima02,sum(tc_aif05) fpl,tc_aic02,sum(tc_aif05/NVL(tc_aic04,1)) bzl,tc_aic03,sum(tc_aif11) jhl \
  FROM tc_aif_file,ima_file,tc_aic_file \
  WHERE tc_aif01=ima01 AND tc_aif01=tc_aic01(+) AND tc_aif09='2' AND tc_aif10=:djbh \
  GROUP BY tc_aif01,ima02,tc_aic02,tc_aic03",
  updatejhqr: "INSERT INTO tc_aif_file (tc_aif01, tc_aif02,tc_aif03,tc_aif05,tc_aif06,tc_aif07,tc_aif08,tc_aif09,tc_aif10,tc_aif12,tc_aif15,tc_aif16) \
  VALUES('aaa','aaa','aaa',0,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username,4,:djbh,'N',to_date(:enterdate,'yyyy-mm-dd'),:entertime)",

  //退货任务
  getthtask: "select tc_tta03, tc_tta01, tc_tta04, tc_tta05, tc_tta10, SUM(tc_ttc11) tc_ttc11_count from tc_tta_file \
  left join tc_ttc_file on tc_ttc01 = tc_tta01 \
  where tc_tta09 = '1' \
  GROUP BY tc_tta03, tc_tta01, tc_tta04, tc_tta05, tc_tta10",
  getlstm: "SELECT ima01,ima02,imaud03 FROM ima_file WHERE imaud03=:lstm AND imaacti='Y' AND ima140='N'",
  updatethshinfo: "INSERT INTO tc_ttd_file (tc_ttd01,tc_ttd02,tc_ttd03,tc_ttd04,tc_ttd05,tc_ttd06,tc_ttd07) \
  values (:orderno,:lstm,:ljbh,:shcount,to_date(:todaydate,'yyyy-mm-dd'),:todaytime,:username)",

  //采购收货
  getcgsh: "SELECT tc_aip03,tc_aip04,tc_aip06,tc_aip07,tc_aip08,tc_aip09,gen02,tc_aip11,tc_aip10,tc_aip13 \
  FROM tc_aip_file \
  LEFT JOIN gen_file ON tc_aip15=gen01 \
  WHERE tc_aip01=to_date(:todaydate,'yyyy-mm-dd') AND tc_aip17='N'",
  getcgzwl: "SELECT pmn20 + nvl(imaud11,0) - nvl(a.rvb07,0) + nvl(b.rvv17,0) zwl FROM pmn_file,ima_file,\
  (SELECT SUM(rvb07) rvb07 FROM rva_file,rvb_file \
  WHERE rva01=rvb01 AND rvb04=:cgdh1 and rvb03=:xc1 \
  AND rvbud02='N' AND rvaconf IN ('Y','N') ) a, \
  (SELECT SUM(rvv17) rvv17 FROM rvv_file,rvu_file \
  WHERE rvv01=rvu01 AND rvuconf='Y' AND rvv36=:cgdh2 AND rvv37=:xc2 \
  AND rvvud02='N' AND rvu00 IN ('2','3') ) b \
  WHERE pmn01=:cgdh3 and pmn02=:xc3 \
  AND pmn04=ima01",
  updatecgsh: "UPDATE tc_aip_file SET tc_aip12=:shcount,tc_aip16=:bccount,tc_aip17='Y',tc_aip18=:useraccount,tc_aip19=:todaytime \
  WHERE tc_aip13=:orderno",

  //进料检验
  getjljy: "SELECT tc_tto13,  tc_tto01,  tc_tto03,    tc_tto14, tc_tto15, tc_tto17, tc_tto18 \
  FROM tc_tto_file \
  WHERE tc_tto19='N'",
  getjymx: "SELECT tc_ttq20,tc_ttq02,tc_ttq21 FROM tc_ttq_file \
  WHERE tc_ttq01=:orderno",
  getjymx2: "SELECT DISTINCT tc_ttq20,CASE tc_ttq22 WHEN 'N' THEN tc_ttq03 ELSE tc_ttq13 END tc_ttq03,tc_ttq22,tc_ttq21 \
  FROM tc_ttq_file \
  WHERE tc_ttq01=:jydh \
  ORDER BY tc_ttq03",
  updatejymx: "UPDATE tc_tto_file set tc_tto19='Y',tc_tto25=to_date(:todaydate,'yyyy-mm-dd'),tc_tto26=:todaytime,tc_tto27=:username \
  WHERE tc_tto01=:orderno",
  getxmjy: "SELECT tc_ttq20,tc_ttq07,tc_ttq02,tc_ttq01, tc_ttq15,tc_ttq17 FROM tc_ttq_file \
  WHERE tc_ttq01=:orderno AND tc_ttq03=:mxbh",
  getxmjy2: "SELECT tc_ttq07,tc_ttq02,tc_ttq01, tc_ttq15,tc_ttq19,to_char(tc_ttq24,'yyyy-mm-dd') tc_ttq24,tc_ttq25 FROM tc_ttq_file \
  WHERE tc_ttq01=:orderno AND tc_ttq13=:mxbh",
  getresultlist: "SELECT tc_bmq03, tc_bmq04, tc_bmq06 FROM tc_bmq_file \
  WHERE tc_bmq01=:orderno AND tc_bmq02=:xc",
  getresultlist2: "SELECT tc_bmq02, tc_bmq03, tc_bmq04 FROM tc_bmq_file \
  WHERE tc_bmq01=:orderno",
  updatexmjy:"MERGE INTO tc_bmq_file \
  USING (SELECT :orderno aa,:xc bb,:reslutxc cc,:result dd FROM dual) \
  ON (tc_bmq01=aa AND tc_bmq02=bb AND tc_bmq03=cc) \
  WHEN MATCHED THEN \
  UPDATE SET tc_bmq04=dd \
  WHEN NOT MATCHED THEN \
  INSERT VALUES(aa,bb,cc,dd,:jytype,'','','')",
  updatexmjy2: "MERGE INTO tc_bmq_file \
  USING (SELECT :orderno aa,:xc bb,:reslutxc cc,:result dd FROM dual) \
  ON (tc_bmq01=aa AND tc_bmq02=bb AND tc_bmq03=cc) \
  WHEN MATCHED THEN \
  UPDATE SET tc_bmq04=dd \
  WHEN NOT MATCHED THEN \
  INSERT VALUES(aa,bb,cc,dd,:jytype,'','','')",
  updatejystatus:"update tc_ttq_file SET tc_ttq21='Y',tc_ttq23=:username,tc_ttq26=to_date(:todaydate,'yyyy-mm-dd'),tc_ttq27=:todaytime,tc_ttq24=to_date(:begindate,'yyyy-mm-dd'),tc_ttq25=:begintime \
  WHERE tc_ttq01=:orderno AND tc_ttq02=:xc",
  updatejystatus2:"update tc_ttq_file SET tc_ttq21='Y',tc_ttq23=:username,tc_ttq26=to_date(:todaydate,'yyyy-mm-dd'),tc_ttq27=:todaytime,tc_ttq24=to_date(:begindate,'yyyy-mm-dd'),tc_ttq25=:begintime \
  WHERE tc_ttq01=:orderno AND tc_ttq13=:mxbh",
  getblyy:"SELECT qce01,qce03 FROM qce_file WHERE qce04='2'",

  //建议库位
  getAdviceKw1: "SELECT CASE WHEN ima06 LIKE '11%' THEN 0 ELSE 1 END ima06,tc_aid13 FROM tc_aid_file,ima_file \
  WHERE tc_aid09 NOT LIKE 'I%' AND tc_aid09 NOT LIKE 'O%' \
  AND tc_aid09 NOT LIKE '%P%' AND tc_aid01=ima01 AND tc_aid01=:ljbh AND tc_aid02=:orderno",
  getAdviceKw2_1: "SELECT COUNT(*) FROM tc_aig_file,tc_aib_file \
  WHERE tc_aig02=tc_aib01 AND tc_aib02=:kq AND tc_aig01=:ljbh  AND tc_aig02 NOT LIKE '%99%' \
  AND tc_aig04 >0",
  getAdviceKw2_2: " SELECT COUNT(*) FROM tc_aig_file  WHERE tc_aig01=:ljbh AND tc_aig02 NOT LIKE '%99%' \
  AND tc_aig04 >0 AND tc_aig02 NOT LIKE 'B%' AND tc_aig02 NOT LIKE '4%' ",
  getAdviceKw3_1: "SELECT aa.tc_aib01 kwh FROM ( SELECT tc_aib01,tc_aib02,bb.tc_aig02 FROM tc_aib_file,( \
  SELECT tc_aig02,sum(tc_aig04) FROM tc_aig_file,tc_aib_file  WHERE tc_aig02=tc_aib01 AND tc_aib02=:kq1 \
  GROUP BY tc_aig02  HAVING SUM(tc_aig04) > 0 ) bb \
  WHERE tc_aib02=:kq2 AND tc_aib01=bb.tc_aig02(+)  AND tc_aig02 IS NULL AND tc_aib02 NOT LIKE '%99%' \
  ORDER BY tc_aib01 ) aa  WHERE rownum=1",
  getAdviceKw3_2: "SELECT aa.tc_aig02 kwh FROM ( SELECT tc_aig02,min(tc_aig04) FROM tc_aig_file,tc_aib_file \
  WHERE tc_aig02=tc_aib01 AND tc_aig01=:ljbh AND tc_aib02=:kq AND tc_aig02 NOT LIKE '%99%' \
  AND tc_aig04 >0 GROUP BY tc_aig02 ORDER BY min(tc_aig04) ) aa \
  WHERE rownum=1 ",
  getAdviceKw3_3: "SELECT aa.tc_aib01 kwh FROM ( SELECT tc_aib01,tc_aib02,bb.tc_aig02 FROM tc_aib_file,( \
  SELECT tc_aig02,sum(tc_aig04) FROM tc_aig_file,tc_aib_file  WHERE tc_aig02=tc_aib01 AND tc_aib02=:kq \
  GROUP BY tc_aig02  HAVING SUM(tc_aig04) > 0 ) bb \
  WHERE tc_aib02=:kq AND tc_aib01=bb.tc_aig02(+)  AND tc_aig02 IS NULL AND tc_aib02 NOT LIKE '%99%' \
  ORDER BY tc_aib01 ) aa  WHERE rownum=1",
  getAdviceKw3_4: "SELECT aa.tc_aig02 kwh FROM ( SELECT tc_aig02,min(tc_aig04) FROM tc_aig_file \
  WHERE tc_aig01=:ljbh  AND tc_aig02 NOT LIKE '%99%' AND tc_aig02 NOT LIKE 'B%' AND tc_aig02 NOT LIKE '4%' \
  AND tc_aig04 >0 GROUP BY tc_aig02 ORDER BY min(tc_aig04) ) aa \
  WHERE rownum=1 "
};

module.exports = sqlmap;
