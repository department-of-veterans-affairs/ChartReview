<html>
<head>
    <meta name="layout" content="main"/>
    <g:title>Login</g:title>
    <r:require modules="bootstrap"/>
</head>
<body>
<br/><br/>
<div id='login' style="margin-left: auto; margin-right: auto; width: 250px; ">
    <legend>Login</legend>
    <g:if test='${flash.message}'>
        <div class="alert alert-error" role="status">
            <button type="button" class="close" data-dismiss="alert">&times;</button>
            ${flash.message}
        </div>
    </g:if>
    <form action='${postUrl}' method='POST' id='loginForm' class='cssform' autocomplete='off'>
        <p>
            <label for='username'><g:message code="login.username.label"/>:</label>
            <input type='text' class='text_' name='j_username' id='username' autofocus/>
        </p>

        <p>
            <label for='password'><g:message code="login.password.label"/>:</label>
            <input type='password' class='text_' name='j_password' id='password'/>
        </p>

        <p style="vertical-align: middle">
            <input type='submit' id="submit" class="btn btn-primary" value='${message(code: "springSecurity.login.button")}'/>
        </p>
    </form>

</div>
<script type='text/javascript'>
    <!--
    (function() {
        document.forms['loginForm'].elements['j_username'].focus();
    })();
    // -->
</script>
</body>
</html>