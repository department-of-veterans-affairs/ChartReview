<%@ page import="gov.va.vinci.chartreview.model.User" %>
<style>
    label { font-weight: bold; }
</style>
<table class="table table-bordered table-striped">
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'username', 'error')} ">
        <th style="width: 200px">
            <label for="username">
                <g:message code="user.username.label" default="Username" />
            </label>
        </th>
        <td>
            <g:textField name="username" value="${userInstance?.username}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'accountNonExpired', 'error')} ">
        <th>
            <label for="accountNonExpired">
                <g:message code="user.accountNonExpired.label" default="Account Non Expired" />
            </label>
        </th>
        <td>
            <g:checkBox name="accountNonExpired" value="${userInstance?.accountNonExpired}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'accountNonLocked', 'error')} ">
        <th>
            <label for="accountNonLocked">
                <g:message code="user.accountNonLocked.label" default="Account Non Locked" />

            </label>
        </th>
        <td>
            <g:checkBox name="accountNonLocked" value="${userInstance?.accountNonLocked}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'credentialsNonExpired', 'error')} ">
        <th>
            <label for="credentialsNonExpired">
                <g:message code="user.credentialsNonExpired.label" default="Credentials Non Expired" />
            </label>
        </th>
        <td>
            <g:checkBox name="credentialsNonExpired" value="${userInstance?.credentialsNonExpired}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'enabled', 'error')} ">
        <th>
            <label for="enabled">
                <g:message code="user.enabled.label" default="Enabled" />
            </label>
        </th>
        <td>
            <g:checkBox name="enabled" value="${userInstance?.enabled}" />
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'password', 'error')} ">
        <th>
            <label for="password">
                <g:message code="user.password.label" />
            </label>
        </th>
        <td>
            <g:passwordField name="password"  />
                <g:if test="${userInstance.id}">
                    &nbsp;&nbsp;&nbsp;&nbsp; (Leave blank to not change)
                </g:if>
        </td>
    </tr>
    <tr class="fieldcontain ${hasErrors(bean: userInstance, field: 'password', 'error')} ">
        <th>
            <label for="confirmPassword">
                <g:message code="user.confirmPassword.label" />
            </label>
        </th>
        <td>
            <g:passwordField name="confirmPassword"  />
        </td>
    </tr>
    <tr>
        <th>
            Authorities
        </th>
        <td>
            <g:each in="${userInstance.authorities?.sort{it.authority}}" var="a">
                <span class="property-value" aria-labelledby="authorities-label">${a?.getAuthority()}</span> <br/>
            </g:each>
        </td>
    </tr>
</table>


