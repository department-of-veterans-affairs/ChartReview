<%@ page import="gov.va.vinci.chartreview.Utils" contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard</title>
</head>
<body>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form action="create">
        <fieldset class="form">
            <legend>Step 1 - Name, Description, and Clinical Element Table</legend>
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 150px;">Name</th>
                    <td><input type="text" name="name"  style="width: 80%" value="${dto.name}"/></td>
                </tr>
                <tr>
                    <th>Description</th>
                    <td>
                        <textArea name="description" style="width: 80%; height: 300px;">${dto.description}</textArea>
                    </td>
                </tr>
                <tr>
                    <th>Active</th>
                    <td>
                        <input type="checkBox" name="active" ${dto.active ? "checked": ""}/>
                    </td>
                </tr>
                <tr>
                    <th style="width: 300px">
                        Clinical Element Table
                        <br/>
                        <span style="font-weight: normal; font-size: small">The name of the table in the project database from which to get the clinical elements.</span>
                    </th>
                    <td>
                        <g:select name="clinicalElementTableName" from="${tableNames}" value="${clinicalElementTableName}" noSelection="['':'-Choose a table-']"/>
                    </td>
                </tr>
            </table>
            <br/>
            <g:submitButton name="next"  value="Next" class="btn btn-primary" style="float: right" />
        </fieldset>
    </g:form>
</div>
</body>
</html>
