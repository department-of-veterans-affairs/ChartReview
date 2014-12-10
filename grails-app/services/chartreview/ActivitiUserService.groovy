package chartreview

import org.activiti.engine.identity.Group
import org.activiti.engine.identity.User
import org.springframework.context.ApplicationContext
import org.springframework.context.ApplicationContextAware

class ActivitiUserService implements ApplicationContextAware {
    ApplicationContext applicationContext

    static transactional = true
    def identityService;

    /**
     * Create a user in the Activiti identity service.
     * @param username the username to create.
     * @param password the password for the new user being created.
     */
    public void createUser(String username, String password) {
        User user = identityService.newUser(username);
        user.setPassword(password);
        identityService.saveUser(user);
    }

    /**
     * Create a user in the Activiti identity service.  The password
     * is set as just a random guid.
     *
     * @param username the username to create.
     */
    public void createUser(String username) {
        createUser(username, "" + UUID.randomUUID());
    }

    /**
     * Creates (or updates) an Activiti user group with a list of users.
     * @param groupId the group id to create or update if it already exists
     * @param userIdsForGroup the user ids that make up the group. If the
     *  group already exists, users not in this list will be removed.
     */
    public void createOrUpdateGroup(String groupId, List<String> userIdsForGroup) {
        Long startTime = System.currentTimeMillis();
        Group g = identityService.createGroupQuery().groupId(groupId).singleResult();
        if (g == null) {
            log.debug("Creating new group: " + groupId);
            g = identityService.newGroup(groupId);
            g.setName(groupId);
            g.setType("assignment");
            identityService.saveGroup(g);
        }

        // Remove existing processUsers.
        List<User> users = identityService.createUserQuery().memberOfGroup(groupId).list();
        for (User u: users) {
            log.debug("Removing user: ${u.id} from group: ${groupId}.");
            identityService.deleteMembership(u.id, groupId);
        }

        // Add new processUsers.
        for (String u: userIdsForGroup) {
            log.debug("Adding user: ${u} to group: ${groupId}.");
            identityService.createMembership(u, groupId);
        }

        log.debug("createOrUpdateGroup took: " + (System.currentTimeMillis() - startTime) + " ms.");
    }

    /**
     * Find the acitivi user.
     * @param userId the username to lookup.
     * @return the user object, or null if no user exists.
     */
    public User findUser(String userId) {
        return identityService.createUserQuery().userId(userId).singleResult();
    }

    /**
     * Given a username and key, get the value for that user/key.
     * @param userId
     * @param key
     * @return the value of that key for the user
     */
    public String getUserInfo(java.lang.String userId, java.lang.String key) {
        return this.identityService.getUserInfo(userId, key);
    }

    /**
     * Given a username and key, set the value for that user/key.
     * @param userId
     * @param key
     * @param value the value to set for the key for the user
     */
    public void setUserInfo(java.lang.String userId, java.lang.String key, String value) {
        this.identityService.setUserInfo(userId, key, value);
    }

    /**
     * Query activiti for all user ordered by userId
     * @return the list of all processUsers ordered by userId
     */
    public List<User> getAllUsers() {
        return identityService.createUserQuery().orderByUserId().asc().list();
    }

    /**
     * Query activiti for all groups ordered by groupId
     * @return the list of all groups ordered by userId
     */
    public List<Group> getAllGroups() {
        return identityService.createGroupQuery().orderByGroupId().asc().list();
    }

    /**
     * Query activiti for all groups ordered by groupId
     * @return the list of all groups ordered by userId
     */
    public List<Group> getAssignmentGroups() {
        return identityService.createGroupQuery().groupType("assignment").orderByGroupName().asc().list();
    }
}
