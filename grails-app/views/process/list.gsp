<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <g:set var="entityName" value="${message(code: 'process.label', default: 'Process Template')}" />
		<g:title><g:message code="default.list.label" args="[entityName]" /></g:title>
        <r:require modules="bootstrap"/>
	</head>
	<body>
		<div id="list-process" class="content scaffold-list" role="main">
			<legend><g:message code="default.list.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: processList]" />
			<table class="table table-bordered table-striped">
				<thead>
                    <tr>
                        <th style="width: 10px">${message(code: 'process.id.label')}</th>
                        <th style="width: 200px">${message(code: 'process.name.label')}</th>
                        <th>${message(code: 'process.description.label')}</th>
                        <th style="width: 75px; text-align: center">${message(code: 'process.version.label')}</th>
                        <th style="width: 300px">Diagram</th>
                        <th style="width: 30px; text-align: center">Delete</th>
					</tr>
				</thead>
				<tbody>
				<g:each in="${processList}" status="i" var="process">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                        <td>${fieldValue(bean: process, field: "id")}</td>
                        <td>${fieldValue(bean: process, field: "name")}</td>
                        <td>${fieldValue(bean: process, field: "description")}</td>
                        <td style="text-align: center">${fieldValue(bean: process, field: "version")}</td>
                        <td><g:link action="diagram" id="${process.getId()}" target="_blank"><img src="<g:createLink action="diagram" id="${process.getId()}" />" style="max-width: 300px"></g:link></td>
                        <td style="text-align: center; vertical-align: middle;"><g:link action="delete" id="${process.getDeploymentId()}" onclick="return confirm('Delete this process? Running instance and historic instances of this process are not affected. ');"><i class="icon-trash"></i></g:link></td>
					</tr>
				</g:each>
				</tbody>
			</table>

            <div id="uploadForm" style="border: 1px solid #DDDDDD; padding: 10px; margin-bottom: 10px">
                <g:uploadForm action="upload">
                    <fieldset>
                        <legend>Upload Process Template</legend>
                        <input type="file" name="myFile" title="Upload a process:"/>
                        <input type="submit" class="btn" value="Upload" />
                    </fieldset>
                </g:uploadForm>
            </div>

		</div>
	</body>
</html>
