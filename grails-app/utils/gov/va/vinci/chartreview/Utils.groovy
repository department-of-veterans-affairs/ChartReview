package gov.va.vinci.chartreview
import com.mysema.query.sql.*
import gov.va.vinci.chartreview.db.DatabaseTable
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.siman.model.Annotation
import gov.va.vinci.siman.model.ClinicalElement
import gov.va.vinci.siman.tools.SimanUtils
import groovy.util.slurpersupport.GPathResult
import org.apache.commons.dbcp.BasicDataSource
import org.apache.commons.dbutils.DbUtils
import org.apache.commons.validator.GenericValidator
import org.joda.time.DateTimeZone
import org.joda.time.format.DateTimeFormatter
import org.joda.time.format.ISODateTimeFormat

import javax.servlet.ServletContext
import javax.servlet.http.HttpSession
import javax.sql.DataSource
import javax.validation.ValidationException
import java.sql.*
import java.text.MessageFormat
import java.util.Date

class Utils {
    public static String SELECTED_PROJECT = "selectedProject";
    static final NUMBER_FORMAT_ERR = "Validation failed. [{0} {1}]";
    static final String ID_SEPARATOR = ","
	
	private static final DateTimeFormatter XML_DATE_TIME_FORMAT = ISODateTimeFormat.dateTimeNoMillis().withZone(DateTimeZone.UTC);

    public static Project getSelectedProject(HttpSession session, String projectId) {

        Project project = (Project) Project.get(session.getAttribute(SELECTED_PROJECT));
        if (project == null) {
            project = Project.get(projectId);
            session.setAttribute(SELECTED_PROJECT, project);
//            throw new RuntimeException("Could not find a selected project in the current session.");
        }
        return project;
    }

    public static DataSource getProjectDatasource(Project project) {
        ServletContext servletContext = org.codehaus.groovy.grails.web.context.ServletContextHolder.getServletContext();
        DataSource ds = (DataSource) servletContext.getAttribute("STUDY:DATASOURCE:" + project.id);

        if (ds == null) {
            ds =  Utils.createProjectDatasource(project);
            servletContext.setAttribute("STUDY:DATASOURCE:" + project.id, ds);
//            throw new RuntimeException("Could not get datasource: STUDY:DATASOURCE:" + projectId + " from session.");
        }
        return ds;
    }

    /**
     * Create a basic datasource for a study.
     * @param project the study to create a datasource for.
     * @return the datasource for the study.
     */
    public static DataSource createProjectDatasource(Project project) {
        BasicDataSource dataSource = new BasicDataSource();
        dataSource.setDriverClassName(project.getJdbcDriver());
        dataSource.setUrl(project.getDatabaseConnectionUrl());

        if (!GenericValidator.isBlankOrNull(project.getJdbcUsername())) {
            dataSource.setUsername(project.getJdbcUsername());
        }

        if (!GenericValidator.isBlankOrNull(project.getJdbcPassword())) {
            dataSource.setPassword(project.getJdbcPassword());
        } else if ("org.h2.Driver".equals(project.getJdbcDriver())) {
            dataSource.setPassword("");
        }

        return dataSource;
    }

    public static List<String> getTableNames(DataSource ds) {
        List<String> tableNames = new ArrayList<String>();
        Connection c = null;
        try {
            c = ds.getConnection();
            DatabaseMetaData md = c.getMetaData();
            ResultSet rs = md.getTables(null, null, "%", null);
            while (rs.next()) {
                DatabaseTable table = new DatabaseTable();
                table.tableCat = safeGetSql(rs, "TABLE_CAT");

                table.tableSchem = safeGetSql(rs, "TABLE_SCHEM");
                table.tableName = safeGetSql(rs, "TABLE_NAME");
                table.tableType = safeGetSql(rs, "TABLE_TYPE");
                table.remarks = safeGetSql(rs, "REMARKS");
                table.typeCat = safeGetSql(rs, "TYPE_CAT");
                table.typeSchem= safeGetSql(rs, "TYPE_SCHEM")
                table.typeName= safeGetSql(rs, "TYPE_NAME");
                table.selfReferencingColName = safeGetSql(rs, "SELF_REFERENCING_COL_NAME");
                table.refGeneration = safeGetSql(rs, "REF_GENERATION");
                tableNames.add(table);
            }
        } catch(Exception e) {
            // Nothing
        }finally{
            DbUtils.closeQuietly((Connection) c);
        }
        return tableNames;
    }

    public static String getIdColName(List<String> fieldNames) throws SQLException
    {
        String idColumnName = "id";
        for (int i = fieldNames.size() - 1; i >= 0; i--) {
            String fieldName = ((String) fieldNames.get(i));
            if(fieldName.toLowerCase().indexOf("id") >= 0)
            {
                idColumnName = fieldName;
                if(fieldName.toLowerCase().compareToIgnoreCase("id") == 0)
                {
                    break;
                }
            }
        }
        return idColumnName;
    }

