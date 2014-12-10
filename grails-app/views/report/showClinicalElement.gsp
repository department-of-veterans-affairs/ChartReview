<%@ page import="chartreview.ReportController" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: Clinical Element</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Clinical Element</legend>
    <g:render template="templates/backButton"/>
    <div style="width: 100%; height: 400px; overflow-y: scroll; border: 0.5px solid; background-color: #F0F0F0; padding: 10px ">
        ${reportText}
    </div>
</body>
</html>