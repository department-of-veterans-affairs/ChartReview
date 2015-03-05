package chartreview

import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.chartreview.util.JdbcScriptRunner
import grails.test.mixin.TestFor
import org.junit.Assert
import org.junit.BeforeClass
import org.slf4j.Logger
import org.slf4j.LoggerFactory

import java.sql.Connection
import java.sql.DriverManager
import java.text.SimpleDateFormat

@TestFor(AnnotationSchemaService)
class AnnotationSchemaServiceTest {
    Logger log = LoggerFactory.getLogger(AnnotationSchemaServiceTest)

    def exampleXml = """
            <schemas>
                <annotationSchema id='104'>
                    <name>MUS</name>
                    <description>Medically Unexplained Syndrome</description>
                    <attributeDefs>
                        <attributeDef id='284354' type='0'>
                            <name>cuis</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>2015-01-01T00:00:00Z</minDate>
                            <maxDate>2015-02-21T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='116' type='3'>
                            <name>Persistence</name>
                            <color>0xff9999</color>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs>
                                <attributeDefOptionDef id='118'>False</attributeDefOptionDef>
                                <attributeDefOptionDef id='117'>True</attributeDefOptionDef>
                            </attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='284355' type='0'>
                            <name>contextLeft</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='284356' type='0'>
                            <name>contextRight</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='113' type='3'>
                            <name>Explanability</name>
                            <color>0x99ffcc</color>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs>
                                <attributeDefOptionDef id='115'>Inconsistent with unexplained</attributeDefOptionDef>
                                <attributeDefOptionDef id='114'>Diagnosed as functiona/unknown</attributeDefOptionDef>
                                <attributeDefOptionDef id='221243'>Unexplained</attributeDefOptionDef>
                            </attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='407043' type='0'>
                            <name>organSystem</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='221244' type='0'>
                            <name>Comments</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                        <attributeDef id='407042' type='0'>
                            <name>semanticCategories</name>
                            <numericLow>0.0</numericLow>
                            <numericHigh>9.99999999999999E11</numericHigh>
                            <minDate>0000-01-01T00:00:00Z</minDate>
                            <maxDate>9999-01-01T00:00:00Z</maxDate>
                            <attributeDefOptionDefs></attributeDefOptionDefs>
                        </attributeDef>
                    </attributeDefs>
                    <classDefs>
                        <classDef id='112'>
                            <name>Chronic Fatigue Syndrome</name>
                            <color>0x00ffff</color>
                            <attributeDefIds>
                                <attributeDefId id='221244'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                        <classDef id='110'>
                            <name>Fibromyalgia</name>
                            <color>0x00ffff</color>
                            <attributeDefIds>
                                <attributeDefId id='221244'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                        <classDef id='111'>
                            <name>Irritable Bowel Syndrome</name>
                            <color>0x9933cc</color>
                            <attributeDefIds>
                                <attributeDefId id='221244'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                        <classDef id='221242'>
                            <name>Evidence of Persistence</name>
                            <color>0xffff33</color>
                            <attributeDefIds>
                                <attributeDefId id='221244'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                        <classDef id='106'>
                            <name>Evidence of Explainability</name>
                            <color>0x00ff00</color>
                            <attributeDefIds>
                                <attributeDefId id='221244'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                        <classDef id='105'>
                            <name>Symptom</name>
                            <color>0x999999</color>
                            <attributeDefIds>
                                <attributeDefId id='284354'></attributeDefId>
                                <attributeDefId id='116'></attributeDefId>
                                <attributeDefId id='284355'></attributeDefId>
                                <attributeDefId id='284356'></attributeDefId>
                                <attributeDefId id='113'></attributeDefId>
                                <attributeDefId id='221244'></attributeDefId>
                                <attributeDefId id='407043'></attributeDefId>
                                <attributeDefId id='407042'></attributeDefId>
                            </attributeDefIds>
                            <classDefs></classDefs>
                        </classDef>
                    </classDefs>
                    <classRels></classRels>
                </annotationSchema>
            </schemas>
       """;


