<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'process.label', default: 'Process Template')}" />
        <g:title><g:message code="default.show.label" args="[entityName]" /></g:title>
        <r:require modules="bootstrap"/>
	</head>
	<body>
		<div id="show-process" class="content scaffold-show" role="main">
			<legend><g:message code="default.show.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: processInstance]" />
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 100px">
                        <span id="name-label" class="property-label"><g:message code="process.name.label" default="Name" /></span>
                    </th>
                    <td>
                        <span class="property-value" aria-labelledby="name-label"><g:fieldValue bean="${processInstance}" field="name"/></span>
                    </td>
                </tr>
                <tr>
                    <th>
                        <span id="description-label" class="property-label"><g:message code="process.description.label" default="Description" /></span>
                    </th>
                    <td>
                        <span class="property-value" aria-labelledby="description-label"><g:fieldValue bean="${processInstance}" field="description"/></span>
                    </td>
                </tr>
                <tr>
                    <th>
                        <span id="active-label" class="property-label"><g:message code="process.active.label" default="Active" /></span>
                    </th>
                    <td>
                        <span class="property-value" aria-labelledby="active-label"><g:formatBoolean boolean="${processInstance?.active}" /></span>
                    </td>
                </tr>
                <tr>
                    <th>
                        <span id="bpmXml-label" class="property-label"><g:message code="process.bpmXml.label" default="Bpm Xml" /></span>
                    </th>
                    <td>
                        <textarea style="width: 95%; height: 400px" readonly="true"><g:fieldValue bean="${processInstance}" field="bpmXml"/></textarea>
                    </td>
                </tr>
            </table>

			<g:form>
				<fieldset class="buttons">
					<g:hiddenField name="id" value="${processInstance?.id}" />
					<g:link class="edit btn btn-primary" action="edit" id="${processInstance?.id}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete btn" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
