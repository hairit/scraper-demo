const Q = require("q");
const modelSchema = require("../../db/models/CronJobHistory");

const CronJobStatus = {
  Running: "Running",
  Successful: "Successful",
  Failed: "Failed",
};

const clearHistory = async () => {
  const count = await modelSchema.countDocuments();
  if (count > process.env.MAX_HISTORY_RECORD_NUMBER) {
    let oldestHistory;
    const histories = await modelSchema
      .find()
      .select("_id")
      .sort({ createdDate: 1 })
      .limit(1);
    if (Array.isArray(histories) && histories.length) {
      oldestHistory = histories[0];
    }
    modelSchema
      .deleteOne({ _id: oldestHistory._id })
      .then(() => {})
      .catch((exception) => console.log(exception.message));
  }
};

function CronJobHistory(config) {
  this.message = [];
  this.startedDate = new Date();
  this.completedDate = null;
  this.taskName = config.taskName;
  this.taskId = config._id;
  this.status = CronJobStatus.Running;
  this.currentLog = null;
  this.runTimeLog = [];

  this.JobStarted = () => {
    let deferred = Q.defer();
    const newItem = new modelSchema({
      taskName: this.taskName,
      taskId: this.taskId,
      startedDate: this.startedDate,
      completedDate: this.completedDate,
      message: JSON.stringify(this.message),
      status: this.status,
    });
    newItem.save(null).then(() => {
      this.currentLog = newItem._id;
      clearHistory();
      deferred.resolve();
    });
    return deferred.promise;
  };

  this.Log = (message, status) => {
    if (message) {
      this.message.push(message);
    }
    if (status && this.status === CronJobStatus.Running) {
      this.status = status;
    }
  };

  this.logRunTime = (log) => {
    if (log) {
      this.runTimeLog = this.runTimeLog.concat(log);
    }
  };

  this.JobDone = (status) => {
    let deferred = Q.defer();
    modelSchema
      .updateOne(
        { _id: this.currentLog },
        {
          $set: {
            completedDate: new Date(),
            message: JSON.stringify(this.message),
            status: status ? status : this.status,
            runTimeLog: JSON.stringify(this.runTimeLog),
          },
        }
      )
      .then(() => {
        deferred.resolve();
      });
    return deferred.promise;
  };
}

exports.CronJobStatus = CronJobStatus;
exports.CronJobHistory = CronJobHistory;
