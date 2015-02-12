package chartreview

import com.google.gson.Gson
import com.mysema.query.sql.SQLTemplates
import gov.va.vinci.chartreview.ProcessVariablesEnum
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.siman.model.ClinicalElementColumnDef
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails
import gov.va.vinci.siman.tools.SimanUtils
import groovy.text.SimpleTemplateEngine
import org.apache.commons.io.IOUtils
import org.apache.commons.lang.StringEscapeUtils
import org.apache.commons.validator.GenericValidator

import javax.validation.ValidationException
import java.sql.*
import java.util.regex.Pattern

import static gov.va.vinci.chartreview.Utils.closeConnection

/**
 * Clinical Element Service
 *
 * Clinical element serialized keys are in the format:
 * <br/><br/>
 * <projectId>;<processId>;<clinicalElementConfigurationId>;<clinicalElementKeyField1>;<clinicalElementKeyField2>;...;<clinicalElementKeyFieldN>;
 */
class ClinicalElementService  {

    def projectService;
    def processService;
    def clinicalElementConfigurationService;

    /**
     * Return all clinical data for a project, clinical element, and patient.
     * @param projectId - The project to get the data for. This defines which database to connect to.
     * @param clinicalElementConfigurationId - The clinical data element id to get. For example, this might specify to get all labs,
     *  or tiu documents.
     * @param serializedKey - The principal id to get the information for.
     */
    public List getClinicalElements(String projectId, String clinicalElementConfigurationId, Object serializedKey) {
        Connection conn = null;
        List results = new ArrayList();

        def (ClinicalElementConfiguration clinicalElementConfiguration, ClinicalElementConfigurationDetails dto, Project p) = getAndValidateProjectAndClinicalElement(projectId, clinicalElementConfigurationId)

        if (serializedKey == null) {
            throw new ValidationException("Principal element id cannot be null.");
        }

        try {
            conn = projectService.getDatabaseConnection(p)

            LinkedHashMap<String, String> keyParts = SimanUtils.deSerializeStringToMap(serializedKey, ";");
            PreparedStatement dataQueryStatement = conn.prepareStatement(dto.query);

            dataQueryStatement.setObject(1, keyParts.values().getAt(3));
            ResultSet rs = dataQueryStatement.executeQuery();

            while (rs.next()) {
                Map<String, Object> row = processResult(projectId, keyParts.get(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName()), clinicalElementConfigurationId, dto, rs, true);
                results.add(row);
            }
        } finally  {
            closeConnection(conn);
        }
        return results;
    }


    /**
     * Return all clinical element serialized keys for a project, clinical element, and patient.
     * @param projectId - The project to get the data for. This defines which database to connect to.
     * @param clinicalElementConfigurationId - The clinical data element id to get. For example, this might specify to get all labs,
     *  or tiu documents.
     * @param primaryId - The principal id to get the information for.
     * @return The list of serialized ids that match. Note, this is just the serialized key as it is represented
     * in the clinical_element tables, it does not contain projectId, clinicalElementGroup, or clinicalElementConfigurationId.
     * For example, it might be id=1;.
     */
    public List<String> getClinicalElementSerializedKeys(String projectId, String clinicalElementConfigurationId, String primaryId) {
        Connection conn = null;
        List<String> results = new ArrayList<String>();

        def (ClinicalElementConfiguration clinicalElementConfiguration, ClinicalElementConfigurationDetails dto, Project p) = getAndValidateProjectAndClinicalElement(projectId, clinicalElementConfigurationId)
        Map<Integer, ClinicalElementColumnDef> keyFields = dto.resultKeyFieldResultSetIndexes();

        if (primaryId == null) {
            throw new ValidationException("Principal element id cannot be null.");
        }

        try {
            conn = projectService.getDatabaseConnection(p);
            PreparedStatement dataQueryStatement = conn.prepareStatement(dto.query);

            dataQueryStatement.setObject(1, primaryId);
            ResultSet rs = dataQueryStatement.executeQuery();
            while (rs.next()) {
                ResultSetMetaData metaData = rs.getMetaData();

                String key = "";

                keyFields.keySet().eachWithIndex { it, index ->
                    String fieldValue = rs.getObject(it);
                    fieldValue = fieldValue.replaceAll(";", "\\;");
                    key += "${dto.dataQueryColumns.get(it-1).columnName}=${rs.getObject(it)};";
                }
                if (key!= "") {
                    results.add(key);
                }

            }
        } finally  {
            closeConnection(conn);
        }
        return results;
    }



