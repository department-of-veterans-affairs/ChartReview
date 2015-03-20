package chartreview

import com.google.gson.Gson
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

import javax.validation.ValidationException
import java.sql.Timestamp

@RestApi(name = "Clinical Element Configuration services", description = "Methods for managing and querying clinical element configurations.")
class ClinicalElementConfigurationController {

    static allowedMethods = [save: "POST", update: "POST", delete: "GET"]
    def clinicalElementConfigurationService;
    def clinicalElementService;
    def projectService;
    def springSecurityService;

    public ClinicalElementConfigurationDetails getDefaultElementConfigurationDTO() {
        ClinicalElementConfigurationDetails dto = new ClinicalElementConfigurationDetails();
        dto.active = true;
        dto.connectionString = "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8";
        dto.examplePatientId  = "1";
        dto.jdbcDriver = "com.mysql.jdbc.Driver";
        dto.jdbcUsername="chartreview";
        dto.name = "Example Lab Element";
        dto.query='select lab.result, lab_test_lookup.lab_name, lab.id\n' +
                '            from lab, lab_test_lookup, patient where lab.lab_performed_id = lab_test_lookup.id\n' +
                '            and lab.patient_id = patient.id and patient.id = ?';
        dto.singleElementQuery='select lab.result, lab_test_lookup.lab_name, lab.id\n' +
                '            from lab, lab_test_lookup, patient where lab.lab_performed_id = lab_test_lookup.id\n' +
                '            and lab.patient_id = patient.id and lab.id = ?';

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
        List<ClinicalElementConfiguration> allConfigurations = clinicalElementConfigurationService.getAllClinicalElementConfigurations(params.projectId);
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
        List<ClinicalElementConfiguration> configurations = [];
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, params.projectId);
        if (!conf) {
            throw new ValidationException("ClinicalElementConfiguration '${id}' not found.");
        }

        configurations.add(conf);


        Object outputObjectList = convertClinicalElementConfigurationToJSONObject(configurations)

