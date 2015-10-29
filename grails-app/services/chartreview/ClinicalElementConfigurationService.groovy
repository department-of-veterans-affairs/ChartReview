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

import javax.sql.DataSource
import java.sql.Connection

import static gov.va.vinci.chartreview.Utils.closeConnection

class ClinicalElementConfigurationService {
    def projectService;

    /**
     * Get a single clinical element configuration.
     * @param   id  the id of the clinical element configuration to get.
     * @param   c   the connection to use for querying. It is not closed.
     * @param   project  the project to get clinical element configuration for.
     * @return    the clinical element configuration. Note, if clinical element configuration is not found, a
     *          ValidationException is thrown.
     */
    public ClinicalElementConfiguration getClinicalElementConfiguration(String id, Connection c, Project project) {
        SQLTemplates templates = Utils.getSQLTemplate(project);
        ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(c, templates);
        return  clinicalElementConfigDAO.getClinicalElementConfiguration(id);
    }

    /**
     * Get a single clinical element configuration.
     * @param   id  the id of the clinical element configuration to get.
     * @param   ds   the datasource to use for querying.
     * @param   project  the project to get clinical element configuration for.
     * @return    the clinical element configuration. Note, if clinical element configuration is not found, a
     *          ValidationException is thrown.
     */
    public ClinicalElementConfiguration getClinicalElementConfiguration(String id, DataSource ds, Project project) {
        Connection c = null;
        try {
            c = ds.getConnection();
            return getClinicalElementConfiguration(id,c, project);

        }finally{
            closeConnection((Connection)c);
        }
    }

    /**
     * Get all Clinical Element configurations for a project.
     * @param   datasource the datasource to use for the queries.
     * @param   project the project to get clinical element configurations for.
     * @param   activeOnly if true, only active configurations are returns. If false, all configurations are returned.
     * @return    A list of clinical element configuration in the project database.
     */
    public List<ClinicalElementConfiguration> getAllClinicalElementConfigurations(DataSource ds, Project project, boolean activeOnly = true) {
        Connection c = null;
        try {
            c = ds.getConnection();
            return getAllClinicalElementConfigurations(c, project, activeOnly);
        } finally {
            closeConnection((Connection)c);
        }
    }


    /**
     * Get all Clinical Element configurations for a project.
     * @param c the database connection to use. It is not closed.
     * @param   project the project to get clinical element configurations for.
     * @param   activeOnly if true, only active configurations are returns. If false, all configurations are returned.
     * @return    A list of clinical element configuration in the project database.
     */
    public List<ClinicalElementConfiguration> getAllClinicalElementConfigurations(Connection c, Project project, boolean activeOnly = true) {
        SQLTemplates templates = Utils.getSQLTemplate(project);

        ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(c, templates);
        List<ClinicalElementConfiguration> configurations = clinicalElementConfigDAO.getAllClinicalElementConfigurations();
        if (activeOnly) {
            return configurations.findAll { it.active }
        } else {
            return configurations;
        }

    }

    public void update(ClinicalElementConfiguration config, String projectId) {
        Connection connection = null;
        try {
            Project project = Project.get(projectId);
            connection = projectService.getDatabaseConnection(project);

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(connection, Utils.getSQLTemplate(project.getJdbcDriver()));
            clinicalElementConfigDAO.updateClinicalElementConfiguration(config);
        }finally{
            closeConnection(connection);
        }
    }

    public ClinicalElementConfiguration getClinicalElementConfigurationByName(String name, Connection c, Project p) {
        List<ClinicalElementConfiguration> configurations = getAllClinicalElementConfigurations(c, p);
        ClinicalElementConfiguration result = null;

        configurations.each {
            if (it.name == name) {
                result = it;
                return;
            }
        }

        return result;
    }

    public ClinicalElementConfiguration getClinicalElementConfigurationByName(String name, DataSource ds, Project p) {
        Connection c = null;
        try {
            c = ds.getConnection();
            return getClinicalElementConfigurationByName(name, c, p);
        } finally {
            closeConnection(c);

        }
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
    public void addClinicalElementConfiguration(Connection c, Project project, ClinicalElementConfiguration conf) {
        SQLTemplates templates = Utils.getSQLTemplate(project);
        ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(c, templates);
        clinicalElementConfigDAO.addClinicalElementConfiguration(conf);
    }

    /**
     * Deletes a clinical element configuration in the project database.
     * @param projectId the project id this clinical element configuration belongs to.
     * @param clinicalElementConfigId the config to delete.
     */
    public void deleteClinicalElementConfig(Connection c, Project project, String clinicalElementConfigId) {
        SQLTemplates templates = Utils.getSQLTemplate(project);
       long deletedCount = new SQLDeleteClause(c, templates, QClinicalElementConfiguration.clinicalElementConfiguration)
                    .where(QClinicalElementConfiguration.clinicalElementConfiguration.id.eq(clinicalElementConfigId)).execute();

        if (deletedCount < 1) {
            throw new IllegalArgumentException("Clinical element configuration: ${clinicalElementConfigId} not found in project: ${projectId}.")
        }
    }
}
