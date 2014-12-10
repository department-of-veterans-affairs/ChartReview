package gov.va.vinci.chartreview.db

import com.thedeanda.lorem.Lorem
import gov.va.vinci.example.model.Patient
import gov.va.vinci.example.model.TIUDocument
import org.apache.commons.lang.math.RandomUtils

import java.text.SimpleDateFormat

/**
 * Created by ryancornia on 3/13/14.
 */
class PatientTestDataGenerator extends BaseTestDataGenerator {
    LabTestDataGenerator labTestDataGenerator = new LabTestDataGenerator();
    SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");
    List<String> sampleTestTIUDocuments = new ArrayList<String>();

    public PatientTestDataGenerator(File testTIUDocumentDirectory) {
        testTIUDocumentDirectory.eachFileMatch(~/.*\.txt/) {
            sampleTestTIUDocuments.add(it.canonicalPath);
        }
    }

    public List<Patient> generatePatients(int numberOfPatients, int maxNumberOfLabs, int maxNumberOfTIUDocuments) {
        List<Patient> results = new ArrayList<Patient>();

        for (int i=0; i<numberOfPatients; i++) {
            String ssn = "${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}-${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}-${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}${RandomUtils.nextInt(9)}";
            Patient p = new Patient(name: Lorem.getName(), ssn: ssn);
            p.save(flush:true, failOnError: true);

            p.labs = labTestDataGenerator.generateLab(p, RandomUtils.nextInt(maxNumberOfLabs));

            int numberOfTIUDocs = RandomUtils.nextInt(maxNumberOfTIUDocuments + 1);

            for (int k=0; k < numberOfTIUDocs; k++) {
                int randomDoc = RandomUtils.nextInt(sampleTestTIUDocuments.size());
                String title = sampleTestTIUDocuments.get(randomDoc).substring(sampleTestTIUDocuments.get(randomDoc).lastIndexOf("/") + 1);
                TIUDocument doc = new TIUDocument(id: UUID.randomUUID().toString(), physician: Lorem.getName(),
                                title: title, description: "Generic description ${new Date()}",
                                documentText: new File(sampleTestTIUDocuments.get(randomDoc)).text.replaceAll("[^\\x20-\\x7e]", ""),
                                patient: p, documentDate: getRandomDate());
                    doc.save(flush: true, failOnError: true);
            }
        }
    }
}
