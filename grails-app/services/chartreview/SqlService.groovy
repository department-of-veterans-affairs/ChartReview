package chartreview
import grails.transaction.Transactional
import org.apache.commons.dbcp.BasicDataSource
import org.apache.commons.dbutils.DbUtils
import org.apache.commons.dbutils.QueryRunner
import org.apache.commons.dbutils.handlers.ArrayListHandler
import org.apache.commons.validator.GenericValidator

import javax.sql.DataSource
import javax.sql.rowset.RowSetMetaDataImpl
import java.sql.*

@Transactional
class SqlService {

    /**
     * Try to make a database connection.
     *
     * @param jdbcDriver
     * @param jdbcUsername
     * @param jdbcPassword
     * @param databaseConnectionUrl
     * @return  a map with the key RESULT, and the value being either "Test successful!", or the error message.
     */
    Map<String, String> connectionTest(String jdbcDriver, String jdbcUsername, String jdbcPassword, String databaseConnectionUrl) {
        Map result = new HashMap();

        Connection c = null;
        ResultSet rs = null;
        result.put("RESULT", "Test successful!");

        try {
            Class.forName(jdbcDriver);
            if (GenericValidator.isBlankOrNull(jdbcUsername) && GenericValidator.isBlankOrNull(jdbcPassword)) {
                c = DriverManager.getConnection(databaseConnectionUrl);
            }   else  {
                c = DriverManager.getConnection(databaseConnectionUrl, jdbcUsername, jdbcPassword);
            }

        }  catch (ClassNotFoundException cnf) {
            result.put("RESULT", "Could not load database driver: ${jdbcDriver}. Please contact the system administrator.");
        } catch (Exception e) {
            result.put("RESULT", "Connection Error: " + e.getMessage());
        } finally {
            DbUtils.closeQuietly((ResultSet)rs);
            DbUtils.closeQuietly((Connection)c);
        }
        return result;

    }


    /**
     * Run a query and return the results.
     * @param jdbcDriver
     * @param jdbcUsername
     * @param jdbcPassword
     * @param databaseConnectionUrl
     * @param query
     * @return A map with key status, value either FAILED or SUCCESS. If failed, the map will also have key message
     * with value being the error message. If SUCCESS, the map contains keys rows and metadata with values for the
     * rows returned and the metadata object.  The key rows contains a List<Object[]> where each Object[] in the list
     * represents a row.
     */
    public Map runQuery(DataSource ds, String query, Object[] queryParams, Integer maxRows = null) {
        Map<String, Object> results = new HashMap<>();

        Connection connection = null;

        try {
            connection = ds.getConnection();

            // Step 3 - Run the query.
            MetaDataArrayListHandler handler = new MetaDataArrayListHandler();
            List<Object[]> rows = null;
            QueryRunner run = new QueryRunner();
            if (queryParams) {
                rows = run.query(connection, query, handler, queryParams);
            } else {
                rows = run.query(connection, query, handler);
            }

            results.put("status", "SUCCESS");
            results.put("rowCount", rows.size());
            if (maxRows) {
                rows = rows.subList(0, maxRows);
            }
            Map<Integer, String> columnNameMap = new HashMap<>();

            results.put("rows", rows);

            results.put("metadata", handler.metaData);
            return results;
        } catch (SQLException e) {
            results.put("status","FAILED");
            results.put("message", "Error execution query: ${e.getMessage()}");
            return results;
        } finally {
            DbUtils.closeQuietly((Connection)connection);
        }
    }

