public async insertTwoRecord(name1: string, name2: string, age1: number, age2: number): Promise<any> {
  return new Promise((resolve, reject) => {
      this.connection.beginTransaction((beginTransactionError: MysqlError) => {
          if (beginTransactionError != null) {
              reject(beginTransactionError.message);
          }
          this.connection.query('INSERT INTO user SET name = ?, age = ?', [name1, age1], (queryError1: MysqlError | null, results1: any, fields1: FieldInfo[] | undefined) => {
              if (queryError1 != null) {
                  this.connection.rollback((rollbackError: MysqlError) => {
                      if (rollbackError != null) {
                          reject(rollbackError.message);
                      } else {
                          reject(queryError1.message);
                      }
                  });
                  this.connection.query('INSERT INTO user SET name = ?, age = ?', [name2, age2], (queryError2: MysqlError | null, results2: any, fields2: FieldInfo[] | undefined) => {
                      if (queryError2 != null) {
                          this.connection.rollback((rollbackError: MysqlError) => {
                              if (rollbackError != null) {
                                  reject(rollbackError.message);
                              } else {
                                  reject(queryError1.message);
                              }
                          });
                      } else {
                          this.connection.commit((commitError: MysqlError) => {
                              if (commitError != null) {
                                  reject(commitError.message);
                              }
                              resolve([results1, results2]);
                          });
                      }
                  });
              }
          });
      });
  });
}