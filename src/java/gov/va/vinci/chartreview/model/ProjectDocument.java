package gov.va.vinci.chartreview.model;

import gov.va.vinci.siman.model.ClinicalElementConfiguration;
import gov.va.vinci.siman.tools.DbConnectionInfo;
import grails.validation.Validateable;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Validateable
public class ProjectDocument implements Serializable{
    private String id;
    private String name;
    private String description;
    private String mimeType;
    private Project project;
    private User uploadedBy;
    private byte[] content;
    private Timestamp version;

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

    @Column(length = 1000)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column(nullable = true)
    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    @ManyToOne(fetch=FetchType.LAZY, cascade = CascadeType.REFRESH, optional = false)
    @JoinColumn(name = "user", referencedColumnName = "id")
    @OrderBy("username")
    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.REFRESH, optional = false)
    @OrderBy("name")
    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    @Lob
    @Column(nullable = false)
    public byte[] getContent() {
        return content;
    }

    public void setContent(byte[] content) {
        this.content = content;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }

}
