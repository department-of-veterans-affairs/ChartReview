<%@ page import="gov.va.vinci.chartreview.Utils; chartreview.ReportController" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: Patients Per Annotator Detail</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Report: Annotations Per Annotator Detail</legend>
    <g:render template="templates/backButton"/>

    <div style="float: right; margin-bottom: 5px;"><g:link action="annotationsByAnnotatorDetail" params="${[format: "csv"]}"><img src="${request.contextPath}/images/file-types-csv-icon.png" style="border: none;">Export to CSV</g:link></div>
    <div style="clear: both;"></div>
    <table id="dataTable" class="table table-striped table-bordered">
        <thead>
            <tr>
                <th>Process</th>
                <th>Annotator</th>
                <th>Clinical Element</th>
                <th><div class="text-center">Task</div></th>
                <th><div class="text-center">Patient</div></th>
                <th>Annotation Type</th>
                <th><div class="text-center">Covered Text</div></th>
                <th><div class="text-center">Attributes</div></th>
            </tr>
        </thead>
        <g:each in="${annotations}" var="annotation">
          <tr>
              <td>${annotation.annotationTask.processName}</td>
              <td>${annotation.annotation.userId}</td>
              <td><g:link action="showClinicalElement" id="${annotation.clinicalElementSerializedKeys}">${annotation.clinicalElementConfigurationName}</g:link></td>
              <td><div class="text-center"><a href="${request.contextPath}/chart-review?projectId=${session.getAttribute(chartreview.ReportController.PROJECT_SESSION_VARIABLE).id}&processId=&taskId=${annotation.annotationTask.taskId}&taskType=COMPLETED&readOnly=true">${annotation.annotationTask.taskId}</a></div></td>
              <td><div class="text-center">${annotation.annotationTask.principalElementId}</div></td>
              <td>${annotation.getReadableAnnotationType()}</td>
              <td><div class="text-center">${annotation.annotation.coveredText}</div></td>
              <td><div class="text-center">${gov.va.vinci.chartreview.Utils.getAnnotationFeaturesAsString(annotation.annotation)}</div></td>
          </tr>
        </g:each>
    </table>
<script>
    $(document).ready(function() {
        $('#dataTable').dataTable({
                "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
        });
    } );
</script>
</body>
</html>