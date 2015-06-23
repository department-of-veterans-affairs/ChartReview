package chartreview

import com.mysema.query.sql.H2Templates
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.siman.model.ClinicalElement
import gov.va.vinci.siman.schema.SimanCreate
import gov.va.vinci.siman.schema.SimanDrop
import grails.test.mixin.Mock
import grails.test.mixin.TestFor
import org.apache.log4j.Level
import org.apache.log4j.LogManager
import org.junit.Before

import java.sql.Connection
import java.sql.DriverManager
import java.sql.ResultSet

@TestFor(AnnotationService)
@Mock([Project, ProjectService, AnnotationService])
class AnnotationServiceTest {

    def actualFromChartReview = """
                        <annotations>
                           <annotation id="1">
                              <schema id="104" />
                              <schemaRef id="110" />
                              <creationDate>2014-03-06T08:02:58Z</creationDate>
                              <clinicalElementConfiguration id="12000aa3-50eb-40d6-ad30-563a0e7ad6cc" />
                              <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=12000aa3-50eb-40d6-ad30-563a0e7ad6cc;key0-ID=9;" />
                              <spans>
                                 <span>
                                    <clinicalElementField id="WHOLE_CONTENT" />
                                    <startOffset>62</startOffset>
                                    <endOffset>217</endOffset>
                                    <text>plit-thickness skin grafting a total area of approximately 15 x 18 cm on the right leg and 15 x 15 cm on the left leg.(Medical Transcription Sample Report)</text>
                                 </span>
                              </spans>
                           </annotation>
                        </annotations>"""

    public static String DB_CONNECTION_URL = "jdbc:h2:mem:testDb;DATABASE_TO_UPPER=false;MVCC=TRUE;LOCK_TIMEOUT=10000;DB_CLOSE_DELAY=-1";
    Connection conn;

    @Before
    public void setup() {
        LogManager.rootLogger.level = Level.DEBUG;
        conn = DriverManager.getConnection(DB_CONNECTION_URL, "sa", "");
        try {
            SimanDrop drop = new SimanDrop(conn, new H2Templates(), null)
            drop.execute();
        } catch (Exception e) {
            println(e);
        }
        SimanCreate create = new SimanCreate(conn, new H2Templates(), null);
        create.execute();
    }

    public void testXmlParsing() {
        def exampleXml = """
                    <annotations>
                        <annotation id="2">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:52Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;id=2;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>10</startOffset>
                                    <endOffset>22</endOffset>
                                    <text>kettSSN: 123</text>
                                </span>
                            </spans>
                            <features>
                                <feature type="0">
                                    <name>Comments</name>
                                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
                                    <elements>
                                        <element>
                                            <value>simple feature</value>
                                            <schemaRef></schemaRef>
                                        </element>
                                    </elements>
                                </feature>
                                <feature type="2">
                                    <name>Comments</name>
                                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
                                    <elements>
                                        <element>
                                            <value>simple feature 2</value>
                                            <schemaRef></schemaRef>
                                        </element>
                                    </elements>

                                </feature>
                            </features>
                        </annotation>
                        <annotation id="0">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:53Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;id=2;"/>
                        </annotation>
                        <annotation id="1">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:42Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=37aa90bb-be98-4e2d-aefb-153716cd493f;id=1;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>3</startOffset>
                                    <endOffset>42</endOffset>
                                    <text>se:  802002-06-01 08:00:00.0 - Pulse 80</text>
                                </span>
                            </spans>
                        </annotation>
                        <annotation id="0">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:46Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=37aa90bb-be98-4e2d-aefb-153716cd493f;id=1;"/>
                        </annotation>
                    </annotations>
               """;

        def testInstances=[]

        mockDomain(Project, testInstances)

        Project p = new Project(id: '1', name: "Project1", description: "Test Project 1", jdbcDriver: "org.h2.Driver", databaseConnectionUrl: DB_CONNECTION_URL, jdbcPassword: "", jdbcUsername: "sa").save();

        //println("Starting H2 web server... should be empty...");
        //org.h2.tools.Server.startWebServer(conn);

        service.saveAnnotations("proc", "tId1", p, exampleXml, "vhaslccornir", "ceGroup", "myGroup");

        ResultSet rs =conn.createStatement().executeQuery("select count(*) from clinical_element");
        rs.next();
        assert(rs.getInt(1) == 2);


        rs =conn.createStatement().executeQuery("select count(*) from annotation");
        rs.next();
        assert(rs.getInt(1) == 4);

        rs =conn.createStatement().executeQuery("select count(*) from feature");
        rs.next();
        assert(rs.getInt(1) == 2);

        //println("Starting H2 web server again... should have annotation...");
        //org.h2.tools.Server.startWebServer(conn);


        List<ClinicalElement> clinicalElementList = service.getExistingAnnotations("1", "ceGroup", "myGroup");

        assertNotNull(clinicalElementList);
        assertEquals(clinicalElementList.size(),2);

        ClinicalElement e = null;
        clinicalElementList.each { it ->
            if (it.serializedKeyString == "id=2;") {
                e = it;
            }
        }

        assertNotNull(e);

        // Order not necessarily preserved, check to make sure one annotation has 2 features, one has 0.
        int featureSize1 = e.annotations.get(0).getFeatures().size();
        int featureSize2 = e.annotations.get(1).getFeatures().size();

        assert(featureSize1 == 0 || featureSize2 == 0);
        assert(featureSize1 == 2 || featureSize2 == 2);

        // Test an invalid group, should be no annotations for this group.
        List<ClinicalElement> emptyList =  service.getExistingAnnotations("1", "threeStepProcess:1:9",  "NOT_A_VALID_GROUP");
        assert(!emptyList);

    }


