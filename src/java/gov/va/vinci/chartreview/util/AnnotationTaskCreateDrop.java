package gov.va.vinci.chartreview.util;

import com.mysema.query.sql.SQLTemplates;
import gov.va.vinci.chartreview.Utils;
import gov.va.vinci.siman.tools.DbConnectionInfo;
import gov.va.vinci.siman.tools.SimanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import javax.xml.bind.ValidationException;
import java.sql.*;

import static gov.va.vinci.siman.tools.SimanUtils.executeSqlStatement;

/**
 * Created by ryancornia on 8/26/14.
 */
public class AnnotationTaskCreateDrop {

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
     * Name of the clinical element table
     */
    public static final String ANNOTATION_TASK_TABLE = "annotation_task";
    /**
     * Log output object
     */
    protected static final Logger logger = Logger.getLogger(AnnotationTaskCreateDrop.class);

    /**
     * Create a connection with the database information provided.  The schema is optional and is specific primarily to
     * mssql wherein each database can store named "schemas" which group tables under a common name.
     *
     * @param dbConnectionInfo connection information
     * @param schema optional, name of the sql schema to use
     * @throws java.sql.SQLException if there is an error getting the database connection
     * @throws javax.xml.bind.ValidationException if there is a problem getting the SQLTemplates from the connection information
     */
    public AnnotationTaskCreateDrop(DbConnectionInfo dbConnectionInfo, String schema)
            throws SQLException, ValidationException {
        if(dbConnectionInfo == null) {
            throw new IllegalArgumentException("dbConnectionInfo argument cannot be null!");
        }
        //Create the connection from the connection info
        this.connection = DriverManager.getConnection(dbConnectionInfo.getUrl(),
                dbConnectionInfo.getUsername(),
                dbConnectionInfo.getPassword());
        this.templates = SimanUtils.getSQLTemplate(dbConnectionInfo);
        this.schema = schema;
        this.close_on_execute = true;
    }

    /**
     * Initialize with the database connection, templates.  The schema is optional is is specific primarily to mssql
     * wherein each database can store names "schemas" which group tables under a common name.
     *
     * @param conn database connection
     * @param templates implementation specific SQLTemplates instance
     * @param schema optional, name of the sql schema to use
     */
    public AnnotationTaskCreateDrop(Connection conn, SQLTemplates templates, String schema) {
        if(conn == null) {
            throw new IllegalArgumentException("Connection argument cannot be null!");
        }
        if(templates == null) {
            throw new IllegalArgumentException("Templates argument cannot be null!");
        }
        this.connection = conn;
        this.templates = templates;
        this.schema = schema;
    }

    /**
     * Get the schema string
     *
     * @return schema string
     */
    public String getSchema() {
        return schema;
    }

    /**
     * Set the schema string to be used.
     *
     * @param schema schema string to be used
     * @return reference to this SimanCreate instance
     */
    public AnnotationTaskCreateDrop setSchema(String schema) {
        this.schema = schema;
        return this;
    }

    /**
     * Reference to the database connection this object will use.
     *
     * @return database connection object
     */
    public Connection getConnection() {
        return connection;
    }

    /**
     * Set the database connection this object will use.
     *
     * @param connection database connection object
     * @return reference to this SimanCreate instance
     */
    public AnnotationTaskCreateDrop setConnection(Connection connection) {
        this.connection = connection;
        return this;
    }

    /**
     * Database specific SQLTemplates object used to generate create queries.
     *
     * @return SQLTemplates object
     */
    public SQLTemplates getTemplates() {
        return templates;
    }

    /**
     * Set the database specific SQLTemplates template to use.
     *
     * @param templates
     * @return
     */
    public AnnotationTaskCreateDrop setTemplates(SQLTemplates templates) {
        this.templates = templates;
        return this;
    }

    /**
     * True if the database connection will be closed after the tables are created.
     *
     * @return true if connection is closed on execute
     */
    public boolean isCloseOnExecute() {
        return close_on_execute;
    }

    /**
     * Set the flag to close the connection when the execute method finishes.
     *
     * @param close_on_execute true if the connection should be closed when execute finishes
     * @return reference to this ClinicalElementConfigurationCreate instance
     */
    public AnnotationTaskCreateDrop setCloseOnExecute(boolean close_on_execute) {
        this.close_on_execute = close_on_execute;
        return this;
    }

    /**
     * Generate the create table statements and execute them.
     */
    public void executeCreate() {
        StringBuilder builder = new StringBuilder();
        String table = null;
        boolean isSchema = StringUtils.isNotBlank(schema);

        /**
         * Add the ClinicalElement table
         */
        table = (isSchema) ? schema + "." + ANNOTATION_TASK_TABLE : ANNOTATION_TASK_TABLE;
        builder.append(templates.getCreateTable() + table + " (\n");
        //guid column
        builder.append(" " + templates.quoteIdentifier("annotation_guid") + " "
                + "VARCHAR(36)" + templates.getNotNull());

        //name column
        builder.append(",\n " + templates.quoteIdentifier("process_name") + " "
                + "VARCHAR(1000)");

        //description column
        builder.append(",\n " + templates.quoteIdentifier("task_id") + " "
                + "VARCHAR(64)");




        //configuration column - JSON blob
        builder.append(",\n " + templates.quoteIdentifier("principal_element_id") + " "
                + "VARCHAR(100)" + templates.getNotNull());

        //version column
        builder.append(",\n " + templates.quoteIdentifier("version") + " DATETIME " + templates.getNotNull());

        //Add the primary key and complete the table
        builder.append(",\n PRIMARY KEY(" + templates.quoteIdentifier("annotation_guid") + ")");
        builder.append("\n)\n");

        /**
         * Create the table
         */
        executeSqlStatement(connection, builder.toString());

        //Add the index
        builder = new StringBuilder();
        builder.append(templates.getCreateIndex() + ANNOTATION_TASK_TABLE + "_principal_element_id"
                + templates.getOn() + table + "(" + templates.quoteIdentifier("principal_element_id") + ")");

        /**
         * Execute the index statements
         */
        executeSqlStatement(connection, builder.toString());

        //Add the index
        builder = new StringBuilder();
        builder.append(templates.getCreateIndex() + ANNOTATION_TASK_TABLE + "_task_id"
                + templates.getOn() + table + "(" + templates.quoteIdentifier("task_id") + ")");

        /**
         * Execute the index statements
         */
        executeSqlStatement(connection, builder.toString());


        if(close_on_execute)
        {
            Utils.closeConnection(this.connection);
        }

    }
    public void executeDrop(){
        boolean isSchema = org.apache.commons.lang3.StringUtils.isNotBlank(this.schema);
        String table = null;
        table = isSchema?this.schema + "." + ANNOTATION_TASK_TABLE:ANNOTATION_TASK_TABLE;
        SimanUtils.executeSqlStatement(this.connection, "DROP TABLE " + table);
        if(this.close_on_execute) {
            this.close();
        }
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
