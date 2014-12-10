
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
		<div id="list-project" class="content scaffold-list" role="main">
			<fieldset>
                <legend><g:message code="default.list.label" args="[entityName]" /></legend>
			</fieldset>
			<g:if test="${flash.message}">
                <div class="alert" role="status">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    ${flash.message}
                </div>
			</g:if>
            <table class="table table-striped table-bordered">
				<thead>
					<tr>
				        <g:sortableColumn property="name" title="${message(code: 'project.name.label', default: 'Name')}" style="width: 200px"/>
                        <th>Description</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
                        <th style="width: 30px; text-align: center">&nbsp;&nbsp;</th>
					</tr>
				</thead>
				<tbody>
				<g:each in="${projectInstanceList}" status="i" var="projectInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                        <td><g:link action="show" id="${projectInstance.id}">${fieldValue(bean: projectInstance, field: "name")}</g:link></td>
                        <td>${fieldValue(bean: projectInstance, field: "description")}</td>
                        <td style="text-align: center"><g:link action="show" id="${projectInstance.id}" ><i class="icon-eye-open"></i></g:link></td>
                        <td style="text-align: center"><g:link action="edit" id="${projectInstance.id}"><i class="icon-pencil"></i></g:link></td>
                        <td style="text-align: center"><g:link action="delete" id="${projectInstance.id}" onclick="return confirm('Delete this project?');"><i class="icon-trash"></i></g:link></td>
					</tr>
				</g:each>
				</tbody>
			</table>
            <div class="pagination">
                <g:paginate total="${projectInstanceTotal}" />
            </div>

            <div class="nav text-right" role="navigation">
                <g:link class="create btn btn-primary" action="create">Create Project</g:link>
            </div>
		</div>
	</body>
</html>
