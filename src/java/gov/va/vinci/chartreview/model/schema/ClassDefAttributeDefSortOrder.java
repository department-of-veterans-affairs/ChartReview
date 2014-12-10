package gov.va.vinci.chartreview.model.schema;

import org.apache.commons.lang.builder.ToStringBuilder;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

@Entity
public class ClassDefAttributeDefSortOrder implements java.io.Serializable, Comparable<ClassDefAttributeDefSortOrder>
{
    private String id;
    private ClassDef classDef;
    private String objId;
    private Integer sortOrder = new Integer(0);
    private Timestamp version = new Timestamp((new Date()).getTime());

    public ClassDefAttributeDefSortOrder()
    {
    }

    public ClassDefAttributeDefSortOrder(ClassDefAttributeDefSortOrder obj) {
        this(
                UUID.randomUUID().toString()
        );
        this.classDef = obj.classDef;
        this.objId = obj.objId;
        this.sortOrder = obj.sortOrder;
    }

    public ClassDefAttributeDefSortOrder(String uid)
    {
        this.id = uid;
    }

    public ClassDefAttributeDefSortOrder(String uid, ClassDef classDef, String objId, Integer sortOrder)
    {
        this(uid);
        this.classDef = classDef;
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
    public ClassDef getClassDef()
    {
        return this.classDef;
    }
    public void setClassDef( ClassDef classDef )
    {
        this.classDef = classDef;
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

    public int compareTo(ClassDefAttributeDefSortOrder compObj)
    {
        return compare(this, compObj);
    }

    static int compare(ClassDefAttributeDefSortOrder obj1, ClassDefAttributeDefSortOrder obj2)
    {
        Integer sortOrder1 = obj1.getSortOrder();
        Integer sortOrder2 = obj2.getSortOrder();
        return sortOrder1.compareTo(sortOrder2);
    }
}
