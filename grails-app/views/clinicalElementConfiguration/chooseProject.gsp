<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'clinicalElementConfiguration.label', default: 'ClinicalElementConfiguration')}" />
		<g:title><g:message code="default.list.label" args="[entityName]" /></g:title>
	</head>
	<body>
		<div id="list-dataSetConfiguration" class="content scaffold-list" role="main">
			<legend>Project</legend>
            <g:render template="/templates/showErrors"  />
            Choose the project to view and change clinical element configurations for<br/><br/>
            <g:form method="get" action="list">
                <g:select name="projectId" from="${projects}" optionKey="id" optionValue="name" />
                <br/>
                <g:submitButton name="select" value="Select" class="btn btn-primary"></g:submitButton>
            </g:form>
		</div>
	</body>
</html>
