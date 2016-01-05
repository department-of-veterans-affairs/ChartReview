package chartreview
import com.google.gson.Gson
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role
import gov.va.vinci.siman.model.ClinicalElementColumnDef
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails
import grails.plugin.gson.converters.GSON
import org.apache.commons.validator.GenericValidator
import org.restapidoc.annotation.RestApi
import org.restapidoc.annotation.RestApiMethod
import org.restapidoc.annotation.RestApiParam
import org.restapidoc.annotation.RestApiParams
import org.restapidoc.pojo.RestApiParamType
import org.restapidoc.pojo.RestApiVerb
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.MediaType

import javax.sql.DataSource
import javax.validation.ValidationException
import java.sql.Timestamp

@RestApi(name = "Clinical Element Configuration services", description = "Methods for managing and querying clinical element configurations.")
class ClinicalElementConfigurationController {

    static allowedMethods = [save: "POST", update: "POST", delete: "GET"]
    def clinicalElementConfigurationService;
    def clinicalElementService;
    def projectService;
    def springSecurityService;

    def index() {
        redirect(action: "list", params: params)
    }

    public ClinicalElementConfigurationDetails getDefaultElementConfigurationDTO() {
        ClinicalElementConfigurationDetails dto = new ClinicalElementConfigurationDetails();
        dto.active = true;
        dto.connectionString = "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8";
        dto.examplePatientId  = "1";
        dto.jdbcDriver = "com.mysql.jdbc.Driver";
        dto.jdbcUsername="chartreview";
        dto.name = "Example Lab Element";
//        dto.query='select lab.result, lab_test_lookup.lab_name, lab.id\n' +
//                '            from lab, lab_test_lookup, patient where lab.lab_performed_id = lab_test_lookup.id\n' +
//                '            and lab.patient_id = patient.id and patient.id = ?';
//        dto.singleElementQuery='select lab.result, lab_test_lookup.lab_name, lab.id\n' +
//                '            from lab, lab_test_lookup, patient where lab.lab_performed_id = lab_test_lookup.id\n' +
//                '            and lab.patient_id = patient.id and lab.id = ?';

        return dto;
    }

