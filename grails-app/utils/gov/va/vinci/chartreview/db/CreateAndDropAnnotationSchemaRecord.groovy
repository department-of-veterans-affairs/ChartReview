package gov.va.vinci.chartreview.db
import com.mysema.query.sql.*
import gov.va.vinci.siman.tools.SimanUtils
import org.apache.commons.lang.StringUtils
import org.apache.log4j.Logger

import javax.validation.ValidationException
import java.sql.Connection
import java.sql.SQLException

import static gov.va.vinci.siman.tools.SimanUtils.executeSqlStatement
/**
 * Created by ryancornia on 2/18/15.
 *
 * Table structure:
 <code>
 +-----------------------+--------------+------+-----+---------+-------+
 | Field                 | Type         | Null | Key | Default | Extra |
 +-----------------------+--------------+------+-----+---------+-------+
 | id                    | varchar(36)  | NO   | PRI | NULL    |       |
 | created_by            | varchar(255) | NO   |     | NULL    |       |
 | created_date          | datetime     | NO   |     | NULL    |       |
 | description           | varchar(255) | NO   |     | NULL    |       |
 | last_modified_by      | varchar(255) | YES  |     | NULL    |       |
 | last_modified_date    | datetime     | YES  |     | NULL    |       |
 | name                  | varchar(255) | NO   |     | NULL    |       |
 | serialization_data    | longtext     | YES  |     | NULL    |       |
 | serialization_version | varchar(255) | NO   |     | NULL    |       |
 | version               | datetime     | YES  |     | NULL    |       |
 +-----------------------+--------------+------+-----+---------+-------+
 </code>
 */
class CreateAndDropAnnotationSchemaRecord {

    /**
     * Name of the database schema if applicable - mssql
     */
    protected String schema = "";
    /**
     * Connection to the database
     */
    protected Connection connection = null;
    /**
     * Database specific SQLTemplates object to use for database specific command syntax
     */
    protected SQLTemplates templates = null;
    /**
     * Should the database connection be closed after the execute method completes. This is set to true when a
     * DbConnectionInfo object is used in the constructor.
     */
    protected boolean close_on_execute = false;
    /**
     * Name of the  table
     */
    public static final String TABLE_NAME = "annotation_schema_record";
    /**
     * Logger
     */
    protected static final Logger logger = Logger.getLogger(CreateAndDropAnnotationSchemaRecord.class);

    /**
     * Create a connection with the database information provided.  The schema is optional and is specific primarily to
     * mssql wherein each database can store named "schemas" which group tables under a common name.
     *
     * @param dbConnectionInfo connection information
     * @param schema optional, name of the sql schema to use
     */
    public CreateAndDropAnnotationSchemaRecord(Connection dbConnection, SQLTemplates templates, String schema) {
        //Create the connection from the connection info
        this.connection = dbConnection;
        this.templates = templates;
        this.schema = schema;
    }

    /**
     * Return the database implementation specific SQLTemplate for each known driver.  If driver is unknown then throws
     * a ValidationException.
     *
     * @param driver connection driver string
     * @return database specific SQLTemplate
     * @throws javax.xml.bind.ValidationException if the driver is not known
     */
    public static SQLTemplates getSQLTemplate(String driver) throws ValidationException {
        // OracleTemplates, PostgresTemplates, SQLiteTemplates
        if ("org.h2.Driver".equals(driver)) {
            return H2Templates.builder().quote().build();
        } else if ("org.hsqldb.jdbcDriver".equals(driver)) {
            return HSQLDBTemplates.builder().quote().build();
        } else if ("com.mysql.jdbc.Driver".equals(driver)) {
            return MySQLTemplates.builder().quote().build();
        } else if ("com.microsoft.sqlserver.jdbc.SQLServerDriver".equals(driver) || "net.sourceforge.jtds.jdbc.Driver".equals(driver)) {
            return SQLServerTemplates.builder().quote().build();
        } else {
            throw new ValidationException("Could not determine dialect from driver. " + driver);
        }
    }

    public void executeCreate() {
        StringBuilder builder = new StringBuilder();
        String table = null;
        boolean isSchema = StringUtils.isNotBlank(schema);

        /**
         * Add the ClinicalElement table
         */
        table = (isSchema) ? schema + "." + TABLE_NAME : TABLE_NAME;

        builder.append(templates.getCreateTable() + table + " (\n");

        builder.append(" " + templates.quoteIdentifier("id") + " "
                + "VARCHAR(36)" + templates.getNotNull());
        builder.append(",\n " + templates.quoteIdentifier("created_by") + " "
                + "VARCHAR(255)" + templates.getNotNull());
        builder.append(",\n " + templates.quoteIdentifier("created_date") + " "
                + "DATETIME "+ templates.getNotNull());
        builder.append(",\n " + templates.quoteIdentifier("description") + " "
                + "VARCHAR(255)" + templates.getNotNull());
        builder.append(",\n " + templates.quoteIdentifier("last_modified_by") + " "
                + "VARCHAR(255)");
        builder.append(",\n " + templates.quoteIdentifier("last_modified_date") + " "
                + "DATETIME");
        builder.append(",\n " + templates.quoteIdentifier("name") + " "
                + "VARCHAR(255)" + templates.getNotNull());

        if (this.getTemplates().getClass().getCanonicalName().equals("com.mysema.query.sql.HSQLDBTemplates")){
            builder.append(",\n " + templates.quoteIdentifier("serialization_data") + " "
                    + "VARCHAR(2000)" + templates.getNotNull());
        } else{
            builder.append(",\n " + templates.quoteIdentifier("serialization_data") + " "
                    + "VARCHAR(MAX)" + templates.getNotNull());
        }

        builder.append(",\n " + templates.quoteIdentifier("serialization_version") + " "
                + "VARCHAR(50) " + templates.getNotNull());

        builder.append(",\n " + templates.quoteIdentifier("version") + " "
                + "DATETIME "+ templates.getNotNull());

        //Add the primary key and complete the table
        builder.append(",\n PRIMARY KEY(" + templates.quoteIdentifier("id") + ")");
        builder.append("\n)\n");

        /**
         * Create the table
         */
        executeSqlStatement(connection, builder.toString());

        //Add the index
        builder = new StringBuilder();
        builder.append(templates.getCreateUniqueIndex() + TABLE_NAME + "_id"
                + templates.getOn() + table + "(" + templates.quoteIdentifier("id") + ")");

        /**
         * Execute the index statements
         */
        executeSqlStatement(connection, builder.toString());
    }

    public void executeDrop(){
        boolean isSchema = org.apache.commons.lang3.StringUtils.isNotBlank(this.schema);
        String table = null;
        table = isSchema?this.schema + "." + TABLE_NAME:TABLE_NAME;
        SimanUtils.executeSqlStatement(this.connection, "DROP TABLE " + table);
        if(this.close_on_execute) {
            this.close();
        }
    }

    boolean getClose_on_execute() {
        return close_on_execute
    }

    void setClose_on_execute(boolean close_on_execute) {
        this.close_on_execute = close_on_execute
    }

    String getSchema() {
        return schema
    }

    void setSchema(String schema) {
        this.schema = schema
    }

    Connection getConnection() {
        return connection
    }

    void setConnection(Connection connection) {
        this.connection = connection
    }

    SQLTemplates getTemplates() {
        return templates
    }

    void setTemplates(SQLTemplates templates) {
        this.templates = templates
    }

    public void close() {
        if(this.connection != null) {
            try {
                this.connection.close();
            } catch (SQLException var2) {
                logger.error("Error closing the connection!", var2);
            }
        }

    }
}
