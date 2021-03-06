package gov.va.vinci.chartreview.model.schema;

import com.mysema.query.sql.SQLQuery;
import com.mysema.query.sql.SQLQueryFactoryImpl;
import com.mysema.query.sql.SQLTemplates;
import com.mysema.query.sql.dml.SQLDeleteClause;
import com.mysema.query.sql.dml.SQLInsertClause;
import com.mysema.query.sql.dml.SQLUpdateClause;
import com.mysema.query.types.Projections;
import gov.va.vinci.siman.tools.ConnectionProvider;
import org.apache.log4j.Logger;

import java.sql.Connection;
import java.sql.Timestamp;
import java.util.List;

/**
 * Data access object for dealing with AnnotationSchemaRecordDAO.
 */
public class AnnotationSchemaRecordDAO {

    /**
     * Database connection object
     */
    protected Connection connection = null;
    /**
     * SQL dialect to use
     */
    protected SQLTemplates dialect = null;
    /**
     * the schema this object resides in if needed. This is generally used in MSSQL connections.
     */
    protected String schema = null;

    /**
     * Logging object
     */
    protected static final Logger log = Logger.getLogger(AnnotationSchemaRecordDAO.class);

    /**
     * Set the database connection and dialect.
     *
     * @param connection database connection object
     * @param templates database dialect to be used
     */
    public AnnotationSchemaRecordDAO(Connection connection, SQLTemplates templates) {
        if(connection == null)
            throw new IllegalArgumentException("Connection argument cannot be null!");
        if(templates == null)
            throw new IllegalArgumentException("SQLTemplates argument cannot be null!");

        //Create the connection from the connection info
        this.connection = connection;
        this.dialect = templates;
    }

    /**
     * Set the database connection and dialect.
     *
     * @param connection database connection object
     * @param templates database dialect to be used
     * @param schema  the schema this object resides in if needed. Null if not needed.
     */
    public AnnotationSchemaRecordDAO(Connection connection, SQLTemplates templates, String schema) {
        if(connection == null)
            throw new IllegalArgumentException("Connection argument cannot be null!");
        if(templates == null)
            throw new IllegalArgumentException("SQLTemplates argument cannot be null!");

        //Create the connection from the connection info
        this.connection = connection;
        this.dialect = templates;
        this.schema = schema;
    }
    /**
     * Get the database specific dialect to be used in queries.
     *
     * @return SQLTemplates dialect object
     */
    public SQLTemplates getDialect() {
        return dialect;
    }

    /**
     * Set the SQLTemplates database specific dialect.
     *
     * @param dialect SQLTemplates dialect object
     * @return reference to this DAO object
     */
    public AnnotationSchemaRecordDAO setDialect(SQLTemplates dialect) {
        this.dialect = dialect;
        return this;
    }

    /**
     * Get the database connection object.
     *
     * @return database connection object
     */
    public Connection getConnection() {
        return connection;
    }

    /**
     * The database schema this object resides in if needed. Null if not needed.
     * @return  the schema this object resides in if needed. Null if not needed.
     */
    public String getSchema() {
        return schema;
    }

    /**
     * Set the database connection object
     *
     * @param connection database connection object
     * @return reference to this DAO object
     */
    public AnnotationSchemaRecordDAO setConnection(Connection connection) {
        this.connection = connection;
        return this;
    }

    /**
     * Add the annotation object to the database.
     *
     * @param record AnnotationSchemaRecord to add. Note: The id should be filled in before calling insert.
     */
    public void insert(AnnotationSchemaRecord record) {
        if(record == null)
            throw new IllegalArgumentException("record argument cannot be null");

        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");
        new SQLInsertClause(connection, dialect, QRECORD)
                .columns(QRECORD.id, QRECORD.createdBy, QRECORD.createdDate,
                        QRECORD.description, QRECORD.lastModifiedBy, QRECORD.lastModifiedDate,
                        QRECORD.name, QRECORD.serializationData, QRECORD.serializationVersion,
                        QRECORD.version)
                .values(record.getId(), record.getCreatedBy(), record.getCreatedDate(),
                        record.getDescription(), record.getLastModifiedBy(), record.getLastModifiedDate(),
                        record.getName(), record.getSerializationData(), record.getSerializationVersion(),
                        record.getVersion())
                .execute();

    }

