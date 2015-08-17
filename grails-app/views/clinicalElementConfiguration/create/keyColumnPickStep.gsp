<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard Step 2</title>
</head>
<body>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form action="create">
        <fieldset class="form">
            %{--<g:hiddenField name="principalClinicalElementTableName" value="${principalClinicalElementTableName}" />--}%
            %{--<g:hiddenField name="clinicalElementTableName" value="${clinicalElementTableName}" />--}%
            <legend>Step 2 - Key Column Pick Step</legend>
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 300px">
                        Clinical Element Id of ${clinicalElementTableName}
                        <br/>
                        <span style="font-weight: normal; font-size: small">The primary key of the clinical element table.</span>
                    </th>
                    <td>
                        <g:select name="clinicalElementIdColName" from="${clinicalElementTableFieldNames}" value="${clinicalElementIdColName}" noSelection="['':'-Choose a field-']"/>
                    </td>
                </tr>
                <tr>
                    <th style="width: 300px">
                        Principal Clinical Element Id from ${clinicalElementTableName} to Principal Clinical Element table
                        <br/>
                        <span style="font-weight: normal; font-size: small">The foreign key into the table in the project database that contains the principal clinical elements (i.e. the patients), from the clinical element table.</span>
                    </th>
                    <td>
                        <g:select name="principalClinicalElementIdColName" from="${clinicalElementTableFieldNames}" value="${principalClinicalElementIdColName}" noSelection="['':'-Choose a field-']"/>
                    </td>
                </tr>
                <tr>
                    <th>
                        Example Principal Element Id
                        <i class="icon-question-sign" rel="tooltip" title="An example principal element id (i.e. patient id) for querying the database to get table metadata.  Note: This is only used if the All Elements Query above is joined to a principal clinical element table, like a patient table." id="examplePatientIdToolTip"></i>
                    </th>
                    <td>
                        <g:textField name="examplePatientId" value="${examplePatientId ? examplePatientId : "1"}" style="width: 90%"/>
                    </td>
                </tr>
            </table>
            <br/>
            <g:submitButton name="prev" value="Previous" class="btn btn-primary" style="float:left;"/>
            <g:submitButton name="next" value="Next" class="btn btn-primary" style="float:right;"/><br/><br/>
        </fieldset>
    </g:form>
</div>
<script>
    $(document).ready(function(){
        $("[rel=tooltip]").tooltip({ placement: 'right'});
    });
</script>
<br/><br/><br/>
</body>
</html>
