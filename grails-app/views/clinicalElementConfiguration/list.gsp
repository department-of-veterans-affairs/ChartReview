<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'clinicalElementConfiguration.label', default: 'ClinicalElementConfiguration')}" />
		<g:title><g:message code="default.list.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div style="float:right">Project: <strong>${project.name}</strong>&nbsp;&nbsp;&nbsp;<g:link action="chooseProject">Change</g:link></div>
		<div id="list-dataSetConfiguration" class="content scaffold-list" role="main">
            <br/><br/>
		   <g:render template="/templates/showErrors"  />
            <br/>
            <legend>Project Clinical Element Configurations</legend>
            <table class="table table-bordered table-striped" style="width: 100%">
                <thead>
                <tr>
                    <g:sortableColumn property="name" title="${message(code: 'clinicalElementConfiguration.name.label')}" params="${[projectId: projectId]}" style="width: 350px" />
                    <g:sortableColumn property="description" title="${message(code: 'clinicalElementConfiguration.description.label')}"  params="${[projectId: projectId]}"/>
                    <g:sortableColumn property="active" title="${message(code: 'clinicalElementConfiguration.active.label')}"  params="${[projectId: projectId]}" style="text-align: center;" />
                    <th style="text-align: center; width: 40px">Edit</th>
                    <th style="text-align: center; width: 40px">Delete</th>
                    <th style="text-align: center; width: 40px">Copy</th>
                    <th style="text-align: center; width: 40px">Export</th>
                </tr>
                </thead>
                <tbody>
                <g:each in="${projectClinicalElementConfigurations.sort{it.name}}" status="i" var="dataSetConfigurationInstance">
                    <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                        <td><g:link action="show" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId]}">${fieldValue(bean: dataSetConfigurationInstance, field: "name")}</g:link></td>
                        <td>${fieldValue(bean: dataSetConfigurationInstance, field: "description")}</td>
                        <td style="text-align: center;">${fieldValue(bean: dataSetConfigurationInstance, field: "active")}</td>
                        <td style="text-align: center"><g:link action="edit" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId]}" ><i class="icon-pencil"></g:link></i></td>
                        <td style="text-align: center"><g:link action="delete" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId]}" onclick="return confirm('Delete this clinical element configuration?');"><i class="icon-trash"></g:link></i></td>
                        <td style="text-align: center"><g:link action="createElementConfiguration" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId]}" ><i class="icon-share"></g:link></i></td>
                        <td style="text-align: center"><g:link action="export" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId]}" target="_blank"><i class="icon-arrow-down"></g:link></i></td>
                    </tr>
                </g:each>
                </tbody>
            </table>

            <legend>Clinical Element Configurations Available From Other Projects</legend>
			<table class="table table-bordered table-striped" style="width: 100%">
				<thead>
					<tr>
                        <th style="width: 20px" >&nbsp;&nbsp;</th>
                        <th style="width: 350px" >${message(code: 'clinicalElementConfiguration.name.label')}</th>
                        <th>${message(code: 'clinicalElementConfiguration.description.label')}</th>
                        <th style="text-align: center; width: 40px">Copy To Project</th>
                        <th style="text-align: center; width: 40px">Export</th>
                    </tr>
				</thead>
				<tbody>
				<g:each in="${otherProjectClinicalElementConfigurations.keySet()}" status="i" var="project">
                    <tr>
                        <td colspan="5" style="font-weight: bold">Project: ${project.name}</td>
                    </tr>
                    <g:each in="${otherProjectClinicalElementConfigurations.get(project).sort{it.name}}" var="dataSetConfigurationInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                        <td>&nbsp;&nbsp;</td>
                        <td>${fieldValue(bean: dataSetConfigurationInstance, field: "name")}</td>
                        <td>${fieldValue(bean: dataSetConfigurationInstance, field: "description")}</td>
                        <td style="text-align: center"><g:link action="createElementConfiguration" params="${[id: dataSetConfigurationInstance.id, projectId: params.projectId, copyFromProjectId: project.id]}" ><i class="icon-share"></g:link></i></td>
                        <td style="text-align: center"><g:link action="export" params="${[id: dataSetConfigurationInstance.id, projectId: project.id]}" target="_blank"><i class="icon-arrow-down"></g:link></i></td>
					</tr>
                    </g:each>
				</g:each>
				</tbody>
			</table>
            <div id="uploadForm" style="border: 1px solid #DDDDDD; padding: 10px; margin-bottom: 10px">
                <g:uploadForm action="upload">
                    <fieldset>
                        <legend>Upload New Clinical Element Configuration</legend>
                        <input type="hidden" name="projectId" value="${params.projectId}" />
                        <input type="file" name="myFile" title="Choose a schema file to upload"/>
                        <input type="submit" class="btn" title="Upload the chosen clinical element configuration and insert it in the list" value="Upload"/>
                        <br/>
                        <br/>
                        <i>File must be in JSON format.</i>
                    </fieldset>
                </g:uploadForm>
            </div>
            <div class="nav" role="navigation">
                <g:link class="create btn btn-primary" action="createElementConfiguration" params="${[projectId: params.projectId]}"><g:message code="default.new.label" args="[entityName]" /></g:link>
            </div>

		</div>
	</body>
</html>