    public static List<String> getFieldNames(DataSource ds, String tableName) {
        List<String> fieldNames = new ArrayList<String>();
        Connection c = null;
        ResultSet rs = null;
        try {
            c = ds.getConnection();
            rs = c.prepareStatement("select * from " + tableName).executeQuery();
            ResultSetMetaData m = rs.getMetaData();
            for (int i = 1; i <= m.getColumnCount(); i++)
            {
                String fieldName = m.getColumnName(i);
                fieldNames.add(fieldName);
            }
        } catch(Exception e) {
            // Nothing
        }finally{
            DbUtils.closeQuietly((ResultSet)rs);
            DbUtils.closeQuietly((Connection) c);
        }
        return fieldNames;
    }

    /**
     * Get the SQLTemplate querydsl needs for a project. This is based on the projects jdbc driver.
     *
     * @param p  the project to get the SQLTemplate for.
     * @return  the SQLTemplate for the projects jdbcdriver.
     */
    public static SQLTemplates getSQLTemplate(Project p) {
        String driver = p.getJdbcDriver();
        if("org.h2.Driver".equals(driver)) {
            return H2Templates.builder().quote().build();
        } else if("org.hsqldb.jdbcDriver".equals(driver)) {
            return HSQLDBTemplates.builder().quote().build();
        } else if("com.mysql.jdbc.Driver".equals(driver)) {
            return MySQLTemplates.builder().quote().build();
        } else if("com.microsoft.sqlserver.jdbc.SQLServerDriver".equals(driver)
                || "net.sourceforge.jtds.jdbc.Driver".equals(driver)) {
            return SQLServerTemplates.builder().quote().printSchema().build();
        } else {
            throw new ValidationException("Could not determine dialect from driver. " + driver);
        }
    }

    public static String getAnnotationFeaturesAsString(Annotation a) {
        String featureString = "";
        a.features?.each {
            featureString += "[${it.name}=${it.value}], ";
        }
        if (featureString.length() >0) {
            featureString = featureString.substring(0, featureString.length()-2);
        }

        return featureString;

    }

    /**
     * Fetch new unique identifiers from database, map temp ids to unique ids for references
     * @param root
     * @return
     */
    def static synchronized Map getReplacementsForTempIds(GPathResult root) {
        // This one-liner is to collect all tempids that are not blank, convert them to longs and remove duplicates
        def tempids = root.'**'.grep{ it.@id != '' }.'@id'*.text().collect{(String)it} as Set
        return getReplacementsForIds(tempids)
    }

    /**
     * Fetch new unique identifiers from database, map temp ids to unique ids for references
     * @param root
     * @return
     */
    def static synchronized Map getReplacementsForIds(Set tempids) {
        Integer numIds = tempids?.size()
        def uids = []
        if(numIds)
        {
            for(i in 0..numIds) {
                def theId = UUID.randomUUID().toString();
                uids.add(theId);
            }
        }

        Map map = [:]
        for(int i = 0; i < numIds; i++)
        {
            String tempid = tempids[i];
            map.put(tempid, uids[i]);
        }
        return map
    }

    /**
     * Generate number of new unique identifiers
     * @param total
     * @return
     */
    def static synchronized List generateUids(Integer total) {
        def uids = []
        if(total) {
            for(i in 0..total) {
                def theId = UUID.randomUUID().toString();
                uids.add(theId);
            }
        }
        return uids;
    }

    /**
     * Format date as string date time
     * @param date
     * @return the formatted date-time string.
     */
    def static String format(Date date) {
        def str = null
        if(date) {
            str = XML_DATE_TIME_FORMAT.print(Date.getMillisOf(date))
        }
        return str
    }

    /**
     * Parse string and create date object, handle parse exception
     * @param str
     * @return date object
     */
    def static Date parse(String str) {
        Date date = null
        if(str?.trim()) {
            // let exception to be handled by the app
            date = XML_DATE_TIME_FORMAT.parseDateTime(str).toDate();
        }
        return date
    }

    /**
     * Convert string to integer, handle format exception
     * @param str
     * @return int
     */
    def static Integer toInteger(String str) {
        Integer intgr;
        if(str?.trim()) {
            try {
                intgr = str.toInteger()
            }catch (NumberFormatException nfe) {
                def msg = MessageFormat.format (NUMBER_FORMAT_ERR, [
                    nfe.getClass().getName(),
                    nfe.message
                ]as Object[]);
                throw new AnnotationWebServiceException(msg)
            }
        }
        return intgr;
    }

    /**
    * Convert string to long, handle format exception
    * @param str
    * @return int
    */
   def static Long toLong(String str) {
       Long lng;
       if(str?.trim()) {
           try {
               lng = str.toLong()
           }catch (NumberFormatException nfe) {
               def msg = MessageFormat.format (NUMBER_FORMAT_ERR, [
                   nfe.getClass().getName(),
                   nfe.message
               ]as Object[]);
               throw new AnnotationWebServiceException(msg)
           }
       }
       return lng;
   }

