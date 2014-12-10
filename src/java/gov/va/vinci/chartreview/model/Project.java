package gov.va.vinci.chartreview.model;

import gov.va.vinci.siman.model.ClinicalElementConfiguration;
import gov.va.vinci.siman.tools.DbConnectionInfo;
import grails.validation.Validateable;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.validator.GenericValidator;

import javax.persistence.*;
import java.io.Serializable;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Validateable
public class Project implements Serializable{
    private String id;
    private String name;
    private String description;
    private String databaseConnectionUrl;
    private String jdbcDriver;
    private String jdbcUsername;
    private String jdbcPassword;
    private Timestamp version;
    private List<UserProjectRole> authorities;

    @Id
    @Column(length = 36)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column(unique=true)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Column
    public String getDatabaseConnectionUrl() {
        return databaseConnectionUrl;
    }

    public void setDatabaseConnectionUrl(String databaseConnectionUrl) {
        this.databaseConnectionUrl = databaseConnectionUrl;
    }

    @Column
    public String getJdbcDriver() {
        return jdbcDriver;
    }

    public void setJdbcDriver(String jdbcDriver) {
        this.jdbcDriver = jdbcDriver;
    }

    @Column
    public String getJdbcUsername() {
        return jdbcUsername;
    }

    public void setJdbcUsername(String jdbcUsername) {
        this.jdbcUsername = jdbcUsername;
    }

    @Column
    public String getJdbcPassword() {
        return jdbcPassword;
    }

    public void setJdbcPassword(String jdbcPassword) {
        this.jdbcPassword = jdbcPassword;
    }


    @OneToMany(fetch=FetchType.EAGER, cascade = {CascadeType.REFRESH, CascadeType.PERSIST, CascadeType.MERGE}, mappedBy="project")
    @OrderBy("user")
    public List<UserProjectRole> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(List<UserProjectRole> authorities) {
        this.authorities = authorities;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }


    @Transient
    public DbConnectionInfo getDbConnectionInfo() {
        return new DbConnectionInfo(this.jdbcDriver, this.databaseConnectionUrl, this.jdbcUsername, this.jdbcPassword);
    }

    @Transient
    public String getTypeSystemPackageName(){
        if (GenericValidator.isBlankOrNull(name)) {
            return null;
        } else {
            return name.replaceAll("\\s", "").replaceAll("[^a-zA-Z0-9]+", "").toLowerCase();
        }
    }
}
