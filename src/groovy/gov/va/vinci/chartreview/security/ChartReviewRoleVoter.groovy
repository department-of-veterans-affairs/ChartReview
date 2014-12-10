package gov.va.vinci.chartreview.security

import gov.va.vinci.chartreview.model.User
import org.springframework.security.access.AccessDecisionVoter
import org.springframework.security.access.ConfigAttribute
import org.springframework.security.access.vote.RoleVoter
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.web.context.request.RequestAttributes
import org.springframework.web.context.request.RequestContextHolder

public class ChartReviewRoleVoter extends RoleVoter {

    @Override
    public int vote(Authentication authentication, Object object, Collection<ConfigAttribute> attributes) {

        int result = AccessDecisionVoter.ACCESS_ABSTAIN;
        Collection<? extends GrantedAuthority> authorities = extractAuthorities(authentication);
        RequestAttributes request = RequestContextHolder.currentRequestAttributes();

        /** Occurs BEFORE the user has authenticated to the system. **/
        if (authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            return result;
        }

        if (authentication.getPrincipal() instanceof User) {
            User u = (User)authentication.getPrincipal();

            List<String> stringAuthorities = u.stringAuthorities();
            attributes.each { attribute ->
                if (stringAuthorities.contains(attribute.getAttribute())) {
                    return ACCESS_GRANTED;
                }
            }
        }

        return result;
    }

    Collection<? extends GrantedAuthority> extractAuthorities(Authentication authentication) {
        return authentication.getAuthorities();
    }

}
