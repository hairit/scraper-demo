import { CRON_JOB_TYPE_HOURLY, CRON_JOB_TYPE_DAILY } from "./constants";

export const ConvertToCronStyle = (type, startTime) => {
  const time = startTime.split(":");
  let cronStyle = "0 * * * *";
  if (type == CRON_JOB_TYPE_HOURLY) {
    cronStyle = `${time[1]} * * * *`;
  } else if (type == CRON_JOB_TYPE_DAILY) {
    cronStyle = `${time[1]} ${time[0]} * * *`;
  }
  return cronStyle;
};

export const getNextStartDateTime = (cronJob, currentDate) => {
  let duration = 0;
  switch (cronJob.typeCronJob) {
    case CRON_JOB_TYPE_HOURLY: {
      duration = 60 * 60 * 1000;
      break;
    }
    case CRON_JOB_TYPE_DAILY: {
      duration = 24 * 60 * 60 * 1000;
      break;
    }
  }
  let nextStep = cronJob.startDateTime.getTime();
  while (true) {
    nextStep += duration;
    if (nextStep > currentDate.getTime()) {
      break;
    }
  }
  return new Date(nextStep);
};
