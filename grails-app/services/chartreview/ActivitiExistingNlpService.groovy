package chartreview

import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.nlp.ChartReviewListener
import gov.va.vinci.siman.cr.SimanPatientCollectionReader
import org.activiti.engine.delegate.DelegateExecution
import org.activiti.engine.delegate.JavaDelegate

/**
 * Class that activi calls to execute an NLP Service.
 */
class ActivitiExistingNlpService implements JavaDelegate{

    def projectService;
    def clinicalElementService;

    @Override
    void execute(DelegateExecution delegateExecution) throws Exception {
        Map<String, Object> allVariables = delegateExecution.getVariables();
        Map<String,Object> serviceVariables = new HashMap<String, Object>();
        for (String key: allVariables.keySet()) {
            if (key.startsWith("serviceTask:" + delegateExecution.getCurrentActivityId() )) {
                serviceVariables.put(key, allVariables.get(key));
            }
        }

        String businessKey = delegateExecution.getProcessBusinessKey();
        Map<String, Object> keyParts = ProcessService.parseBusinessKey(businessKey);
        String serviceName = (String)serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-serviceName");
        String brokerUrl = (String)serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-brokerUrl");
        String[] clinicalElementConfigurations =serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements").split(",");
        log.debug("BrokerUrl: " + brokerUrl);
        log.debug("ServiceName: " + serviceName);
        log.debug("BusinessKey: " + businessKey);
        log.debug("KeyParts: " + keyParts);
        log.debug("ClinicalElements: " + clinicalElementConfigurations);
        log.debug("ProjectId: " + allVariables.get("projectId"));

        Project p =  Project.get(allVariables.get("projectId"));

        ChartReviewListener myListener = new ChartReviewListener();
        gov.va.vinci.leo.Client myClient = new gov.va.vinci.leo.Client(myListener);
        myClient.setInputQueueName(serviceName);
        myClient.setBrokerURL(brokerUrl);
        myClient.setEndpoint(serviceName);

        // TODO - What to set this too?
        myClient.setCasPoolSize(1);

        Map<String, String> collectionReaderParameters = new HashMap<String, String>();
        collectionReaderParameters.put("databaseConnectionUrl", p.getDatabaseConnectionUrl());
        collectionReaderParameters.put("jdbcDriver", p.getJdbcDriver());
        collectionReaderParameters.put("jdbcUsername", p.getJdbcUsername());
        collectionReaderParameters.put("jdbcPassword", p.getJdbcPassword());
        collectionReaderParameters.put("patientId", ProcessService.parseBusinessKey(businessKey).get("patientId"));
        collectionReaderParameters.put("clinicalElementConfigurationIds", serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements"));

        SimanPatientCollectionReader reader = new SimanPatientCollectionReader(p.getJdbcDriver(),
                p.getDatabaseConnectionUrl(), p.jdbcUsername, p.jdbcPassword,
                false, serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements"),
                ProcessService.parseBusinessKey(businessKey).get("processId"),
                ProcessService.parseBusinessKey(businessKey).get("projectId"),
                true,
                ProcessService.parseBusinessKey(businessKey).get("patientId"));
        myClient.run(reader);

    }
}
