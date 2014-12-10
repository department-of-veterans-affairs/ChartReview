<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Schema</g:title>
    <r:require modules="bootstrap"/>
    <g:set var="entityName" value="${message(code: 'schema.label', default: 'Schema')}" />
    <g:title><g:message code="default.list.label" args="[entityName]" /></g:title>
</head>
<body>
    <div id="list-schema" class="content scaffold-list" role="main">
        <fieldset>
            <legend><g:message code="default.list.label" args="[entityName]" /></legend>
        </fieldset>
        <g:if test="${flash.message}">
            <div class="alert" role="status">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                ${flash.message}
            </div>
        </g:if>
        <table class="table table-striped table-bordered">
            <thead>
            <tr>
                <g:sortableColumn property="name" title="${message(code: 'schema.name.label', default: 'Name')}" />
                <th style="width: 30px; text-align: center">Edit</th>
                <th style="width: 30px; text-align: center">Delete</th>
                <th style="width: 30px; text-align: center">Copy</th>
                <th style="width: 30px; text-align: center">Export</th>
            </tr>
            </thead>
            <tbody>
            <g:each in="${model}" status="i" var="schema">
                <tr class="${(i % 2) == 0 ? 'even' : 'odd'}">
                    <td><g:link action="startEdit" id="${schema.id}">${fieldValue(bean: schema, field: "name")}</g:link></td>
                    <td style="text-align: center"><g:link action="startEdit" id="${schema.id}"><i class="icon-pencil" title="Edit this schema"></i></g:link></td>
                    <td style="text-align: center"><g:link action="delete" id="${schema.id}" onclick="return confirm('Delete this schema?');"><i class="icon-trash" title="Delete this schema"></i></g:link></td>
                    <td style="text-align: center"><g:link action="copy" id="${schema.id}" ><i class="icon-share"></g:link></i></td>
                    <td style="text-align: center"><g:link action="export" id="${schema.id}" target="_blank"><i class="icon-arrow-down"></g:link></i></td>
                </tr>
            </g:each>
            </tbody>
        </table>
        <div class="pagination">
            <g:paginate total="${total}" />
        </div>

        <div id="uploadForm" style="border: 1px solid #DDDDDD; padding: 10px; margin-bottom: 10px">
            <g:uploadForm action="upload">
              <fieldset>
                <legend>Upload New Schema</legend>
                <input type="file" name="myFile" title="Choose a schema file to upload"/>
                <input type="submit" class="btn" title="Upload the chosen schema and insert it in the list"/>
            </fieldset>
            </g:uploadForm>
        </div>

        <div class="nav text-right" role="navigation">
            <g:link class="create btn btn-primary" action="create" title="Create a schema and start editing it">Create Schema</g:link>
        </div>

    </div>
</body>
</html>