    public void testSaveTwice() {
        def exampleXml = """
                    <annotations>
                        <annotation id="2">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:52Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;key1-id=1;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>10</startOffset>
                                    <endOffset>22</endOffset>
                                    <text>kettSSN: 123</text>
                                </span>
                            </spans>
                            <features>
                                <feature type="0">
                                    <name>Comments</name>
                                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
                                    <elements>
                                        <element>
                                            <value>simple feature</value>
                                            <schemaRef></schemaRef>
                                        </element>
                                    </elements>
                                </feature>
                                <feature type="2">
                                    <name>Comments</name>
                                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
                                    <elements>
                                        <element>
                                            <value>simple feature 2</value>
                                            <schemaRef></schemaRef>
                                        </element>
                                    </elements>

                                </feature>
                            </features>
                        </annotation>
                        <annotation id="0">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:53Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;key1-id=1;"/>
                        </annotation>
                        <annotation id="1">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:42Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=37aa90bb-be98-4e2d-aefb-153716cd493f;id=1;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>3</startOffset>
                                    <endOffset>42</endOffset>
                                    <text>se:  802002-06-01 08:00:00.0 - Pulse 80</text>
                                </span>
                            </spans>
                        </annotation>
                        <annotation id="0">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:46Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=37aa90bb-be98-4e2d-aefb-153716cd493f;id=1;"/>
                        </annotation>
                    </annotations>
               """;

        def testInstances=[]

        mockDomain(Project, testInstances)

        Project p = new Project(id: '1', name: "Project1", description: "Test Project 1", jdbcDriver: "org.h2.Driver", databaseConnectionUrl: DB_CONNECTION_URL, jdbcPassword: "", jdbcUsername: "sa").save();

        //println("Starting H2 web server... should be empty...");
     //   org.h2.tools.Server.startWebServer(conn);

        service.saveAnnotations("proc", "tId1", p, exampleXml, "vhaslccornir", null, "myGroup");
        ResultSet rs =conn.createStatement().executeQuery("select count(*) from clinical_element");
        rs.next();
        assert(rs.getInt(1) == 2);

        rs =conn.createStatement().executeQuery("select count(*) from annotation");
        rs.next();
        assert(rs.getInt(1) == 4);

        rs =conn.createStatement().executeQuery("select count(*) from feature");
        rs.next();
        assert(rs.getInt(1) == 2);

        def exampleXml2 = """
                    <annotations>
                        <annotation id="2">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:52Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;id=2;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>10</startOffset>
                                    <endOffset>22</endOffset>
                                    <text>kettSSN: 123</text>
                                </span>
                            </spans>
                            <features>
                                <feature type="0">
                                    <name>Comments</name>
                                    <schemaRef uri="undefined;attributeDef:221244"></schemaRef>
                                    <elements>
                                        <element>
                                            <value>simple feature</value>
                                            <schemaRef></schemaRef>
                                        </element>
                                    </elements>
                                </feature>

                            </features>
                        </annotation>
                        <annotation id="0">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:53Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=b9d363b0-1c9e-4576-8875-5e199db919d8;id=0;"/>
                        </annotation>
                        <annotation id="1">
                            <schema id="104"/>
                            <schemaRef id="111" uri="annotationSchema:104;classDef:111"></schemaRef>
                            <creationDate>2014-02-26T11:52:42Z</creationDate>
                            <clinicalElementConfiguration id="b9d363b0-1c9e-4576-8875-5e199db919d8"/>
                            <clinicalElement id="projectId=1;processId=threeStepProcess:1:9;clinicalElementConfigurationId=37aa90bb-be98-4e2d-aefb-153716cd493f;id=1;"/>
                            <spans>
                                <span>
                                    <clinicalElementField id="WHOLE_CONTENT"/>
                                    <startOffset>3</startOffset>
                                    <endOffset>42</endOffset>
                                    <text>se:  802002-06-01 08:00:00.0 - Pulse 80</text>
                                </span>
                            </spans>
                        </annotation>
                    </annotations>
               """;


        new Project(id: '1', name: "Project1", description: "Test Project 1", jdbcDriver: "org.h2.Driver", databaseConnectionUrl: DB_CONNECTION_URL, jdbcPassword: "", jdbcUsername: "sa").save();

        //println("Starting H2 web server... should be empty...");

        service.saveAnnotations("proc", "tId1", p, exampleXml2, "vhaslccornir", "ce2", "myGroup");

        rs =conn.createStatement().executeQuery("select count(*) from clinical_element");
        rs.next();
        assert(rs.getInt(1) == 5);


        rs =conn.createStatement().executeQuery("select count(*) from annotation");
        rs.next();
        assert(rs.getInt(1) == 7);

        rs =conn.createStatement().executeQuery("select count(*) from feature");
        rs.next();
        assert(rs.getInt(1) == 3);

        List<ClinicalElement> clinicalElementList = service.getExistingAnnotations("1", "ce2", "myGroup");
        assert(clinicalElementList.size() == 3 );
    }


}
