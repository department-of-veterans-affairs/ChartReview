package gov.va.vinci.chartreview

/**
 * An enum for keeping variables names that are set in activiti so they can be referenced in java code in
 * a compile time safe way.
 *
 */
public enum ProcessVariablesEnum {
    /**
     * A display name to show to the user.
     */
    DISPLAY_NAME("displayName"),
    /**
     * This is the activiti process id.
     */
    PROCESS_ID("processId"),
    /**
     * This is the user defined group, which gets stored in the clinical_element.group table. This allows
     * scoping of clinical elements at a more granular level.
     */
    CLINICAL_ELEMENT_GROUP("clinicalElementGroup"),
    /**
     * Defines the assignment level. If process, a user gets assigned all tasks in a process when they claim the first
     * task in a process. If task level, any user can grab any single task in a process that is available.
     */
    PROCESS_OR_TASK("processOrTask"),
    /**
     * Users that are assigned to the process.
     */
    PROCESS_USERS("processUsers"),
    /**
     * The project id.
     */
    PROJECT_ID("projectId"),
    /**
     * The query used to create the process.
     */
    PROCESS_CREATION_QUERY("processCreationQuery");

    protected String name;

    public ProcessVariablesEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
