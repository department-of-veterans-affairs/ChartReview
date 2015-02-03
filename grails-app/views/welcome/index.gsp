<%@ page import="chartreview.WelcomeController" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main"/>
		<g:title>Welcome to ChartReview</g:title>
        <r:require modules="bootstrap"/>
        <script type="text/javascript" src="${request.contextPath}/js/jquery.dataTables.min.js"></script>
        <script type="text/javascript" src="${request.contextPath}/js/dataTables.bootstrap.js"></script>
    </head>
	<body>

        <h1>Welcome to ChartReview</h1>
        <br/>
        <div class="hero-unit">
            <h2>Choose Project and Process</h2>
            <br/>
            <g:form>
            <div class="form-horizontal">
                <div class="control-group">

                    <div class="control-label">
                        Project
                    </div>
                    <div class="controls" style="vertical-align: middle">
                        <g:select id="projectId" name="projectId"
                              noSelection="${['-1':'Select...']}"
                              from="${projects.sort{it.name}}" optionKey="id" optionValue="name"
                              class="form-control" value="${projectId}"/>
                        <g:checkBox id="showCompletedProcesses" name="showCompletedProcesses" value = "${session.getAttribute(WelcomeController.SESSION_VARIABLE_NAME_SHOW_COMPLETED)}" class="form-control"/> Show Completed Processes
                    </div>
                </div>
                <g:if test="${processDisplayNames && processDisplayNames.size() > 0}">
                    <div class="control-group">
                        <div class="control-label">
                            Process
                        </div>
                        <div class="controls">
                            <g:select onchange="loadingSummaryTable(); ${remoteFunction(action: 'loadSummaryTable',
                                                    update: [success: 'summaryTable', failure: 'summaryTable'],
                                                    onComplete:'finishUp()',
                                                    params: '\'processId=\' + this.value + \'&projectId=\' + $("#projectId").val()')}"
                                      name="processId"
                                      id="processId"
                                      from="${processDisplayNames.sort{it.value}}"
                                      noSelection="${['-1':'Select...']}"
                                      optionKey="key"
                                      optionValue="value"
                                      class="form-control"
                                      value="${session.getAttribute(chartreview.WelcomeController.SESSION_VARIABLE_NAME_PROCESS_ID)}"
                            />

                        </div>
                    </div>
                </g:if>
                <g:if test="${processDisplayNames && processDisplayNames.size() == 0}">
                    <div class="control-group">
                            <div class="text-warning">No tasks available for project.</div>
                    </div>
                </g:if>
                <g:if test="${processDisplayNames && processDisplayNames.size() != 0}">
                    <div id="getNextButton" style="display: none; margin-bottom: 10px">
                        <g:submitButton name="open" value="Get Next Assignment" class="btn btn-primary form-control" style="vertical-align: middle"/>
                    </div>
                </g:if>
                    <div id="summaryTable">


                    </div>

                </div>
                </g:form>
        </div>
        <script>
            $(document).ready(function() {
                if($("#processId").val() && $("#processId").val() != "-1")
                {
                    $('#summaryTable').html('Loading data....');
                    $('#getNextButton').hide();
                    ${remoteFunction(action: 'loadSummaryTable',
                                            update: [success: 'summaryTable', failure: 'summaryTable'],
                                            onComplete:'finishUp()',
                                            params: '\'processId=\' + $("#processId").val() + \'&projectId=\' + $("#projectId").val()')};
                }
            });

            function loadingSummaryTable() {
                $('#getNextButton').hide();
                $('#summaryTable').html('Loading data.....');
            }

            function finishUp() {
                if ($('#processId').val() == "-1") {
                    $('#getNextButton').hide();
                } else {
                    $('#getNextButton').show();
                }
            }
            $('#showCompletedProcesses').change(
                    function(){
                        $(this).closest('form').trigger('submit');
                    });
            $('#projectId').change(
                    function(){
                        $(this).closest('form').trigger('submit');
                    });
        </script>
    </body>
</html>
