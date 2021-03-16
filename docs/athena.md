CREATE EXTERNAL TABLE IF NOT EXISTS sales (
      continent STRING,
      country STRING,
      area STRING,
      channel STRING,
      letter STRING,
      datum STRING,
      num STRING,
      datum2 STRING,
      foo INT,
      foo2 DOUBLE,
      foo3 DOUBLE,
      foo4 DOUBLE,
      foo5 DOUBLE,
      foo6 DOUBLE
    )
	ROW FORMAT DELIMITED FIELDS TERMINATED BY ','
    LOCATION 's3://serverlogger-playground/athena/sales/'
    ;
