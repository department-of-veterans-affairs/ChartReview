package gov.va.vinci.chartreview.db

import com.thedeanda.lorem.Lorem
import gov.va.vinci.example.model.Lab
import gov.va.vinci.example.model.LabTestLookup
import gov.va.vinci.example.model.Patient
import org.apache.commons.lang.math.RandomUtils

import java.text.SimpleDateFormat

/**
 * Created by ryancornia on 3/13/14.
 */
class LabTestDataGenerator extends BaseTestDataGenerator {

    SimpleDateFormat sdf = new SimpleDateFormat("MM/dd/yyyy");

    public List<Lab> generateLab(Patient p, int numberOfLabs) {
        List<Lab> results = new ArrayList<Lab>();

        for (int i=0; i < numberOfLabs; i++) {
            int random = RandomUtils.nextInt(4);
            switch (random) {
                case 0:
                    results.add(generateAlbumin(p));
                    break;
                case 1:
                    results.add(generateAst(p));
                    break;
                case 2:
                    results.add(generateBP(p));
                    break;
                case 3:
                    results.add(generatePulse(p));
                    break;
            }
        }

        results.each {
            it.save(flush: true, failOnError: true);
        }
    }

    protected Lab generateAlbumin(Patient p) {
        double value = (double)(RandomUtils.nextInt(20) + 34) / 10;
        return new  Lab(labDate: getRandomDate(), description: "AST Test", labPerformedBy: getRandomLabPerformedBy(),
                result: "" + value,
                labPerformed: LabTestLookup.findByLabName("Albumin"), patient: p);
    }

    protected Lab generateAst(Patient p) {
        return new Lab(labDate: getRandomDate(), description: "AST Test", labPerformedBy: getRandomLabPerformedBy(),
                result: (8 + RandomUtils.nextInt(40)).toString(),
                labPerformed: LabTestLookup.findByLabName("AST"), patient: p);
    }

    protected Lab generateBP(Patient p) {
        return new Lab(labDate: getRandomDate(), description: "Blood Pressure", labPerformedBy: getRandomLabPerformedBy(),
                result: (60 + RandomUtils.nextInt(100)).toString() + " / " + (60 + RandomUtils.nextInt(50)).toString(),
                labPerformed: LabTestLookup.findByLabName("BP"), patient: p);
    }

    protected Lab generatePulse(Patient p) {
        return new Lab(labDate: getRandomDate(), description: "Resting Pulse", labPerformedBy: getRandomLabPerformedBy(),
                        result: (60 + RandomUtils.nextInt(80)).toString(),
                        labPerformed: LabTestLookup.findByLabName("Pulse"), patient: p);
    }



    protected String getRandomLabPerformedBy() {
        return Lorem.getName();
    }
}
