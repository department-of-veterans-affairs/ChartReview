import gov.va.vinci.chartreview.security.PasswordExpiredEventHandler
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor

// Place your Spring DSL code here
beans = {
    chartReviewRoleVoter(gov.va.vinci.chartreview.security.ChartReviewRoleVoter) {
        // attributes
    }

    SSOAuthenticationManager(gov.va.vinci.chartreview.security.SSOAuthenticationManager) {

    }

    myPreAuthFilter(gov.va.vinci.chartreview.security.PreAuthenticationFilter) {
        authenticationManager = ref('SSOAuthenticationManager')
    }


    userDetailsService( gov.va.vinci.chartreview.security.ChartReviewUserDetailsService);
    passwordExpiredEventHandler(PasswordExpiredEventHandler)

    jobExecutor(org.activiti.spring.components.jobexecutor.SpringJobExecutor) {
        taskExecutor = ref('threadPoolTaskExecutor')
    }

    threadPoolTaskExecutor(ThreadPoolTaskExecutor) {
         maxPoolSize = 10
         corePoolSize = 5
         queueCapacity= 1000
    }
}
