package gov.va.vinci.chartreview.model;

import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Entity
public class User implements UserDetails {
    private String id;
    private String username;
    private String password;
    private Timestamp version;
    boolean enabled = true;
    boolean accountNonExpired;
    boolean accountNonLocked;
    boolean credentialsNonExpired;
    private List<UserProjectRole> authorities;

    @Id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column(unique=true)
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Column
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Column
    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    @Column
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    public void setAccountNonExpired(boolean accountExpired) {
        this.accountNonExpired = accountExpired;
    }

    @Column
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }

    @Column
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    public void setCredentialsNonExpired(boolean passwordNonExpired) {
        this.credentialsNonExpired = passwordNonExpired;
    }

    @Version
    public Timestamp getVersion() {
        return version;
    }

    public void setVersion(Timestamp version) {
        this.version = version;
    }

    @OneToMany(fetch=FetchType.EAGER, cascade = {CascadeType.REFRESH, CascadeType.PERSIST, CascadeType.MERGE}, mappedBy="user")
    @OrderBy("project, role")
    public List<UserProjectRole> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(List<UserProjectRole> authorities) {
        this.authorities = authorities;
    }

    public List<String> stringAuthorities() {
        List<String> results = new ArrayList<String>();

        for (UserProjectRole  role: getAuthorities()) {
            results.add(role.getAuthority());
        }

        return results;
    }
}
