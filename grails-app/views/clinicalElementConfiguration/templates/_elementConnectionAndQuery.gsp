<table class="table table-bordered table-striped">
    <tr>
        <th style="width: 200px;">
            Jdbc Driver
        </th>
        <td>
            <g:select name="jdbcDriver" from="${['com.microsoft.sqlserver.jdbc.SQLServerDriver', 'com.mysql.jdbc.Driver', 'org.h2.Driver']}" value="${dto.jdbcDriver}" class="input-xxlarge"/>
        </td>
    </tr>
    <tr>
        <th>
            Connection String
            <i class="icon-question-sign" rel="tooltip" title="JDBC database connection string." id="connectionStringToolTip"></i>
        </th>
        <td>
            <g:textField name="connectionString" value="${dto.connectionString}" class="input-xxlarge"/>
        </td>
    </tr>
    <tr>
        <th>
            Jdbc Username/Password
            <i class="icon-question-sign" rel="tooltip" title="Username and password to connect to the database with. If using integrated authentication, these can be left blank." id="loginToolTip"></i>
        </th>
        <td>
            <g:textField name="jdbcUsername" value="${dto.jdbcUsername}" style="width: 150px"/> / <g:passwordField name="jdbcPassword" value="${dto.jdbcPassword}" style="width: 150px"/>
        </td>
    </tr>
    <tr>
        <th>
            All Elements by Patient Id Query*
            <br/>
            <span style="font-weight: normal; font-size: small">Queries all context clinical elements by the principal clinical element id (i.e the patient id).  For example, this query could return all elements of this type that belong to a given patient (plus any other desired criteria).  This SQL queries a project database.</span>
        </th>
        <td>
            <g:textArea name="query" rows="8" cols="50" style="width:80%" value="${dto.query}"/>
        </td>
    </tr>
    <tr>
        <th>
            Single Element Query
            <br/>
            <span style="font-weight: normal; font-size: small">Queries a single clinical element of this type.  The goal of this query is to return a single record by specifying any criteria in the where clause that are needed to identify the record uniquely.  The criteria may include the relationship to the principal clinical element (i.e. the patient), but does not have to.  The record id alone could be the only criteria, in the most simple case.  This SQL queries a project database.  NOTE: The columns and order MUST match that of the Query All Elements by Patient Id above exactly.</span>
        </th>
        <td>
            <g:textArea name="singleElementQuery" rows="8" cols="50" style="width:80%" value="${dto.singleElementQuery}"/>
        </td>
    </tr>
    <tr>
        <th>
            Example Patient Id
            <i class="icon-question-sign" rel="tooltip" title="An example patient id for querying the database to get table metadata." id="examplePatientIdToolTip"></i>
        </th>
        <td>
            <g:textField name="examplePatientId" value="${dto.examplePatientId}" style="width: 80%"/>
        </td>
    </tr>
</table>