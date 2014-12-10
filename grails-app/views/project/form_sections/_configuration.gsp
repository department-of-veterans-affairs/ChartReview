<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'name', 'error')} ">
    <label for="name">
        <g:message code="project.name.label" />*
    </label>
    <g:textField name="name" value="${projectInstance?.name}"/>
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'description', 'error')} ">
    <label for="description">
        <g:message code="project.description.label" />*
    </label>
    <g:textArea name="description" value="${projectInstance?.description}" style="width: 600px; height: 200px;"/>
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'databaseConnectionUrl', 'error')} ">
    <label for="databaseConnectionUrl">
        <g:message code="project.databaseConnectionUrl.label" />*
    </label>
    <g:textField name="databaseConnectionUrl" value="${projectInstance?.databaseConnectionUrl}" class="input-xxlarge" />
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'jdbcDriver', 'error')} ">
    <label for="jdbcDriver">
        <g:message code="project.jdbcDriver.label" />
    </label>
    <g:select name="jdbcDriver" from="${['net.sourceforge.jtds.jdbc.Driver','com.microsoft.sqlserver.jdbc.SQLServerDriver', 'com.mysql.jdbc.Driver', 'org.h2.Driver']}" value="${projectInstance?.jdbcDriver}" class="input-xxlarge"/>
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'jdbcUsername', 'error')} ">
    <label for="jdbcUsername">
        <g:message code="project.jdbcUsername.label" />
    </label>
    <g:textField name="jdbcUsername" value="${projectInstance?.jdbcUsername}"/>
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'jdbcPassword', 'error')} ">
    <label for="jdbcPassword">
        <g:message code="project.jdbcPassword.label" />
    </label>
    <g:passwordField id="jdbcPassword" name="jdbcPassword" value="${projectInstance?.jdbcPassword}"/>
</div>
<div class="fieldcontain ${hasErrors(bean: projectInstance, field: 'jdbcPassword', 'error')} ">
    <label for="confirmJdbcPassword">
        Confirm Password
    </label>
    <g:passwordField id="confirmJdbcPassword" name="confirmJdbcPassword" value="${projectInstance?.jdbcPassword}"/>
</div><br/><br/>
<input type="button"  class="btn btn-primary save" id="configurationNext" onclick="changeTab(1);" value="Next &gt;&gt;" />