var oracledb = require('oracledb');

oracledb.getConnection(
  {
    user          : "mh01",
    password      : "mh01",
    connectString : "116.246.2.202:1521/TOPPROD"
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    console.log('Connection was successful!');

    connection.close(
      function(err)
      {
        if (err) {
          console.error(err.message);
          return;
        }
      });
  });