<!DOCTYPE html>
<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Settings</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
<div style="width: 50%; margin: 0px auto; margin-top: 20px;">
    <g:if test="${flash.error}">
        <div class="alert">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            <p class="text-error">${flash.error}</p>
        </div>
    </g:if>
    <g:if test="${flash.message}">
        <div class="alert">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            ${flash.message}
        </div>
    </g:if>
    <g:form action="saveSettings" class="form-horizontal">
        <fieldset>

            <legend>Settings</legend>
            <div class="control-group">
                <label>Password</label>
                <input type="password" name="password" value="">
            </div>
            <div class="control-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value="">
            </div>
            <button type="submit" class="btn btn-primary">Save</button>
            <br/><br/>

        </fieldset>
    </g:form>
</div>
</body>
</html>