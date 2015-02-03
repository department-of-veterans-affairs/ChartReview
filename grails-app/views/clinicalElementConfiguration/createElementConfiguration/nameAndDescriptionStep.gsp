<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <g:title>Clinical Element Configuration Wizard</g:title>
</head>
<body>

<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form >
        <fieldset class="form">
            <legend>Step 1 - Name and Description</legend>
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 150px;">Name</th>
                    <td><g:textField name="name" value="${dto.name}" style="width: 80%"/></td>
                </tr>
                <tr>
                    <th>Description</th>
                    <td>
                        <g:textArea name="description" style="width: 80%; height: 300px;">${dto.description}</g:textArea>
                    </td>
                </tr>
                <tr>
                    <th>Active</th>
                    <td>
                        <g:checkBox name="active" checked="${dto.active}" />
                    </td>
                </tr>
            </table>
            <br/>
            <div>
            <g:submitButton name="next" value="Next" class="btn btn-primary" style="float: right"/>
            </div>

        </fieldset>
    </g:form>
</div>
</body>
</html>
