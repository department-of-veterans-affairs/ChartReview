<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"><!--<![endif]-->
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<g:layoutHead/>
        <r:require module="jquery-ui"/>
		<r:layoutResources />
        <link rel="shortcut icon" href="${createLinkTo(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
        <link  media="screen, projection" rel="stylesheet" type="text/css" href="${request.contextPath}/css/dataTables.bootstrap.css" />
    </head>
	<body style="min-height: 600px; width: 100%">
        <g:render template="/layouts/mainmenu" />
        <br/><br/>
        <div class="container" style="margin-top: 40px; vertical-align: top; margin-left: auto; margin-right: auto; display: block;">
            <g:layoutBody/>
            <r:layoutResources/>
            <br/><br/>
        </div>
        <!--
        <div id="footer" class="navbar navbar-fixed-bottom navbar-inverse" style="color: #FFFFFF; background-color: #000000">
            <p>Version <g:meta name="app.version"/> Remote User: <%=  request.getRemoteUser() %></p>
        </div>
    -->

	</body>
</html>
