
<%@ page import="gov.va.vinci.chartreview.model.User" %>
<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main">
		<g:set var="entityName" value="${message(code: 'user.label', default: 'User')}" />
        <r:require modules="bootstrap"/>
		<g:title>Users</g:title>
	</head>
	<body>

		<div id="list-user" class="content scaffold-list" role="main">
			<legend><g:message code="default.list.label" args="[entityName]" /></legend>
			<g:if test="${flash.message}">
			<div class="message" role="status">${flash.message}</div>
			</g:if>
			<table class="table table-bordered table-striped">
				<thead>
					<tr>
                        <g:sortableColumn property="username" title="${message(code: 'user.username.label', default: 'Username')}" />

						<g:sortableColumn property="accountNonExpired" title="${message(code: 'user.accountNonExpired.label', default: 'Account Non Expired')}" />
					
						<g:sortableColumn property="accountNonLocked" title="${message(code: 'user.accountNonLocked.label', default: 'Account Non Locked')}" />
					
						<g:sortableColumn property="credentialsNonExpired" title="${message(code: 'user.credentialsNonExpired.label', default: 'Credentials Non Expired')}" />
					
						<g:sortableColumn property="enabled" title="${message(code: 'user.enabled.label', default: 'Enabled')}" />

					</tr>
				</thead>
				<tbody>
				<g:each in="${userInstanceList}" status="i" var="userInstance">
					<tr class="${(i % 2) == 0 ? 'even' : 'odd'}">

                        <td><g:link action="show" id="${userInstance.id}">${fieldValue(bean: userInstance, field: "username")}</g:link></td>

                        <td>${fieldValue(bean: userInstance, field: "accountNonExpired")}</td>
					
						<td><g:formatBoolean boolean="${userInstance.accountNonLocked}" /></td>
					
						<td><g:formatBoolean boolean="${userInstance.credentialsNonExpired}" /></td>
					
						<td><g:formatBoolean boolean="${userInstance.enabled}" /></td>

					</tr>
				</g:each>
				</tbody>
			</table>
            <g:link action="create" class="create btn btn-primary"><g:message code="default.new.label" args="[entityName]" /></g:link>
			<div class="pagination">
				<g:paginate total="${userInstanceTotal}" />
			</div>
		</div>
	</body>
</html>
