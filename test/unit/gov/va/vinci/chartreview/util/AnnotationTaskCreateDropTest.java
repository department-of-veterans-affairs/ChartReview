package gov.va.vinci.chartreview.util;

import gov.va.vinci.siman.tools.DbConnectionInfo;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.ResultSetHandler;
import org.apache.commons.dbutils.handlers.ArrayListHandler;
import org.junit.Before;
import org.junit.Test;

import java.sql.*;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

/**
 * Created by ryancornia on 8/26/14.
 */
public class AnnotationTaskCreateDropTest {


    DbConnectionInfo dbConnectionInfo = new DbConnectionInfo("org.h2.Driver", "jdbc:h2:mem:TestDb", "sa", "");

    @Before
    public void setupDB() throws Exception {
        Class.forName(dbConnectionInfo.getDriver()).newInstance();

    }

    @Test
    public void testCreateDropExecute() throws Exception {
        Connection conn = DriverManager.getConnection(dbConnectionInfo.getUrl(), dbConnectionInfo.getUsername(), dbConnectionInfo.getPassword());

        //Create the tables first
        AnnotationTaskCreateDrop sct = new AnnotationTaskCreateDrop(dbConnectionInfo, null);
        sct.execute();

         //Check the tables QueryRunner
        QueryRunner dataManager = new QueryRunner();
        ResultSetHandler rsh = new ArrayListHandler();

        List<Object[]> results = (List<Object[]>) dataManager.query(conn, "SELECT * FROM INFORMATION_SCHEMA.TABLES", rsh);

        boolean found = false;
        for (int i=0; i < results.size(); i++) {
            Object[] singleRow = results.get(i);
            if (singleRow[2].equals("ANNOTATION_TASK")) {
                assertTrue(((String)singleRow[5]).contains("\"annotation_id\" VARCHAR(36) NOT NULL"));
                assertTrue(((String)singleRow[5]).contains("\"process_name\" VARCHAR(1000)"));
                assertTrue(((String)singleRow[5]).contains("\"task_id\" VARCHAR(64),"));
                assertTrue(((String)singleRow[5]).contains("\"principal_element_id\" VARCHAR(100) NOT NULL,"));
                assertTrue(((String)singleRow[5]).contains("\"version\" DATETIME NOT NULL"));
                found = true;
            }
        }
        assertTrue(found);
    }
}