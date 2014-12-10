<!DOCTYPE html>
<html>
	<head>
		<meta name="layout" content="main"/>
		<g:title>Welcome to ChartReview</g:title>
        <r:require modules="bootstrap"/>
	</head>
	<body>
    <div class="hero-unit">
        <h2>Quick Start: Setting up a new project</h2>
        <ol>
            <li>
                Create the <a href="${request.contextPath}/clinicalElementConfiguration/list">Clinical Element Configurations</a> (must be admin)
                <ul>
                    <li>
                        A patient clinical element is <strong>required</strong>.
                    </li>
                    <li>
                        Patient clinical element should have "Summary" as true and "Content" as false.
                    </li>

                </ul>
            </li>
            <li>
                Create a <a href="${request.contextPath}/project/list">new project</a>.
            </li>
            <li>
                Add any <a href="${request.contextPath}/user/list">users</a> to ChartReview that are on the project, but not currently in ChartReview. (must be admin)
            </li>
            <li>
                Create the SIMAN tables in the project database.
                <ul>
                    <li><a href="${request.contextPath}/resources/sql/create-annotation-db-sql-server.sql" target="_blank">Create Script for SQL Server</a></li>
                    <li><a href="${request.contextPath}/resources/sql/create-annotation-db-mysql.sql" target="_blank">Create Script for MySQL</a></li>
                </ul>
            </li>
            <li>Create or upload <a href="${request.contextPath}/schema/list">annotation schemas</a>.</li>
            <li>Add one or more processes to the project.
                <ul>
                    <li>The primary clinical element for a task should be the patient clinical element defined above.</li>
                    <li>The patient query will instantiate a process for each patient id returned. Be sure to test this query outside of ChartReview to make sure it is returning the patients expected.</li>
                </ul>
            </li>
        </ol>
        <h2>ChartReview User Manual:</h2>
        <a href="${request.contextPath}/resources/help/index.html" target="_blank">Click here to view the full ChartReview User Manual (HTML)</a>
        <a href="${request.contextPath}/resources/CRUserManual.pdf" target="_blank"> / (PDF)</a>
        <a href="${request.contextPath}/resources/CRUserManual.docx"> / (Word)</a>
    </div>
        <script>
            $('#projectId').change(
                    function(){
                        $(this).closest('form').trigger('submit');
                    });
        </script>
    </body>
</html>
