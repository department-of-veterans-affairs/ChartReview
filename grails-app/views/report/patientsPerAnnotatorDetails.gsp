<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: Patients Per Annotator and Process Detail</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
<script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Report: Patients Per Annotator and Process Detail</legend>
    <g:render template="templates/backButton"/>
    <table id="dataTable" class="table table-striped table-bordered">
        <thead>
            <th>Process</th>
            <th>Annotator</th>
            <th>Task Id</th>
            <th>Patient Id</th>
        </thead>
        <g:each in="${patientAnnotatorProcesses.sort{it.processName + " ~~ " + it.annotator}}" var="item">
          <tr>
              <td>${item.processName}</td>
              <td>${item.annotator}</td>
              <td>${item.taskId}</td>
              <td>${item.patientId}</td>
          </tr>
        </g:each>
    </table>
<script>
    $(document).ready(function() {
        $('#dataTable').dataTable();
    } );
</script>
</body>
</html>