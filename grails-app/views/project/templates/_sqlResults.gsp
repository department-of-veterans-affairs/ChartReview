<legend>Results</legend>
<g:if test="${!rows || rows.size() == 0}">
    <strong>No Results.</strong>
</g:if>
<g:else>
<table class="table table-striped">
    <g:each var="row" in="${rows}">
        <tr>
            <g:each var="column" in="${row}">
                <td>${column}</td>
            </g:each>
        </tr>
    </g:each>
</table>
</g:else>