    def actualFromChartReview = """
        <schemas>
            <annotationSchema id='104'>
                <name>MUS</name>
                <description>Medically Unexplained Syndrome</description>
                <attributeDefs>
                    <attributeDef id='284354' type='0'>
                        <name>cuis</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='116' type='3'>
                        <name>Persistence</name>
                        <color>0xff9999</color>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs>
                            <attributeDefOptionDef id='118'>False</attributeDefOptionDef>
                            <attributeDefOptionDef id='117'>True</attributeDefOptionDef>
                        </attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='284355' type='0'>
                        <name>contextLeft</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='284356' type='0'>
                        <name>contextRight</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='113' type='3'>
                        <name>Explanability</name>
                        <color>0x99ffcc</color>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs>
                            <attributeDefOptionDef id='115'>Inconsistent with unexplained</attributeDefOptionDef>
                            <attributeDefOptionDef id='114'>Diagnosed as functiona/unknown</attributeDefOptionDef>
                            <attributeDefOptionDef id='221243'>Unexplained</attributeDefOptionDef>
                        </attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='407043' type='0'>
                        <name>organSystem</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='221244' type='0'>
                        <name>Comments</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                    <attributeDef id='407042' type='0'>
                        <name>semanticCategories</name>
                        <numericLow>0.0</numericLow>
                        <numericHigh>9.99999999999999E11</numericHigh>
                        <minDate>0000-01-01T00:00:00Z</minDate>
                        <maxDate>9999-01-01T00:00:00Z</maxDate>
                        <attributeDefOptionDefs></attributeDefOptionDefs>
                    </attributeDef>
                </attributeDefs>
                <classDefs>
                    <classDef id='112'>
                        <name>Chronic Fatigue Syndrome</name>
                        <color>0x00ffff</color>
                        <attributeDefIds>
                            <attributeDefId id='221244'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                    <classDef id='110'>
                        <name>Fibromyalgia</name>
                        <color>0x00ffff</color>
                        <attributeDefIds>
                            <attributeDefId id='221244'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                    <classDef id='111'>
                        <name>Irritable Bowel Syndrome</name>
                        <color>0x9933cc</color>
                        <attributeDefIds>
                            <attributeDefId id='221244'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                    <classDef id='221242'>
                        <name>Evidence of Persistence</name>
                        <color>0xffff33</color>
                        <attributeDefIds>
                            <attributeDefId id='221244'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                    <classDef id='106'>
                        <name>Evidence of Explainability</name>
                        <color>0x00ff00</color>
                        <attributeDefIds>
                            <attributeDefId id='221244'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                    <classDef id='105'>
                        <name>Symptom</name>
                        <color>0x999999</color>
                        <attributeDefIds>
                            <attributeDefId id='284354'></attributeDefId>
                            <attributeDefId id='116'></attributeDefId>
                            <attributeDefId id='284355'></attributeDefId>
                            <attributeDefId id='284356'></attributeDefId>
                            <attributeDefId id='113'></attributeDefId>
                            <attributeDefId id='221244'></attributeDefId>
                            <attributeDefId id='407043'></attributeDefId>
                            <attributeDefId id='407042'></attributeDefId>
                        </attributeDefIds>
                        <classDefs></classDefs>
                    </classDef>
                </classDefs>
                <classRels></classRels>
            </annotationSchema>
        </schemas>
    """

    public
    static String DB_CONNECTION_URL = "jdbc:h2:mem:testDb;DATABASE_TO_UPPER=false;MVCC=TRUE;LOCK_TIMEOUT=10000;DB_CLOSE_DELAY=-1";

    @BeforeClass
    public static void setup() {
        Connection conn = DriverManager.getConnection(DB_CONNECTION_URL, "sa", "");
        JdbcScriptRunner scriptRunner = new JdbcScriptRunner(conn, true, true);
        scriptRunner.setLogWriter(new PrintWriter(new ByteArrayOutputStream()));
        scriptRunner.runScript(new BufferedReader(new FileReader("web-app/resources/sql/create-schema-db-hsqldb.sql")));
    }

    public void testXmlParsing() {

        AnnotationSchema s = service.parseSchemaXml(exampleXml, false);
        assertNotNull(s);
        assertEquals(6, s.getClassDefs().size());
        assertEquals(8, s.getAttributeDefs().size());
        assertEquals(0, s.getClassRelDefs().size());


        boolean found = false;
        for (AttributeDef attribute: s.getAttributeDefs()) {
            if ("cuis".equals(attribute.name)) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                assert("2015-01-01".equals(sdf.format(attribute.getMinDate())));
                assert("2015-02-21".equals(sdf.format(attribute.getMaxDate())));
                found =  true;
            }
        }

        if (!found) {
            Assert.fail("CUIS not found in schema to test date format.");
        }



    }



    /**
    public void testUimaTypeDescriptor() {

        AnnotationSchema annotationSchema = service.saveSchema(exampleXml);
        String result = service.schemaToUimaTypeDescriptor(annotationSchema, "chart-review");
        println(result);
        result = result.replaceAll("\\s","");

    }
     **/

}