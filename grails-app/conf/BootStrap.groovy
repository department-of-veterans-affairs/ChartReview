import com.google.gson.Gson
import com.mysema.query.sql.codegen.MetaDataExporter
import gov.va.vinci.chartreview.db.ExampleDataUtils
import gov.va.vinci.chartreview.marshallers.AnnotationSchemaMarshaller
import gov.va.vinci.chartreview.marshallers.AttributeDefMarshaller
import gov.va.vinci.chartreview.marshallers.AttributeDefOptionDefMarshaller
import gov.va.vinci.chartreview.marshallers.ClassDefMarshaller
import gov.va.vinci.chartreview.marshallers.ClassRelDefMarshaller
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role
import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import gov.va.vinci.siman.model.ClinicalElementConfigurationDetails
import grails.converters.XML
import grails.plugin.springsecurity.SecurityFilterPosition
import grails.plugin.springsecurity.SpringSecurityUtils
import org.activiti.engine.RepositoryService
import org.activiti.engine.repository.Deployment
import org.codehaus.groovy.grails.commons.GrailsApplication
import org.codehaus.groovy.grails.web.converters.marshaller.xml.CollectionMarshaller

import java.sql.Connection
import java.sql.Timestamp
import java.text.SimpleDateFormat

class BootStrap {
    def springSecurityService;
    GrailsApplication grailsApplication;
    def activitiUserService;
    def dataSource;
    def clinicalElementService;
    def gsonBuilder;
    def jobExecutor;

    /**
     * Activiti repository service.
     */
    RepositoryService repositoryService;


    def init = { servletContext ->

        SpringSecurityUtils.clientRegisterFilter(
                    'myPreAuthFilter', SecurityFilterPosition.PRE_AUTH_FILTER.order);

        /** Bug fix for patient element in db. **/
        XML.registerObjectMarshaller(new AnnotationSchemaMarshaller());
        XML.registerObjectMarshaller(new AttributeDefMarshaller());
        XML.registerObjectMarshaller(new AttributeDefOptionDefMarshaller());
        XML.registerObjectMarshaller(new ClassDefMarshaller());
        XML.registerObjectMarshaller(new ClassRelDefMarshaller());

        XML.registerObjectMarshaller(new CollectionMarshaller() {
            @Override
            public boolean supports(Object object) {
                object instanceof List<AnnotationSchema>
            }

            @Override
            String getElementName(final Object o) {
                'annotationSchemas'
            }
        })

        createInitialUsersRolesAndProjectsIfNecessary();
        migrateAttributeDefMinDates();

        /**
        ClinicalElementConfiguration.findAll().each { ClinicalElementConfiguration config ->
            def details = config.getConfigurationDetails();
            details.contentTemplate = details.contentTemplate.toLowerCase();

            details.dataQueryColumns.each {
                it.columnName = it.columnName.toLowerCase();
            }

            config.setConfiguration(new Gson().toJson(details));
            config.save(flush: true, failOnError: true);
        }  **/
        //queryDSL();

        // DROP and CREATE chartreview and UNCOMMENT THIS TO REBUILD EVERYTHING DB;  to also REBULID activity tables - set databaseSchemaUpdate="true" in DataSource.groovy
//       createTestData();
//       ExampleDataUtils.createActivitiUsersAndGroups(activitiUserService);
//       deployExampleActivitiProcesses();
//       ExampleDataUtils.createExampleSchema();
//         new PatientTestDataGenerator(new File("/Users/ryancornia/git/public-example-data")).generatePatients(100, 10, 5);


    }


    def destroy = {

    }

    def queryDSL() {
        Connection conn = dataSource.getConnection();
        MetaDataExporter exporter = new MetaDataExporter();
        exporter.setPackageName("gov.va.vinci.chartreview.siman");
        exporter.setTableNamePattern("document,annotation,feature,user")
        exporter.setTargetFolder(new File("src/java"));
        exporter.export(conn.getMetaData());
    }

