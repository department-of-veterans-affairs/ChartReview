<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title></title>
    <r:require module="jquery-ui"/>
    <r:require modules="bootstrap"/>
    <r:layoutResources />
    <style>
    .tab-pane { min-height: 475px;
        margin-left: 20px;
        margin-right: 20px;
    }
    </style>
</head>

<body >
<r:layoutResources />
<div style="margin: 10px; min-width: 500px">
        <legend>Add Workflow Step</legend>
        <g:form controller="project" action="doAddWorkflow">

        <ul class="nav nav-tabs" id="myTab">
            <li class="active"><a href="#configuration">Workflow Configuration</a></li>
            <li><a href="#sourceData">Source Data</a></li>
            <li><a href="#sourceAnnotations">Source Annotations</a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active" id="configuration">
                <table class="table table-bordered table-striped" id="workflowTable">
                    <tr>
                        <th style="width: 150px">Step</th><td><input type="text" id="spinner" size="2" maxlength="2" style="width: 50px;"/></td>
                    </tr>
                    <tr>
                            <th>Workflow</th>
                            <td>
                                <select name="process">
                        <g:each in="${workflows}" var="process">
                            <option value="${process.id}">${process.name}</option>
                        </g:each>
                    </select></td>
                    </tr>
                    <tr>
                        <th>Users</th>
                        <td>
                            <table id="users" class="table table-bordered table-striped">
                                <tbody>

                                </tbody>
                            </table>
                            <br/>
                            <div style="vertical-align: middle" >Find User: <input type="text" id="findUsername" style="vertical-align: middle"/>
                                <br/><a href="#" class="btn btn-primary" id="addUserButton">Add User To Workflow</a></div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="tab-pane" id="sourceData">
                   Not Implemented
            </div>
            <div class="tab-pane" id="sourceAnnotations">
                Include existing annotations? <input type="checkbox">
                <br/>
                <br/>
                <table class="table table-bordered table-striped" id="workflowTable">
                    <tr>
                        <th style="width: 300px">Annotation Schema<br/>(e.g. validation or empty)</th><td><input type="text" size="20" maxlength="20" style="width: 150px;"/></td>
                    </tr>
                    <tr>
                        <th>SIMAN Table Suffix<br/>(e.g. _20131001 or empty)</th><td><input type="text" size="20" maxlength="20" style="width: 150px;"/></td>
                    </tr>
                    <tr>
                        <th>SIMAN Qualifier<br/>(e.g. MyRun or empty)</th><td><input type="text" size="20" maxlength="20" style="width: 150px;"/></td>
                    </tr>

                </table>
            </div>
        </div>
        <br/>
        <p style="text-align: right">
            <input type="submit" class="btn btn-primary" id="addWorkflowButton" value="Add Workflow" />
        </p>
        <br/><br/>
        </g:form>
        <script>
        $(document).ready(function() {
            $('#findUsername').autocomplete({
                source: '<g:createLink controller="user" action="ajaxFindUsers"/>'
            });
        });

        $(function() {
            $('#spinner').spinner({
                min: 1,
                max: 20,
                step: 1
            });
        });

        $(document).ready(function(){
            $("#addUserButton").click(function(){
                $("#processUsers tbody").append('<tr><td style="vertical-align: middle"><input type="hidden" value="' + $('#findUsername').val() + '" name="username"/>' + $('#findUsername').val() + '</td><td style="text-align: center; width: 70px" class="delete"><i class="icon-trash"></i>Remove&nbsp;&nbsp;</td></tr>');
            });
        });
        //$(document).on('click', 'td.delete', del);

        $('#myTab a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        })
        </script>
</div>
</body>
</html>