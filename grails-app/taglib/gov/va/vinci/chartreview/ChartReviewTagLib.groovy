package gov.va.vinci.chartreview

import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import grails.plugin.springsecurity.SpringSecurityService


class ChartReviewTagLib {
    SpringSecurityService springSecurityService;

    def title = { attrs, body ->
        out << "<title>ChartReview: " + body() + "</title>";
    }


    /**
     * Renders the body if any of the specified roles are granted to the user. Roles are
     * specified in the 'roles' attribute which is a comma-delimited string.
     *
     * @attr roles REQUIRED the role name(s)
     */
    def ifAnyRoleGrantedBeginsWith = { attrs, body ->

        String roles = assertAttribute('roles', attrs, 'ifAnyRoleGrantedBeginsWith')

        if (!springSecurityService.isLoggedIn()) {
            return;
        }

        User user = (User)springSecurityService.principal;
        roles.split(",").each{ roleToCheck->
            roleToCheck = roleToCheck.trim().toLowerCase();

            for (UserProjectRole auth: user.authorities) {
                if (auth.getAuthority().toLowerCase().startsWith(roleToCheck)) {
                    out << body();
                    return
                }
            }
        }
    }


    protected assertAttribute(String name, attrs, String tag) {
        if (!attrs.containsKey(name)) {
            throwTagError "Tag [$tag] is missing required attribute [$name]"
        }
        attrs.remove name
    }

}
