import StdAdaptor from "./printer/StdAdaptor";
import Printer from "./printer/Printer";
import logger from "./utils/logger";
import JiraRepo from "./repository/Jira";


const test = async () => {
  const jiraRepo = new JiraRepo();
  const data = await jiraRepo.getNonLeadComponentsWithIssuesCount();
  const stdAdaptor = new StdAdaptor();
  const printer = new Printer(stdAdaptor);
  await printer.print(data);
};

test().then(() => {
  process.exit();
});



//Handle uncaught exception and shutdown
process
  .on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at Promise', {
      reason,
      p
    });
  })
  .on('uncaughtException', err => {
    logger.error('Uncaught Exception thrown', {
      err
    });
  });


async function graceFullShutdown() {
  try {
    logger.log('Service shutting down ...', {});
    await new Promise((resolve) => setTimeout(resolve, 10));
    process.exit(0);
  } catch (e) {
    logger.error('bad error in exiting Service', {
      err: e
    });
    process.exit(0);
  }
}

process.on('SIGTERM', graceFullShutdown);
process.on('SIGINT', graceFullShutdown);
process.on('SIGUSR1', graceFullShutdown);
