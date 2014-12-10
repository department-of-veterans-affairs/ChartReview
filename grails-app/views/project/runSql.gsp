
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
                <legend>Project: ${project.name}</legend>
			</fieldset>
			<g:if test="${flash.message}">
                <div class="alert" role="status">
                    <button type="button" class="close" data-dismiss="alert">&times;</button>
                    ${flash.message}
                </div>
			</g:if>

            <legend>SQL To Run <i class="icon-asterisk"></i></legend>
            <textarea id="sqlToRun" name="sqlToRun" style="width: 100%; height: 200px">SELECT SUSER_NAME()</textarea>
            * Select statements only. Updates, deletes, and DDL will fail. <br/><br/>
            <a href="#" onclick="runSQL(); return false;" class="btn btn-primary">Execute</a>
            <br/><br/>
            <div id="queryResults">
            </div>
		</div>
    <script>
        function runSQL() {
            var sql =  $('textarea#sqlToRun').val();
            ${ remoteFunction (action:"ajaxSql", update:"queryResults", params: '\'id=' + project.id + '&sql=\' + sql')};
        }
    </script>
	</body>
</html>
