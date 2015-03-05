package gov.va.vinci.chartreview.model.schema;

import org.apache.commons.lang.builder.ToStringBuilder;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

@Deprecated
@Entity
public class AnnotationSchemaClassDefSortOrder implements java.io.Serializable, Comparable<AnnotationSchemaClassDefSortOrder>
{
    private String id;
    private AnnotationSchema annotationSchema;
    private String objId;
    private Integer sortOrder = new Integer(0);
    private Timestamp version = new Timestamp((new Date()).getTime());

    public AnnotationSchemaClassDefSortOrder()
    {
    }

    public AnnotationSchemaClassDefSortOrder(AnnotationSchemaClassDefSortOrder obj) {
        this(
                UUID.randomUUID().toString()
        );
        this.annotationSchema = obj.annotationSchema;
        this.objId = obj.objId;
        this.sortOrder = obj.sortOrder;
    }

    public AnnotationSchemaClassDefSortOrder(String uid)
    {
        this.id = uid;
    }

    public AnnotationSchemaClassDefSortOrder(String uid, AnnotationSchema annotationSchema, String objId, Integer sortOrder)
    {
        this(uid);
        this.annotationSchema = annotationSchema;
        this.objId = objId;
        this.sortOrder = sortOrder;
    }

    @Id
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }

    @ManyToOne
    public AnnotationSchema getAnnotationSchema()
    {
        return this.annotationSchema;
    }
    public void setAnnotationSchema( AnnotationSchema annotationSchema )
    {
        this.annotationSchema = annotationSchema;
    }

    @Column
    public String getObjId() {
        return objId;
    }
    public void setObjId(String objId) {
        this.objId = objId;
    }

    @Column
    public int getSortOrder() {
        return sortOrder;
    }
    public void setSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }
    public void setVersion(Timestamp version) {
        this.version = version;
    }

    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }

    public int compareTo(AnnotationSchemaClassDefSortOrder compObj)
    {
        return compare(this, compObj);
    }

    static int compare(AnnotationSchemaClassDefSortOrder obj1, AnnotationSchemaClassDefSortOrder obj2)
    {
        Integer sortOrder1 = obj1.getSortOrder();
        Integer sortOrder2 = obj2.getSortOrder();
        return sortOrder1.compareTo(sortOrder2);
    }
}
