

package gov.va.vinci.chartreview.model.schema;

import org.apache.commons.lang.builder.ToStringBuilder;
import javax.persistence.*;
import java.sql.Timestamp;
import java.util.*;

@Deprecated
@Entity
public class AttributeDefAttributeDefOptionDefSortOrder implements java.io.Serializable, Comparable<AttributeDefAttributeDefOptionDefSortOrder>
{
    private String id;
    private AttributeDef attributeDef;
    private String objId;
    private Integer sortOrder = new Integer(0);
    private Timestamp version = new Timestamp((new Date()).getTime());

    public AttributeDefAttributeDefOptionDefSortOrder()
    {
    }

    public AttributeDefAttributeDefOptionDefSortOrder(AttributeDefAttributeDefOptionDefSortOrder obj) {
        this(
                UUID.randomUUID().toString()
        );
        this.attributeDef = obj.attributeDef;
        this.objId = obj.objId;
        this.sortOrder = obj.sortOrder;
    }

    public AttributeDefAttributeDefOptionDefSortOrder(String uid)
    {
        this.id = uid;
    }

    public AttributeDefAttributeDefOptionDefSortOrder(String uid, AttributeDef attributeDef, String objId, Integer sortOrder)
    {
        this(uid);
        this.attributeDef = attributeDef;
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
    public AttributeDef getAttributeDef()
    {
        return this.attributeDef;
    }
    public void setAttributeDef( AttributeDef attributeDef )
    {
        this.attributeDef = attributeDef;
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

    public int compareTo(AttributeDefAttributeDefOptionDefSortOrder compObj)
    {
        return compare(this, compObj);
    }

    static int compare(AttributeDefAttributeDefOptionDefSortOrder obj1, AttributeDefAttributeDefOptionDefSortOrder obj2)
    {
        Integer sortOrder1 = obj1.getSortOrder();
        Integer sortOrder2 = obj2.getSortOrder();
        return sortOrder1.compareTo(sortOrder2);
    }
}
