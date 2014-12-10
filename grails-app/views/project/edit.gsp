<%@ page import="gov.va.vinci.chartreview.model.Project" %>
<!DOCTYPE html>
<html>
	<head>
        <meta name="layout" content="main"/>
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'project.label', default: 'Project')}" />
		<g:title><g:message code="default.edit.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>
        <div id="edit-project" class="content scaffold-edit" role="main">
            <legend><g:message code="default.edit.label" args="[entityName]" />: ${projectInstance?.name}</legend>
            <g:render template="/templates/showErrors" model="[model: projectInstance]" />
			<g:form method="post" action="update" >
				<g:hiddenField name="id" value="${projectInstance?.id}" />
				<g:hiddenField name="version" value="${projectInstance?.version}" />
				<fieldset class="form">
					<g:render template="form" model="projectInstance: ${projectInstance}"/>
				</fieldset>
			    <br/><br/>
			</g:form>
		</div>
	</body>
</html>
