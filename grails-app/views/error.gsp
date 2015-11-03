<!DOCTYPE html>
<html>
	<head>
		<g:title><g:if env="development">Grails Runtime Exception</g:if><g:else>Error</g:else></g:title>
		<meta name="layout" content="main">
        <r:require modules="bootstrap"/>
		<g:if env="development"><link rel="stylesheet" href="${resource(dir: 'css', file: 'errors.css')}" type="text/css"></g:if>
	</head>
	<body>
		<g:if env="development">
			<g:renderException exception="${exception}" />
		</g:if>
		<g:else>
			<ul class="errors">
				<li>An internal error has occurred.</li>
				<g:renderException exception="${exception}" />
			</ul>
		</g:else>
	</body>
</html>
