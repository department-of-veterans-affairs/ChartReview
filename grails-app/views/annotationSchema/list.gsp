<%@ page import="chartreview.AnnotationSchemaController" %>
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
    <div style="float:right">Project: <strong>${session.getAttribute("projectName")}</strong>&nbsp;&nbsp;&nbsp;<g:link action="chooseProject">Change</g:link></div>
<br/><br/>
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
                    <td><g:link action="view" id="${schema.id}">${fieldValue(bean: schema, field: "name")}</g:link></td>
                    <td style="text-align: center"><g:link action="edit" params="[id: schema.id, projectId: session.getAttribute(chartreview.AnnotationSchemaController.SELECTED_PROJECT)]"><i class="icon-pencil" title="Edit this schema"></i></g:link></td>
                    <td style="text-align: center"><g:link action="delete" params="[id: schema.id, projectId: session.getAttribute(chartreview.AnnotationSchemaController.SELECTED_PROJECT)]" onclick="return confirm('Delete this schema?');"><i class="icon-trash" title="Delete this schema"></i></g:link></td>
                    <td style="text-align: center"><span  onclick='doModal("${schema.id}")'><i class="icon-share"></i></span></td>
                    <td style="text-align: center"><g:link action="export" params="[id: schema.id, projectId: session.getAttribute(chartreview.AnnotationSchemaController.SELECTED_PROJECT)]"  target="_blank"><i class="icon-arrow-down"></g:link></i></td>
                </tr>
            </g:each>
            </tbody>
        </table>
        <div class="pagination">
            <g:paginate total="${total}" />
        </div>

        <div class="nav text-right" role="navigation">
            <g:link class="create btn btn-primary" action="create" title="Create a schema and start editing it">Create Schema</g:link>
        </div>

        <div id="uploadForm" style="border: 1px solid #DDDDDD; padding: 10px; margin-bottom: 10px">
            <g:uploadForm action="upload">
              <fieldset>
                <legend>Upload New Schema</legend>
                <input type="file" name="myFile" title="Choose a schema file to upload"/>
                  <div class="checkbox" style="margin-top: 10px">
                      <label>
                          <input type="checkbox" value="true" checked name="changeUUIDS" > Change UUIDs
                      </label>
                  </div>
                  <div class="checkbox" style="margin-top: 10px">
                      <label>
                          <input type="checkbox" value="false" name="changeName" id="changeNameCheckBox" >  Change Name
                      </label>
                       <input type="text" id="newNameInput" name="newName"  disabled/>
                  </div>
                  <input type="submit" class="btn" title="Upload the chosen schema and insert it in the list" value="Upload"/>
            </fieldset>
            </g:uploadForm>
        </div>




        <!-- Modal -->
        <div class="modal hide fade" id="myModal">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h3>Schema Name</h3>
            </div>
            <div class="modal-body">
                <p>Enter new schema name: <input type="text" name="newName" id="newName" />
                   <input type="hidden" name="copyId" id="copyId"/></p>
            </div>
            <div class="modal-footer">
                <a href="#" class="btn" onclick="$('#myModal').modal('hide');">Close</a>
                <a href="#" class="btn btn-primary" onclick="submitCopy()">Copy</a>
            </div>
        </div>
    </div>

<script>

    $('#changeNameCheckBox').click(function(){
        $('#newNameInput').attr('disabled',!this.checked)
    });

    $('#myModal').on('shown', function (e) {
        e.preventDefault();
        $('#newName').focus();
    });

    function submitCopy() {
         window.location ='<g:createLink action="copy"></g:createLink>?id=' + $('#copyId').val() + "&projectId=${session.getAttribute(chartreview.AnnotationSchemaController.SELECTED_PROJECT)}&newName=" + encodeURIComponent($('#newName').val());
    }

    function doModal(schemaId) {
        $('#myModal').modal('show');
        $('#copyId').val(schemaId);
    }
</script>
</body>
</html>