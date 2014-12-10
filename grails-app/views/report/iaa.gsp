<!DOCTYPE html>
<html>
<head>
    <style type="text/css">
    span.underline {
        border-bottom: 1px solid grey;
    }
    </style>
    <meta name="layout" content="main"/>
    <g:title>Report: Inter-Annotator Agreement</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
    <g:render template="templates/showProjectAndProcesses" />
    <legend>Report: Inter-Annotator Agreement</legend>
    <g:render template="templates/backButton"/>

    <ul class="nav nav-tabs" id="myTab">
        <li class="active"><a href="#originalReport">Original Report</a></li>
        <li><a href="#newReport">New Report</a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="originalReport" style="margin-left: 20px; margin-right: 20px">
            <span class="underline">Fleiss' kappa</span>
            <table cellpadding="10">
                <tr>
                    <td valign="top">
                        <table>
                            <tr>
                                <td>
                                    <b>k = ${iaaFleissKappa} &nbsp&nbsp&nbsp&nbsp concordance = ${concordance}</b>
                                    <table width="300" class="table-striped table-bordered">
                                        <thead>
                                        <th>k</th>
                                        <th>Interpretation</th>
                                        </thead>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;< 0</td>
                                            <td width="200">&nbsp;&nbsp;Poor agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.01 – 0.20</td>
                                            <td width="200">&nbsp;&nbsp;Slight agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.21 – 0.40</td>
                                            <td width="200">&nbsp;&nbsp;Fair agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.41 – 0.60</td>
                                            <td width="200">&nbsp;&nbsp;Moderate agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.61 – 0.80</td>
                                            <td width="200">&nbsp;&nbsp;Substantial agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.81 – 1.00</td>
                                            <td width="200">&nbsp;&nbsp;Almost perfect agreement</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td>
                        Patiend Id to Classification Count Table
                        <table class="table table-striped table-bordered">
                            <thead>
                            <th></th>
                            <g:each in="${classificationList}" var="classification">
                                <th>${classification}</th>
                            </g:each>
                            <th>Pi</th>
                            </thead>
                            <g:each in="${patientIdList}" var="patientId">
                                <tr>
                                    <td><b>${patientId}</b></td>
                                    <g:each in="${classificationList}" var="classification">
                                        <td>${patientIdToClassificationCountMapMap.get(patientId).get(classification)}</td>
                                    </g:each>
                                    <td>${piByPatientIdMap.get(patientId)}</td>
                                </tr>
                            </g:each>
                            <tr>
                                <td><b>Total</b></td>
                                <g:each in="${classificationList}" var="classification">
                                    <td><b>${totalByClassificationMap.get(classification)}</b></td>
                                </g:each>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Pj</b></td>
                                <g:each in="${classificationList}" var="classification">
                                    <td>${pjByClassificationMap.get(classification)}</td>
                                </g:each>
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <br/>
        </div>
        <div class="tab-pane" id="newReport" style="margin-left: 20px; margin-right: 20px">
            <span class="underline" style="font-weight: bold;">New Version: Fleiss' kappa</span>
            <table cellpadding="10">
                <tr>
                    <td valign="top">
                        <table>
                            <tr>
                                <td>
                                    <b>k = ${iaaFleissKappa} &nbsp&nbsp&nbsp&nbsp concordance = ${concordance}</b>
                                    <table width="300" class="table-striped table-bordered">
                                        <thead>
                                        <th>k</th>
                                        <th>Interpretation</th>
                                        </thead>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;< 0</td>
                                            <td width="200">&nbsp;&nbsp;Poor agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.01 – 0.20</td>
                                            <td width="200">&nbsp;&nbsp;Slight agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.21 – 0.40</td>
                                            <td width="200">&nbsp;&nbsp;Fair agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.41 – 0.60</td>
                                            <td width="200">&nbsp;&nbsp;Moderate agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.61 – 0.80</td>
                                            <td width="200">&nbsp;&nbsp;Substantial agreement</td>
                                        </tr>
                                        <tr>
                                            <td width="100">&nbsp;&nbsp;0.81 – 1.00</td>
                                            <td width="200">&nbsp;&nbsp;Almost perfect agreement</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td>
                        Patiend Id to Classification Count Table
                        <table class="table table-striped table-bordered">
                            <thead>
                            <th></th>
                            <g:each in="${classificationList}" var="classification">
                                <th>${classification}</th>
                            </g:each>
                            <th>Pi</th>
                            </thead>
                            <g:each in="${patientIdList}" var="patientId">
                                <tr>
                                    <td><b>${patientId}</b></td>
                                    <g:each in="${classificationList}" var="classification">
                                        <td>
                                            <g:each in="${primaryClinicalElementUserClassificationCount.findAll{it.primaryClinicalElementId == patientId && it.classification == classification}}" var="annotatorDetail">
                                                ${annotatorDetail.userId} (${annotatorDetail.count})<br/>
                                            </g:each>
                                        </td>
                                    </g:each>
                                    <td>${piByPatientIdMap.get(patientId)}</td>
                                </tr>
                            </g:each>
                            <tr>
                                <td><b>Total</b></td>
                                <g:each in="${classificationList}" var="classification">
                                    <td><b>${totalByClassificationMap.get(classification)}</b></td>
                                </g:each>
                                <td></td>
                            </tr>
                            <tr>
                                <td><b>Pj</b></td>
                                <g:each in="${classificationList}" var="classification">
                                    <td>${pjByClassificationMap.get(classification)}</td>
                                </g:each>
                                <td></td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            <br/>
        </div>
    </div>
    <script>
        $('#myTab a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        });
    </script>
</body>
</html>