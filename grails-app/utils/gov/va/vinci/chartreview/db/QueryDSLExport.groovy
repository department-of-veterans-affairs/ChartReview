package gov.va.vinci.chartreview.db

import com.mysema.query.sql.codegen.MetaDataExporter

import java.sql.DriverManager


Class.forName("com.mysql.jdbc.Driver").newInstance();

java.sql.Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/example?" +
        "user=example&password=passw0rd");;
MetaDataExporter exporter = new MetaDataExporter();
exporter.setPackageName("gov.va.vinci.chartreview.model.schema");
exporter.setTargetFolder(new File("../../../../../../../src/java"));
exporter.export(conn.getMetaData());
