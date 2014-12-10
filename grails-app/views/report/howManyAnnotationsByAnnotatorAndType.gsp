<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: How Many Annotations By Annotator And Type</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Report: How Many Annotations By Annotator And Type</legend>
    <g:render template="templates/backButton"/>
    <table id="dataTable" class="table table-striped table-bordered">
        <thead>
            <th>Annotator</th>
            <th>Type</th>
            <th>Count</th>
        </thead>
        <g:each in="${usernameAnnotationTypeCount}" var="item">
          <tr>
              <td>
                  ${item.userId}
              </td>
              <td>
                  ${gov.va.vinci.chartreview.Utils.getReadableAnnotationType(item.annotationType, schemaMap.get(item.annotationType.substring(item.annotationType.indexOf(":") + 1, item.annotationType.indexOf(";"))))}</td>
              <td>${item.count}</td>
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