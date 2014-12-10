package gov.va.vinci.example.model

class Lab {

    Date labDate;
    String description;
    String labPerformedBy;
    String result;
    LabTestLookup labPerformed;
    Patient patient;

    static constraints = {
    }
}
