<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard</title>
</head>
<body>
<style>
table {
    table-layout:fixed;
}

.div-table-content {
    height:300px;
    overflow-y:auto;
}
</style>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form action="create">
        <fieldset class="form">
            <legend>Step 4 - Preview Query Output</legend>
            <g:if test="${dto.elementType == 'LIST'}">
                <div class="panel panel-default">
                    <table class="table table-condensed" >
                        <thead>
                        <tr>
                            <g:each in="${dto.dataQueryColumns.findAll{it.exclude == false }}" var="item">
                                <td>${item.displayName}</td>
                            </g:each>
                        </tr>
                        </thead>
                    </table>
                </div>
                <div class="div-table-content">
                    <table class="table table-condensed table-striped">
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
            </g:if>
            <g:if test="${exampleContentTemplate}">
                <div style=" border: 1px solid; padding: 5px; border-color: #d3d3d3; margin-top: 20px">
                    ${raw(exampleContentTemplate)}
                </div>
            </g:if>
            <br/>
            <br/>
            <g:submitButton name="prev" value="Previous" class="btn btn-primary" />
            <g:submitButton name="finish" value="Finish" class="btn btn-primary" style="float:right;" />
        </fieldset>
    </g:form>
</div>
</body>
</html>
