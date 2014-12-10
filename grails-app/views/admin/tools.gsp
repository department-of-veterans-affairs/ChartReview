<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="ClinicalElementConfiguration" />
		<g:title>Admin Tools</g:title>
	</head>
	<body>
		<div id="show-dataSetConfiguration" class="content scaffold-show" role="main">
			<legend>Admin Tools</legend>
            <g:render template="/templates/showErrors"  />
            <g:form action="deleteRunningProcessInstances" class="form-inline">
            <div class="controls-row">
                <div class="control-group span6">
                    <h4>Delete all running Activiti Process Instances.   <br/><br/>
                        <g:submitButton name="Do Delete!" class="btn btn-danger" style="margin-left: 40px"
                                    onclick="return confirm('Really DELETE all running instances? CANNOT BE UN-DONE!')">
                        </g:submitButton>
                    </h4>
                </div>
            </div>
            </g:form>
            <legend>Rest API</legend>
            <a href="${request.contextPath}/restApiDoc/?doc_url=${request.contextPath}/restApiDoc/api#">View Rest API Docs</a>
    </body>
</html>