    @RestApiMethod( description="Returns all ACTIVE clinical element definitions in JSON.",
            path="/clinicalElementConfiguration/active",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.PATH, description = "The project id to get active clinical element configurations for.")
    ])
    /**
     * Returns all ACTIVE clinical element definitions in JSON.
     *
     */
    def active() {
        Project p = Utils.getSelectedProject(session, params.projectId);
        List<ClinicalElementConfiguration> allConfigurations = clinicalElementConfigurationService.getAllClinicalElementConfigurations(p);
        List<ClinicalElementConfiguration> activeConfiguration = new ArrayList<ClinicalElementConfiguration>();

        allConfigurations.sort{it.name}.each { it ->
            if (it.active) {
                activeConfiguration.add(it);
            }
        }

        Object outputObjectList = convertClinicalElementConfigurationToJSONObject(activeConfiguration)
        def returnMap = new HashMap();
        returnMap.put ("elements", outputObjectList);
        render returnMap as GSON;
    }

    @RestApiMethod( description="Returns a single clinical element configuration",
            path="/clinicalElementConfiguration/configuration",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="id", type="string", paramType = RestApiParamType.PATH, description = "The id of the clinical element configuration to get."),
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.PATH, description = "The project id that the clinical element configuration is in.")
    ])
    /**
     * Returns a single clinical element configuration in json format.
     * @param id
     * @return
     */
    def configuration(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        List<ClinicalElementConfiguration> configurations = [];
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, p);
        if (!conf) {
            throw new ValidationException("ClinicalElementConfiguration '${id}' not found.");
        }

        configurations.add(conf);


        Object outputObjectList = convertClinicalElementConfigurationToJSONObject(configurations)

        def returnMap = new HashMap();
        returnMap.put ("elements", outputObjectList);
        new Gson().toJson(returnMap);
        render returnMap as GSON;
        return null;
    }

    @RestApiMethod( description="Exports a single clinical element configuration to JSON.",
            path="/clinicalElementConfiguration/export",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="id", type="string", paramType = RestApiParamType.PATH, description = "The id of the clinical element configuration to export."),
            @RestApiParam(name="projectId", type="string", paramType = RestApiParamType.PATH, description = "The project id that the clinical element configuration is in to export.")
    ])
    def export(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, p);
        if (!conf) {
            throw new ValidationException("ClinicalElementConfiguration '${id}' not found.");
        }

        render conf as GSON;
    }

    @RestApiMethod( description="Returns all clinical element configurations associated with a project",
            path="/clinicalElementConfiguration/byProject",
            produces= MediaType.APPLICATION_JSON_VALUE,
            verb=RestApiVerb.GET
    )
    @RestApiParams(params=[
            @RestApiParam(name="id", type="string", paramType = RestApiParamType.PATH, description = "The id of the project to get clinical element configurations for.")
    ])
    /**
     * Get the clinical elements that are available for the specific project id.
     * @param projectId
     */
    def byProject() {
        String projectId = params.id;
        log.debug("Getting clinical element configurations for project: ${projectId}")
        Project p = Project.get(projectId);
        List<ClinicalElementConfiguration> conf = clinicalElementConfigurationService.getAllClinicalElementConfigurations(p);
        Object outputObjectList = convertClinicalElementConfigurationToJSONObject(conf);
        def returnMap = new HashMap();
        returnMap.put ("elements", outputObjectList);
        render returnMap as GSON;
        return null;
    }

   /**
     * Upload a saved JSON formatted clinical element configuration.
     */
    def upload = {
        Project p = Utils.getSelectedProject(session, params.projectId);
        def f = request.getFile('myFile')
        if (f.empty) {
            flash.message = 'File cannot be empty'
            redirect(action: "list")
            return
        }

        String jsonText = f.getInputStream().getText();
        ClinicalElementConfiguration conf = new Gson().fromJson(jsonText, ClinicalElementConfiguration.class);

        ClinicalElementConfiguration existing = clinicalElementConfigurationService.getClinicalElementConfiguration(conf.id, p);
        if (existing) {
            flash.message = "Clinical element configuration with id '${conf.id}' already exists in project database. Change id in file before importing.";
            redirect(action: "list")
            return
        }

        conf.name = conf.name + " Imported " + new Date();
        if (conf.version == null) {
            conf.version = new Timestamp(new Date().getTime());
        }


        clinicalElementConfigurationService.addClinicalElementConfiguration(p, conf)
        flash.message = 'Upload complete.';
        redirect(action: "list", params: [projectId: p.id])
        return
    }

    def chooseProject() {
        render(view: "chooseProject", model: [projects: projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username)])
    }

    def list(Integer max) {
        if (params.projectId) {
            session.setAttribute(Utils.SELECTED_PROJECT, params.projectId);
        }
        if (session.getAttribute(Utils.SELECTED_PROJECT) == null) {
            redirect(action: "chooseProject", params: params)
            return;
        }
        Project p = Project.get(session.getAttribute(Utils.SELECTED_PROJECT));
        session.setAttribute("projectName", p.getName());
        if (!session.getAttribute(Utils.SELECTED_PROJECT)) {
            redirect(action: "chooseProject", params: params)
            return;
        }

        params.max = Math.min(max ?: 10, 100)
        if (!params.sort) {
            params.sort = "name";
        }

        params.project = p;
        List<ClinicalElementConfiguration> projectClinicalElementConfigurations = clinicalElementConfigurationService.getAllClinicalElementConfigurations(p).sort{it.name};

        List<Project> userProjects = projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username, Role.findByName("ROLE_ADMIN")).sort{it.name};
        LinkedHashMap<Project, List<ClinicalElementConfiguration>> otherConfigurations = new LinkedHashMap<Project, List<ClinicalElementConfiguration>>();

        userProjects.remove(p);

