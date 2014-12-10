package chartreview

import gov.va.vinci.chartreview.model.User
import grails.plugin.gson.converters.GSON
import org.springframework.dao.DataIntegrityViolationException

class UserController {
     def springSecurityService;
    static allowedMethods = [save: "POST", update: "POST", delete: "POST"]

    def index() {
        redirect(action: "list", params: params)
    }

    def list() {
        int max = 10;
        if (!params.sort) {
            params.sort = "username";
        }

        Integer offset = 0;
        if (params.offset ) {offset  = Integer.parseInt(params.offset)};

        if (params.max ) {max  = Integer.parseInt(params.max)};

        if (!max) {
            max = 10;
        }
        List<User> users = User.findAll().unique().sort{ it.getProperties().get(params.sort)};

        if ("desc" == params.order) {
            users = users.reverse();
        }

        if (offset > users.size()) {
            offset = users.size();
        }

        max = max + offset;
        if (max > users.size()) {
            max = users.size();
        }

        [userInstanceList: users.subList(offset, max), userInstanceTotal: User.count()]
    }

    def create() {
        User user = new User(params);

        user.accountNonExpired = true;
        user.accountNonLocked = true;
        user.credentialsNonExpired = true;
        user.enabled = true;

        [userInstance: user]
    }

    def save() {
        def userInstance = new User(params);
        userInstance.clearErrors();

        boolean validationResult = userInstance.validate();

        if (!validationResult || !validate(params, userInstance, true)) {
            render(view: "create", model: [userInstance: userInstance])
            return
        }

        userInstance.password =  springSecurityService.encodePassword(params.password)
        userInstance.id = UUID.randomUUID().toString();

        if (!userInstance.save(flush: true)) {
            render(view: "create", model: [userInstance: userInstance])
            return
        }

        flash.message = message(code: 'default.created.message', args: [message(code: 'user.label'), userInstance.username])
        redirect(action: "show", id: userInstance.id)
    }

    def update(String id, Long version) {
        User userInstance = User.get(id)
        if (!userInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'user.label'), id])
            redirect(action: "list")
            return
        }

        if (version != null) {
            if (userInstance.version > version) {
                userInstance.errors.rejectValue("version", "default.optimistic.locking.failure",
                        [message(code: 'user.label')] as Object[],
                        "Another user has updated this User while you were editing")
                render(view: "edit", model: [userInstance: userInstance])
                return
            }
        }

        String originalPassword = userInstance.password;
        userInstance.properties = params
        userInstance.clearErrors();

        boolean validated = true;
        if (userInstance.password) {
            // Validate pass/confirm match.
            validated = validate(params, userInstance, true);
            if (validated) {
                userInstance.password = springSecurityService.encodePassword(params.password)
            }
        } else {
            validated = validate(params, userInstance, false);

            if (validated) {
                // Empty password, set it to the old one.
                userInstance.password = originalPassword;
            }
        }

        //  See if validateAndSetProperties password or user instance validation failed. If so, redirect back.
        if (!validated || !userInstance.validate()) {
            render(view: "edit", model: [userInstance: userInstance.refresh()])
            return
        }

        if (!userInstance.save(flush: true)) {
            render(view: "edit", model: [userInstance: userInstance.refresh()])
            return
        }

        flash.message = message(code: 'default.updated.message', args: [message(code: 'user.label'), userInstance.username])
        redirect(action: "show", id: userInstance.id)
    }

    def show(String id) {
        def userInstance = User.get(id)
        if (!userInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'user.label'), id])
            redirect(action: "list")
            return
        }

        [userInstance: userInstance]
    }

    def edit(String id) {
        def userInstance = User.get(id)
        if (!userInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'user.label'), id])
            redirect(action: "list")
            return
        }

        [userInstance: userInstance]
    }



    def delete(String id) {
        def userInstance = User.get(id)
        if (!userInstance) {
            flash.message = message(code: 'default.not.found.message', args: [message(code: 'user.label'), id])
            redirect(action: "list")
            return
        }

        try {
            userInstance.delete(flush: true)
            flash.message = message(code: 'default.deleted.message', args: [message(code: 'user.label'), id])
            redirect(action: "list")
        }
        catch (DataIntegrityViolationException e) {
            flash.message = message(code: 'default.not.deleted.message', args: [message(code: 'user.label'), id])
            redirect(action: "show", id: id)
        }
    }


    def ajaxFindUsers = {
        log.debug "Find User :${params.term}"

        def foundUsers = User.withCriteria {
            ilike 'username', '%' + params.term + '%'
            setResultTransformer org.hibernate.Criteria.DISTINCT_ROOT_ENTITY
        }

        render (foundUsers?.'username' as GSON)
    }



    private boolean validate(def params, User userInstance, boolean validatePassword)
    {
        boolean returnValue = true;
        if (validatePassword) {
            if (!params.password.equals(params.confirmPassword)) {
                // The following helps with field highlighting in your view
                userInstance.errors.rejectValue(
                        'password',
                        'password.cofirm.dont.match')
                returnValue = false;
            }
        }

        /**
         * Validate user is unique.
         */
        User existingUser = User.findByUsername(params.username);

        if(existingUser && existingUser.id != userInstance.id) {
            userInstance.errors.rejectValue(
                    'username',
                    'username.already.exists')
            returnValue = false;
        }

        return returnValue;
    }

}
