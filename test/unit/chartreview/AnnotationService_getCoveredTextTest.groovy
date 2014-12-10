package chartreview

import com.mysema.query.sql.H2Templates
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.siman.model.Annotation
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
class AnnotationService_getCoveredTextTest {


    public void testSimple() {
        Annotation a = new Annotation();
        a.setStart(5);
        a.setEnd(9);

        assertEquals("5678", service.getCoveredText(a, "0123456789ABCD"));
    }


}
