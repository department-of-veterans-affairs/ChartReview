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
			<legend>Choose Project and Processes For Reports</legend>
            <g:render template="/templates/showErrors"  />
            Project<br/>
            <g:form method="get" action="showReports">
                <g:select onchange="${remoteFunction(action: 'loadProjectProcesses',
                        onSuccess: 'updateProcesses(data)',
                        params: '\'projectId=\' + escape(this.value)')}"
                          name="projectId"
                          from="${projects.sort{it.name}}"
                          noSelection="${['-1':'Select...']}"
                          optionKey="id"
                          optionValue="name"
                          class="form-control" />

                <br/>
                Processes<br/>
                    <select name="processes" id="processesId" multiple="true" style="width: 400px; height: 400px">
                    </select>

                    <br/>
                <g:submitButton name="select" value="Select" class="btn btn-primary"></g:submitButton>
            </g:form>
		</div>
        <script>
            function updateProcesses(data) {
                $('#processesId').empty();

                $.each(data, function( index, value ) {
                    $('#processesId').append('<option value="' + value + '">' + value + '</option>')
                });

            }
        </script>
	</body>
</html>
