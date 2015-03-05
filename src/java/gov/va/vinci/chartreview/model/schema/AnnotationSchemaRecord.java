package gov.va.vinci.chartreview.model.schema;

import grails.validation.Validateable;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Date;

@Entity
@Validateable
public class AnnotationSchemaRecord {
    private String id;
    String name;
    String description;
    Date createdDate;
    String createdBy;
    Date lastModifiedDate;
    String lastModifiedBy;
    String serializationVersion;
    String serializationData;
    Timestamp version;

    @Id
    @Column(length = 36)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column(nullable = false)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column(nullable = false)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column(nullable = false)
    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    @Column(nullable = false)
    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    @Column
    public Date getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Date lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    @Column
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    @Column(nullable = false)
    public String getSerializationVersion() {
        return serializationVersion;
    }

    public void setSerializationVersion(String serializationVersion) {
        this.serializationVersion = serializationVersion;
    }

    @Column
    @Lob
    public String getSerializationData() {
        return serializationData;
    }

    public void setSerializationData(String serializationData) {
        this.serializationData = serializationData;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }
}