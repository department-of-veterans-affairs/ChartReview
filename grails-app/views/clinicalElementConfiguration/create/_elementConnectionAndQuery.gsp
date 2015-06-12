<table class="table table-bordered table-striped">
    <tr>
        <th style="width: 300px">
            All Elements Query*
            <br/>
            <span style="font-weight: normal; font-size: small">Queries all context clinical elements by the principal clinical element id (i.e the patient id).  For example, this query could return all elements of this type that belong to a given patient (plus any other desired criteria).  This SQL queries a project database.  NOTE: You will need to delete this query if you go to previous pages to re-choose query builder options.  Otherwise, this query text will take precedence over other changes.</span>
        </th>
        <td>
            <g:textArea name="query" rows="8" cols="50" style="width:90%" value="${dto.query}"/>
        </td>
    </tr>
    <tr>
        <th>
            Single Element Query
            <br/>
            <span style="font-weight: normal; font-size: small">Queries a single clinical element of this type.  The goal of this query is to return a single record by specifying any criteria in the where clause that are needed to identify the record uniquely.  The criteria may include the relationship to the principal clinical element (i.e. the patient), but does not have to.  The record id alone could be the only criteria, in the most simple case.  This SQL queries a project database.  NOTE: The columns and order MUST match that of the Query All Elements by Patient Id above exactly.  NOTE: You will need to delete this query if you go to previous pages to re-choose query builder options.  Otherwise, this query text will take precedence over other changes.</span>
        </th>
        <td>
            <g:textArea name="singleElementQuery" rows="8" cols="50" style="width:90%" value="${dto.singleElementQuery}"/>
        </td>
    </tr>
</table>