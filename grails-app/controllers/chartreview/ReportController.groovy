package chartreview

import au.com.bytecode.opencsv.CSVWriter
import gov.va.vinci.chartreview.PatientAnnotatorProcessTaskId
import gov.va.vinci.chartreview.PatientCountAnnotatorProcess
import gov.va.vinci.chartreview.model.ActivitiRuntimeProperty
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.report.AnnotationByAnnotatorDetailModel
import gov.va.vinci.chartreview.report.UsernameAnnotationTypeCount
import gov.va.vinci.siman.model.Annotation
import grails.plugin.gson.converters.GSON

class ReportController {

    public static String PROJECT_SESSION_VARIABLE = "report:project";
    public static String PROCESS_SESSION_VARIABLE = "report:processes";

    def reportService;
    def projectService;
    def springSecurityService;
    def clinicalElementService;


    def index() {
        redirect(action: "showReports", params: params)
    }

    def chooseProjectAndProcess() {
        session.removeAttribute(PROJECT_SESSION_VARIABLE);
        session.removeAttribute(PROCESS_SESSION_VARIABLE)
        List<Project> projects =  projectService.projectsUserIsAssignedTo(springSecurityService.authentication.principal.username).sort{it.name};
        render(view: "chooseProjectAndProcesses", model: [projects: projects])
    }

    def loadProjectProcesses() {
        List<String> processList = new ArrayList<String>();
        List<ActivitiRuntimeProperty> props = ActivitiRuntimeProperty.findAllByProject(Project.get(params.projectId));

        props.each {
            processList.add(it.processDisplayName);
        }

        processList.unique().sort();

        render processList as GSON;
    }

    def showReports() {
        if (params.projectId) {
            session.setAttribute(PROJECT_SESSION_VARIABLE, Project.get(params.projectId));
        }
        if (params.processes) {
            session.setAttribute(PROCESS_SESSION_VARIABLE, params.list('processes'));
        }

        if (!verifySelection()) {
            return;
        }

    }

    def patientsPerAnnotator() {
        if (!verifySelection()) {
            return;
        }

        List<PatientAnnotatorProcessTaskId> patientAnnotatorProcesses;
        List<String> processNames;
        List<PatientCountAnnotatorProcess> results = new ArrayList<PatientCountAnnotatorProcess>();

        (patientAnnotatorProcesses, processNames) =  reportService.patientByAnnotatorProcess(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE));
        processNames.sort();


        processNames.each { processName ->
            def allByProcess = patientAnnotatorProcesses.findAll {it.processName == processName}
            Map<String, PatientCountAnnotatorProcess> map = new HashMap<String, PatientAnnotatorProcessTaskId>();
            allByProcess.each {
                PatientCountAnnotatorProcess p=null;
                if (map.containsKey(it.annotator)) {
                     p = map.get(it.annotator);
                } else {
                     p = new PatientCountAnnotatorProcess(annotator: it.annotator, processName: processName);
                }
                p.patientCount++;
                map.put(it.annotator, p);
            }
            results.addAll(map.values())
        }

