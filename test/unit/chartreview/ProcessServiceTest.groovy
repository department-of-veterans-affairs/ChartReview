package chartreview

import grails.test.mixin.TestFor
import org.junit.Before

@TestFor(ProcessService)
class ProcessServiceTest {

    @Before
    public void setup() {
    }

    public void testBusinessKeyCreationAndParsing() {
        String key = service.createBusinessKey("1234", "procId1", "5678");
        assert(key.startsWith("1234::procId1::5678"));
        Map<String, Object> keyParts = service.parseBusinessKey(key);

        assertEquals("1234", keyParts.get("projectId"));
        assertEquals("procId1", keyParts.get("processId"));
        assertEquals("5678", keyParts.get("patientId"));
        assertTrue(keyParts.get("creationTime") instanceof  Long);
    }

}
