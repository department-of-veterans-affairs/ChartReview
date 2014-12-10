package gov.va.vinci.example.model

class TIUDocument {

    Date documentDate;
    String physician;

    String title;
    String description;
    String documentText;
    Patient patient;

    static constraints = {
    }
    static mapping = {
        table 'tiu_document'
        documentText type: 'text'
    }
}
