<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: How Many Annotations By Type</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
    <script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Report: How Many Annotations By Type</legend>
    <g:render template="templates/backButton"/>
    <table id="dataTable" class="table table-striped table-bordered">
        <thead>
            <th>Type</th>
            <th>Count</th>
        </thead>
        <g:each in="${typeCountMap.keySet()}" var="item">
          <tr>
              <td>
                  ${gov.va.vinci.chartreview.Utils.getReadableAnnotationType(item, schemaMap.get(item.substring(item.indexOf(":") + 1, item.indexOf(";"))))}</td>
              <td>${typeCountMap.get(item)}</td>
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