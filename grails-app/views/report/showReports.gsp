<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Report: Patients Per Annotator</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Reports</legend>
    <ul>
        <li><g:link action="annotationsByAnnotatorDetail">Annotations By Annotator Detail</g:link></li>
        <li><g:link action="howManyAnnotationsByType">How Many Annotations By Type</g:link></li>
        <li><g:link action="howManyAnnotationsByAnnotatorAndType">How Many Annotations By Annotator And Type</g:link></li>
        <li><g:link action="patientsPerAnnotator">Patients Per Annotator and Process</g:link></li>
        <li><g:link action="patientsPerAnnotatorDetails">Patients Per Annotator and Process DETAIL</g:link></li>
        <li><g:link action="patientsReviewedByMoreThanOneAnnotator">Patients Reviewed More Than Once</g:link></li>
        <li><g:link action="iaa">Inter-Annotator Agreement</g:link></li>
    </ul>
</body>
</html>