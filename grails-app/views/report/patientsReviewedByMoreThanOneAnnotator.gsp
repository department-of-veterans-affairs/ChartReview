<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: Patients Per Annotator</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
<script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    <legend>Report: Patients Reviewed by More Than One Annotator</legend>
    <g:render template="templates/backButton"/>
    <table id="dataTable" class="table table-striped table-bordered">
        <thead>
            <th>Patient Id</th>
            <th>Reviewed Count</th>
        </thead>
        <g:each in="${patientIdCountMap.keySet()}" var="item">
          <tr>
              <td>${item}</td>
              <td>${patientIdCountMap.get(item)}</td>
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