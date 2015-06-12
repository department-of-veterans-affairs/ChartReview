<%@ page import="com.google.gson.Gson" contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard</title>
</head>
<body>
    <div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
        <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
        <legend>Clinical Element Created</legend>
        <br/><br/>
        <pre>${new com.google.gson.Gson().toJson(dto)}</pre>
    </div>
</body>
</html>
