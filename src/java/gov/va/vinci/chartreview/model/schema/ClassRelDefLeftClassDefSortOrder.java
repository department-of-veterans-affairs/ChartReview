package gov.va.vinci.chartreview.model.schema;

import org.apache.commons.lang.builder.ToStringBuilder;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

@Entity
public class ClassRelDefLeftClassDefSortOrder implements java.io.Serializable, Comparable<ClassRelDefLeftClassDefSortOrder>
{
    private String id;
    private ClassRelDef classRelDef;
    private String objId;
    private Integer sortOrder = new Integer(0);
    private Timestamp version = new Timestamp((new Date()).getTime());

    public ClassRelDefLeftClassDefSortOrder()
    {
    }

    public ClassRelDefLeftClassDefSortOrder(ClassRelDefLeftClassDefSortOrder obj) {
        this(
                UUID.randomUUID().toString()
        );
        this.classRelDef = obj.classRelDef;
        this.objId = obj.objId;
        this.sortOrder = obj.sortOrder;
    }

    public ClassRelDefLeftClassDefSortOrder(String uid)
    {
        this.id = uid;
    }

    public ClassRelDefLeftClassDefSortOrder(String uid, ClassRelDef classRelDef, String objId, Integer sortOrder)
    {
        this(uid);
        this.classRelDef = classRelDef;
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
    public ClassRelDef getClassRelDef()
    {
        return this.classRelDef;
    }
    public void setClassRelDef( ClassRelDef classRelDef )
    {
        this.classRelDef = classRelDef;
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

    public int compareTo(ClassRelDefLeftClassDefSortOrder compObj)
    {
        return compare(this, compObj);
    }

    static int compare(ClassRelDefLeftClassDefSortOrder obj1, ClassRelDefLeftClassDefSortOrder obj2)
    {
        Integer sortOrder1 = obj1.getSortOrder();
        Integer sortOrder2 = obj2.getSortOrder();
        return sortOrder1.compareTo(sortOrder2);
    }
}
