<%@ page import="gov.va.vinci.chartreview.model.Role" %>
<legend>Project Users</legend>
<table class="table table-striped table-bordered" id="administrators">
    <thead>
        <tr>
            <th>
                Username
            </th>
            <th style="width: 200px">Role</th>
            <th style="width: 50px">&nbsp;&nbsp;</th>
        </tr>
    </thead>
    <tbody>
        <g:each in="${projectInstance.authorities}" var="authority">
            <tr><td><input type="hidden" value="${authority.user.username}" name="username"/>${authority.user.username}</td>
                <td>
                    <g:select name="role" from="${gov.va.vinci.chartreview.model.Role.findAll()}" optionValue="name" optionKey="id" value="${authority.role.id}"/>
                </td>
                <td style="text-align: center" class="delete"><i class="icon-trash"></i>Remove&nbsp;&nbsp;</td></tr>
        </g:each>
    </tbody>
</table>
<div style="vertical-align: middle" >Find User: <input type="text" id="username"/>
<br/><a href="#" class="btn btn-primary" id="addUserButton">Add</a></div>
 <br/><br/>

<fieldset class="buttons">
    <input type="button" class="btn btn-primary save" id="configurationNext" onclick="changeTab(0);" value="&lt;&lt; Previous" />
    <g:submitButton name="${type}" class="btn btn-success" value="${submitButton}" style="float: right;"/>
</fieldset>

<script>
    $(document).ready(function() {
        $('#username').autocomplete({
            source: '<g:createLink controller="user" action="ajaxFindUsers"/>'
        });
    });

    $(document).ready(function(){
        $("#addUserButton").click(function(){
            $("#administrators tbody").append('<tr>' +
                                                    '<td><input type="hidden" value="' + $('#username').val() + '" name="username"/>' + $('#username').val() + '</td>' +
                                                    '<td><select name="role">' +
                                                        <g:each in="${gov.va.vinci.chartreview.model.Role.findAll().sort{it.name}}" var="it">'<option value="${it.id}">${it.name}</option>' +</g:each>
                                                    '      </select></td>' +
                                                    '<td style="text-align: center" class="delete"><i class="icon-trash"></i>Remove&nbsp;&nbsp;</td>'+
                                                '</tr>');
        });
    });
    $(document).on('click', 'td.delete', del);

    function del() {
        var r=confirm("Remove administrator?");
        if (r==true)
        {
            $(this).closest("tr").remove();
        }
    }
</script>