//            userProjects.each { otherProject ->
//                try {
//                    DataSource otherProjectDS = Utils.getProjectDatasource(otherProject);
//                    otherConfigurations.put(otherProject, clinicalElementConfigurationService.getAllClinicalElementConfigurations(otherProjectDS, otherProject, false));
//                } catch (Exception e) {
//                    log.warn("Could not get clinical element configuration for ${otherProject.id}. Ignoring this project for user.")
//                }
//            }
        [
            otherProjectClinicalElementConfigurations: otherConfigurations,
            project: p,
            projectId: p.id,
            projectClinicalElementConfigurations: projectClinicalElementConfigurations,
            chartReviewProject: Project.findByName("ChartReview")
        ]
        //        render (view: "index", model: [configurations: configurations]);
    }

    def delete(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        DataSource ds = Utils.getProjectDatasource(p);
        try {
            clinicalElementConfigurationService.deleteClinicalElementConfig(ds, p, id);
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'clinicalElementConfiguration.label'), ""])
            redirect(action: "list", params: [projectId: p.id]);
            return;
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'clinicalElementConfiguration.label'), ""])
            redirect(action: "show", id: id);
            return;
        }
    }

    /**
     * The webconversation for creating a new clinical element confifugration.
     * Reminder: Go into state (first by default or one with action).  If state has no redirect, then the gsp
     * with the same name as the state is opened and the "on"s handle actions specified in buttons submitted
     * from the page form of the same name as the state also.  An end state is reached when a redirect
     * is done from a state.
     */
    def createFlow = {

        init {
            action {
                ClinicalElementConfigurationDetails details =  getDefaultElementConfigurationDTO();
                ClinicalElementConfiguration configuration = new ClinicalElementConfiguration();

                Project p = Utils.getSelectedProject(session, params.projectId);
                conversation.project = p;
                DataSource ds = Utils.getProjectDatasource(p);
                conversation.dataSource = ds;
                List<String> tableNames = Utils.getTableNames(ds);
                conversation.tableNames = tableNames;

                if (params.id) {
                    String loadFromProjectId = p.id;
                    if (params.copyFromProjectId) {
                        loadFromProjectId = params.copyFromProjectId;
                    }
                    configuration = clinicalElementConfigurationService.getClinicalElementConfiguration(params.id, p);
                    details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration);
                }

                details.jdbcDriver = p.getJdbcDriver();
                details.jdbcPassword = p.getJdbcPassword();
                details.jdbcUsername = p.getJdbcUsername();
                details.connectionString = p.getDatabaseConnectionUrl();

                if (details.contentTemplate) {
                    details.setHasContent(true);
                }
                conversation.dto = details;
                conversation.clinicalElementConfiguration  = configuration;
                conversation.clinicalElementTableName = "COMPANY";
                conversation.examplePatientId = conversation.dto.examplePatientId;
                nameDescriptionTableStep();
            }
            on("nameDescriptionTableStep").to "nameDescriptionTableStep"
        }
        nameDescriptionTableStep {
            on("next"){
                conversation.name = params.name;
                conversation.clinicalElementTableName = params.clinicalElementTableName;
                conversation.principalClinicalElementIdColName = Utils.getIdColName(conversation.dataSource, conversation.principalClinicalElementTableName);
                conversation.clinicalElementIdColName = Utils.getIdColName(conversation.dataSource, conversation.clinicalElementTableName);
                conversation.clinicalElementTableFieldNames = Utils.getFieldNames(conversation.dataSource, conversation.clinicalElementTableName);

                if (!setNamdAndDescriptionsParams(params, conversation.dto, conversation.dataSource, conversation.project)) {
                    return nameAndDescriptionStep();
                }
                ClinicalElementConfiguration elementConfiguration = new ClinicalElementConfiguration();
                elementConfiguration.setId(UUID.randomUUID().toString());
                elementConfiguration.setName(conversation.dto.name);
                elementConfiguration.setDescription(conversation.dto.description);
                elementConfiguration.setCreatedBy(springSecurityService.authentication.principal.username);
                elementConfiguration.setActive(conversation.dto.active);
                elementConfiguration.setVersion(new Timestamp(System.currentTimeMillis()));
                elementConfiguration.setCreatedDate(new Timestamp(new Date().getTime()));
                conversation.clinicalElementConfiguration = elementConfiguration;
            }.to "keyColumnPickStep"
        }
        keyColumnPickStep {
            on("prev") {
                ClinicalElementConfigurationDetails dto = conversation.dto;
                saveKeyColumnPickValues(conversation.dataSource, params, dto, conversation.clinicalElementTableName);
                conversation.principalClinicalElementIdColName = params.principalClinicalElementIdColName;
                conversation.clinicalElementIdColName = params.clinicalElementIdColName;
                conversation.examplePatientId = params.examplePatientId;
            }.to "nameDescriptionTableStep"
            on("next"){
                ClinicalElementConfigurationDetails dto = conversation.dto;
                saveKeyColumnPickValues(conversation.dataSource, params, dto, conversation.clinicalElementTableName);
                conversation.principalClinicalElementIdColName = params.principalClinicalElementIdColName;
                conversation.clinicalElementIdColName = params.clinicalElementIdColName;
                conversation.examplePatientId = params.examplePatientId;

                try {
                    List<ClinicalElementColumnDef> existingDataQueryColumns = dto.getDataQueryColumns()

                    dto = clinicalElementService.populateColumnInfo(conversation.project, dto);
                    List<ClinicalElementColumnDef> toRemove = new ArrayList<ClinicalElementColumnDef>();
                    List<ClinicalElementColumnDef> toAdd = new ArrayList<ClinicalElementColumnDef>();

                    dto.dataQueryColumns.each{ column ->
                        def existingColumn = existingDataQueryColumns.find{ col -> col.columnName == column.columnName && col.type == column.type}
                        if (existingColumn) {
                            toRemove.add(column);
                            toAdd.add(existingColumn);
                        }
                    }
                    toRemove.eachWithIndex { col, counter ->
                        int index = dto.dataQueryColumns.indexOf(col);
                        dto.dataQueryColumns[index] = toAdd.get(counter);
                    }
                    buildDefaultContentTemplate(dto);
                } catch (Exception e) {
                    flash.message = "Error: ${e.getMessage()}";
                    conversation.dataSetConfigurationInstance = dto;
                    return keyColumnPickStep();
                }
                conversation.dto = dto;
                conversation.template = conversation.dto.contentTemplate;
            }.to "columnDefinitionStep"
        }
        columnDefinitionStep {
            on("prev") {
                def(boolean success, List<String> messages) = saveColumnDefinitionParams(conversation.dto, conversation.clinicalElementIdColName);
            }.to "keyColumnPickStep"
            on("advanced"){
                def(boolean success, List<String> messages) = saveColumnDefinitionParams(conversation.dto, conversation.clinicalElementIdColName);
                if (!success) {
                    if (flash.message == null) {
                        flash.message = "";
                    }
                    messages.each {
                        flash.message = flash.message + "<br/>" + it;
                    }
                    flash.message += "<br/>";
                    return columnDefinitionStep();
                }
            }.to "defineQueriesStep"
            on("next"){
                def(boolean success, List<String> messages) = saveColumnDefinitionParams(conversation.dto, conversation.clinicalElementIdColName);
                if (!success) {
                    if (flash.message == null) {
                        flash.message = "";
                    }
                    messages.each {
                        flash.message = flash.message + "<br/>" + it;
                    }
                    flash.message += "<br/>";
                    return columnDefinitionStep();
                }

                List<Map> results  = clinicalElementService.getExampleResults(conversation.project, conversation.dto);
                conversation.exampleResults = results;
                if (conversation.dto.contentTemplate && conversation.dto.contentTemplate.trim().length() > 0 && results.size()>0) {
                    Map result = results[0];
                    conversation.exampleContentTemplate = clinicalElementService.resultSetToContentTemplate(result, conversation.dto.contentTemplate, null, null, null, null, null, false)
                }
            }.to "previewOutputStep"
        }
        defineQueriesStep {
            on("back"){
                String oldQuery = conversation.dto.query;
                conversation.dto.setQuery(params.query);
                conversation.dto.setSingleElementQuery(params.singleElementQuery);

                try {
                    List<ClinicalElementColumnDef> existingDataQueryColumns = conversation.dto.getDataQueryColumns()

                    conversation.dto = clinicalElementService.populateColumnInfo(conversation.project, conversation.dto);
                    List<ClinicalElementColumnDef> toRemove = new ArrayList<ClinicalElementColumnDef>();
                    List<ClinicalElementColumnDef> toAdd = new ArrayList<ClinicalElementColumnDef>();

                    conversation.dto.dataQueryColumns.each{ column ->
                        def existingColumn = existingDataQueryColumns.find{ col -> col.columnName == column.columnName && col.type == column.type}
                        if (existingColumn) {
                            toRemove.add(column);
                            toAdd.add(existingColumn);
                        }
                    }
                    toRemove.eachWithIndex { col, counter ->
                        int index = conversation.dto.dataQueryColumns.indexOf(col);
                        conversation.dto.dataQueryColumns[index] = toAdd.get(counter);
                    }
                    if(oldQuery.compareToIgnoreCase(conversation.dto.query) != 0)
                    {
                        buildDefaultContentTemplate(conversation.dto);
                    }
                } catch (Exception e) {
                    flash.message = "Error: ${e.getMessage()}";
                    conversation.dataSetConfigurationInstance = conversation.dto;
                    return keyColumnPickStep();
                }
            }.to "columnDefinitionStep"
        }
        previewOutputStep {
            on("prev"){
                conversation.template = conversation.dto.contentTemplate;
            }.to "columnDefinitionStep"
            on("finish"){
                // Save all the columns in the conversation, but delete from the dto the columns that were not included, except the id columns.
                def columnsToDelete = new ArrayList();

                // Performance - only query columns that are included when filling the grid.  When getting a single element, we still need to query all columns so that
                // we get the record detail columns that may appear in the content template.
                def queryColumns = "";
                conversation.dto.dataQueryColumns.each { column ->
                    if (column.exclude && column.columnName != conversation.clinicalElementIdColName && column.columnName != conversation.principalClinicalElementIdName) {
                        columnsToDelete.add(column);
                    }
                    else
                    {
                        if(queryColumns.length() == 0)
                        {
                            queryColumns += column.columnName;
                        }
                        else
                        {
                            queryColumns += ", " + column.columnName;
                        }
                    }
                }
                conversation.dto.setQuery(conversation.dto.query.replace("*", queryColumns));

                conversation.dto.dataQueryColumns.removeAll(columnsToDelete);

                ClinicalElementConfiguration elementConfiguration = conversation.clinicalElementConfiguration;
                elementConfiguration.setConfiguration(new Gson().toJson(conversation.dto));
                clinicalElementConfigurationService.addClinicalElementConfiguration(conversation.project, elementConfiguration);
                redirect(action: 'list', params: [projectId: conversation.project.id]);
            }.to "finish"
        }
        finish {
            // Done, no action.
        }
        reset {
            redirect(action:'create', params: ["_eventId": "init", projectId: conversation.p.id])
        }
    }

    def show(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        ClinicalElementConfiguration dataSetConfigurationInstance = clinicalElementConfigurationService.getClinicalElementConfiguration(id, p);
        if (!dataSetConfigurationInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'clinicalElementConfiguration.label'), id])
            redirect(action: "list")
            return
        }

        [dataSetConfigurationInstance: dataSetConfigurationInstance,
         elementConfigurationDTO: clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance),
         projectId: p.id
        ]
    }

    def edit(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        def dataSetConfigurationInstance = clinicalElementConfigurationService.getClinicalElementConfiguration(id, p)
        if (!dataSetConfigurationInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'clinicalElementConfiguration.label'), id])
            redirect(action: "list", params: [ projectId: p.id])
            return
        }

        boolean active = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance).active;
        [
            dataSetConfigurationInstance: dataSetConfigurationInstance,
            elementConfigurationDTO:  clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance),
            projectId: p.id
        ]
    }

    def update(String id) {
        Project p = Utils.getSelectedProject(session, params.projectId);
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, p);

        if (!conf) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'clinicalElementConfiguration.label'), id])
            redirect(action: "list")
            return
        }

        ClinicalElementConfigurationDetails details =  clinicalElementConfigurationService.getClinicalElementConfigurationDetails(conf);

        if (params.active && "on" == params.active) {
            conf.active = true;
        } else {
            conf.active = false;
        }

        conf.name = params.name;
        conf.description = params.description;

