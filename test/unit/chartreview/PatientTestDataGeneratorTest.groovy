package chartreview

import gov.va.vinci.chartreview.db.PatientTestDataGenerator
import org.junit.Test


class PatientTestDataGeneratorTest {

    @Test
    public void testConstructor() {
        PatientTestDataGenerator p = new PatientTestDataGenerator(new File("/Users/ryancornia/git/public-example-data"));
    }
}
