<br/>
<g:if test="${summaryTableDTOs}">
    <h4>Your Recent Work</h4>
    <table class="table table-bordered table-striped">
        <tr>
            <th>Task Id</th>
            <th>Type</th>
            <th>Primary Id</th>
            <th>Status</th>
            <th>Comment</th>
            <th>Date</th>
            <th>&nbsp;&nbsp;</th>
        </tr>
        <g:each in="${summaryTableDTOs}" var="summaryTableDTO">
            <tr>
                <td>
                    <a href="${request.contextPath}/chart-review?projectId=${params.projectId}&processId=${params.processId}&taskId=${summaryTableDTO.taskId}&taskType=${summaryTableDTO.taskType}">${summaryTableDTO.taskId}</a>
                </td>
                <td>
                    ${summaryTableDTO.taskType}
                </td>
                <td>
                    ${summaryTableDTO.patientId}
                </td>
                <td>
                    ${summaryTableDTO.status}
                </td>
                <td>
                    ${summaryTableDTO.statusComment}
                </td>
                <td>
                    ${summaryTableDTO.date}
                </td>
                <td>
                    <g:if test="${summaryTableDTO.status.toLowerCase() != 'completed' && summaryTableDTO.status.toLowerCase() != 'hold'}">
                        <div id="putOnHoldButton${summaryTableDTO.taskId}">
                            <input type="button" value="Put on hold" class="btn btn-info" onclick="$('#putOnHoldButton${summaryTableDTO.taskId}').hide();$('#putOnHoldForm${summaryTableDTO.taskId}').show();"/>
                        </div>
                        <div id="putOnHoldForm${summaryTableDTO.taskId}" style="display: none;">
                            <form id="holdForm${summaryTableDTO.taskId}">
                                Hold Comment:
                                <br/>
                                <textarea name="holdComment" style="width: 200px;" id="holdComment${summaryTableDTO.taskId}"/>
                                <br/>
                                <input type="button" value="Hold" class="btn btn-primary" id="submitHoldButton${summaryTableDTO.taskId}" onclick="doSubmit(${summaryTableDTO.taskId})">
                                <input type="button" value="Cancel" class="btn btn-warning"
                                onclick="$('#putOnHoldForm${summaryTableDTO.taskId}').hide();$('#putOnHoldButton${summaryTableDTO.taskId}').show();">
                            </form>
                        </div>
                    </g:if>
                </td>
            </tr>
        </g:each>
    </table>
</g:if>
<script>
    function doSubmitShowCompleted()
    {
        $.ajax({
            url: "${request.contextPath}/welcome/updateShowCompleted",
            data: {
                taskId: taskId,
                statusComment: $('#holdComment' + taskId).val(),
                showCompleted: document.getElementById("showCompletedProcesses").checked,
                processId: "${params.processId}",
                projectId: "${params.projectId}"

            },
            type: "GET",
            dataType: "html",
            success: function (data) {
                alert('doSubmitShowCompleted success'+data);
//                $('#summaryTable').replaceWith("");
                $('#summaryTable').replaceWith(data);
            },
            error: function (xhr, status) {
                alert("Sorry, there was a distinct problem!");
            },
            complete: function (xhr, status) {
                //$('#showresults').slideDown('slow')
            }
        });
    }
    function doSubmit(taskId)
    {
        $.ajax({
            url: "${request.contextPath}/welcome/putOnHold",
            data: {
                taskId: taskId,
                statusComment: $('#holdComment' + taskId).val(),
                showCompleted: document.getElementById("showCompletedProcesses").checked,
                processId: "${params.processId}",
                projectId: "${params.projectId}"

            },
            type: "GET",
            dataType: "html",
            success: function (data) {
                $('#summaryTable').replaceWith(data);
            },
            error: function (xhr, status) {
                alert("Sorry, there was a problem!");
            },
            complete: function (xhr, status) {
                //$('#showresults').slideDown('slow')
            }
        });
    }
</script>