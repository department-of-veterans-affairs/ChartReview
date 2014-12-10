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
import gov.va.vinci.siman.tools.SimanUtils
import org.apache.commons.validator.GenericValidator

import javax.validation.ValidationException
import java.sql.Connection
import java.sql.DriverManager

import static gov.va.vinci.chartreview.Utils.closeConnection

class ClinicalElementConfigurationService {
    def projectService;

    /**
     * Get all Clinical Element configurations for a project.
     * @param   projectId  the projectId to get clinical element configurations for.
     * @return    A list of clinical element configuration in the project database.
     */
    public List<ClinicalElementConfiguration> getAllClinicalElementConfigurations(String projectId, boolean activeOnly = true) {
        Connection connection = null;
        try {
            Project project = Project.get(projectId);
            connection = projectService.getDatabaseConnection(project);

            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(connection, Utils.getSQLTemplate(project.getJdbcDriver()));
            List<ClinicalElementConfiguration> configurations = clinicalElementConfigDAO.getAllClinicalElementConfigurations();
            if (activeOnly) {
                return configurations.findAll { it.active }
            } else {
                return configurations;
            }
        }finally{
            closeConnection(connection);
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

    public ClinicalElementConfiguration getClinicalElementConfigurationByName(String name, String projectId) {
        List<ClinicalElementConfiguration> configurations = getAllClinicalElementConfigurations(projectId);
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
     * Get a single Clinical Element configuration.
     * @param id  the id of the clinical element configuration.
     * @return    the clinical element configuration. Note, if clinical element configuration is not found, a
     *          ValidationException is thrown.
     */
    public ClinicalElementConfiguration getClinicalElementConfiguration(String id, Connection conn, SQLTemplates template) {
        ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(conn, template);
        return  clinicalElementConfigDAO.getClinicalElementConfiguration(id);
    }

    /**
     * Get a single Clinical Element configuration.
     * @param id  the id of the clinical element configuration.
     * @return    the clinical element configuration. Note, if clinical element configuration is not found, a
     *          ValidationException is thrown.
     */
    public ClinicalElementConfiguration getClinicalElementConfiguration(String id, String projectId) {

        Connection connection = null;
        try {
            Project project = Project.get(projectId);
            connection = projectService.getDatabaseConnection(project);
            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(connection, Utils.getSQLTemplate(project.getJdbcDriver()));
            return  clinicalElementConfigDAO.getClinicalElementConfiguration(id);
        }finally{
            closeConnection(connection);
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
    public void addClinicalElementConfiguration(String projectId, ClinicalElementConfiguration conf) {
        Project project = Project.get(projectId);

        Connection connection = null;
        try {
            connection = projectService.getDatabaseConnection(project);
            ClinicalElementConfigDAO clinicalElementConfigDAO = new ClinicalElementConfigDAO(connection, Utils.getSQLTemplate(project.getJdbcDriver()));

            clinicalElementConfigDAO.addClinicalElementConfiguration(conf);
        } finally {
            closeConnection(connection);
        }
    }

    public void deleteClinicalElementConfig(String projectId, String clinicalElementConfigId) {
        Project project = Project.get(projectId);
        Connection connection = null

        try {
            connection = projectService.getDatabaseConnection(project);

            long deletedCount = new SQLDeleteClause(connection, Utils.getSQLTemplate(project.jdbcDriver), QClinicalElementConfiguration.clinicalElementConfiguration)
                    .where(QClinicalElementConfiguration.clinicalElementConfiguration.id.eq(clinicalElementConfigId)).execute();


            if (deletedCount < 1) {
                throw new IllegalArgumentException("Clinical element configuration: ${clinicalElementConfigId} not found in project: ${projectId}.")
            }
        } finally {
            closeConnection(connection);
        }
    }


}
