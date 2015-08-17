package gov.va.vinci.chartreview.security

import gov.va.vinci.chartreview.model.User
import gov.va.vinci.chartreview.model.UserProjectRole
import grails.plugin.springsecurity.userdetails.GrailsUserDetailsService
import org.springframework.dao.DataAccessException
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException


/**
 * Custom user details service to get the correct user model object and return it to spring from the database.
 *
 */
class ChartReviewUserDetailsService  implements GrailsUserDetailsService {

    @Override
    UserDetails loadUserByUsername(String username, boolean loadRoles) throws UsernameNotFoundException, DataAccessException {
        return loadUserByUsername(username);
    }

    @Override
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User.withTransaction { status ->
            User user = User.findByUsername(username)

            List<UserProjectRole> roles = UserProjectRole.findAllByUser(user);

            user.setAuthorities(roles);

            if (!user) throw new UsernameNotFoundException('User not found', username)
            return user;
        }
    }
}
