<%@ page import="gov.va.vinci.chartreview.model.Project" %>
<!DOCTYPE html>
<html>
	<head>
        <meta name="layout" content="main"/>
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'project.label', default: 'Project')}" />
		<g:title><g:message code="default.create.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>
        <div id="create-project" class="content scaffold-create" role="main">
			<legend><g:message code="default.create.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: projectInstance]" />
			<g:form action="save" >
				<fieldset class="form">
					<g:render template="form"/>
				</fieldset>

			</g:form>
		</div>
	</body>
</html>