    /**
     * Create a DataSource from JDBC Connection information.
     * @param jdbcDriver
     * @param jdbcUsername
     * @param jdbcPassword
     * @param databaseConnectionUrl
     * @return the created datasource.
     */
    public static DataSource createDataSource(String jdbcDriver, String jdbcUsername, String jdbcPassword,
                                       String jdbcConnectionUrl) throws Exception {

        try {
        Class.forName(jdbcDriver);
        } catch (Exception e) {
            throw new Exception("Could not find driver '${jdbcDriver}' in classpath.");
        }
        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setDriverClassName(jdbcDriver);
        dataSource.setUrl(jdbcConnectionUrl);
        if (!GenericValidator.isBlankOrNull(jdbcUsername)) {
             dataSource.setUsername(jdbcUsername);
        }
        if (!GenericValidator.isBlankOrNull(jdbcPassword)) {
            dataSource.setPassword(jdbcPassword);
        } else if (jdbcDriver == org.h2.Driver.class.getCanonicalName()) {
            dataSource.setPassword("");
        }

        Connection c = null;
        try {
             c = dataSource.getConnection();
        } catch (Exception e) {
            throw new Exception("Error creating connection: ${e.getMessage()}")
        } finally {
            DbUtils.closeQuietly((Connection)c);
        }

        return dataSource;
    }



//    /**
//     * Queries the datasource for all tables within it.
//     * @param ds  the datasource to query.
//     * @return    a list of database tables.
//     *
//     */
//    public List<DatabaseTable> getTableNames(DataSource ds) throws SQLException{
//        List<DatabaseTable> tableNames = new ArrayList<>();
//        Connection c = null;
//        try {
//            c = ds.getConnection();
//            DatabaseMetaData md = c.getMetaData();
//            ResultSet rs = md.getTables(null, null, "%", null);
//            while (rs.next()) {
//                DatabaseTable table = new DatabaseTable();
//                table.tableCat = safeGet(rs, "TABLE_CAT");
//
//                table.tableSchem = safeGet(rs, "TABLE_SCHEM");
//                table.tableName = safeGet(rs, "TABLE_NAME");
//                table.tableType = safeGet(rs, "TABLE_TYPE");
//                table.remarks = safeGet(rs, "REMARKS");
//                table.typeCat = safeGet(rs, "TYPE_CAT");
//                table.typeSchem= safeGet(rs, "TYPE_SCHEM")
//                table.typeName= safeGet(rs, "TYPE_NAME");
//                table.selfReferencingColName = safeGet(rs, "SELF_REFERENCING_COL_NAME");
//                table.refGeneration = safeGet(rs, "REF_GENERATION");
//                tableNames.add(table);
//            }
//        } finally{
//            DbUtils.closeQuietly((Connection) c);
//        }
//
//        return tableNames;
//    }
//
    /**
     * Get the fields names for a table. The table should be fully qualified if needed
     * @param ds  the datasource to query
     * @param tableName  The table to get column names for (fully qualified if needed)
     * @return  a list of column names in the table.
     * @throws SQLException  if table is not found in the database or any other SQL exception occurs.
     */
    public List<String> getFieldNames(DataSource ds, String tableName) throws SQLException{
        List<String> fieldNames = new ArrayList<String>();
        Connection c = null;
        ResultSet rs = null;
        try {
            c = ds.getConnection();

            rs = c.prepareStatement("select * from " + tableName).executeQuery();
            ResultSetMetaData m = rs.getMetaData();
            for (int i = 1; i <= m.getColumnCount(); i++)
            {
                String fieldName = m.getColumnName(i);
                fieldNames.add(fieldName);
            }
        } finally{
            DbUtils.closeQuietly((ResultSet)rs);
            DbUtils.closeQuietly((Connection) c);
        }
        return fieldNames;
    }


    /**
     * Tries to get a column by name. If an exception is thrown, null is returned.
     * @param rs        the resultset to get column from.
     * @param column    the column name to get.
     * @return          the column value, or if an exception is thrown, null.
     */
    private Object safeGet(ResultSet rs, String column) {
        try {
            return rs.getObject(column);
        } catch (SQLException e) {
            return null;
        }
    }


    /**
     * An internal DBUtils list handler to expose the metadata object.
     */
    protected class MetaDataArrayListHandler extends ArrayListHandler
    {
        ResultSetMetaData metaData = null;

        @Override
        protected Object[] handleRow(ResultSet rs)
                throws SQLException
        {
            if (metaData == null) {
                metaData = new RowSetMetaDataImpl();

                ResultSetMetaData metaData1 = rs.getMetaData();
                metaData.setColumnCount(rs.getMetaData().columnCount);
                for (int counter = 0; counter < rs.getMetaData().columnCount; counter++) {
                    metaData.setColumnName(counter+1, metaData1.getColumnName(counter+1));
                    metaData.setCatalogName(counter+1, metaData1.getCatalogName(counter+1));
                    metaData.setColumnDisplaySize(counter+1, metaData1.getColumnDisplaySize(counter+1));
                    metaData.setColumnLabel(counter+1, metaData1.getColumnLabel(counter+1));
                    metaData.setColumnType(counter+1, metaData1.getColumnType(counter+1));
                    metaData.setColumnTypeName(counter+1, metaData1.getColumnTypeName(counter+1));
                }
            }

            return super.handleRow(rs);
        }

        public ResultSetMetaData getMetaData() {
            return metaData;
        }
    }

}
