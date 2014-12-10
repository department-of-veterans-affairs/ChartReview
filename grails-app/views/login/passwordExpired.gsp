<%@ page import="gov.va.vinci.chartreview.model.User" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main">
    <r:require modules="bootstrap"/>
    <g:set var="entityName" value="${message(code: 'user.label', default: 'User')}" />
    <g:title>Password Expired</g:title>
</head>
    <body>
    <div id='login'>
        <div class='inner'>

            <legend>Password Expired</legend>
            <g:if test='${flash.message}'>
                <div class="alert alert-error">${flash.message}</div>
            </g:if>
            <div class="alert"><strong>${username}</strong>, you must update your password.</div>
            <g:form action='updatePassword' id='passwordResetForm' autocomplete='off'>
                 <p>
                    <label for='password'>Current Password</label>
                    <g:passwordField name='password' class='text_' />
                </p>
                <p>
                    <label for='password'>New Password</label>
                    <g:passwordField name='password_new' class='text_' />
                </p>
                <p>
                    <label for='password'>New Password (again)</label>
                    <g:passwordField name='password_new_2' class='text_' />
                </p>
                <p>
                    <input type='submit' value='Reset' class="btn btn-primary"/>
                </p>
            </g:form>
        </div>
    </div>
</body>
</html>