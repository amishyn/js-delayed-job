import { JobStoreSql } from './job-store-sql';
import { ApiService } from 'api-service';
import { Processor } from './job-processor';

export class ApiJob {
  jobStore;
  processor: Processor;

  constructor(
    private apiService: ApiService
  ) {
    this.jobStore = new JobStoreSql(console);
    this.processor = new Processor(this, this.jobStore);
  }

  public scheduleProcessing() {
    setInterval( () => { this.processJobs() }, 5*60*1000);
  }

  public processJobs() {
    this.processor.processJobs();
  }

  public perform(job) {
    if (job.type === 'get') {
      return this.apiService.get(job.params['url'])
    }
  }

  public addJob(type, params) {
    this.jobStore.addJob(type, params).then((job) => {
      console.log(`${job.type} added with parmas ${job.params}`);
    })
  }
}
