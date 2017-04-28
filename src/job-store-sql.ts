import { Sql } from './sql';

export class JobStoreSql {
  storage;
  tableName;
  logger

  private schema = {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    job_type: 'TEXT',
    params: 'TEXT',
    status: 'TEXT'
  };

  // FIXME: require query method in storage
  constructor(logger, tableName = 'delayed-job-store') {
    this.storage = new Sql();
    this.tableName = tableName;
    this.logger = logger;
    this.init();
  }

  init() {
    let fields = Object.keys(this.schema).map(e => `${e} ${this.schema[e]}`);
    this.storage.query(`create table if not exists ${this.tableName}(${fields.join(',')})`);
  }

  add(jobType, params: {job_type: string, params: Object}) {
    let keys = ['job_type', 'params', 'status'];
    let values = [jobType, JSON.stringify(params), 'pending'];
    let valuesPlaceholders = values.map(() => '?');
    let query = `insert into ${this.tableName}(${keys.join(',')}) values(${valuesPlaceholders.join(',')})`;
    return this.storage.query(query, values);
  }

  markAsDone(job: { job_type: string, params: Object, id: number, status: string }) {
    let query = `update ${this.tableName} set status = 'done' where id = ?`;
    return this.storage.query(query, [job.id]);
  }

  cleanupDone() {
    let query = `delete from  ${this.tableName} where status ='done';`;
    return this.storage.query(query);
  }

  cleanupAll() {
    let query = `delete from  ${this.tableName};`;
    return this.storage.query(query);
  }

  all(conditions: string = '', values = []): Promise<[any]> {
    let query = `select * from ${this.tableName} ${conditions};`;
    return this.storage.query(query, values).then(resp => {
      let data = [];
      for(let i = 0; i < resp.res.rows.length; i++) {
        let item = resp.res.rows.item(i);
        item.params_str = item.params;
        item.params = JSON.parse(item.params);
        data.push(item);
      }
      return data ;
    }, error => {
      this.logger.error(error);
    });
  }

  pending(): Promise<[any]> {
    return this.all("where status = ?", ['pending']);
  }

  processed(): Promise<[any]> {
    return this.all("where status = ?", ['done']);
  }

  pendingCount(): Promise<[any]> {
    let query = `select count(*) as pendingCount from ${this.tableName} where status = ?;`;
    let queryValues = ['pending'];
    return this.storage.query(query, queryValues).then(resp => {
      return resp.res.rows.item(0).pendingCount;
    });
  }

}

