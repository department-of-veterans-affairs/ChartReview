package gov.va.vinci.chartreview.model.schema;

import static com.mysema.query.types.PathMetadataFactory.*;

import com.mysema.query.types.path.*;

import com.mysema.query.types.PathMetadata;
import javax.annotation.Generated;
import com.mysema.query.types.Path;

import com.mysema.query.sql.ColumnMetadata;




/**
 * QAnnotationSchemaRecord is a Querydsl query type for QAnnotationSchemaRecord
 */
@Generated("com.mysema.query.sql.codegen.MetaDataSerializer")
public class QAnnotationSchemaRecord extends com.mysema.query.sql.RelationalPathBase<QAnnotationSchemaRecord> {

    private static final long serialVersionUID = 317569522;

    public static final QAnnotationSchemaRecord annotationSchemaRecord = new QAnnotationSchemaRecord("annotation_schema_record");

    public final StringPath createdBy = createString("createdBy");

    public final DateTimePath<java.sql.Timestamp> createdDate = createDateTime("createdDate", java.sql.Timestamp.class);

    public final StringPath description = createString("description");

    public final StringPath id = createString("id");

    public final StringPath lastModifiedBy = createString("lastModifiedBy");

    public final DateTimePath<java.sql.Timestamp> lastModifiedDate = createDateTime("lastModifiedDate", java.sql.Timestamp.class);

    public final StringPath name = createString("name");

    public final StringPath serializationData = createString("serializationData");

    public final StringPath serializationVersion = createString("serializationVersion");

    public final DateTimePath<java.sql.Timestamp> version = createDateTime("version", java.sql.Timestamp.class);

    public final com.mysema.query.sql.PrimaryKey<QAnnotationSchemaRecord> primary = createPrimaryKey(id);

    public QAnnotationSchemaRecord(String variable) {
        super(QAnnotationSchemaRecord.class, forVariable(variable), "null", "annotation_schema_record");
        addMetadata();
    }

    public QAnnotationSchemaRecord(String variable, String schema, String table) {
        super(QAnnotationSchemaRecord.class, forVariable(variable), schema, table);
        addMetadata();
    }

    public QAnnotationSchemaRecord(Path<? extends QAnnotationSchemaRecord> path) {
        super(path.getType(), path.getMetadata(), "null", "annotation_schema_record");
        addMetadata();
    }

    public QAnnotationSchemaRecord(PathMetadata<?> metadata) {
        super(QAnnotationSchemaRecord.class, metadata, "null", "annotation_schema_record");
        addMetadata();
    }

    public void addMetadata() {
        addMetadata(createdBy, ColumnMetadata.named("created_by").ofType(12).withSize(255).notNull());
        addMetadata(createdDate, ColumnMetadata.named("created_date").ofType(93).withSize(19).notNull());
        addMetadata(description, ColumnMetadata.named("description").ofType(12).withSize(255).notNull());
        addMetadata(id, ColumnMetadata.named("id").ofType(12).withSize(36).notNull());
        addMetadata(lastModifiedBy, ColumnMetadata.named("last_modified_by").ofType(12).withSize(255));
        addMetadata(lastModifiedDate, ColumnMetadata.named("last_modified_date").ofType(93).withSize(19));
        addMetadata(name, ColumnMetadata.named("name").ofType(12).withSize(255).notNull());
        addMetadata(serializationData, ColumnMetadata.named("serialization_data").ofType(-1).withSize(65535).notNull());
        addMetadata(serializationVersion, ColumnMetadata.named("serialization_version").ofType(12).withSize(50).notNull());
        addMetadata(version, ColumnMetadata.named("version").ofType(93).withSize(19).notNull());
    }

}

