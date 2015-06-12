<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <title>Clinical Element Configuration Wizard</title>
</head>
<body>
<br/><br/><br/>
<div id="create-dataSetConfiguration" class="content scaffold-create" role="main">
    <g:render template="/templates/showErrors" model="[model: "${dataSetConfigurationInstance}"]" />
    <g:form action="create" >
        <fieldset class="form">
            <legend>Step 3 (Advanced) Query Definitions</legend>
            <g:render template="/clinicalElementConfiguration/create/elementConnectionAndQuery" model="[dto: dto]"/>

            <blockquote>
                <p>* NOTE: Query All Elements by id query can be any query, but must follow these rules:</p>
                    <ul>
                        <li>It must return the key columns that uniquely identify the a row for this clinical element.</li>
                        <li>The query must take one parameter, the clinical element id, and is signified with a question mark (?).</li>
                    </ul>
                <p>An example query might be:</p>
    <pre>select id, company_name, email, phone, address, city, state, zip, site, version from company where id = ? </pre>
            <p>
            In the above example, company.id uniquely identifies the company row for this clinical element.
            </p>
            </blockquote>
            <g:submitButton name="back" value="Back" class="btn btn-primary" style="float:left;"/>
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