//        details.contentTemplate = params.contentTemplate;

        if (params.containsKey("elementType")) {
            details.elementType = params.elementType;
        }

        if (GenericValidator.isBlankOrNull(params.name) || GenericValidator.isBlankOrNull(params.description) ) {
            flash.message = message(code: "clinicalElement.nameAndDescription.required");
            conf.discard();
            render (view: "edit", model: [dataSetConfigurationInstance: conf, elementConfigurationDTO:  details])
            return;
        }

        ClinicalElementConfiguration existingName = clinicalElementConfigurationService.getClinicalElementConfigurationByName(params.name, p);

        if (existingName && existingName.id != id) {
            flash.message = message(code: "clinicalElementConfiguration.name.unique");
            render (view: "edit", model: [dataSetConfigurationInstance: conf, elementConfigurationDTO:  details])
            return;
        }

        conf.setConfiguration( new Gson().toJson(details));

        clinicalElementConfigurationService.update(conf, p.id);

        flash.message = message(code: 'default.updated.message', args: [message(code: 'clinicalElementConfiguration.label', default: 'Clinical Element Configuration'), conf.name])
        redirect(action: "show", params:[id: id, projectId: p.id])
    }


    /******************************************************************************************************************
     *
     *
     * Helper methods below here.
     *
     *
     ******************************************************************************************************************/

    protected updateColumnsFromParams(Map params, List<ClinicalElementColumnDef> columns, String clinicalElementIdColName)
    {
        boolean atLeastOneKeyField = false;
        boolean returnFalse = false;
        List<String> messages = new ArrayList<>();

        columns.each { column ->
            if (column.columnName.compareToIgnoreCase(clinicalElementIdColName) == 0)
            {
                column.keyField = true;
                atLeastOneKeyField = true;
            }
            else
            {
                column.keyField = false;
            }

            if (GenericValidator.isBlankOrNull(params.get(column.columnName + "-displayName"))) {
                messages.add("Column ${column.columnName} display name cannot be empty. ");
                returnFalse=true;
            }
            column.displayName = params.get(column.columnName + "-displayName");
        }

        if (returnFalse) {
            return [false, messages];
        }

        params.each { param ->
//            if (param.key.endsWith("-KeyField") && !param.key.startsWith("_") && "on".equals(param.value?.toLowerCase())) {
//                String name =  param.key.substring(0, param.key.length() - 9);
//                ClinicalElementColumnDef d = columns.find{it.columnName == param.key.substring(0, param.key.length() - 9)}
//                if (!d) {
//                    throw new Exception("Column ${name} not found. There is a problem with the request.");
//                }
//                d.keyField = true;
//                atLeastOneKeyField = true;
//            }
            if(param.key.endsWith("-mimeTypeReferenceColumn"))
            {
                String name =  param.key.substring(0, param.key.length() - 24);
                ClinicalElementColumnDef d = columns.find{it.columnName == name}
                if (!d) {
                    throw new Exception("Column ${name} not found. There is a problem with the request.");
                }
                String type = d.type.split(":")[0].trim();
                d.setType(type + ":mimeTypeReferenceColumn=" + param.value);
            }
        }

        /**
         * Set excludes.
         */
        columns.each { column ->
            if (params["${column.columnName}-Exclude"] && "on".equals(params["${column.columnName}-Exclude"])) {
                column.exclude = true;
            } else {
                column.exclude = false;
            }
        }

        if (!atLeastOneKeyField) {
            messages.add("At least one key field must be selected that uniquely identifies a row.");
            return [false, messages];
        }
        return [true, messages];
    }

    protected ClinicalElementConfigurationDetails saveKeyColumnPickValues(DataSource ds, Map params, ClinicalElementConfigurationDetails dto, String clinicalElementTableName) {
        String principalClinicalElementIdColName = params.principalClinicalElementIdColName;
        String clinicalElementIdColName = params.clinicalElementIdColName;
        if(clinicalElementTableName && (!dto.query || dto.query && dto.query.trim().length() == 0) && principalClinicalElementIdColName && principalClinicalElementIdColName.length() > 0)
        {
            dto.setQuery("select * from " + clinicalElementTableName + " where " + principalClinicalElementIdColName + " = ?");
        }
        if(clinicalElementTableName && (!dto.singleElementQuery || dto.singleElementQuery && dto.singleElementQuery.trim().length() == 0) && clinicalElementIdColName && clinicalElementIdColName.length() > 0)
        {
            dto.setSingleElementQuery("select * from " + clinicalElementTableName + " where " + clinicalElementIdColName + " = ?");
        }
        dto.setExamplePatientId(params.examplePatientId);
        return dto;
    }

    protected boolean setNamdAndDescriptionsParams(Map params, ClinicalElementConfigurationDetails dto, DataSource ds, Project p) {
        dto.name = params.name;
        dto.description = params.description;
        dto.active= false;
        if ("on".equals(params.active?.toLowerCase())) {
            dto.active = true;
        }
        if (GenericValidator.isBlankOrNull(params.name)) {
            flash.message = "Element name is required.";
            return false;
        }

        def exists = clinicalElementConfigurationService.getClinicalElementConfigurationByName(params.name, p);
        if (exists) {
            flash.message = "Element with name '${params.name}' already exists.";
            return false;
        }

        return true;
    }

    protected Object convertClinicalElementConfigurationToJSONObject(List<ClinicalElementConfiguration> configurations) {
        /**
         * Create the object to output as JSON.
         */
        def outputObjectList = new ArrayList();
        configurations.each { configuration ->
            def list = [];
            ClinicalElementConfigurationDetails details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration.configuration);
            details.getDataQueryColumns().each {
                column ->
                    list.add([text: column.displayName, dataIndex: column.columnName, type: column.getJsType(), sort: column.sort, hidden: column.hidden, exclude: column.exclude])
            }

            def outputObject = [
                    text: configuration.name,
                    dataIndex: configuration.id,
                    fields: list,
                    elementType: details.elementType,
                    hasContent: details.contentTemplate?.trim()?.length() > 0,
                    titleField: details.titleField,
                    descriptionField: details.descriptionField,
                    idField: '_SERIALIZED_ID_'
            ]

            outputObjectList.add(outputObject);
        }
        return outputObjectList;
    }

    protected saveColumnDefinitionParams(ClinicalElementConfigurationDetails dto, String clinicalElementIdColName) {
        dto.titleField = params.titleField;
        dto.descriptionField = params.descriptionField;

        if (params.containsKey("elementType")) {
            dto.elementType = params.elementType;
        }
        dto.hasContent = params.hasContent.compareToIgnoreCase("false") == 0 ? false : true;
        if(!dto.hasContent)
        {
            dto.contentTemplate = null;
        }
        else
        {
            dto.contentTemplate = params.template;
        }

        return updateColumnsFromParams(params, dto.dataQueryColumns, clinicalElementIdColName);
    }

    protected buildDefaultContentTemplate(ClinicalElementConfigurationDetails dto)
    {
        if(!dto.getContentTemplate() || dto.getContentTemplate().length() == 0)
        {
            def template = "";
            dto.dataQueryColumns.each { column ->
                template += "<p>" + column.columnName + ": \${" + column.columnName + "}" + "</p>";
            }
            dto.setContentTemplate(template);
        }
    }
}
