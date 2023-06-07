import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import * as passport from 'passport';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    snapshot: true,
  });

  const whitelist = ['https://osutournament.com', 'http://localhost:8080', 'http://localhost:5173'];
  app.enableCors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: 'Content-Type, cache-control',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('v1');
  const config: ConfigService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enable('trust proxy');
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const redisClient = createClient({
    url: `redis://${
      process.env.NODE_ENV === 'production' ? 'redis' : 'localhost'
    }/`,
  });

  await redisClient.connect()

  redisClient.on('error', (err) =>
    Logger.error('Could not establish a connection with redis. ' + err),
  );
  redisClient.on('connect', () =>
    Logger.verbose('Connected to redis successfully'),
  );

  const redisStore = new RedisStore({
    client: redisClient,
  });

  app.use(
    session({
      store: redisStore,
      name: 'cookie',
      saveUninitialized: false,
      secret: config.get('COOKIE_SESSION_SECRET'),
      resave: false,
      rolling: true,
      cookie: {
        domain:
          process.env.NODE_ENV === 'production'
            ? '.osutournament.com'
            : 'localhost',
        maxAge: 1000 * 60 * 60 * 24 * 30 * 6,
        httpOnly: false,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  const port: number = config.get<number>('PORT');
  await app.listen(port, () => {
    console.log('[WEB]', config.get<string>('BASE_URL') + '/v1');
  });
}

bootstrap();
