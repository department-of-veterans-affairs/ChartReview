<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:title>Clinical Element Configuration Wizard</g:title>
	</head>
	<body>
		<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
            <fieldset class="form">
            <legend>Step 2 - Define Queries</legend>
                <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
                <g:form >
				    <g:render template="/clinicalElementConfiguration/templates/elementConnectionAndQuery" model="[dto: dto]"/>

                    <blockquote>
                        <p>* NOTE: Query All Elements by Patient Id query can be any query, but must follow these rules:</p>
                            <ul>
                                <li>It must return the key columns that uniquely identify the a row for this clinical element.</li>
                                <li>The query must take one parameter, the patient id, and is signified with a question mark (?).</li>
                            </ul>
                        <p>An example query might be:</p>
<pre>select lab.lab_value, icd9.icd9_code, lab.lab_id
     from lab, icd9_code, patient
     where lab.lab_icd9 = icd9.icd9 and lab.patient_id = patient.patient_id and
           patient.patiend_id = ? </pre>
                    <p>
                    In the above example, lab.lab_id uniquely identifies the lab row for this clinical element.
                    </p>
                    </blockquote>
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
	</body>
</html>