    /**
     * Get the content for a specific clinical element.
     * @param serializedKey  the serialized key that represents this clinical elements.
     * @param wrapInText If true, the content is wrapped in a <text> tag.
     * @return  the content template filled in for this clinical element.
     */
    public String getElementContent(Connection conn, SQLTemplates templates, String serializedKey, boolean wrapInText = true, boolean escapeHtml = true) {
        // TODO - Merge this with the one below?
        Map result = getClinicalElement(conn, templates, serializedKey, true);
        Map<String, String> keyParts = SimanUtils.deSerializeStringToMap(serializedKey, ";");
        String projectId = keyParts.get("projectId");
        String clinicalElementGroup = keyParts.get("clinicalElementGroup");
        String clinicalElementConfigurationId = keyParts.get("clinicalElementConfigurationId");
        ClinicalElementConfiguration configuration = clinicalElementConfigurationService.getClinicalElementConfiguration(keyParts.get("clinicalElementConfigurationId"), conn, templates);
        ClinicalElementConfigurationDetails details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration);
        List<ClinicalElementColumnDef> columns = details.getDataQueryColumns();

        if (!details.contentTemplate) {
            return "";
        }

        String content = resultSetToContentTemplate(result, details.contentTemplate, columns, projectId, clinicalElementGroup, clinicalElementConfigurationId, escapeHtml)

        // Comment this out for field-level annotations
        if (wrapInText) {
            return "<text name='annotatable' clinicalElementFieldId='WHOLE_CONTENT' >" + content.toString() + "</text>";
        } else {
            return content.toString();
        }

