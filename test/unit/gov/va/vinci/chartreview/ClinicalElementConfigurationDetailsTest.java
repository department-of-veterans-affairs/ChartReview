package gov.va.vinci.chartreview;


import com.google.gson.Gson;
import gov.va.vinci.siman.model.ClinicalElementConfiguration;
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails;
import org.junit.Test;

import java.util.UUID;

import static org.junit.Assert.*;


public class ClinicalElementConfigurationDetailsTest {

    @Test
    public void testSerialize() {
        ClinicalElementConfigurationDetails configuration = new ClinicalElementConfigurationDetails();
        configuration.setActive(true);
        configuration.setContentTemplate("{test}");
        configuration.setDescription("Test Description");
        configuration.setDescriptionField("field1");
        configuration.setExamplePatientId("1");
        configuration.setHasContent(true);
        configuration.setHasSummary(false);
        configuration.setQuery("Select *");
        configuration.setSingleElementQuery("Select * from where id=?");
        configuration.setTitleField("title");

        configuration.setJdbcDriver("driver");
        configuration.setJdbcPassword("pass");
        configuration.setJdbcUsername("user");

        Gson gson = new Gson();
        String value = gson.toJson(configuration);
        assertFalse(value.contains("jdbc"));
    }

    @Test
    public void testDeSerialize() {
        String exampleJson = "{\n" +
                "   \"contentTemplate\": \"<p>\\r\\n\\t&nbsp;<\\/p>\\r\\n<h2>\\r\\n\\t${TITLE}<\\/h2>\\r\\n<p>\\r\\n\\t<b>${DOCUMENT_DATE} - ${PHYSICIAN}<\\/b><br />\\r\\n\\t<br />\\r\\n\\t${DOCUMENT_TEXT}<\\/p>\\r\\n<p>\\r\\n\\t&nbsp;<\\/p>\\r\\n\",\n" +
                "   \"description\": \"Simple TIU Document based on example database.\",\n" +
                "   \"titleField\": \"TITLE\",\n" +
                "   \"descriptionField\": \"DESCRIPTION\",\n" +
                "   \"query\": \"select document_date, title, physician, id, document_text, substring(document_text, 1, 100) as description from tiu_document\\r\\nwhere patient_id = ?\",\n" +
                "   \"name\": \"TIU Document\",\n" +
                "   \"JUNK_PROPERTY_TEST\": \"TIU Document\",\n" +
                "   \"dataQueryColumns\": [\n" +
                "      {\n" +
                "         \"keyField\": false,\n" +
                "         \"sort\": \"DESC\",\n" +
                "         \"hidden\": false,\n" +
                "         \"columnName\": \"DOCUMENT_DATE\",\n" +
                "         \"exclude\": false,\n" +
                "         \"displayName\": \"DOCUMENT_DATE\",\n" +
                "         \"type\": \"TIMESTAMP\"\n" +
                "      },\n" +
                "      {\n" +
                "         \"keyField\": false,\n" +
                "         \"sort\": \"ASC\",\n" +
                "         \"hidden\": false,\n" +
                "         \"columnName\": \"TITLE\",\n" +
                "         \"exclude\": false,\n" +
                "         \"displayName\": \"TITLE\",\n" +
                "         \"type\": \"VARCHAR\"\n" +
                "      } \n" +
                "   ],\n" +
                "   \"hasContent\": true,\n" +
                "   \"hasSummary\": false,\n" +
                "   \"singleElementQuery\": \"select document_date, title, physician, id, document_text, substring(document_text, 1, 100) as description from tiu_document\\r\\nwhere id = ?\"\n" +
                "}";
        Gson gson = new Gson();


        ClinicalElementConfigurationDetails value = gson.fromJson(exampleJson, ClinicalElementConfigurationDetails.class);

        assertTrue(value.getHasContent());
        assertFalse(value.getHasSummary());
        assertEquals(value.getDescription(), "Simple TIU Document based on example database.");
        assertEquals(value.getDataQueryColumns().size(), 2);
        assertEquals(value.getName(), "TIU Document");
        assertTrue(value.getDataQueryColumns().get(0).getColumnName().equals("DOCUMENT_DATE") || value.getDataQueryColumns().get(0).getColumnName().equals("TITLE"));
    }

}