        def returnMap = new HashMap();
        returnMap.put ("elements", outputObjectList);
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
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, params.projectId);
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
    def byProject(String id) {
        log.debug("Getting clinical element configurations for project: ${id}")
        List<ClinicalElementConfiguration> conf = clinicalElementConfigurationService.getAllClinicalElementConfigurations(id);
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
        def f = request.getFile('myFile')
        if (f.empty) {
            flash.message = 'File cannot be empty'
            redirect(action: "list")
            return
        }



        String jsonText = f.getInputStream().getText();
        ClinicalElementConfiguration conf = new Gson().fromJson(jsonText, ClinicalElementConfiguration.class);

        ClinicalElementConfiguration existing = clinicalElementConfigurationService.getClinicalElementConfiguration(conf.id, params.projectId);
        if (existing) {
            flash.message = "Clinical element configuration with id '${conf.id}' already exists in project database. Change id in file before importing.";
            redirect(action: "list")
            return
        }

        conf.name = conf.name + " Imported " + new Date();
        if (conf.version == null) {
            conf.version = new Timestamp(new Date().getTime());
        }


        clinicalElementConfigurationService.addClinicalElementConfiguration(params.projectId, conf)
        flash.message = 'Upload complete.';
        redirect(action: "list", params: [projectId: params.projectId])
        return
    }

    def index() {
        redirect(action: "list", params: params)
    }

    def chooseProject() {
        render(view: "chooseProject", model: [projects: projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username)])
    }

    def list(Integer max) {
        if (!params.projectId) {
            redirect(action: "chooseProject");
            return;
        }

        params.max = Math.min(max ?: 10, 100)
        if (!params.sort) {
            params.sort = "name";
        }

        Project project = Project.get(params.projectId);
        params.project = project;
        List<ClinicalElementConfiguration> projectClinicalElementConfigurations = clinicalElementConfigurationService.getAllClinicalElementConfigurations(params.projectId).sort{it.name};
        List<Project> userProjects = projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username, Role.findByName("ROLE_ADMIN")).sort{it.name};


        LinkedHashMap<Project, List<ClinicalElementConfiguration>> otherConfigurations = new LinkedHashMap<Project, List<ClinicalElementConfiguration>>();

        userProjects.remove(project);

        userProjects.each { p ->
            try {
                otherConfigurations.put(p, clinicalElementConfigurationService.getAllClinicalElementConfigurations(p.id, false));
            } catch (Exception e) {
                log.warn("Could not get clinical element configuration for ${p.id}. Ignoring this project for user.")
            }
        }
        [
            otherProjectClinicalElementConfigurations: otherConfigurations,
            project: project,
            projectId: project.id,
            projectClinicalElementConfigurations: projectClinicalElementConfigurations,
            chartReviewProject: Project.findByName("ChartReview")
        ]
    }

    def delete(String id) {
        try {
            clinicalElementConfigurationService.deleteClinicalElementConfig(params.projectId, id);
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'clinicalElementConfiguration.label'), ""])
            redirect(action: "list", params: [projectId: params.projectId]);
            return;
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'clinicalElementConfiguration.label'), ""])
            redirect(action: "show", id: id);
            return;
        }
    }

    /**
     * The webconversation for creating a new dataset.
     */
    def createElementConfigurationFlow = {
        init {
            action {
                ClinicalElementConfigurationDetails details =  getDefaultElementConfigurationDTO();
                ClinicalElementConfiguration configuration = new ClinicalElementConfiguration();

                conversation.projectId = params.projectId;

                if (params.id) {
                    String loadFromProjectId = params.projectId;
                    if (params.copyFromProjectId) {
                        loadFromProjectId = params.copyFromProjectId;
                    }
                    configuration = clinicalElementConfigurationService.getClinicalElementConfiguration(params.id, loadFromProjectId);
                    details = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(configuration);
                }

                Project project = Project.get(params.projectId);
                conversation.project = project;
                details.jdbcDriver = project.getJdbcDriver();
                details.jdbcPassword = project.getJdbcPassword();
                details.jdbcUsername = project.getJdbcUsername();
                details.connectionString = project.getDatabaseConnectionUrl();

                if (details.contentTemplate) {
                    details.setHasContent(true);
                }
                conversation.dto = details;
                conversation.clinicalElementConfiguration  = configuration;
                nameAndDescriptionStep();
            }
            on("nameAndDescriptionStep").to "nameAndDescriptionStep"
        }
        nameAndDescriptionStep {
            on("next"){
                ClinicalElementConfigurationDetails dto = conversation.dto;
                if (!setNamdAndDescriptionsParams(params, dto, conversation.projectId)) {
                    conversation.dto = dto;
                    return nameAndDescriptionStep();
                }
                ClinicalElementConfiguration elementConfiguration = new ClinicalElementConfiguration();
                elementConfiguration.setId(UUID.randomUUID().toString());
                elementConfiguration.setName(dto.name);
                elementConfiguration.setDescription(dto.description);
                elementConfiguration.setCreatedBy(springSecurityService.authentication.principal.username);
                elementConfiguration.setActive(dto.active);
                elementConfiguration.setVersion(new Timestamp(System.currentTimeMillis()));
                elementConfiguration.setCreatedDate(new Timestamp(new Date().getTime()));
                conversation.clinicalElementConfiguration = elementConfiguration;
            }.to "defineQueriesStep"
            on("reset").to "reset"
        }
        defineQueriesStep {
            on("prev") {

            }.to "nameAndDescriptionStep"
            on("next"){
                ClinicalElementConfigurationDetails dto = conversation.dto;
                setStep1Params(params, dto);
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
                        dto.dataQueryColumns[index] =  toAdd.get(counter);
                    }

                } catch (Exception e) {
                    flash.message = "Error: ${e.getMessage()}";
                    conversation.dataSetConfigurationInstance = dto;
                    return defineQueriesStep();
                }
                conversation.dto = dto;
            }.to "columnDefinitionStep"
        }
        columnDefinitionStep {
            on("next"){
                ClinicalElementConfigurationDetails dto = conversation.dto;
                def(boolean success, List<String> messages) = copyStep2Params(dto);

               conversation.dto = dto;
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

                List<Map> results  = clinicalElementService.getExampleResults(conversation.project, dto);
                conversation.exampleResults = results;
                if (dto.contentTemplate?.trim().length() > 0 && results.size()>0) {
                    conversation.exampleContentTemplate = clinicalElementService.resultSetToContentTemplate(results.get(0), dto.contentTemplate, true);
                }
            }.to "previewOutputStep"
            on("reset"){
                ClinicalElementConfigurationDetails dto = conversation.dto;
                copyStep2Params(dto);
                conversation.dto = dto;
            }.to "defineQueriesStep"
        }
        previewOutputStep {
            on("prev"){
            }.to "columnDefinitionStep"
            on("finish"){
                ClinicalElementConfiguration elementConfiguration = conversation.clinicalElementConfiguration;
                elementConfiguration.setConfiguration(new Gson().toJson(conversation.dto));
                clinicalElementConfigurationService.addClinicalElementConfiguration(conversation.projectId, elementConfiguration);
                redirect(action: 'list', params: [projectId: conversation.projectId]);
            }.to "finish"
            on("reset").to "reset"
        }
        finish {
            // Done, no action.
        }
        reset {
            redirect(action:'createElementConfiguration', params: ["_eventId": "init", projectId: conversation.projectId])
        }
    }

    def show(String id) {
        ClinicalElementConfiguration dataSetConfigurationInstance = clinicalElementConfigurationService.getClinicalElementConfiguration(id, params.projectId);
        if (!dataSetConfigurationInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'clinicalElementConfiguration.label'), id])
            redirect(action: "list")
            return
        }

        [dataSetConfigurationInstance: dataSetConfigurationInstance,
         elementConfigurationDTO: clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance),
         projectId: params.projectId
        ]
    }

    def edit(String id) {
        def dataSetConfigurationInstance = clinicalElementConfigurationService.getClinicalElementConfiguration(id, params.projectId)
        if (!dataSetConfigurationInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'clinicalElementConfiguration.label'), id])
            redirect(action: "list", params: [ projectId: params.projectId])
            return
        }

        boolean active = clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance).active;
        [
            dataSetConfigurationInstance: dataSetConfigurationInstance,
            elementConfigurationDTO:  clinicalElementConfigurationService.getClinicalElementConfigurationDetails(dataSetConfigurationInstance),
            projectId: params.projectId
        ]
    }

    def update(String id) {
        ClinicalElementConfiguration conf = clinicalElementConfigurationService.getClinicalElementConfiguration(id, params.projectId);

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

        ClinicalElementConfiguration existingName = clinicalElementConfigurationService.getClinicalElementConfigurationByName(params.name, params.projectId);

        if (existingName && existingName.id != id) {
            flash.message = message(code: "clinicalElementConfiguration.name.unique");
            render (view: "edit", model: [dataSetConfigurationInstance: conf, elementConfigurationDTO:  details])
            return;
        }

        conf.setConfiguration( new Gson().toJson(details));

        clinicalElementConfigurationService.update(conf, params.projectId);

        flash.message = message(code: 'default.updated.message', args: [message(code: 'clinicalElementConfiguration.label', default: 'Clinical Element Configuration'), conf.name])
        redirect(action: "show", params:[id: id, projectId: params.projectId])
    }


    /******************************************************************************************************************
     *
     *
     * Helper methods below here.
     *
     *
     ******************************************************************************************************************/
    protected updateColumnsFromParams(Map params, List<ClinicalElementColumnDef> columns)
    {
        boolean atLeastOneKeyField = false;
        boolean returnFalse = false;
        List<String> messages = new ArrayList<>();

        columns.each { column ->
            column.keyField = false;

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
             if (param.key.endsWith("-KeyField") && !param.key.startsWith("_") && "on".equals(param.value?.toLowerCase())) {
                String name =  param.key.substring(0, param.key.length() - 9);
                ClinicalElementColumnDef d = columns.find{it.columnName == param.key.substring(0, param.key.length() - 9)}
                if (!d) {
                    throw new Exception("Column ${name} not found. There is a problem with the request.");
                }
                d.keyField = true;
                atLeastOneKeyField = true;
            }
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


    protected ClinicalElementConfigurationDetails setStep1Params(Map params, ClinicalElementConfigurationDetails dto) {
        dto.query = params.query;
        dto.singleElementQuery = params.singleElementQuery;
        dto.examplePatientId = params.examplePatientId;
        return dto;
    }

    protected boolean setNamdAndDescriptionsParams(Map params, ClinicalElementConfigurationDetails dto, String projectId) {
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

        def exists = clinicalElementConfigurationService.getClinicalElementConfigurationByName(params.name, projectId);
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
                    hasContent: details.contentTemplate.trim().length() > 0,
                    titleField: details.titleField,
                    descriptionField: details.descriptionField,
                    idField: '_SERIALIZED_ID_'
            ]

            outputObjectList.add(outputObject);
        }
        return outputObjectList;
    }

    protected  copyStep2Params(ClinicalElementConfigurationDetails dto) {
        dto.titleField = params.titleField;
        dto.descriptionField = params.descriptionField;

        if (params.containsKey("elementType")) {
            dto.elementType = params.elementType;
        }

        if (params.containsKey("hasContent")) {
            dto.contentTemplate = params.contentTemplate;
            dto.hasContent = true;
        } else {
            dto.hasContent = false;
            dto.contentTemplate = null;
        }
        return updateColumnsFromParams(params, dto.dataQueryColumns);
    }
}
