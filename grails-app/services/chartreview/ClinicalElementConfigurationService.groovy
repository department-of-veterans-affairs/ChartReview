package chartreview
import com.google.gson.Gson
import com.mysema.query.sql.SQLTemplates
import com.mysema.query.sql.dml.SQLDeleteClause
import gov.va.vinci.chartreview.Utils
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.siman.dao.ClinicalElementConfigDAO
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails
import gov.va.vinci.siman.model.QClinicalElementConfiguration
import org.apache.commons.dbutils.DbUtils

import javax.sql.DataSource
import java.sql.Connection

import static gov.va.vinci.chartreview.Utils.closeConnection

class ClinicalElementConfigurationService {
    def projectService;
    def grailsApplication;

    /**
     * Get a single clinical element configuration.
     * @param   id  the id of the clinical element configuration to get.
     * @param   projectId  the projectId to get clinical element configuration for.
     * @return    the clinical element configuration. Note, if clinical element configuration is not found, a
     *          ValidationException is thrown.
     */
    public ClinicalElementConfiguration getClinicalElementConfiguration(String id, Project project) {
        Connection c = null;

        SQLTemplates templates = Utils.getSQLTemplate(project);
        try {
            c = projectService.getDatabaseConnection(project);

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(c, templates, grailsApplication.config.chartReview.defaultSchema);
            return  clinicalElementConfigDAO.getClinicalElementConfiguration(id);
        }finally{
            Utils.closeConnection(c);
        }
    }

    /**
     * Get all Clinical Element configurations for a project.
     * @param   projectId  the projectId to get clinical element configurations for.
     * @return    A list of clinical element configuration in the project database.
     */
    public List<ClinicalElementConfiguration> getAllClinicalElementConfigurations(Project project, boolean activeOnly = true) {
        Connection c = null;

        SQLTemplates templates = Utils.getSQLTemplate(project);
        try {
            c = projectService.getDatabaseConnection(project);
            def defaultSchema = grailsApplication.config.chartReview.defaultSchema;

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO((java.sql.Connection)c, templates, defaultSchema);
            List<ClinicalElementConfiguration> configurations = clinicalElementConfigDAO.getAllClinicalElementConfigurations();
            if (activeOnly) {
                return configurations.findAll { it.active }
            } else {
                return configurations;
            }
        } finally {
            Utils.closeConnection(c);
        }
    }

    public void update(ClinicalElementConfiguration config, String projectId) {
        Connection connection = null;
        try {
            Project project = Project.get(projectId);
            connection = projectService.getDatabaseConnection(project);

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(connection, Utils.getSQLTemplate(project.getJdbcDriver()), grailsApplication.config.chartReview.defaultSchema);
            clinicalElementConfigDAO.updateClinicalElementConfiguration(config);
        }finally{
            Utils.closeConnection(c);
        }
    }

    public ClinicalElementConfiguration getClinicalElementConfigurationByName(String name, Project p) {
        List<ClinicalElementConfiguration> configurations = getAllClinicalElementConfigurations(p);
        ClinicalElementConfiguration result = null;

        configurations.each {
            if (it.name == name) {
                result = it;
                return;
            }
        }

        return result;
    }

    /**
     * Convert a JSON serialized version of an ClinicalElementConfigurationDetails to an actual ClinicalElementConfigurationDetails object.
     * @param configuration the ClinicalElementConfiguration that has the configuration property with the string to parse.
     * @return the ClinicalElementConfigurationDetails de-serialized from the ClinicalElementConfiguration.
     */
    public ClinicalElementConfigurationDetails getClinicalElementConfigurationDetails(ClinicalElementConfiguration conf) {
        return getClinicalElementConfigurationDetails(conf.getConfiguration());
    }

    /**
     * Convert a JSON serialized version of an ClinicalElementConfigurationDetails to an actual ClinicalElementConfigurationDetails object.
     * @param configuration the JSON string to parse.
     * @return the ClinicalElementConfigurationDetails de-serialized from the String.
     */
    public ClinicalElementConfigurationDetails getClinicalElementConfigurationDetails(String configuration) {
        Gson gson = new Gson();
        ClinicalElementConfigurationDetails dto = gson.fromJson(configuration, ClinicalElementConfigurationDetails.class)
        return dto;
    }

    /**
     * Saves a new clinical element configuration to the project database.
     * @param projectId the project id this clinical element configuration belongs to.
     * @param conf the conf to save.
     */
    public void addClinicalElementConfiguration(Project project, ClinicalElementConfiguration conf) {
        Connection c = null;
        SQLTemplates templates = Utils.getSQLTemplate(project);
        try {
            c = projectService.getDatabaseConnection(project);

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(c, templates, grailsApplication.config.chartReview.defaultSchema);
            clinicalElementConfigDAO.addClinicalElementConfiguration(conf);
        } finally {
            Utils.closeConnection(c);
        }
    }

    /**
     * Deletes a clinical element configuration in the project database.
     * @param projectId the project id this clinical element configuration belongs to.
     * @param clinicalElementConfigId the config to delete.
     */
    public void deleteClinicalElementConfig(DataSource ds, Project project, String clinicalElementConfigId) {
        Connection c = null;
        SQLTemplates templates = Utils.getSQLTemplate(project);

        try {
//            c = ds.getConnection();
            c = projectService.getDatabaseConnection(project);
            QClinicalElementConfiguration qClinicalElementConfiguration = new QClinicalElementConfiguration("cec", grailsApplication.config.chartReview.defaultSchema, "CLINICAL_ELEMENT_CONFIGURATION");
            long deletedCount = new SQLDeleteClause(c, templates, qClinicalElementConfiguration)
                    .where(qClinicalElementConfiguration.id.eq(clinicalElementConfigId)).execute();

            if (deletedCount < 1) {
                throw new IllegalArgumentException("Clinical element configuration: ${clinicalElementConfigId} not found in project: ${projectId}.")
            }
        } finally {
            Utils.closeConnection(c);
        }
    }
}
