<table class="table table-striped table-bordered" style="width: 80%; margin-left: 20px;">
    <tr>
        <th>Name</th>
        <th>Description</th>
        <th style="width: 70px; text-align: center">View</th>
        <th style="width: 70px; text-align: center">Delete</th>
    </tr>
    <g:each in="${projectDocuments?.sort{it.name}}" var="document">
        <tr>
            <td>${document.name}</td>
            <td>${document.description}</td>
            <td style="text-align: center"><g:link controller="projectDocument" action="show" id="${document.id}" target="_blank" ><i class="icon-eye-open"></i></g:link></td>
            <td style="text-align: center"><g:link controller="projectDocument" action="delete" id="${document.id}" onclick="return confirm('Delete this project document?');"><i class="icon-trash"></i></g:link></td>
        </tr>
    </g:each>
</table>