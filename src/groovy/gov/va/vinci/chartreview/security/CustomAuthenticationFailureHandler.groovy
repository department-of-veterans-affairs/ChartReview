package gov.va.vinci.chartreview.security

import org.springframework.security.authentication.DisabledException
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler

import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

/**
 * Created by ryancornia on 5/9/14.
 */
class CustomAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        super.onAuthenticationFailure(request, response, exception);
        if(exception.getClass().isAssignableFrom(UsernameNotFoundException.class)) {
            println("BAD_CREDENTIAL");
        } else if (exception.getClass().isAssignableFrom(DisabledException.class)) {
            println("USER_DISABLED");
        }
    }
}
