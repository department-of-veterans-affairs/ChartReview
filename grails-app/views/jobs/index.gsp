<%@ page import="gov.va.vinci.chartreview.model.Project" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <r:require modules="bootstrap"/>
    <g:set var="entityName" value="${message(code: 'project.label', default: 'Project')}" />
    <g:title><g:message code="default.list.label" args="[entityName]" /></g:title>
</head>
<body>
    <legend>Failed Jobs</legend>
    <g:each in="${failedJobs}" var="failedJob">
        ${failedJob}<br/><br/>
    </g:each>
</body>
</html>