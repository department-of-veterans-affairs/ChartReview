package chartreview

import grails.test.mixin.TestFor
import org.junit.Before

@TestFor(ProjectService)
class ProjectServiceTest {

    @Before
    public void setup() {
    }

    public void testProjectSave() {
//        def params = [jdbcPassword: "z213~sadf",
//                      databaseConnectionUrl:"jdbc:sqlserver://cpoe.chpc.utah.edu:1433;databasename=crexample1",
//                      description:"brad1",
//                      jdbcUsername:"crexample1",
//                      name:"brad1",
//                      jdbcDriver:"com.microsoft.sqlserver.jdbc.SQLServerDriver"];
//        def project = new Project(params);
//
//        project.id = UUID.randomUUID().toString();
//
//        List<String> usernames = new ArrayList<String>(["admin"]);
//        List<String> roles = new ArrayList<String>(["ba1281da-7ab8-4d2a-ae2a-dea8b9b16bf9"]);
//
//        Boolean saved = service.saveProject(project, usernames, roles);
//        assert(key.startsWith("1234::procId1::5678"));
//        Map<String, Object> keyParts = service.parseBusinessKey(key);
//
//        assertEquals("1234", keyParts.get("projectId"));
//        assertEquals("procId1", keyParts.get("processId"));
//        assertEquals("5678", keyParts.get("patientId"));
//        assertTrue(keyParts.get("creationTime") instanceof  Long);
    }

}
