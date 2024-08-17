import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from '@copilotkit/runtime';
import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import bytes from 'bytes';
import { useContainer } from 'class-validator';
import { graphqlUploadExpress } from 'graphql-upload';
import OpenAI from 'openai';

import { ApplyCorsToExceptions } from 'src/utils/apply-cors-to-exceptions';

import { AppModule } from './app.module';

import { settings } from './engine/constants/settings';
import { LoggerService } from './engine/integrations/logger/logger.service';
import { generateFrontConfig } from './utils/generate-front-config';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.DEBUG_MODE === 'true',
  });
  const logger = app.get(LoggerService);

  // TODO: Double check this as it's not working for now, it's going to be heplful for durable trees in twenty "orm"
  // // Apply context id strategy for durable trees
  // ContextIdFactory.apply(new AggregateByWorkspaceContextIdStrategy());

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  if (Sentry.isInitialized()) {
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }

  app.useGlobalFilters(new ApplyCorsToExceptions());

  // Apply validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });

  // Graphql file upload
  app.use(
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  // Create the env-config.js of the front at runtime
  generateFrontConfig();

  const openai = new OpenAI();
  const serviceAdapter = new OpenAIAdapter({ openai });

  const runtime = new CopilotRuntime({
    actions: [
      {
        name: 'sayHello',
        description: 'say hello so someone by roasting their name',
        parameters: [
          {
            name: 'roast',
            description: 'A sentence or two roasting the name of the person',
            type: 'string',
            required: true,
          },
        ],
        handler: ({ roast }: { roast: string }) => {
          console.log(roast);

          return 'The person has been roasted.';
        },
      },
    ],
  });

  const copilotRuntime = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/api/copilotkit',
    runtime,
    serviceAdapter,
  });

  // app.use("/copilotkit", copilotRuntime);

  // OR

  app.use('/api/copilotkit', (req, res, next) => {
    return copilotRuntime(req, res, next);
  });

  await app.listen(process.env.PORT ?? 3000);
};

bootstrap();