        // Uncomment this for field-level annotations
//        return content.toString();
    }

    /**
     * Get the content for a specific clinical element.
     * @param serializedKey  the serialized key that represents this clinical elements.
     * @param wrapInText If true, the content is wrapped in a <text> tag.
     * @return  the content template filled in for this clinical element.
     */
    public String getElementContent(String serializedKey, boolean wrapInText = true, boolean escapeHtml = true) {
        // TODO - Merge this with the one above?
        Map result = getClinicalElement(serializedKey, true);
        Map<String, String> keyParts = SimanUtils.deSerializeStringToMap(serializedKey, ";");
        String projectId = keyParts.get("projectId");
        String clinicalElementGroup = keyParts.get("clinicalElementGroup");
        String clinicalElementConfigurationId = keyParts.get("clinicalElementConfigurationId");
        String clinicalElementId = keyParts.get("id");
        ClinicalElementConfiguration configuration = clinicalElementConfigurationService.getClinicalElementConfiguration(keyParts.get("clinicalElementConfigurationId"), keyParts.get("projectId"));
        ClinicalElementConfigurationDetails details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration);
        List<ClinicalElementColumnDef> columns = details.getDataQueryColumns();

        if (!details.contentTemplate) {
            return "";
        }

        String content = resultSetToContentTemplate(result, details.contentTemplate, columns, projectId, clinicalElementGroup, clinicalElementConfigurationId, clinicalElementId, escapeHtml)

        //println("Content---->:'" + content + "'")
        String returnText = "";
        // Comment this out for field-level annotations
        if (wrapInText) {
            returnText = "<text name='annotatable' clinicalElementFieldId='WHOLE_CONTENT' >" + content.toString() + "</text>";
        } else {
            returnText =  content.toString();
        }

        //println("ReturnText===>" + returnText);
        return returnText;

    }

    public String resultSetToContentTemplate(Map<String, Object> result, String contentTemplate, List<ClinicalElementColumnDef> columns, String projectId, String clinicalElementGroup, String clinicalElementConfigurationId, String clinicalElementId, boolean escapeHtml = true) {
        def engine = new SimpleTemplateEngine()
        def simpleTemplate = engine.createTemplate(contentTemplate);

        // Uncomment this for field-level annotations
        /**
         result.keySet().each { key ->
         def clinicalElementFieldId = serializedKey + "/" + key;
         String temp = "<text name='annotatable' clinicalElementFieldId='${clinicalElementFieldId}' id='${key}'>${result.get(key)}</text>";
         result.put(key, temp);}**/
        // Escape the > and < symbols and change the new lines to html breaks
        if (escapeHtml) {
            result.keySet().each { key ->
                String value = null;

                Object o = result.get(key);

                if (o != null && o instanceof java.sql.Clob) {
                    Clob clob = (Clob) o;
                    InputStream inputStream = clob.getAsciiStream();
                    StringWriter w = new StringWriter();
                    IOUtils.copy(inputStream, w);
                    value = w.toString();
                } else if (o != null && o instanceof byte[]) {
                    String url = "<img src='clinicalElement/elementBlob?projectId="+projectId+"&clinicalElementGroup="+clinicalElementGroup+"&clinicalElementConfigurationId="+clinicalElementConfigurationId+"&clinicalElementId="+clinicalElementId+"&columnName="+key+"'/>";
//                    String url = "<video src='clinicalElement/elementBlob?projectId="+projectId+"&clinicalElementGroup="+clinicalElementGroup+"&clinicalElementConfigurationId="+clinicalElementConfigurationId+"&clinicalElementId="+clinicalElementId+"&columnName="+key+"' type='video/mp4'/>";
                    result.put(key, url);
                } else {
                    value = result.get(key);
                }
                if (value && value.length() > 0) {
                    result.put(key, StringEscapeUtils.escapeHtml(value).replaceAll("\r\n", "  <br/>")
                                                                       .replaceAll("\r", " <br/>")
                                                                       .replaceAll("\n", " <br/>"));
                }
            }
        }

        def content = simpleTemplate.make(result)
        return content.toString();
    }

    /**
     * Returns the data for a single clinical element a given serialized key.
     *
     * @param serializedKey the unique serialized key for this clinical element.
     * @param includeAllFields if true, all fields are included, if false, only rows that have not been checked "exclude"
     *                          in the clinical element configuration are returned.
     * @return  the clinical element field map with key being the field name and value being the field value.
     */
    public LinkedHashMap<String, Object> getClinicalElement(Connection conn, SQLTemplates templates, String serializedKey, boolean includeAllFields = false) {
        LinkedHashMap<String, String> keyParts = SimanUtils.deSerializeStringToMap(serializedKey, ";");

        String projectId = keyParts.get("projectId");
        String clinicalElementGroup = keyParts.get("clinicalElementGroup");
        String clinicalElementConfigurationId = keyParts.get("clinicalElementConfigurationId");

        keyParts.remove("projectId");
        keyParts.remove("clinicalElementGroup");
        keyParts.remove("clinicalElementConfigurationId");

        ClinicalElementConfiguration clinicalElementConfiguration = clinicalElementConfigurationService.getClinicalElementConfiguration(clinicalElementConfigurationId, conn, templates);
        if (!clinicalElementConfiguration) {
            throw new ValidationException("Clinical element configuration with id ${clinicalElementConfigurationId} not found.");
        }

        ClinicalElementConfigurationDetails dto = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(clinicalElementConfiguration);

        List<String> parameters = new ArrayList<String>();

        // Add key fields as parameters. Because this is a linked map, the order is preserved from the key.
        keyParts.each() { key, value ->
            parameters.add(value);
        }

        PreparedStatement ps = conn.prepareStatement(dto.singleElementQuery);

        parameters.eachWithIndex { def entry, int i ->
            ps.setObject(i+1, entry);
        }

        ResultSet rs = ps.executeQuery();
        if (!rs.next()) {
            return null;
        }

        return processResult(projectId, clinicalElementGroup, clinicalElementConfigurationId, dto, rs, !includeAllFields);
    }
    /**
     * Returns the data for a single clinical element a given serialized key.
     *
     * @param serializedKey the unique serialized key for this clinical element.
     * @param includeAllFields if true, all fields are included, if false, only rows that have not been checked "exclude"
     *                          in the clinical element configuration are returned.
     * @return  the clinical element field map with key being the field name and value being the field value.
     */
    public LinkedHashMap<String, Object> getClinicalElement(Connection conn, SQLTemplates templates, String projectId, String clinicalElementConfigurationId, String clinicalElementId, boolean includeAllFields = false) {
        ClinicalElementConfiguration clinicalElementConfiguration = clinicalElementConfigurationService.getClinicalElementConfiguration(clinicalElementConfigurationId, conn, templates);
        if (!clinicalElementConfiguration) {
            throw new ValidationException("Clinical element configuration with id ${clinicalElementConfigurationId} not found.");
        }

        ClinicalElementConfigurationDetails dto = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(clinicalElementConfiguration);

        List<String> parameters = new ArrayList<String>();

        parameters.add(clinicalElementId);

        PreparedStatement ps = conn.prepareStatement(dto.singleElementQuery);

        parameters.eachWithIndex { def entry, int i ->
            ps.setObject(i+1, entry);
        }

        ResultSet rs = ps.executeQuery();
        if (!rs.next()) {
            return null;
        }

        return processResult(projectId, null, clinicalElementConfigurationId, dto, rs, !includeAllFields);
    }



    /**
     * Returns the data for a single clinical element a given serialized key.
     *
     * @param serializedKey the unique serialized key for this clinical element.
     * @param includeAllFields if true, all fields are included, if false, only rows that have not been checked "exclude"
     *                          in the clinical element configuration are returned.
     * @return  the clinical element field map with key being the field name and value being the field value.
     */
    public LinkedHashMap<String, Object> getClinicalElement(String serializedKey, boolean includeAllFields = false) {
        LinkedHashMap<String, String> keyParts = SimanUtils.deSerializeStringToMap(serializedKey, ";");
        String projectId = keyParts.get("projectId");
        Connection c = null;

        try {
            Project p = projectService.getProject(projectId);
            c = projectService.getDatabaseConnection(p);
            getClinicalElement(c, Utils.getSQLTemplate(p.getJdbcDriver()), serializedKey, includeAllFields);
        } finally {
            closeConnection(c);
        }
    }

    /**
     * Returns the ClinicalElementConfiguration, ClinicalElementConfigurationDetails, and Project given
     * a project and ClinicalElementConfiguration id. If either cannot be found, a ValidationException is thrown.
     * @param projectId  the project id
     * @param clinicalElementConfigurationId    the ClinicalElementConfiguration id.
     * @return     the ClinicalElementConfiguration, ClinicalElementConfigurationDetails, and Project given
     * a project and ClinicalElementConfiguration id. If either cannot be found, a ValidationException is thrown.
     */
    protected List getAndValidateProjectAndClinicalElement(String projectId, String clinicalElementConfigurationId) {
        Project p = Project.get(projectId);
        if (!p) {
            throw new ValidationException("Project with id ${projectId} not found.");
        }

        ClinicalElementConfiguration clinicalElementConfiguration = clinicalElementConfigurationService.getClinicalElementConfiguration(clinicalElementConfigurationId, projectId);
        if (!clinicalElementConfiguration) {
            throw new ValidationException("Clinical element configuration with id ${clinicalElementConfigurationId} not found.");
        }

        ClinicalElementConfigurationDetails dto = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(clinicalElementConfiguration);
        [clinicalElementConfiguration, dto, p]
    }


    /**
     * Return a specific property of a project, clinical element, and element.
     * @param projectId - The project to get the data for. This defines which database to connect to.
     * @param clinicalElementId - The clinical data element id to get. For example, this might specify to get all labs,
     *  or tiu documents.
     * @param principalElementId - The principal element id to get the information for.
     */
    public List getClinicalElementContent(String projectId, String clinicalElementConfigurationId, Object principalElementId, Object clinicalElementId) {
        Project p = Project.get(projectId);
        ClinicalElementConfiguration clinicalElementConfiguration = ClinicalElementConfiguration.get(clinicalElementConfigurationId);

        Connection conn = null;
        List results = new ArrayList();

        try {
            conn = projectService.getDatabaseConnection(p)
            ClinicalElementConfigurationDetails dto = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(clinicalElementConfiguration);

            PreparedStatement dataQueryStatement = conn.prepareStatement(dto.query);
            dataQueryStatement.setObject(1, principalElementId);
            ResultSet rs = dataQueryStatement.executeQuery();
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.columnCount;

            while (rs.next()) {
                List row = new ArrayList();
                for (int i=1; i <= columnCount; i++) {
                    def object = rs.getObject(i);
                    row.add(object);
                }
                results.add(row);
            }
        } finally  {
            closeConnection(conn);
        }

        return results;
    }







    /**
     * Converts a resultset into a map corresponding to the fields.
     * @param projectId  the project id this resultset is associated with.
     * @param clinicalElementGroup  the clinical element group id this resultset is associated with.
     * @param clinicalElementConfigurationId  the clinicalElementConfigurationId this resultset is associated with.
     * @param dto  the details object about this clinical element configuration.
     * @param rs   the resultset to map
     * @param removeExcludedFields if true, fields that have  been checked "exclude"
     *                          in the clinical element configuration are not returned. If false, all fields are returned.
     * @return A map with _SERIALIZED_ID_ as one entry with the serialized key and the value. The rest of the map includes all of the column name/values from the resultset.
     */
    public LinkedHashMap<String, Object> processResult(String projectId, String clinicalElementGroup, String clinicalElementConfigurationId, ClinicalElementConfigurationDetails dto, ResultSet rs, boolean removeExcludedFields) {
        Map<Integer, ClinicalElementColumnDef> excludeFields = dto.resultExcludeFieldResultSetIndexes();
        Map<Integer, ClinicalElementColumnDef> keyFields = dto.resultKeyFieldResultSetIndexes();

        LinkedHashMap<String, Object> results = new LinkedHashMap<String, Object>();


        ResultSetMetaData metaData = rs.getMetaData();
        List row = new ArrayList();

        for (int i = 1; i <= metaData.columnCount; i++) {
            // Don't return exclude columns.
            if ((removeExcludedFields && !excludeFields.containsKey(i)) || !removeExcludedFields) {
                if (rs.getObject(i) != null && rs.getObject(i) instanceof Clob) {
                    Clob clob = (Clob)rs.getObject(i);
                    InputStream inputStream = clob.getAsciiStream();
                    StringWriter w = new StringWriter();
                    IOUtils.copy(inputStream, w);
                    results.put(dto.dataQueryColumns.get(i-1).columnName, w.toString());
                } else {
                    results.put(dto.dataQueryColumns.get(i-1).columnName, rs.getObject(i));
                }
            }
        }

        String key = null;

        if (clinicalElementGroup == null){
            key = "projectId=${projectId};clinicalElementGroup=;clinicalElementConfigurationId=${clinicalElementConfigurationId};";
        } else {
            key = "projectId=${projectId};clinicalElementGroup=${clinicalElementGroup};clinicalElementConfigurationId=${clinicalElementConfigurationId};";
        }

        keyFields.keySet().eachWithIndex { it, index ->
            String fieldValue = rs.getObject(it);
            fieldValue = fieldValue.replaceAll(";", "\\;");
            key += "${dto.dataQueryColumns.get(it-1).columnName}=${rs.getObject(it)};";
        }

        results.put("_SERIALIZED_ID_", key);
        return results;
    }

    /**
     * Deserialize a serialized key.
     *
     * @param key the serialized key string.
     * @return  A map with the map keys being field names and values being the key values.
     *
     */
    public static LinkedHashMap<String, String> deSerializeKey(String key) {
        String regex = "(?<!\\\\)" + Pattern.quote(";");
        LinkedHashMap<String, String> parameters= new LinkedHashMap<String, String>();

        key.split(regex).eachWithIndex{ String entry, int i ->
            parameters.put(entry.substring(0, entry.indexOf(":")), entry.substring(entry.indexOf(":") + 1));
        }
        return parameters;
    }

    /**
     * Given a configuration, run the example query and populate a ClinicalElementConfigurationDetails object.
     *
     * @param config        The configuration. Note, all fields including connection information, query, and examplePatientId
     *                      must be filled in.
     * @return              A ClinicalElementConfigurationDetails from the result metadata of the query.
     * @throws SQLException if any type of sql exception occurs connection to or querying the database.
     */
    public ClinicalElementConfigurationDetails populateColumnInfo(ClinicalElementConfigurationDetails config) throws SQLException {
        // Get a connection to the database
        Connection conn = null;

        try {
            conn = getConnection(config)

            PreparedStatement dataQueryStatement = conn.prepareStatement(config.query);

            // Execute the data query query
            dataQueryStatement.setObject(1, config.examplePatientId);
            ResultSet rs = dataQueryStatement.executeQuery();
            config.dataQueryColumns = resultSetToColumnDTOArray(rs)

        } finally {
            try {
                conn.close()
            } catch (Exception e) {

            }
        }
        return config;
    }

    public List getExampleResults(ClinicalElementConfigurationDetails config) {
        // Get a connection to the database
        Connection conn = null;
        List<Map> results = new ArrayList<Map>();
        try {
            conn = getConnection(config)

            PreparedStatement dataQueryStatement = conn.prepareStatement(config.query);

            // Execute the data query query
            dataQueryStatement.setObject(1, config.examplePatientId);
            ResultSet rs = dataQueryStatement.executeQuery();
            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<String, Object>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnName(i), rs.getObject(i));
                }
                results.add(row);
            }
        } finally {
            try {
                conn.close()
            } catch (Exception e) {
            }
        }
        return results;
    }

    protected Connection getConnection(ClinicalElementConfigurationDetails config) {
        Connection conn = null;
        Class.forName(config.jdbcDriver);

        /** Use the supplied username/password if filled out, otherwise try just the url. **/
        if (!GenericValidator.isBlankOrNull(config.jdbcUsername)
                || !GenericValidator.isBlankOrNull(config.jdbcPassword)) {
            conn = DriverManager.getConnection(config.connectionString, config.jdbcUsername, config.jdbcPassword)
        } else {
            conn = DriverManager.getConnection(config.connectionString);
        }
        conn
    }

    /**
     * Transfer a resultset into a list of ClinicalElementColumnDefs
     * @param rsDataQuery   the resultset to translate
     * @return  a list of ClinicalElementColumnDefs created from the resultset.
     */
    protected List<ClinicalElementColumnDef> resultSetToColumnDTOArray(ResultSet rsDataQuery) {
        ResultSetMetaData metaData = rsDataQuery.getMetaData();
        List<ClinicalElementColumnDef> columns = new ArrayList<ClinicalElementColumnDef>();

        int columnCount = metaData.getColumnCount();
        for (int i = 1; i <= columnCount; i++) {
            ClinicalElementColumnDef dto = new ClinicalElementColumnDef();
            dto.columnName = metaData.getColumnName(i);
            dto.displayName = metaData.getColumnLabel(i);
            dto.type = metaData.getColumnTypeName(i);
            columns.add(dto);
        }
        return columns;
    }

    /**
     * Returns the mime type of the given column a given column name as found overloaded in the column's type like this: "blob:mime_type=image/jpeg"
     */
    public String getMimeType(String projectId, String clinicalElementConfigurationId, String columnName) {
//        String mimeType = "image/jpeg";
        String mimeType = "video/quicktime";
        ClinicalElementConfiguration configuration = clinicalElementConfigurationService.getClinicalElementConfiguration(clinicalElementConfigurationId, projectId);
        ClinicalElementConfigurationDetails details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration);
        List<ClinicalElementColumnDef> columns = details.getDataQueryColumns();
        ClinicalElementColumnDef colDef = findDef(columns, columnName);
        if(colDef)
        {
            String type = colDef.getType();
            String[] parts = type.split(":");
            if(parts.length > 1)
            {
                String subParts = parts[1].split("=");
                if(subParts.length > 0 && subParts[0].trim().equals("mime_type"))
                {
                    mimeType = subParts[1].trim();
                }
            }
        }
        return mimeType;

    }

    /**
     * Finds a column def by name in a list of column defs.
     * @param sourceList
     * @param columnName
     * @return
     */
    public ClinicalElementColumnDef findDef(List<ClinicalElementColumnDef> sourceList, String columnName) {
        for (ClinicalElementColumnDef colDef:  sourceList) {
            if (colDef.columnName.equals(columnName)) {
                return colDef;
            }
        }
        return null;
    }

    /**
     * Get the blob in the given column for a specific clinical element.
     * @param serializedKey  the serialized key that represents this clinical elements.
     * @return  the blob.
     */
    public byte[] getElementBlob(String projectId, String clinicalElementConfigurationId, String clinicalElementId, String columnName) {
        def blob = null;
        Connection c = null;
        try {
            Project p = projectService.getProject(projectId);
            c = projectService.getDatabaseConnection(p);
            Map result = getClinicalElement(c, Utils.getSQLTemplate(p.getJdbcDriver()), projectId, clinicalElementConfigurationId, clinicalElementId);
            Object o = result.get(columnName);
            if (o != null && o instanceof byte[]) {
                blob = o;
            }
        } finally {
            closeConnection(c);
        }
        return blob;
    }
}
