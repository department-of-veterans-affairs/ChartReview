package gov.va.vinci.chartreview.db

import com.thedeanda.lorem.Lorem
import gov.va.vinci.chartreview.model.Project
import gov.va.vinci.chartreview.model.Role
import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import gov.va.vinci.chartreview.model.schema.AnnotationSchema
import gov.va.vinci.chartreview.model.schema.AttributeDef
import gov.va.vinci.chartreview.model.schema.AttributeDefOptionDef
import gov.va.vinci.chartreview.model.schema.ClassDef
import gov.va.vinci.example.model.Lab
import gov.va.vinci.example.model.LabTestLookup
import gov.va.vinci.example.model.Patient
import gov.va.vinci.example.model.TIUDocument
import gov.va.vinci.siman.model.ClinicalElementConfiguration
import org.activiti.engine.identity.Group

import java.text.SimpleDateFormat

class ExampleDataUtils {

    /**
     * Create default user and roles.
     *
     * @param springSecurityService
     * @return
     */
    public static  List createUsersAndRoles(def springSecurityService) {
        User globalAdmin = new User(id: UUID.randomUUID().toString(),
                username: "admin",
                password: springSecurityService.encodePassword("admin"),
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true).
                save(flush: true, failOnError: true);

        User project1User = new User(id: UUID.randomUUID().toString(),
                username: "project1",
                password: springSecurityService.encodePassword("project1"),
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true).
                save(flush: true, failOnError: true);

        User project2User = new User(id: UUID.randomUUID().toString(),
                username: "project2",
                password: springSecurityService.encodePassword("project2"),
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true).
                save(flush: true, failOnError: true);

        User noproject = new User(id: UUID.randomUUID().toString(),
                username: "noproject",
                password: springSecurityService.encodePassword("noproject"),
                accountNonExpired: true,
                accountNonLocked: true,
                credentialsNonExpired: true,
                enabled: true).
                save(flush: true, failOnError: true);

        Role r = new Role(id: UUID.randomUUID().toString(), name: "ROLE_ADMIN");
        r.save(flush: true, failOnError: true);
        [globalAdmin, r, project1User, project2User]
    }

    public static void createActivitiUsersAndGroups(def activitiUserService) {
        Group g = activitiUserService.identityService.newGroup("user");
        g.setName("User");
        g.setType('security-role');
        activitiUserService.identityService.saveGroup(g);
        Group g2 = activitiUserService.identityService.newGroup("admin");
        g2.setName("Admin");
        g2.setType('security-role');
        activitiUserService.identityService.saveGroup(g2);
        activitiUserService.createUser("admin", "admin");
        activitiUserService.createUser("project1", "project1");
        activitiUserService.createUser("project2", "project2");
        activitiUserService.createUser("noproject", "noproject");
        activitiUserService.identityService.createMembership("admin", "user");
        activitiUserService.identityService.createMembership("admin", "admin");
        activitiUserService.identityService.createMembership("project1", "user");
        activitiUserService.identityService.createMembership("project2", "user");
        activitiUserService.identityService.createMembership("noproject", "user");
    }