    /**
     * Update the object in the database.
     * @param record record to add
     */
    public void update(AnnotationSchemaRecord record) {
        if(record == null)
            throw new IllegalArgumentException("record argument cannot be null");

        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");
        new SQLUpdateClause(connection, dialect, QRECORD)
                .where(QRECORD.id.eq(record.getId()))
                .set(QRECORD.createdBy, record.getCreatedBy())
                .set(QRECORD.createdDate, new Timestamp(record.getCreatedDate().getTime()))
                .set(QRECORD.description, record.getDescription())
                .set(QRECORD.lastModifiedBy, record.getLastModifiedBy())
                .set(QRECORD.lastModifiedDate, new Timestamp(record.getLastModifiedDate().getTime()))
                .set(QRECORD.name, record.getName())
                .set(QRECORD.serializationData, record.getSerializationData())
                .set(QRECORD.serializationVersion, record.getSerializationVersion())
                .set(QRECORD.version, record.getVersion())
                .execute();
    }

    /**
     * Get an AnnotationSchemaRecord by id.
     * @param id the id of the record to get.
     * @return the record, or null if the record was not found.
     *
     */
    public AnnotationSchemaRecord get(String id) {
        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");
        SQLQuery query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();

        query = query.from(QRECORD)
                .where(QRECORD.id.eq(id));

        List<AnnotationSchemaRecord> queryResults = getAnnotationSchemaRecords(QRECORD, query);

        if (queryResults.size() == 1) {
            return queryResults.get(0);
        } else {
            return null;
        }
    }


    /**
     * Get an AnnotationSchemaRecord by id.
     * @param name the name of the record to get.
     * @return the record, or null if the record was not found. Because name is enforced to be unique, there
     * will always be 0 or 1 results.
     *
     */
    public AnnotationSchemaRecord findByName(String name) {
        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");
        SQLQuery query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();

        query = query.from(QRECORD)
                .where(QRECORD.name.eq(name));

        List<AnnotationSchemaRecord> queryResults = getAnnotationSchemaRecords(QRECORD, query);

        if (queryResults.size() == 1) {
            return queryResults.get(0);
        } else {
            return null;
        }
    }


    /**
     * Get all AnnotationSchemaRecords
     * @return a list of zero or more records.
     *
     */
    public List<AnnotationSchemaRecord> getAll() {
        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");
        SQLQuery query = new SQLQueryFactoryImpl(dialect, new ConnectionProvider(connection)).query();

        query = query.from(QRECORD);

        return(getAnnotationSchemaRecords(QRECORD, query));
    }


    /**
     * Delete a schema.
     * @param id the id of the schema to delete.
     *
     */
    public Long delete(String id) {
        QAnnotationSchemaRecord QRECORD = new QAnnotationSchemaRecord("r", this.schema, "annotation_schema_record");

        return new SQLDeleteClause(connection, dialect, QRECORD)
                .where(QRECORD.id.eq(id))
                .execute();
    }

    /**
     * Populates a list based on the results from the query.
     * @param QRECORD   the record to get columns for.
     * @param query     the query results to create list from.
     * @return          a list of AnnotationSchemaRecord objects from the query resultset.
     */
    private List<AnnotationSchemaRecord> getAnnotationSchemaRecords(QAnnotationSchemaRecord QRECORD, SQLQuery query) {
        return query.list(
                    Projections.bean(AnnotationSchemaRecord.class,
                            QRECORD.createdBy,
                            QRECORD.createdDate,
                            QRECORD.description,
                            QRECORD.id,
                            QRECORD.lastModifiedBy,
                            QRECORD.lastModifiedDate,
                            QRECORD.name,
                            QRECORD.serializationData,
                            QRECORD.serializationVersion,
                            QRECORD.version)
            );
    }

}
