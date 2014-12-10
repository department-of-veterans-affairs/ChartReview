package chartreview

import org.activiti.engine.runtime.Job

class JobsController {

    def managementService;

    def index() {
        List<Job> failedJobs = managementService.createJobQuery().withException().list();

        render(view: "index", model: [failedJobs: failedJobs])

    }

}
