<%@ page import="gov.va.vinci.chartreview.model.Project" %>
<!DOCTYPE html>
<html>
	<head>
        <meta name="layout" content="main"/>
		<g:set var="entityName" value="${message(code: 'project.label', default: 'Project')}" />
		<g:title>Show <g:fieldValue bean="${projectInstance}" field="name"/></g:title>
        <r:require modules="bootstrap"/>
	</head>
	<body>
    <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>

    <legend>Project: <g:fieldValue bean="${projectInstance}" field="name"/></legend>
    <style>
        .tab-pane {
            min-height: 400px;
        }
        .modal {
            max-height: 800px;
            min-width: 700px;
        }
    </style>

    %{--<g:form>--}%


    <div class="btn-group" style="float: right; " >
        <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
            <i class="icon-cog"></i> Actions
            <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right" >
                <li><g:link action="edit" id="${projectInstance?.id}"><g:message code="default.button.edit.label" default="Edit" /></g:link></li>
                <li><g:link action="runSql" id="${projectInstance?.id}">Run SQL Query</g:link></li>
                <g:if test="${isValid}">
                    <li><g:link action="dropSiman" id="${projectInstance.id}" onclick="return confirm('Are you sure you want to drop the Siman tables from this project? All existing annotations will be deleted.')">Drop Siman Tables</g:link></li>
                </g:if>
                <g:elseif test="${isValid == false}">
                    <li><g:link action="createSiman" id="${projectInstance.id}">Create Siman Tables</g:link></li>
                </g:elseif>
                <li><g:link action="upgradeAnnotationText" id="${projectInstance?.id}" onclick="return confirm('Updating annotation covered text may take awhile. Are you sure?')">Update Annotation Text</g:link></li>
                <li>
                    <g:link action="delete" id="${projectInstance.id}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');">
                        Delete Project
                    </g:link>
                </li>
        </ul>
    </div>

        <ul class="nav nav-tabs" id="myTab">
            <li class="active"><a href="#configuration">General Configuration</a></li>
            <li><a href="#projectDocuments">Documents</a></li>
            <li><a href="#users">Project Users</a></li>
            <li><a href="#processes">Processes</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active" id="configuration" style="margin-left: 20px; margin-right: 20px">
                <div id="show-project" class="content scaffold-show" role="main">
                    <g:if test="${flash.message}">
                    <div class="alert" role="status">
                        <button type="button" class="close" data-dismiss="alert">&times;</button>
                        ${flash.message}
                    </div>
                    </g:if>
                    <table class="table table-striped table-bordered">
                        <tr>
                            <th style="width: 200px;">
                                <span id="name-label" class="property-label"><g:message code="project.name.label"  /></span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="name-label"><g:fieldValue bean="${projectInstance}" field="name"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <span id="description-label" class="property-label"><g:message code="project.description.label" /></span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="description-label"><g:fieldValue bean="${projectInstance}" field="description"/></span>
                            </td>
                        </tr>
                        <tr>
                             <th>
                                 <span id="databaseConnectionURL-label" class="property-label"><g:message code="project.databaseConnectionUrl.label" /></span>
                             </th>
                             <td>
                                 <span class="property-value" aria-labelledby="databaseConnectionUrl-label"><g:fieldValue bean="${projectInstance}" field="databaseConnectionUrl"/></span>
                             </td>
                        </tr>
                        <tr>
                            <th>
                                <span id="jdbcDriver-label" class="property-label"><g:message code="project.jdbcDriver.label"/></span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="jdbcDriver-label"><g:fieldValue bean="${projectInstance}" field="jdbcDriver"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th>
                                <span id="jdbcUsername-label" class="property-label"><g:message code="project.jdbcUsername.label" /></span>
                            </th>
                            <td>
                                <span class="property-value" aria-labelledby="jdbcUsername-label"><g:fieldValue bean="${projectInstance}" field="jdbcUsername"/></span>
                            </td>
                        </tr>
                        <tr>
                            <th><span id="jdbcPassword-label" class="property-label"><g:message code="project.jdbcPassword.label" /></span></th>
                            <td><span class="property-value" aria-labelledby="jdbcPassword-label">**********</span></td>
                        </tr>
                    </table>
                    <g:if test="${isValid}">
                        <div class="alert alert-success">
                            <h4>Siman Tables Exist</h4>
                            <br/>
                            Siman database tables exist in project database.
                            <br/><br/>
                        </div>
                    </g:if>
                    <g:elseif test="${isValid == false}">
                        <div class="alert alert-block">
                            <h4>Warning!</h4>
                            <br/>
                            Siman Database tables do not currently exist in the project database.
                            <br/><br/>
                        </div>
                    </g:elseif>
                    <g:else>
                        <div class="alert alert-block">
                            <h4>Warning!</h4>
                            <br/>
                            Could not connect to database to insure Siman tables currently exist.
                            <br/><br/>
                        </div>
                    </g:else>
                </div>
            </div>
            <div class="tab-pane" id="projectDocuments" style="margin-left: 20px; margin-right: 20px">
                <h4>Project Documents</h4>
                <g:render template="templates/projectDocuments" model="['projectDocuments':projectDocuments]" />
                <br/>


                <div id="uploadDocumentDiv" class="hero-unit" style="padding: 15px">
                <legend>Upload Document</legend>
                <g:uploadForm action="uploadDocument" >
                    <input type="hidden" name="projectId" value="${projectInstance.id}" />
                    <table class="table table-condensed table-bordered table-striped" style="vertical-align: middle">
                        <tr>
                            <th style="vertical-align: middle">Name:</th><td style="vertical-align: middle"><input type="text" name="name"></td>
                        </tr>
                        <tr>
                            <th style="vertical-align: middle">Description:</th><td style="vertical-align: middle">
                                <input type="text" name="description" style="width: 90%"></td>
                        </tr>
                        <tr>
                            <th style="vertical-align: middle">Document:</th>
                            <td style="vertical-align: middle"><input type="file" name="fileUpload" style="padding-bottom: 5px;"/></td>
                        </tr>
                    </table>
                    <input type="submit" value="Upload" class="btn" />
                </g:uploadForm>
                </div>


            </div>
            <div class="tab-pane" id="processes" style="margin-left: 20px; margin-right: 20px; width: 80%">
                 <h4>Process Associated With This Project
                     <span style="margin-left: 10px; vertical-align: middle">
                         <g:remoteLink action="updateProcessDetailsTable" id="${projectInstance.id}" update="processTable">
                            <i class="icon-refresh"></i>
                         </g:remoteLink>
                    </span></h4>
                    <div id="loader" style="display: none; width: 100%; margin: 10px; padding: 10px" class="label label-success">
                        Processes associated with this project refreshed.
                    </div>
                    <g:render template="templates/processesTable" model="${[processes: processes]}" />

                <!-- Button to trigger modal -->
                <a role="button" class="btn btn-primary" style="float:right;" data-toggle="modal" data-target="#myModal" id="addProcessButton" onclick="window.location='${request.contextPath}/process/addToProject?id=${projectInstance.id}'" >Add Process</a>
                <br/><br/>

            </div>
            <div class="tab-pane" id="users" style="margin-left: 20px; margin-right: 20px">
                <h4>Project Users</h4>
                <table class="table table-striped table-bordered" id="administrators">
                    <thead>
                    <tr>
                        <th>
                            Username
                        </th>
                        <th style="width: 200px">Role</th>
                    </tr>
                    </thead>
                    <tbody>
                    <g:each in="${projectInstance.authorities.sort{it.user.username}}" var="authority">
                        <tr><td><input type="hidden" value="${authority.user.username}" name="username"/>${authority.user.username}</td>
                            <td>
                                ${authority.role.name}
                            </td>
                    </g:each>
                    </tbody>
                </table>

            </div>
        </div>
        %{--<g:hiddenField name="id" value="${projectInstance?.id}" />--}%
    %{--</g:form>--}%
    <script>
            $('#myTab a').click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            <g:if test="${selectedTab}">
                $('#myTab a[href="#${selectedTab}"]').tab('show');
            </g:if>

            $.ajaxSetup({
                beforeSend: function() {
                    $('#loader').hide();
                },
                complete: function(){
                    $('#loader').show();
                    $("#loader").delay(2000).fadeOut("slow");
                },
                success: function() {}
            });
        </script>
    </body>
</html>
