<html>
<head>
  <meta name="layout" content="main"/>
  <g:title>Login</g:title>
  <r:require modules="bootstrap"/>
</head>
<body>
<g:ifAnyRoleGrantedBeginsWith roles="ROLE_ADMIN_CHARTREVIEW">
  <legend>Switch User</legend>
  <form action='${request.contextPath}/j_spring_security_switch_user' method='POST'>
    Switch to user: <input type='text' name='j_username'/> <br/>
    <input type='submit' class="btn btn-primary" value='Switch'/>
  </form>
  * Note: This does not change your database connection permissions.
</g:ifAnyRoleGrantedBeginsWith>
</body>
</html>