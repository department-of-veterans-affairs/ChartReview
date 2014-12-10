package gov.va.vinci.chartreview.security

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.ApplicationListener
import org.springframework.security.authentication.event.AuthenticationFailureCredentialsExpiredEvent

import javax.servlet.http.HttpSession

class PasswordExpiredEventHandler
        implements ApplicationListener<AuthenticationFailureCredentialsExpiredEvent> {

    @Autowired
    private HttpSession httpSession;

    void onApplicationEvent(AuthenticationFailureCredentialsExpiredEvent event) {
        httpSession.setAttribute("LAST_USERNAME", event.authentication.principal);
    }
}