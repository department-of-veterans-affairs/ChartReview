package gov.va.vinci.chartreview.model;

import org.springframework.security.core.GrantedAuthority;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
public class UserProjectRole implements GrantedAuthority {
    private String id;
    private User user;
    private Project project;
    private Role role;
    private Integer processStepId;
    private Timestamp version;

    @Id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.REFRESH, optional = false)
    @JoinColumn(name = "user", referencedColumnName = "id")
    @OrderBy("name")
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.REFRESH, optional = false)
    @OrderBy("name")
    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    @ManyToOne(fetch=FetchType.EAGER, cascade = CascadeType.REFRESH, optional = false)
    @OrderBy("name")
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    @Column
    public Integer getProcessStepId() {
        return processStepId;
    }

    public void setProcessStepId(Integer processStepId) {
        this.processStepId = processStepId;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }

    @Transient
    /**
     * Returns a string representation of the role. This is in the format:
     * <br/><br/>
     * #ROLE#_#PROJECT.NAME(in upper case)#
     * <br/><br/>
     * if there is a workflow guid:
     * <br/><br/>
     * #ROLE#_#PROJECT.NAME(in upper case)#_#workflowStepId#
     */
    public String getAuthority() {
        if (processStepId != null) {
            return role.getName() + "_" + project.getName().toUpperCase() + "_" + processStepId;
        } else {
            return role.getName() + "_" + project.getName().toUpperCase();
        }
    }
}
