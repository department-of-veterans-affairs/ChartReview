package gov.va.vinci.example.model

class Patient {

    String name;
    String ssn;

    static hasMany = [labs: Lab]

    static constraints = {
        name nullable:false;
        ssn nullable: false;

    }
}