    /**
     * Convert string to double, handle format exception
     * @param str
     * @return double
     */
    def static Double toDouble(String str) {
        Double dbl = 0
        if(str?.trim()) {
            try {
                dbl = str.toDouble()
            }catch (NumberFormatException nfe) {
                def msg = MessageFormat.format (NUMBER_FORMAT_ERR, [
                    nfe.getClass().getName(),
                    nfe.message
                ]as Object[]);
                throw new AnnotationWebServiceException(msg)
            }
        }
        return dbl;
    }

    /**
     * Convert string to boolean, handles format validation
     * @param str
     * @return
     */
    def static Boolean toBoolean(String str) {
        Boolean bool =['true', 'false'].contains(str.trim().toLowerCase());
        if(!bool) {
            def msg = MessageFormat.format ("Validation failded. [{0} {1}]", [
                "Boolean format must be 'true' or 'false' only. ",
                "It is : " + str
            ]as Object[])
            throw new AnnotationWebServiceException (msg)
        }
        return str.toBoolean()
    }

    /**
     * Gets domain object by uid , throws exception if object does not exist
     * @param cl
     * @param uid
     * @return
     */
    def static getByUidSafe(Class cl, Long uid) {
        def model = null
        if(uid) {
            model = cl.get(uid)
            if(model == null){throw new AnnotationWebServiceException("Id: $uid not resolved. Instance of $cl expected but was null.")}
        }
        return model
    }
   
    /**
     * Get value from the map
     * @param map
     * @param arg
     * @return
     */
    def static safeGet(Map map, Object arg) {
        String key;
		if(arg != null)
		{
            key = arg;
		}
        return map.get(key)
    }

    /**
     * Tries to get a column by name. If an exception is thrown, null is returned.
     * @param rs        the resultset to get column from.
     * @param column    the column name to get.
     * @return          the column value, or if an exception is thrown, null.
     */
    def static private Object safeGetSql(ResultSet rs, String column) {
        try {
            return rs.getObject(column);
        } catch (SQLException e) {
            return null;
        }
    }
/**
    * Get list of analyte ids from request
    * @param idFromRequest
    * @return list of ids, or throws exception if non found
    */
   def static List getIdsFromRequestSafe(String idFromRequest) {
       List ids = idFromRequest?.trim()?.tokenize(ID_SEPARATOR)
       ids?.removeAll(["", null])
 
       List uids = []
       ids.each{uids.add(Utils.toLong(it))}
 
       if(!uids){
           throw new AnnotationWebServiceException("Expected id or list of ids, received none")
       }
 
       return uids;
   }
 
    /**
    * Get list of context element ids from request
    * @param idFromRequest
    * @return list of ids, or throws exception if non found
    */
   def static List getContextElementIdsFromRequestSafe(String idFromRequest) {
       List ids = idFromRequest?.trim()?.tokenize(ID_SEPARATOR)
       return ids;
   }

    def static String fullSerializedKey(ClinicalElement clinicalElement) {
        Map map = new LinkedHashMap<String, String>();
        map.put(ProcessVariablesEnum.PROJECT_ID.name, clinicalElement.projectId);
        map.put(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.name, clinicalElement.clinicalElementGroup);
        map.put('clinicalElementConfigurationId', clinicalElement.clinicalElementConfigurationId);
        map.putAll(clinicalElement.serializedKeys);
        return SimanUtils.serializeMapToString(map, ";");
    }


    public static ActivitiRuntimeProperty getActivitiRuntimePropertyFromList(String propertyName, List<ActivitiRuntimeProperty> listToSearch) {
        ActivitiRuntimeProperty prop =  listToSearch.find{ it.name == propertyName};
        return prop;
    }

    public static String getReadableAnnotationType(String annotationType, AnnotationSchema annotationSchema) {
        List<String> parts = annotationType.split(";");

        String classDefId = parts[1].split(":")[1];

        ClassDef classDef = annotationSchema.classDefs.find{it.id == classDefId};
        return classDef.name;
    }

    public static void closeConnection(Connection c) {
        if (c instanceof net.sourceforge.jtds.jdbc.Driver) {  // Don't close if JTDS ONLY
            return;
        }

        DbUtils.closeQuietly((Connection)c);
    }

    public static SQLTemplates getSQLTemplate(String driver) throws ValidationException {
        if(driver.equals("org.h2.Driver")) {
            return H2Templates.builder().quote().build();
        } else if(driver.equals("org.hsqldb.jdbcDriver")) {
            return HSQLDBTemplates.builder().quote().build();
        } else if(driver.equals("com.mysql.jdbc.Driver")) {
            return MySQLTemplates.builder().quote().build();
        } else if(driver.equals("com.microsoft.sqlserver.jdbc.SQLServerDriver") || driver.equals("net.sourceforge.jtds.jdbc.Driver")) {
            return SQLServerTemplates.builder().quote().build();
        } else {
            throw new ValidationException("Could not determine dialect from driver. " + driver);
        }
    }
}
