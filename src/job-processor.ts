export class Processor {
  ;
  constructor(
    private performDelegate,
    private jobStore,
  ) {}

  public processJob(job) {
    return this.perform(job).then(() => {
      return this.jobStore.markAsDone(job).then(() => {
        return 'success';
      });
    });
  }

  perform(job) {
    return this.performDelegate.perform(job);
  }

  public processJobs() {
    return this.jobStore.pending().then(jobs => {
      Promise.all(
        jobs.map(job => { return this.processJob(job); })
      ).then(s => {
        return 'done';
      }, e => {
        return 'failed';
      });
    });
  }

}
