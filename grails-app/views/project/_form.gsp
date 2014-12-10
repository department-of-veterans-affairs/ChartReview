<%@ page import="gov.va.vinci.chartreview.model.Project" %>
<style>
    .tab-pane { min-height: 475px;
                margin-left: 20px;
                margin-right: 20px;
    }
</style>

<ul class="nav nav-tabs" id="myTab">
    <li class="active"><a href="#configuration">General Configuration</a></li>
    <li><a href="#users">Project Users</a></li>
</ul>
<div class="tab-content">
    <div class="tab-pane active" id="configuration">
        <g:render template="form_sections/configuration" model="[projectInstance: projectInstance, workflows: workflows]" />
    </div>
    <div class="tab-pane" id="users">
        <g:render template="form_sections/security" model="[projectInstance: projectInstance]" />
    </div>
    <br/><br/>
</div>
<script>

</script>
<script>
    function changeTab(tab) {
        $('#myTab li:eq(' + tab + ') a').tab('show');
    }

    $('#myTab a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })

</script>

