console.log('All good');
import { SetupServer } from './server';
import config from 'config';
import logger from './logger';

enum ExitStatus {
  Failed = 1,
  Sucess = 2,
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );
  // lets throw the error and let the uncaughtException handle below handle it
  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failed);
});


(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const exitSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    exitSignals.map(signal => process.on(signal, async() => {
      try {
        await server.close()
        logger.info("Server exited with sucess!");
        process.exit(ExitStatus.Sucess)
      } catch (error) {
        logger.info(`Process exited with a error : ${error}`);
        process.exit(ExitStatus.Failed)
      }
    }))
  } catch (error) {
    logger.error(`Error on starting app: ${error}`);
    process.exit(ExitStatus.Failed);
  }
})();
