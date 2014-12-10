package gov.va.vinci.chartreview.model.schema;

import grails.persistence.Entity;
import org.apache.commons.lang.builder.ToStringBuilder;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Version;
import java.sql.Timestamp;
import java.util.Date;

@Entity
public class AnnotationSchemaRef implements java.io.Serializable {

    private String id;
    private String name;
	private String uri;
    private Timestamp version = new Timestamp((new Date()).getTime());

	public AnnotationSchemaRef() {
	}

	public AnnotationSchemaRef(String uid, String name) {
        this.id = uid;
        this.name = name;
	}

	public AnnotationSchemaRef(String uid, String name, String uri) {
        this(uid, name);
		this.uri = uri;
	}


    @Id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Column
	public String getUri() {
		return uri;
	}

	public void setUri(String uri) {
		this.uri = uri;
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
}
