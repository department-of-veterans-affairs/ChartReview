<%@ page import="chartreview.ReportController" %>
<div style="float:right; font-size: 12px; margin-top: -25px">
<strong>Project:</strong> ${session.getAttribute(ReportController.PROJECT_SESSION_VARIABLE).name}<br/>
<strong>Processes:</strong>
<g:each in="${session.getAttribute(ReportController.PROCESS_SESSION_VARIABLE)}" var="process" status="count">
    <g:if test="${count < 2}">
        ${process}<g:if test="${count < session.getAttribute(ReportController.PROCESS_SESSION_VARIABLE).size() - 1}">,</g:if>
    </g:if>
    <g:elseif test="${count == 2}">
        <a href="#myModal" role="button" data-toggle="modal">more...</a>
    </g:elseif>
</g:each>
<br/>
<div style="float: right"><g:link action="chooseProjectAndProcess" class="btn btn-mini btn-info">Change</g:link></div>
</div>
<!-- Modal -->
<div id="myModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="myModalLabel">Project and Processes</h3>
    </div>
    <div class="modal-body">
        <p><strong>Project:</strong> ${session.getAttribute(ReportController.PROJECT_SESSION_VARIABLE).name}</p>
        <p><strong>Processes:</strong> ${session.getAttribute(ReportController.PROCESS_SESSION_VARIABLE)}</p>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
    </div>
</div>