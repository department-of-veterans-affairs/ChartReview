<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard</title>
</head>
<body>
<style scoped>
table {
    table-layout:fixed;
}
</style>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main" style="min-height: 500px;">
    <g:render template="/templates/showErrors" model="[model: '${dataSetConfigurationInstance}']" />
    <g:form action="create">
        <fieldset class="form">
            <legend>Step 4 - Preview Query Output</legend>
            <g:if test="${dto.elementType?.toUpperCase() == 'LIST'}">
                <h3>List View</h3>
                <div class="panel panel-default">
                    <table class="table table-condensed" id="previewListTable" >
                        <colgroup>
                            <g:each in="${dto.dataQueryColumns.findAll{it.exclude == false }}" var="item">
                                <col width="0*" /> %{-- -min-width equivalent--}%
                            </g:each>
                        </colgroup>
                        <thead>
                        <tr>
                            <g:each in="${dto.dataQueryColumns.findAll{it.exclude == false }}" var="item">
                                <td>${item.displayName}</td>
                            </g:each>
                        </tr>
                        </thead>
                        <tbody>
                        <g:each in="${exampleResults}" var="result">
                            <tr>
                                <g:each in="${dto.dataQueryColumns.findAll{it.exclude == false }}" var="item" status="i">
                                    <td>${result.get(item.columnName)}</td>
                                </g:each>
                            </tr>
                        </g:each>
                        </tbody>
                    </table>
                </div>
                <g:if test="${!exampleResults}">
                    <h4 style="font-weight: bold;">No data found for preview.</h4>
                </g:if>
                <br/><br/>
            </g:if>
            <h3>Summary View</h3>
            <g:if test="${exampleContentTemplate}">
                <div style=" border: 1px solid; padding: 5px; border-color: #d3d3d3; margin-top: 20px">
                    ${raw(exampleContentTemplate)}
                </div>
            </g:if>
            <g:else>
                <h4 style="font-weight: bold;">No data found, or content template is blank!</h4>
            </g:else>
            <br/>
            <br/>
            <button name="_eventId_prev" class="btn btn-primary" style="float:left;" id="_eventId_prev" type="submit"><i class="glyphicon glyphicon-chevron-left"></i> Back</button>
            <g:submitButton name="finish" value="Finish" class="btn btn-primary" style="float:right;" />
        </fieldset>
    </g:form>
</div>
</body>
</html>
