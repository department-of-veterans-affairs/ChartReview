<table class="table table-striped table-bordered" style="width: 100%" id="processTable">
    <tr>
        <th>Process</th><th style="width: 100px; text-align: center">Running / Historic</th><th style="width: 40px; text-align: center">Copy</th><th style="width: 40px; text-align: center">Delete</th><th style="width: 40px; text-align: center">View</th>
    </tr>
    <g:each in="${processes.sort{it.processName}}" var="proc">
        <tr>
            <td>${proc.processName}</td>
            <td style="text-align: center">${proc.todoCount} / ${proc.doneCount}</td>
            <td style="width: 40px; text-align: center">
                <g:link controller="process" action="addToProject" params="[id: projectInstance.id, proc: proc.processName, processDefinitionId: proc.processDefinitionId]">
                    <i class="icon-share"></i>
                </g:link>
            </td>
            <td style="width: 40px; text-align: center">
                <g:link controller="admin" action="deleteRunningProcessInstancesByProjectProcess" params="[projectId: projectInstance.id, displayName: proc.processName]"
                        onclick="return confirm('Delete this running process from the project?')">
                    <i class="icon-trash"></i>
                </g:link>
            </td>
            <td style="width: 40px; text-align: center">
                <g:link controller="process" action="addToProject" params="[id: projectInstance.id, proc: proc.processName, processDefinitionId: proc.processDefinitionId, readOnly: true]">
                    <i class="icon-eye-open"></i>
                </g:link>
            </td>
        </tr>
    </g:each>
</table>