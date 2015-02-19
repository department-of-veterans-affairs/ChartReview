<%@ page import="org.springframework.security.core.context.SecurityContextHolder" %>
<div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
        <div class="container">
            <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </a>
            <a class="brand" href="${request.contextPath}" style="vertical-align: middle "><img src="${request.contextPath}/images/library-white.png" style="height: 25px; vertical-align: middle"/> ChartReview</a>
            <div class="nav-collapse collapse">
                <ul class="nav" style="background-image: none;">
                    <li
                        <g:if test="${request.requestURL.contains("/project/")     \
                                && !request.requestURL.contains("/test/")      \
                                && !request.requestURL.contains("/reports/")   \
                                && !request.requestURL.contains("/validation/")   \
                                && !request.requestURL.contains("/project/")}">
                            class="active"
                        </g:if>
                    ><a href="${request.contextPath}">Home</a></li>
                <sec:ifLoggedIn>
                    <g:ifAnyRoleGrantedBeginsWith roles="ROLE_ADMIN">
                         <li class="dropdown">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown">Admin <b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><g:link controller="clinicalElementConfiguration" action="list">Clinical Element Configurations</g:link></li>
                                    <li><g:link controller="project">Projects</g:link></li>
                                    <li><g:link controller="report" action="index">Reports</g:link></li>
                                    <li><g:link controller="annotationSchema">New Schema Module</g:link></li>
                                    <li><g:link controller="schema">Schemas</g:link></li>
                                    <g:ifAnyRoleGrantedBeginsWith roles="ROLE_ADMIN_CHARTREVIEW">
                                        <li class="divider"></li>
                                        <li><g:link controller="jobs" action="index">Failed Jobs</g:link></li>
                                        <li><g:link controller="process" action="list">Process Templates</g:link></li>
                                        <li><g:link controller="admin" action="tools">Tools and Utilities</g:link></li>
                                        <li><g:link controller="user">Users</g:link></li>
                                        <li class="divider"></li>
                                        <li><g:link controller="about">About</g:link></li>
                                        <li><g:link controller="runtimeLogging">Log Level</g:link></li>
                                        <li><g:link controller="monitoring">Performance Monitoring</g:link></li>
                                    </g:ifAnyRoleGrantedBeginsWith>
                                </ul>
                            </li>
                    </g:ifAnyRoleGrantedBeginsWith>
                </ul>

                    <ul class="nav pull-right" style="background-image: none;">

                        <li><g:link controller="help">Help</g:link></li>
                        <li><g:link controller="settings">Settings</g:link></li>
                        <li><a href="${request.contextPath}/j_spring_security_logout">Logout (${SecurityContextHolder.getContext().getAuthentication().principal.username})</a></li>
                        <sec:ifNotSwitched>
                            <g:ifAnyRoleGrantedBeginsWith roles="ROLE_ADMIN_CHARTREVIEW"><li><g:link controller="admin" action="switchUser">Switch User</g:link></li></g:ifAnyRoleGrantedBeginsWith>
                        </sec:ifNotSwitched>
                        <sec:ifSwitched>
                             <li><a href='${request.contextPath}/j_spring_security_exit_user'>
                                Resume as <sec:switchedUserOriginalUsername/>
                            </a></li>
                        </sec:ifSwitched>
                    </ul>
                </sec:ifLoggedIn>
            </div><!--/.nav-collapse -->
        </div>
    </div>
</div>