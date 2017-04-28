const DB_NAME: string = '__ionicstorage';
const win: any = window;

export class Sql {
  private db: any;

  constructor() {
    if (win.sqlitePlugin) {
      this.db = win.sqlitePlugin.openDatabase({
        name: DB_NAME,
        location: 'default'
      });
    } else {
      console.warn('Storage: SQLite plugin not installed, falling back to WebSQL.',
      ' Make sure to install cordova-sqlite-storage in production!');
      this.db = win.openDatabase(DB_NAME, '1.0', 'database', 5 * 1024 * 1024);
    }
  }

  /**
   * Perform an arbitrary SQL operation on the database. Use this method
   * to have full control over the underlying database through SQL operations
   * like SELECT, INSERT, and UPDATE.
   *
   * @param {string} query the query to run
   * @param {array} params the additional params to use for query placeholders
   * @return {Promise} that resolves or rejects with an object of the form { tx: Transaction, res: Result (or err)}
   */
  query(query: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.db.transaction((tx1: any) => {
            tx1.executeSql(query, params,
              (tx: any, res: any) => resolve({tx, res}),
              (tx: any, err: any) => reject({tx, err}));
          },
          (err: any) => reject({err}));
      } catch (err) {
        reject({err});
      }
    });
  }

}
