package gov.va.vinci.chartreview.security

import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken

import javax.servlet.http.HttpServletRequest
import java.security.Principal

/**
 * Needs to handle SSO where the user is pre-authorized to the application, like (for instance) when using
 * integrated windows authentication and tomcat to pre-authenticate.
 *
 * Created by ryancornia on 9/19/14.
 */
class PreAuthenticationFilter extends AbstractPreAuthenticatedProcessingFilter{
    @Override
    protected Object getPreAuthenticatedPrincipal(HttpServletRequest httpServletRequest) {
        java.security.Principal principal = httpServletRequest.getUserPrincipal();

        if (!principal) {
            return null;
        }
        User u = getUser(principal);

        return u;
    }

    @Override
    protected Object getPreAuthenticatedCredentials(HttpServletRequest httpServletRequest) {
        java.security.Principal principal = httpServletRequest.getUserPrincipal();

        if (!principal) {
            return null;
        }

        User u = getUser(principal);
        if (u == null) {
            return null;
        }

        PreAuthenticatedAuthenticationToken token =
                new PreAuthenticatedAuthenticationToken(u, null, u.authorities);
        token.setAuthenticated(true);
        return token;
    }

    private User getUser(Principal principal) {
        String username = principal.getName().toLowerCase();
        if (username.contains("@")) {
            username = username.substring(0, username.indexOf("@"));
        }

        User user = null;
        User.withTransaction { status ->
            user = User.findByUsername(username)

            if (user) {
                List<UserProjectRole> roles = UserProjectRole.findAllByUser(user);
                user.authorities = roles;
            }
        }
        return user;
    }
}



