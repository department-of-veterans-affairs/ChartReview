package chartreview

import gov.va.vinci.chartreview.model.User

class SettingsController {
    def springSecurityService;

    def index() { }

    def saveSettings() {
        def password = params.password;
        def confirmPassword = params.confirmPassword;

        if (password  && password != confirmPassword) {
            flash.error = "Password and confirm password do not match.";
            redirect(action: "index");
            return;
        }
        if (password.length() < 4) {
            flash.error = "Password must be 4 characters or greater.";
            redirect(action: "index");
            return;
        }

        if (password) {
            User user = User.findByUsername(springSecurityService.principal.username);
            user.password = springSecurityService.encodePassword(password);
            user.save(flush: true, failOnError: true);
        }
        flash.message = "Settings saved.";
        redirect(action: "index");
        return;
    }
}
