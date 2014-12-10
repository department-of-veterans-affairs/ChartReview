<table class="table table-bordered table-striped">
    <tr>
        <th style="width: 200px">
            Column Name
            <i class="icon-question-sign" rel="tooltip" title="The column name from the result set." id="columnNameToolTip"></i>
        </th>
        <th>Display Name
            <i class="icon-question-sign" rel="tooltip" title="The name for this column that will be displayed in the user interface." id="displayNameToolTip"></i>
        </th>
        <th>
            Type Name
            <i class="icon-question-sign" rel="tooltip" title="The database type for the column." id="typeNameToolTip"></i>
        </th>
        <th style="text-align: center">
            Key Field
            <i class="icon-question-sign" rel="tooltip" title="Key fields in the database should be checked." id="keyFieldToolTip"></i>
        </th>
        <th style="text-align: center">
            Exclude <i class="icon-question-sign" rel="tooltip" title="Excluded fields are not sent to the UI, and are expected to be part of the content template." id="excludeToolTip"></i>
        </th>
    </tr>
    <g:each in="${model.dataQueryColumns.sort{it.columnName}}" var="column">
        <tr>
            <td>${column.columnName}</td>
            <td>${column.displayName}</td>
            <td>${column.type}</td>
            <td style="text-align: center">${column.keyField}</td>
            <td style="text-align: center">${column.exclude}</td>
        </tr>
    </g:each>
</table>