    static public void createSamplePatientsLabsAndTIUDocuments() {
        LabTestLookup pulse = new LabTestLookup(labDescription: "Patient pulse at resting.", labName: "Pulse");
        pulse.save(flush: true, failOnError: true);

        LabTestLookup albumin = new LabTestLookup(labDescription: "Patient albumin level.", labName: "Albumin");
        albumin.save(flush: true, failOnError: true);

        LabTestLookup ast = new LabTestLookup(labDescription: "Patient Aspartate transaminase level.", labName: "AST");
        ast.save(flush: true, failOnError: true);

        LabTestLookup bp = new LabTestLookup(labDescription: "Blood pressure ", labName: "BP");
        bp.save(flush: true, failOnError: true);

        Patient patient1 = Patient.build(id: 1, name: Lorem.name, ssn: '123-45-6789').save(flush: true, failOnError: true);
        Patient patient2 = Patient.build(id: 2, name: Lorem.name, ssn: '123-45-6789').save(flush: true, failOnError: true);

        SimpleDateFormat formatter = new SimpleDateFormat("MM/dd/yyyy HH:mm");


        Lab.build(patient: patient1, labPerformedBy: "Doctor Who 1", labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 22:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('10/01/2006 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 22:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 22:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2006 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2006 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 22:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('08/01/2006 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2007 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('09/01/2002 22:00'),  labPerformed: pulse, result: "80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2010 08:00'),  labPerformed: pulse, result: "83").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: pulse, result: "65").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: pulse, result: "71").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2006 22:00'),  labPerformed: bp, result: "120 / 80").save(flush: true, failOnError: true);

        Lab.build(patient: patient1, labPerformedBy: "Doctor Who 1", labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 22:00'),  labPerformed: ast, result: "900").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.1").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('10/01/2006 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: ast, result: "1300").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 22:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "880").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "990").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "600").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: ast, result: "1000").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 22:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient1, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2006 08:00'),  labPerformed: ast, result: "900").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: albumin, result: "3.2").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "880").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2006 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "1050").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: albumin, result: "3.5").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: ast, result: "900").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('11/01/2002 08:00'),  labPerformed: albumin, result: "2.5").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 22:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: albumin, result: "2.9").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2010 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: ast, result: "900").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('07/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('08/01/2006 08:00'),  labPerformed: ast, result: "1200").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 22:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: ast, result: "800").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2007 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2002 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2002 08:00'),  labPerformed: ast, result: "900").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('09/01/2002 22:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2010 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2006 08:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('12/01/2002 08:00'),  labPerformed: albumin, result: "2.8").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('06/01/2007 08:00'),  labPerformed: albumin, result: "3.0").save(flush: true, failOnError: true);
        Lab.build(patient: patient2, labPerformedBy: 'Doctor Who 1', labDate: formatter.parse('02/01/2006 22:00'),  labPerformed: ast, result: "1100").save(flush: true, failOnError: true);

        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('06/01/2013 08:00'), title: 'Psych H&P - 1', documentText: '<b>HISTORY:</b></b>Patient was asked about alcohol use and said he was charged with a DUI two years ago and since then had "drastically reduced" his ETOH consumption.   Reported he occasionally drank after work, but denied any problems because of it.  His wife became angry and interjected at that point, saying that her husband was lying, that he drank nightly, and had been late to work several times in the past month due to hangovers.  His lateness was becoming a problem and his supervisor had given him a warning this past week.    Patient\'s wife said she was worried he would be written-up or fired if it happened again.   When I asked the patient if he had similar concerns about his drinking, he became tearful and said that he had tried to stop drinking, but each time he tried, he felt nauseated and shaky unless he had more to drink.  He said he hid a bottle of vodka in his garage and was lately drinking a shot or two before leaving for work each morning. He said that made it so he could get through the morning without shaking and throwing up.<br/>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2007 10:00'), title: 'Psychiatric History', documentText: '<b>HIST:</b></b>Patient says he nearly hit someone on a jet ski while piloting a boat on an outing with friends a few weeks ago.  When questioned further, he said he had consumed "three of four beers" prior to the incident, but didn\'t think that had anything to do with the near miss.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 1  ', documentText: '<b>HISTORY:</b></b>When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 2  ', documentText: '<b>HISTORY:</b></b>When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('07/01/2012 18:00'), title: 'Physical Exam', documentText: 'Patient\'s favorite nephew wants him to attend his wedding next month.  Patient says he doesn\'t think he will go because he knows alcohol won\'t be served at the wedding reception due to the family\'s religious beliefs and doesn\'t want to go that long without a drink.  <br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('06/01/2002 08:00'), title: 'Psych H&P - 1', documentText: '<b>HISTORY:</b></b>Patient was asked about alcohol use and said he was charged with a DUI two years ago and since then had "drastically reduced" his ETOH consumption.   Reported he occasionally drank after work, but denied any problems because of it.  His wife became angry and interjected at that point, saying that her husband was lying, that he drank nightly, and had been late to work several times in the past month due to hangovers.  His lateness was becoming a problem and his supervisor had given him a warning this past week.    Patient\'s wife said she was worried he would be written-up or fired if it happened again.   When I asked the patient if he had similar concerns about his drinking, he became tearful and said that he had tried to stop drinking, but each time he tried, he felt nauseated and shaky unless he had more to drink.  He said he hid a bottle of vodka in his garage and was lately drinking a shot or two before leaving for work each morning. He said that made it so he could get through the morning without shaking and throwing up.<br/>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2007 10:00'), title: 'Psychiatric History', documentText: '<b>HIST:</b></b>Patient says he nearly hit someone on a jet ski while piloting a boat on an outing with friends a few weeks ago.  When questioned further, he said he had consumed "three of four beers" prior to the incident, but didn\'t think that had anything to do with the near miss.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 1  ', documentText: '<b>HISTORY:</b></b>When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('08/01/2002 18:00'), title: 'Physical Exam', documentText: 'Patient\'s favorite nephew wants him to attend his wedding next month.  Patient says he doesn\'t think he will go because he knows alcohol won\'t be served at the wedding reception due to the family\'s religious beliefs and doesn\'t want to go that long without a drink.  <br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('09/01/2013 08:00'), title: 'Psych H&P - 1', documentText: '<b>HISTORY:</b>Patient was asked about alcohol use and said he was charged with a DUI two years ago and since then had "drastically reduced" his ETOH consumption.   Reported he occasionally drank after work, but denied any problems because of it.  His wife became angry and interjected at that point, saying that her husband was lying, that he drank nightly, and had been late to work several times in the past month due to hangovers.  His lateness was becoming a problem and his supervisor had given him a warning this past week.    Patient\'s wife said she was worried he would be written-up or fired if it happened again.   When I asked the patient if he had similar concerns about his drinking, he became tearful and said that he had tried to stop drinking, but each time he tried, he felt nauseated and shaky unless he had more to drink.  He said he hid a bottle of vodka in his garage and was lately drinking a shot or two before leaving for work each morning. He said that made it so he could get through the morning without shaking and throwing up.<br/>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2007 10:00'), title: 'Psychiatric History', documentText: '<b>HIST:</b>Patient says he nearly hit someone on a jet ski while piloting a boat on an outing with friends a few weeks ago.  When questioned further, he said he had consumed "three of four beers" prior to the incident, but didn\'t think that had anything to do with the near miss.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 1  ', documentText: '<b>HISTORY:</b>When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/1011 18:00'), title: 'Physical Exam', documentText: '<b>HISTORY:</b>Patient\'s favorite nephew wants him to attend his wedding next month.  Patient says he doesn\'t think he will go because he knows alcohol won\'t be served at the wedding reception due to the family\'s religious beliefs and doesn\'t want to go that long without a drink.  <br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('06/01/2013 08:00'), title: 'Psych H&P - 1', documentText: '<b>HISTORY:</b>Patient was asked about alcohol use and said he was charged with a DUI two years ago and since then had "drastically reduced" his ETOH consumption.   Reported he occasionally drank after work, but denied any problems because of it.  His wife became angry and interjected at that point, saying that her husband was lying, that he drank nightly, and had been late to work several times in the past month due to hangovers.  His lateness was becoming a problem and his supervisor had given him a warning this past week.    Patient\'s wife said she was worried he would be written-up or fired if it happened again.   When I asked the patient if he had similar concerns about his drinking, he became tearful and said that he had tried to stop drinking, but each time he tried, he felt nauseated and shaky unless he had more to drink.  He said he hid a bottle of vodka in his garage and was lately drinking a shot or two before leaving for work each morning. He said that made it so he could get through the morning without shaking and throwing up.<br/>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('11/01/2007 10:00'), title: 'Psychiatric History', documentText: '<b>HIST:</b>Patient says he nearly hit someone on a jet ski while piloting a boat on an outing with friends a few weeks ago.  When questioned further, he said he had consumed "three of four beers" prior to the incident, but didn\'t think that had anything to do with the near miss.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 1  ', documentText: '<b>HISTORY:</b></b>When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2002 18:00'), title: 'Physical Exam', documentText: '</b>Patient\'s favorite nephew wants him to attend his wedding next month.  Patient says he doesn\'t think he will go because he knows alcohol won\'t be served at the wedding reception due to the family\'s religious beliefs and doesn\'t want to go that long without a drink.  <br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('03/01/2011 08:00'), title: 'Psych H&P - 1', documentText: '<b>HISTORY:</b></b>Patient was asked about alcohol use and said he was charged with a DUI two years ago and since then had "drastically reduced" his ETOH consumption.   Reported he occasionally drank after work, but denied any problems because of it.  His wife became angry and interjected at that point, saying that her husband was lying, that he drank nightly, and had been late to work several times in the past month due to hangovers.  His lateness was becoming a problem and his supervisor had given him a warning this past week.    Patient\'s wife said she was worried he would be written-up or fired if it happened again.   When I asked the patient if he had similar concerns about his drinking, he became tearful and said that he had tried to stop drinking, but each time he tried, he felt nauseated and shaky unless he had more to drink.  He said he hid a bottle of vodka in his garage and was lately drinking a shot or two before leaving for work each morning. He said that made it so he could get through the morning without shaking and throwing up.<br/>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2007 10:00'), title: 'Psychiatric History', documentText: '<b>HIST:</b>Patient says he nearly hit someone on a jet ski while piloting a boat on an outing with friends a few weeks ago.  When questioned further, he said he had consumed "three of four beers" prior to the incident, but didn\'t think that had anything to do with the near miss.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('10/01/2005 03:00'), title: 'Psych H&P - 1  ', documentText: 'When asked if he thought he might have a problem with alcohol, the patient said that, compared to his friends, he didn\'t think so.   He reported he could drink a 6-pack in a few hours without getting a buzz; something his friends couldn\'t do.  He said his friends often comment on how well he holds his liquor.<br>').save(flush: true, failOnError: true);
        TIUDocument.build(patient: patient1, physician: 'Doctor Who 1', documentDate: formatter.parse('01/01/2002 18:00'), title: 'Physical Exam', documentText: '<b>HISTORY:</b>Patient\'s favorite nephew wants him to attend his wedding next month.  Patient says he doesn\'t think he will go because he knows alcohol won\'t be served at the wedding reception due to the family\'s religious beliefs and doesn\'t want to go that long without a drink.  <br>').save(flush: true, failOnError: true);
    }

    static public void createProjectAndUserProjectRoles(User globalAdmin, Role r, User project1User, User project2User,
                                                    ClinicalElementConfiguration labClinicalElementConfiguration,
                                                    ClinicalElementConfiguration tiuClinicalElementConfiguration,
                                                    ClinicalElementConfiguration patientClinicalElementConfiguration) {
        Project chartReviewProject = new Project(id: '056fb6c9-bf16-4c07-a89c-e7c0328bc341', name: "ChartReview", description: "Test Description", jdbcDriver: "com.mysql.jdbc.Driver", databaseConnectionUrl: "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8", jdbcPassword: "", jdbcUsername: "sa");
        chartReviewProject.save(flush: true, failOnError: true);

        Project project1 = new Project(id: '1', name: "p1", description: "Test Project 1", jdbcDriver: "com.mysql.jdbc.Driver", databaseConnectionUrl: "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8", jdbcPassword: "", jdbcUsername: "sa");
        project1.clinicalElementConfigurations = new ArrayList<ClinicalElementConfiguration>();
        project1.clinicalElementConfigurations.add(patientClinicalElementConfiguration);
        project1.clinicalElementConfigurations.add(tiuClinicalElementConfiguration);
        project1.clinicalElementConfigurations.add(labClinicalElementConfiguration);
        project1.save(flush: true, failOnError: true);

        Project project2 = new Project(id: '2', name: "p2", description: "Test Project 2", jdbcDriver: "com.mysql.jdbc.Driver", databaseConnectionUrl: "jdbc:mysql://localhost/chartreview?useUnicode=yes&characterEncoding=UTF-8", jdbcPassword: "", jdbcUsername: "sa");
        project2.clinicalElementConfigurations = new ArrayList<ClinicalElementConfiguration>();
        project2.clinicalElementConfigurations.add(patientClinicalElementConfiguration);
        project2.save(flush: true, failOnError: true);

        UserProjectRole ur = new UserProjectRole(id: UUID.randomUUID().toString(), user: globalAdmin, role: r, project: chartReviewProject);
        ur.save(flush: true, failOnError: true);
        globalAdmin.setAuthorities([ur]);

        UserProjectRole project1UserRole = new UserProjectRole(id: UUID.randomUUID().toString(), user: project1User, role: r, project: project1);
        project1UserRole.save(flush: true, failOnError: true);
        project1User.setAuthorities([project1UserRole]);

        UserProjectRole project1UserRole2 = new UserProjectRole(id: UUID.randomUUID().toString(), user: project2User, role: r, project: project1);
        project1UserRole2.save(flush: true, failOnError: true);
        project2User.setAuthorities([project1UserRole2]);

        UserProjectRole project2UserRole = new UserProjectRole(id: UUID.randomUUID().toString(), user: project2User, role: r, project: project2);
        project2UserRole.save(flush: true, failOnError: true);
        project2User.setAuthorities([project2UserRole]);
    }


    static public void createExampleSchema() {
        AnnotationSchema existing = AnnotationSchema.get("104");

        if (existing) {
            println("Exisitng AQUAL schema (104), deleting....");
            existing.delete(flush:true);
        } else {
            println("No existing AQUAL Schema....");
        }

        AnnotationSchema s = new AnnotationSchema("104", "AQUAL");
        s.setDescription("AQUAL Schema");

        AttributeDef attribute116 = new AttributeDef(id: "116", type: 0, name: "Type of Assessment", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00", color: "0xff9999");
        s.addAttributeDef(attribute116);

        AttributeDef attribute113 = new AttributeDef(id: "113", type: 2, name: "Self Assessment", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00", color: "0x99ffcc");
        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "200", name: "Denies Alcohol Use"));
        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "115", name: "Denies Social Consequence"));
        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "114", name: "Denies Physical Impact"));
        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "201", name: "Drinks Within Limits"));
        s.addAttributeDef(attribute113);

        AttributeDef attribute221244 = new AttributeDef(id: "221244", type: 0, name: "Comments", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
        s.addAttributeDef(attribute221244);

        ClassDef def112 = new ClassDef(id: "112", name: "Structured Clinical Assessment", color: "0x00ffff");
        def112.getAttributeDefs().add(attribute116);
        def112.getAttributeDefs().add(attribute221244);
        s.addClassDef(def112);

        ClassDef def110 = new ClassDef(id: "110", name: "Social Impact", color: "0x9933cc");
        def110.getAttributeDefs().add(attribute113);
        def110.getAttributeDefs().add(attribute221244);
        s.addClassDef(def110);

        ClassDef def111 = new ClassDef(id: "111", name: "Physical Impact", color: "0xffff33");
        def111.getAttributeDefs().add(attribute113);
        def111.getAttributeDefs().add(attribute221244);
        s.addClassDef(def111);

        ClassDef def221242= new ClassDef(id: "221242", name: "Follow-up Assessment", color: "0x00ff00");
        def221242.getAttributeDefs().add(attribute116);
        def221242.getAttributeDefs().add(attribute221244);
        s.addClassDef(def221242);

//        AnnotationSchema s = new AnnotationSchema("104", "MUS");
//        s.setDescription("Medically Unexplained Syndrome");
//
//        AttributeDef attribute116 = new AttributeDef(id: "116", type: 3, name: "Persistence", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00", color: "0xff9999");
//        attribute116.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "118", name: "False"));
//        attribute116.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "117", name: "True"));
//        s.addAttributeDef(attribute116);
//
//        AttributeDef attribute113 = new AttributeDef(id: "113", type: 3, name: "Explanability", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00", color: "0x99ffcc");
//        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "115", name: "Inconsistent with unexplained"));
//        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "114", name: "Diagnosed as functiona/unknown"));
//        attribute113.addAttributeDefOptionDefs(new AttributeDefOptionDef(id: "221243", name: "Unexplained"));
//        s.addAttributeDef(attribute113);
//
//        AttributeDef attribute284354 = new AttributeDef(id: "284354", type: 0, name: "cuis", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute284354);
//        AttributeDef attribute284355 = new AttributeDef(id: "284355", type: 0, name: "contextLeft", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute284355);
//        AttributeDef attribute284356 = new AttributeDef(id: "284356", type: 0, name: "contextRight", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute284356);
//        AttributeDef attribute407043 = new AttributeDef(id: "407043", type: 0, name: "organSystem", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute407043);
//
//        AttributeDef attribute221244 = new AttributeDef(id: "221244", type: 0, name: "Comments", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute221244);
//        AttributeDef attribute407042 = new AttributeDef(id: "407042", type: 0, name: "semanticCategories", numericHigh: 9.99999999999999E11, numericLow: 0.0,minDate:"0000-01-01 00:00:00",maxDate:"9999-01-01 00:00:00");
//        s.addAttributeDef(attribute407042);
//
//        ClassDef def112 = new ClassDef(id: "112", name: "Chronic Fatigue Syndrome", color: "0x00ffff");
//        def112.getAttributeDefs().add(attribute221244);
//        s.addClassDef(def112);
//
//        ClassDef def110 = new ClassDef(id: "110", name: "Fibromyalgia", color: "0x00ffff");
//        def110.getAttributeDefs().add(attribute221244);
//        s.addClassDef(def110);
//
//        ClassDef def111 = new ClassDef(id: "111", name: "Irritable Bowel Syndrome", color: "0x9933cc");
//        def111.getAttributeDefs().add(attribute221244);
//        s.addClassDef(def111);
//
//        ClassDef def221242= new ClassDef(id: "221242", name: "Evidence of Persistence", color: "0xffff33");
//        def221242.getAttributeDefs().add(attribute221244);
//        s.addClassDef(def221242);
//
//        ClassDef def106 = new ClassDef(id: "106", name: "Evidence of Explainability", color: "0x00ff00");
//        def106.getAttributeDefs().add(attribute221244);
//        s.addClassDef(def106);
//
//        ClassDef def105 = new ClassDef(id: "105", name: "Symptom", color: "0x999999");
//        def105.getAttributeDefs().add(attribute221244);
//        def105.getAttributeDefs().add(attribute284354);
//        def105.getAttributeDefs().add(attribute116);
//        def105.getAttributeDefs().add(attribute113);
//        def105.getAttributeDefs().add(attribute284355);
//        def105.getAttributeDefs().add(attribute284356);
//        def105.getAttributeDefs().add(attribute407043);
//        def105.getAttributeDefs().add(attribute407042);
//        s.addClassDef(def105);

        s.save(flush: true, failOnError: true);
        println("...AQUAL Schema created.");
    }
}
