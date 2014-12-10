<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'process.label', default: 'Process Template')}" />
		<g:title><g:message code="default.edit.label" args="[entityName]" /></g:title>
        <r:require modules="bootstrap"/>
	</head>
	<body>

		<div id="edit-process" class="content scaffold-edit" role="main">
			<legend><g:message code="default.edit.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: processInstance]" />
			<g:uploadForm method="post" >
				<g:hiddenField name="version" value="${processInstance?.version}" />
				<fieldset class="form">
					<g:render template="form"/>
				</fieldset>
				<fieldset class="buttons">
					<g:actionSubmit class="save btn btn-primary" action="update" value="${message(code: 'default.button.update.label', default: 'Update')}" />
					<g:actionSubmit class="delete btn" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" formnovalidate="" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:uploadForm>
		</div>
	</body>
</html>
