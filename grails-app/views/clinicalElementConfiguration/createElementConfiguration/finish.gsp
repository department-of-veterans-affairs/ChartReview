<%@ page import="com.google.gson.Gson; grails.plugin.gson.converters.GSON;" %>
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
        <legend>Clinical Element Created</legend>
        <br/><br/>
        <pre>${new Gson().toJson(dto)}</pre>
    </div>
</body>
</html>
