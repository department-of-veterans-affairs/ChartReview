<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="Clinical Element Configuration" />
		<g:title><g:message code="default.show.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div class="breadcrumbMenu"><g:link action="list" params="${[projectId: params.projectId]}">&lt; ${entityName} List</g:link></div>
        <div id="show-dataSetConfiguration" class="content scaffold-show" role="main">
			<legend><g:message code="default.show.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors"  />

            <ul class="nav nav-tabs" id="myTab">
                <li class="active"><a href="#configuration">General Configuration</a></li>
                <li><a href="#columns">Columns</a></li>
                <li><a href="#contentTemplate">Content Template</a></li>
            </ul>
            <div class="tab-content" style="min-height: 350px">
                <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
                    <table class="table table-bordered table-striped">
                        <tr>
                            <th style="width: 200px">
                                <span id="name-label" class="property-label">Name</span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="name-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="name"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th><span id="description-label" class="property-label">Description</span></th>
                            <td><span class="property-value" aria-labelledby="description-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="description"/></span></td>
                        </tr>
                        <tr>
                            <th><span id="active-label" class="property-label">Active</span></th>
                            <td><span class="property-value" aria-labelledby="active-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="active"/></span></td>
                        </tr>
                        <tr>
                            <th><span id="titleField-label" class="property-label">Title Field</span></th>
                            <td><span class="property-value" aria-labelledby="titleField-label"><g:fieldValue bean="${elementConfigurationDTO}" field="titleField"/></span></td>
                        </tr>
                        <tr>
                            <th><span id="descriptionField-label" class="property-label">Description Field</span></th>
                            <td><span class="property-value" aria-labelledby="descriptionField-label"><g:fieldValue bean="${elementConfigurationDTO}" field="descriptionField"/></span></td>
                        </tr>
                        <tr>
                            <th><span id="isSummaryField-label" class="property-label">Type
                                <i class="icon-question-sign" rel="tooltip" title="The type of this clinical element. Summary is one record per primary clinical element (patient), list is multiple records per primary clinical element (patient)." id="elementToolTip"></i>
                            </span></th>
                            <td><span class="property-value" aria-labelledby="isSummaryField-label"><g:fieldValue bean="${elementConfigurationDTO}" field="elementType"/></span></td>
                        </tr>
                        <tr>
                            <th style="width: 200px">
                                <span id="sql-label" class="property-label">All Elements By Patient Id Query</span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="sql-label"><g:fieldValue bean="${elementConfigurationDTO}" field="query"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th style="width: 200px">
                                <span id="singleElementSql-label" class="property-label">Single Element Query</span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="singleElementSql-label"><g:fieldValue bean="${elementConfigurationDTO}" field="singleElementQuery"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th><span id="createdBy-label" class="property-label">Created By</span></th>
                            <td><span class="property-value" aria-labelledby="createdBy-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="createdBy"/></span></td>
                        </tr>
                        <tr>
                            <th><span id="createdDate-label" class="property-label">Created Date</span></th>
                            <td><span class="property-value" aria-labelledby="createdDate-label"><g:fieldValue bean="${dataSetConfigurationInstance}" field="createdDate"/></span></td>
                        </tr>
                    </table>
                </div>
                <div class="tab-pane" id="columns" style="margin-left: 20px; margin-right: 20px">
                    <legend>Columns</legend>
                    <g:render template="templates/elementTable" model="[model: elementConfigurationDTO]" />
                </div>
                <div class="tab-pane" id="contentTemplate" style="margin-left: 20px; margin-right: 20px">
                    <legend>Content Template</legend>
                    <div style="background-color: white">
                        ${elementConfigurationDTO.contentTemplate}
                    </div>
                </div>
            </div>

            <g:form action="edit">
				<fieldset class="buttons">
                    <g:hiddenField name="id" value="${dataSetConfigurationInstance?.id}" />
                    <g:hiddenField name="projectId" value="${projectId}" />
					<g:actionSubmit class="save btn btn-primary" action="edit" value="${message(code: 'default.button.edit.label', default: 'Edit')}" />
				</fieldset>
			</g:form>
		</div>
    <script>
        $(document).ready(function(){
            $("[rel=tooltip]").tooltip({ placement: 'right'});
        });

        $('#myTab a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });
        </script>
	</body>
</html>
