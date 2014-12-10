
<%@ page import="gov.va.vinci.chartreview.model.User" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:set var="entityName" value="${message(code: 'user.label', default: 'User')}" />
		<g:title><g:message code="default.show.label" args="[entityName]" /></g:title>
	</head>
	<body>
        <div class="breadcrumbMenu"><g:link action="list">&lt; ${entityName} List</g:link></div>
        <div id="show-user" class="content scaffold-show" role="main">
			<legend><g:message code="default.show.label" args="[entityName]" /></legend>
            <g:render template="/templates/showErrors" model="[model: userInstance]" />
            <table class="table table-bordered table-striped">
                <tr>
                    <th style="width: 200px"><span id="username-label" class="property-label"><g:message code="user.username.label"  /></span></th>
                    <td><span class="property-value" aria-labelledby="username-label"><g:fieldValue bean="${userInstance}" field="username"/></span></td>
                </tr>
                <tr>
                    <th><span id="accountNonExpired-label" class="property-label"><g:message code="user.accountNonExpired.label" /></span></th>
                    <td><span class="property-value" aria-labelledby="accountNonExpired-label"><g:formatBoolean boolean="${userInstance?.accountNonExpired}" /></span></td>
                </tr>
                <tr>
                    <th><span id="accountNonLocked-label" class="property-label"><g:message code="user.accountNonLocked.label" /></span></th>
                    <td><span class="property-value" aria-labelledby="accountNonLocked-label"><g:formatBoolean boolean="${userInstance?.accountNonLocked}" /></span></td>
                </tr>
                <tr>
                    <th><span id="credentialsNonExpired-label" class="property-label"><g:message code="user.credentialsNonExpired.label" /></span></th>
                    <td><span class="property-value" aria-labelledby="credentialsNonExpired-label"><g:formatBoolean boolean="${userInstance?.credentialsNonExpired}" /></span></td>
                </tr>
                <tr>
                    <th><span id="enabled-label" class="property-label"><g:message code="user.enabled.label" /></span></th>
                    <td><span class="property-value" aria-labelledby="enabled-label"><g:formatBoolean boolean="${userInstance?.enabled}" /></span></td>
                </tr>
                <tr>
                    <th>Authorities</th>
                    <td>
                        <g:each in="${userInstance.authorities.sort{it.authority}}" var="a">
                            <span class="property-value" aria-labelledby="authorities-label">${a?.getAuthority()}</span> <br/>
                        </g:each>
                    </td>
                </tr>
            </table>

			<g:form>
				<fieldset class="buttons">
					<g:hiddenField name="id" value="${userInstance?.id}" />
					<g:link class="edit btn btn-primary" action="edit" id="${userInstance?.id}"><g:message code="default.button.edit.label" default="Edit" /></g:link>
					<g:actionSubmit class="delete btn" action="delete" value="${message(code: 'default.button.delete.label', default: 'Delete')}" onclick="return confirm('${message(code: 'default.button.delete.confirm.message', default: 'Are you sure?')}');" />
				</fieldset>
			</g:form>
		</div>
	</body>
</html>