        [ patientCountAnnotatorProcess: results ];
    }


    def annotationsByAnnotatorDetail() {
        if (!verifySelection()) {
            return;
        }

        List<AnnotationByAnnotatorDetailModel> annotations = reportService.annotationByAnnotatorDetail(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE));
        annotations?.sort{it.annotation.userId};
        if (params.format != "csv"){
            render (view: "annotationsByAnnotatorDetail", model: [annotations: annotations]);
        } else {
            StringWriter writer  = new StringWriter();
            CSVWriter csvWriter = new CSVWriter(writer);

            String[] headerRow = [ "Process", "User", "ClinicalElementConfiguration", "TaskId", "PatientId", "AnnotationType", "CoveredTest", "Attributes"]

            csvWriter.writeNext(headerRow);

            annotations.each { annotation ->
                String[] row = [ annotation.annotationTask.processName,
                        annotation.annotation.userId,
                        annotation.clinicalElementConfigurationName,
                        annotation.annotationTask.taskId,
                        annotation.annotationTask.principalElementId,
                        annotation.getReadableAnnotationType(),
                        annotation.annotation.coveredText,
                        gov.va.vinci.chartreview.Utils.getAnnotationFeaturesAsString(annotation.annotation)];
                csvWriter.writeNext(row);
            }
            response.setHeader("Content-disposition", "attachment; filename=report.csv")
            render(contentType:'text/csv',text:writer.toString())
            return null;

        }
    }

    def patientsPerAnnotatorDetails() {
        if (!verifySelection()) {
            return;
        }

        List<PatientAnnotatorProcessTaskId> patientAnnotatorProcesses;
        List<String> processNames;
        (patientAnnotatorProcesses, processNames) =  reportService.patientByAnnotatorProcess(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE));
        [ patientAnnotatorProcesses: patientAnnotatorProcesses ];
    }


    def patientsReviewedByMoreThanOneAnnotator() {
        if (!verifySelection()) {
            return;
        }

        [ patientIdCountMap: reportService.patientsWithMultipleAnnotators(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE)) ];
    }

    def iaa() {
        if (!verifySelection()) {
            return;
        }

        def projectId = session.getAttribute(PROJECT_SESSION_VARIABLE).id;
        def processIds = session.getAttribute(PROCESS_SESSION_VARIABLE);
        def iaaResults = reportService.iaa(projectId, processIds);
        [
                iaaFleissKappa: iaaResults.iaaFleissKappa,
                classificationList: iaaResults.classificationList,
                patientIdList: iaaResults.patientIdList,
                patientIdToClassificationCountMapMap: iaaResults.patientIdToClassificationCountMapMap,
                piByPatientIdMap: iaaResults.piByPatientIdMap,
                totalByClassificationMap: iaaResults.totalByClassificationMap,
                pjByClassificationMap: iaaResults.pjByClassificationMap,
                primaryClinicalElementUserClassificationCount: iaaResults.primaryClinicalElementUserClassificationCount,
                concordance: iaaResults.concordance
        ]

    }

    def howManyAnnotationsByAnnotatorAndType() {
        if (!verifySelection()) {
            return;
        }

        def (annotations, schemaMap) = reportService.annotations(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE));

        annotations = annotations.sort{it.userId};

        List<UsernameAnnotationTypeCount> results = new ArrayList<UsernameAnnotationTypeCount>();

        annotations.each { annotation ->
            UsernameAnnotationTypeCount result = results.find{it.userId == annotation.userId && it.annotationType == annotation.annotationType};
            if (result) {
                result.count = result.count++;
            } else {
                results.add(new UsernameAnnotationTypeCount(userId: annotation.userId, annotationType: annotation.annotationType, count: 1));
            }

        }

        [ usernameAnnotationTypeCount: results, schemaMap: schemaMap ]
    }

    def howManyAnnotationsByType() {
        if (!verifySelection()) {
            return;
        }

        def (annotations, schemaMap) = reportService.annotations(session.getAttribute(PROJECT_SESSION_VARIABLE).id, session.getAttribute(PROCESS_SESSION_VARIABLE));

        annotations = annotations.sort{it.annotationType};

        Map<String, Integer> typeCountMap = new HashMap<String, Integer>();
        annotations.each { annotation ->
            if (typeCountMap.get(annotation.annotationType)) {
                typeCountMap.put(annotation.annotationType, typeCountMap.get(annotation.annotationType) + 1);
            } else {
                typeCountMap.put(annotation.annotationType, 1);

            }
        }

        [ typeCountMap: typeCountMap, schemaMap: schemaMap ]
    }

    def showClinicalElement() {
        if (!verifySelection()) {
            return;
        }

        String id = params.id;
        Project  project = session.getAttribute(PROJECT_SESSION_VARIABLE);

        String reportText=  clinicalElementService.getElementContent("projectId=${project.id};${id}", false);
        [ reportText: reportText]
    }


    protected boolean verifySelection() {
        if (!session.getAttribute(PROJECT_SESSION_VARIABLE) || !session.getAttribute(PROCESS_SESSION_VARIABLE)) {
            redirect(action: "chooseProjectAndProcess");
            return false;
        }
        return true;
    }
}