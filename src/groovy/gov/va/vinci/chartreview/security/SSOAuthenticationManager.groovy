package gov.va.vinci.chartreview.security

import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken

import java.security.Principal

/**
 * Created by ryancornia on 9/19/14.
 *
 * Fills in a pre-authentication token with roles.
 */
class SSOAuthenticationManager implements AuthenticationManager {
    @Override
    Authentication authenticate(Authentication authentication) throws AuthenticationException {

        PreAuthenticatedAuthenticationToken authenticatedAuthenticationToken =
                new PreAuthenticatedAuthenticationToken(authentication.principal,
                                                        authentication.credentials,
                                                        getAuthorities(authentication.principal.username));

        return authenticatedAuthenticationToken;
    }

    private List<UserProjectRole> getAuthorities(String username) {
        User user = null;
        List<UserProjectRole> roles = null;
        User.withTransaction { status ->
            user = User.findByUsername(username)

            if (user) {
                roles = UserProjectRole.findAllByUser(user);
            }
        }
        return roles;
    }
}
