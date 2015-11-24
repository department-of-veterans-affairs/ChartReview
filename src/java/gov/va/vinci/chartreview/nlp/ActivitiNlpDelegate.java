package gov.va.vinci.chartreview.nlp;

import chartreview.AnnotationSchemaService;
import chartreview.ProcessService;
import chartreview.ProjectService;
import gov.va.vinci.chartreview.ProcessVariablesEnum;
import gov.va.vinci.chartreview.Utils;
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty;
import gov.va.vinci.chartreview.model.Project;
import gov.va.vinci.chartreview.model.schema.AnnotationSchema;
import gov.va.vinci.chartreview.model.schema.AnnotationSchemaRecord;
import gov.va.vinci.leo.tools.LeoUtils;
import gov.va.vinci.siman.cr.SimanPatientCollectionReader;
import grails.util.Holders;
import org.activiti.engine.delegate.DelegateExecution;
import org.activiti.engine.delegate.JavaDelegate;
import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by ryancornia on 4/29/14.
 */
public class ActivitiNlpDelegate implements JavaDelegate {
    /**
     * Log file handler.
     */
    private final static Logger LOG = Logger.getLogger(LeoUtils.getRuntimeClass().toString());

    protected DataSource dataSource;


    @Override
    public void execute(DelegateExecution delegateExecution) throws Exception {
        try {
            // This insures the grails app is fully started before continuing...
            ApplicationContext context = Holders.getGrailsApplication().getMainContext();

            while (context == null) {
                System.out.println("Context was null, sleeping 2 seconds before trying again...");
                Thread.sleep(2000);
                context = Holders.getGrailsApplication().getMainContext();
            }

            ApplicationContext ctx = Holders.getGrailsApplication().getMainContext();
            ProcessService processService = (ProcessService) ctx.getBean("processService");
            AnnotationSchemaService annotationSchemaService = (AnnotationSchemaService) ctx.getBean("annotationSchemaService");
            ProjectService projectService = (ProjectService) ctx.getBean("projectService");


            Map<String, Object> allVariables = delegateExecution.getVariables();
            Map<String, Object> serviceVariables = new HashMap<String, Object>();


            List<ActivitiRuntimeProperty> propertyList =
                    processService.getRuntimeProperties(
                                                        (String) allVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()),
                                                        (String) allVariables.get(ProcessVariablesEnum.DISPLAY_NAME.getName())
                                                       );

            for (ActivitiRuntimeProperty key : propertyList) {
                if (key.getName().startsWith("serviceTask:" + delegateExecution.getCurrentActivityId())) {
                    serviceVariables.put(key.getName(), key.getValue());
                }
            }

            String businessKey = delegateExecution.getProcessBusinessKey();
            Map<String, Object> keyParts = ProcessService.parseBusinessKey(businessKey);
            String serviceName = (String) serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-serviceName");
            String brokerUrl = (String) serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-brokerUrl");
            String schemaId = (String) serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-schema");

            LOG.debug("    BrokerUrl: " + brokerUrl);
            LOG.debug("    ServiceName: " + serviceName);
            LOG.debug("    BusinessKey: " + businessKey);
            LOG.debug("    KeyParts: " + keyParts);
            LOG.debug("    ClinicalElements: " + serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements"));
            LOG.debug("    ProjectId: " + allVariables.get("projectId"));

            Map<String, String> collectionReaderParameters = new HashMap<String, String>();
            collectionReaderParameters.put(SimanPatientCollectionReader.Param.PATIENT_ID.getName(), (String) keyParts.get("patientId"));
            collectionReaderParameters.put(SimanPatientCollectionReader.Param.CLINICAL_ELEMENT_CONFIGURATION_IDS.getName(),
                    (String) serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements"));

            LOG.debug("Collection Reader Parameters: " + collectionReaderParameters);

            Project p = projectService.getProject((String) allVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()));

            AnnotationSchemaRecord annotationSchemaRecord = annotationSchemaService.get(p, schemaId);
            if (annotationSchemaRecord == null) {
                throw new IllegalArgumentException("Could not find schema with id ${annotationType}.");
            }
            AnnotationSchema schema = annotationSchemaService.parseSchemaXml(annotationSchemaRecord.getSerializationData(), false);
            String[] inputType = annotationSchemaService.schemaToUimaTypeNames(schema, "chartreview." + p.getTypeSystemPackageName());

            String clinicalElementValue = null;
            if (Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), propertyList) != null) {
                clinicalElementValue = Utils.getActivitiRuntimePropertyFromList(ProcessVariablesEnum.CLINICAL_ELEMENT_GROUP.getName(), propertyList).getValue();
            }

            ChartReviewListener myListener = new ChartReviewListener(schema, p, clinicalElementValue, (String) serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-annotationGroup"), false);
            myListener.setInputTypes(inputType);

            gov.va.vinci.leo.Client myClient = new gov.va.vinci.leo.Client(myListener);
            myClient.setInputQueueName(serviceName);
            myClient.setBrokerURL(brokerUrl);
            myClient.setEndpoint(serviceName);

            // TODO - What to set this too?
            myClient.setCasPoolSize(1);
            Object config = Holders.getGrailsApplication().getConfig();

            SimanPatientCollectionReader reader = new SimanPatientCollectionReader(
                    Utils.getActivitiRuntimePropertyFromList("jdbcDriver", propertyList).getValue(),
                    Utils.getActivitiRuntimePropertyFromList("databaseConnectionUrl", propertyList).getValue(),
                    Utils.getActivitiRuntimePropertyFromList("jdbcUsername", propertyList).getValue(),
                    Utils.getActivitiRuntimePropertyFromList("jdbcPassword", propertyList).getValue(),
                    false, // Load existing annotation.
                    ((String)serviceVariables.get("serviceTask:" + delegateExecution.getCurrentActivityId() + "-clinicalElements")).split(","), // Clinical Element config ids.
                    (String) allVariables.get(ProcessVariablesEnum.PROCESS_ID.getName()),
                    (String) allVariables.get(ProcessVariablesEnum.PROJECT_ID.getName()),
                    true,
                    (String) keyParts.get("patientId"),
                    "Dflt"
                    );
            myClient.run(reader);
        } catch (Exception e) {
            System.out.println("Got exception: " + e);
            e.printStackTrace();
            throw e;
        }
    }
}