    def createTestData() {
        Gson gson = new Gson();
        println("Creating test data.");

        print("Loading json serialized example clinical elements...");

        def resourceFolder = grailsApplication.mainContext.getResource("resources/serialized-example-data/ClinicalElementConfiguration").getFile();
        resourceFolder.eachFile {
            ClinicalElementConfiguration clinicalElementConfiguration = gson.fromJson(it.text, ClinicalElementConfiguration.class)
            clinicalElementConfiguration.createdDate = new Timestamp(new Date().getTime());
            clinicalElementConfiguration.clearErrors();
            clinicalElementConfiguration.save(flush:true, failOnError: true);
        }
        println("...finished...");

        /**
         * Create test processUsers and roles.
         */
        def (User globalAdmin, Role r, User project1User, User project2User) = ExampleDataUtils.createUsersAndRoles(springSecurityService)

        /**
         * Create project and roles associated with them.
         */
        ExampleDataUtils.createProjectAndUserProjectRoles(globalAdmin, r, project1User, project2User,
                ClinicalElementConfiguration.get("37aa90bb-be98-4e2d-aefb-153716cd493f"),
                ClinicalElementConfiguration.get("12000aa3-50eb-40d6-ad30-563a0e7ad6cc"),
                ClinicalElementConfiguration.get("b9d363b0-1c9e-4576-8875-5e199db919d8"))

        /**
         * Create example data.
         */
        ExampleDataUtils.createSamplePatientsLabsAndTIUDocuments();
        println("Test data creation complete.");
    }

    def deployExampleActivitiProcesses() {
        println("Importing example BPM process definitions.")
        def resourceFolder = grailsApplication.mainContext.getResource("resources/activiti/processes").getFile();
        resourceFolder.eachFileMatch(~/.*.bpmn/) {  bpmFile ->
            println("   --> Importing BPM file: ${bpmFile}");

            Deployment d = repositoryService.createDeployment()
                    .addString(bpmFile.absolutePath, bpmFile.text)
                    .deploy();
        }

        println("Deployments Complete!");

    }

    /**
     * Create all the initial data necessary to get an admin to be able to log into chart review, if the admin does not already exist.
     *
     * @param springSecurityService
     * @return
     */
    def createInitialUsersRolesAndProjectsIfNecessary() {

        List<User> users = User.findAll().unique();
        if(users.size() == 0)
        {
            User globalAdmin = new User(id: UUID.randomUUID().toString(),
                    username: "admin",
                    password: springSecurityService.encodePassword("admin"),
                    accountNonExpired: true,
                    accountNonLocked: true,
                    credentialsNonExpired: true,
                    enabled: true).
                    save(flush: true, failOnError: true);

            Role adminRole = new Role(id: UUID.randomUUID().toString(), name: "ROLE_ADMIN");
            adminRole.save(flush: true, failOnError: true);
            Role userRole = new Role(id: UUID.randomUUID().toString(), name: "ROLE_USER");
            userRole.save(flush: true, failOnError: true);

            Project chartReviewProject = new Project(id: UUID.randomUUID().toString(), name: "ChartReview", description: "Test Description", jdbcDriver: "com.mysql.jdbc.Driver", databaseConnectionUrl: "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8", jdbcPassword: "passw0rd", jdbcUsername: "chartreview");
            chartReviewProject.save(flush: true, failOnError: true);

            UserProjectRole ur = new UserProjectRole(id: UUID.randomUUID().toString(), user: globalAdmin, role: adminRole, project: chartReviewProject);
            ur.save(flush: true, failOnError: true);
            globalAdmin.setAuthorities([ur]);
            globalAdmin.save(flush: true, failOnError: true);
        }
    }

    /**
     * Create all the initial data necessary to get an admin to be able to log into chart review, if the admin does not already exist.
     *
     * @param springSecurityService
     * @return
     */
    def migrateAttributeDefMinDates() {
        AttributeDef.findAll().each { AttributeDef ad ->
            Date minDate = new Date();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            try
            {
                minDate = sdf.parse("0002-01-01 00:00:00");
            }
            catch(Exception e)
            {
                // Do nothing
            }
            if(ad.getMinDate().getTime() < minDate.getTime())
            {
                ad.setMinDate(minDate);
            }
            ad.save(flush: true, failOnError: true);
        }
    }
}
