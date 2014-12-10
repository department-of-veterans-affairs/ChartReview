<%@ page import="gov.va.vinci.chartreview.model.User" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">  ]
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'user.label', default: 'User')}" />
		<g:title><g:message code="default.edit.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>
        <div id="edit-user" class="content scaffold-edit" role="main">
			<legend><g:message code="default.edit.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: userInstance]" />
			<g:form method="post" >
				<g:hiddenField name="id" value="${userInstance?.id}" />
				<g:hiddenField name="version" value="${userInstance?.version}" />
				<fieldset class="form">
					<g:render template="form"/>
				</fieldset>
				<fieldset class="buttons">
					<g:actionSubmit class="save btn btn-primary" action="update" value="${message(code: 'default.button.update.label', default: 'Update')}" />
					<g:actionSubmit class="delete btn" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" formnovalidate="" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
